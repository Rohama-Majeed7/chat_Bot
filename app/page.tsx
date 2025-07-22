"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  MessageCircle,
  Loader2,
  Send,
  ArrowDownCircleIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import LandingSections from "@/components/LandingSections";

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatButton, setShowChatButton] = useState(true);
  const chatRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    handleSubmit,
    isLoading,
    handleInputChange,
    input,
    reload,
    stop,
    error,
  } = useChat({ api: "/api/openai" });
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowChatButton(true);
      } else {
        setShowChatButton(false);
        setIsChatOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className="flex flex-col min-h-screen">
      <LandingSections />
      <AnimatePresence>
        {showChatButton && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              ref={chatRef}
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={toggleChat}
            >
              {isChatOpen ? (
                <ArrowDownCircleIcon size={24} />
              ) : (
                <MessageCircle size={24} />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-16 right-4 z-50 w-[95%] md:w-[500px]  bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <Card className="h-[400px] flex flex-col border-2 justify-between border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Chat with Us</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X size={20} />
                </Button>
              </CardHeader>
              <ScrollArea className="p-4 ">
                {messages?.length === 0 && (
                  <div className="text-center text-gray-500">
                    No Messages Yet
                  </div>
                )}
                {messages?.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex flex-col ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`${
                        message.role === "user"
                          ? "bg-primary self-end p-1 rounded-lg w-fit text-primary-foreground"
                          : "bg-slate-300 p-1 rounded-lg"
                      }`}
                    >
                      <ReactMarkdown
                        children={message.content}
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...rest }) {
                            const isInline = className?.includes("inline");
                            if (isInline) {
                              return (
                                <code className="bg-gray-200 rounded px-1">
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <pre
                                className="bg-gray-200 rounded px-1 overflow-x-auto"
                              >
                                {children}
                              </pre>
                            );
                          },
                        }}
                      />
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-black flex items-center space-x-2 justify-center">
                    <Loader2 className="animate-spin" size={20} />
                    <button
                      type="button"
                      onClick={() => stop()}
                      className="text-blue-500"
                    >
                      abort
                    </button>
                  </div>
                )}
                {error && (
                  <div className="text-black flex items-center space-x-2 justify-center">
                    <div>An error occured</div>
                    <button onClick={() => reload()} className="text-blue-500">
                      <span className="text-blue-500 underline">Retry</span>
                    </button>
                  </div>
                )}
                <div ref={scrollRef}></div>
              </ScrollArea>
              <CardFooter className="flex items-center space-x-2 ">
                <form
                  onSubmit={handleSubmit}
                  className="flex w-full gap-2 items-center"
                >
                  <Input
                    className="border-black border-1"
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <Send size={20} />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
