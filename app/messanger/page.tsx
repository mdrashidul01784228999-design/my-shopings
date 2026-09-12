"use client";
import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessage } from "../api/messsent";

// ১. মেসেজের জন্য প্রপার ইন্টারফেস/টাইপ তৈরি করা হলো
interface MessageType {
  user: string;
  text: string;
  time: string;
}

export default function SuperPremiumMessenger() {
  // স্টেটকে MessageType অ্যারে হিসেবে ডিক্লেয়ার করা হলো
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState<string>("");
  const [username] = useState<string>("User_" + Math.floor(Math.random() * 1000));
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // পরিবেশ ভেরিয়েবলগুলো (Environment Variables) চেক করে সেফ করা হলো
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "";

    if (!pusherKey) {
      console.error("Pusher key is missing!");
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe("chat-room");
    
    // ডাটার টাইপ MessageType অ্যাসাইন করা হলো
    channel.bind("new-message", (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      pusher.unsubscribe("chat-room");
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white font-sans overflow-hidden">
      
      {/* --- Sidebar (Visible on Desktop) --- */}
      <aside className="hidden md:flex w-24 lg:w-72 flex-col border-r border-white/5 bg-black/20 backdrop-blur-3xl">
        <div className="p-6">
          <div className="h-8 w-8 lg:w-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20" />
        </div>
        <div className="flex-1 px-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-gray-800 border border-white/10 flex-shrink-0" />
              <div className="hidden lg:block">
                <div className="h-3 w-24 bg-white/20 rounded-full mb-2" />
                <div className="h-2 w-16 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* --- Main Chat Window --- */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Background Decorative Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full" />

        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ rotate: 5 }} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px]">
              <div className="w-full h-full bg-[#0a0a0c] rounded-[14px] flex items-center justify-center font-bold text-blue-400">
                {username[0]}
              </div>
            </motion.div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Main Chatroom</h2>
              <p className="text-xs text-blue-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                {messages.length} Messages Live
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
          </div>
        </header>

        {/* Chat Feed */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-thin scrollbar-thumb-white/5">
          <AnimatePresence>
            {messages.map((msg, i) => {
              const isMe = msg.user === username;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`group flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] md:max-w-[70%]`}>
                    {!isMe && <span className="text-[11px] font-bold text-gray-500 ml-2 mb-1 uppercase tracking-widest">{msg.user}</span>}
                    
                    <div className={`relative px-5 py-3 rounded-[24px] overflow-hidden shadow-2xl transition-all ${
                      isMe 
                      ? "bg-blue-600/90 text-white rounded-tr-none border border-white/10 shadow-blue-500/20" 
                      : "bg-white/5 backdrop-blur-md text-gray-100 rounded-tl-none border border-white/10"
                    }`}>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                      <p className="text-[15px] leading-relaxed relative z-10">{msg.text}</p>
                    </div>
                    
                    <span className="text-[10px] mt-2 text-gray-600 font-medium px-2 group-hover:text-gray-400 transition-colors">
                      {msg.time} {isMe && "• Delivered"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </main>

        {/* Futuristic Input Area */}
        <footer className="p-6 bg-black/40 backdrop-blur-2xl border-t border-white/5 z-20">
          <form 
            action={async (formData) => {
              if (!input.trim()) return;
              setInput(""); 
              await sendMessage(formData);
            }}
            className="max-w-5xl mx-auto flex items-center gap-4"
          >
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
              <input type="hidden" name="username" value={username} />
              <input
                name="message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write a message..."
                className="relative w-full bg-[#121214] border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none transition-all placeholder-gray-600 text-[15px]"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3 text-gray-500">
                <button type="button" className="hover:text-blue-400 transition">📎</button>
                <button type="button" className="hover:text-yellow-400 transition">😊</button>
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={!input.trim()}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className={`h-[54px] w-[54px] flex items-center justify-center rounded-2xl transition-all ${
                input.trim() 
                ? "bg-blue-600 text-white" 
                : "bg-white/5 text-gray-700 cursor-not-allowed border border-white/5"
              }`}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                 <path d="M3.4 20.4L22 12 3.4 3.6c-.5-.2-1 .1-1 .7v5.1c0 .4.3.8.7.9l11.4 1.7L3.1 13.7c-.4.1-.7.5-.7.9v5.1c0 .6.5.9 1 .7z" />
              </svg>
            </motion.button>
          </form>
        </footer>
      </div>
    </div>
  );
}


