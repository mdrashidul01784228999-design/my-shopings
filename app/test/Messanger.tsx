// মোবাইল ও পিসি লেআউট রেসপনসিভনেস:
// মোবাইল ভিউ: ইনবক্স লিস্ট এবং মেসেজ উইন্ডো একসাথে ওপেন হবে না। প্রথমে চ্যাট লিস্ট আসবে, কেউ ক্লিক করলে মসৃণভাবে চ্যাট স্ক্রিন ফুল ওপেন হবে এবং বাম পাশে একটি ArrowLeft বাটন চলে আসবে রিভার্স করার জন্য।

// পিসি বা ল্যাপটপ ভিউ: স্ক্রিনের বাম পাশে চ্যাট লিস্ট ফিক্সড থাকবে এবং ডান পাশে বড় ইন্টারফেসে চ্যাট উইন্ডো শো করবে।

// 🔌 API কাস্টমাইজেশন গাইড:
// কোডের axios.get('/api/messages/${activeChat.id}') সেকশনটিতে আপনার ব্যাকএন্ডের চ্যাট হিস্ট্রি এপিআই বসিয়ে দিন।

// কোডের axios.post("/api/messages/send", messageData) লিংকে মেসেজ ডাটাবেজে পাঠানোর রিয়েল রাউট সেট করে নিন।





"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Search, Send, ArrowLeft, Phone, Video, Info, 
  Image, Smile, MoreHorizontal, MessageSquareDot, Circle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ডামি চ্যাট লিস্ট (API কল করার আগে ইনিশিয়াল স্টেট হিসেবে থাকবে)
const initialChats = [
  { id: 1, name: "Rashidul Neon", avatar: "https://i.pravatar.cc/150?u=1", lastMessage: "✨ ভাই নিয়ন কোডটা কি কমপ্লিট?", time: "২ মিনিট আগে", online: true },
  { id: 2, name: "Cyber Glow", avatar: "https://i.pravatar.cc/150?u=2", lastMessage: "🔥 অসাম ডিজাইন হয়েছে!", time: "১ ঘণ্টা আগে", online: false },
  { id: 3, name: "Bangla Tech", avatar: "https://i.pravatar.cc/150?u=3", lastMessage: "💡 নতুন আপডেট এপিআই রেডি।", time: "গতকাল", online: true },
];

export default function CyberMessenger() {
  const [chats, setChats] = useState(initialChats);
  const [activeChat, setActiveChat] = useState<typeof initialChats[0] | null>(null);
  const [messages, setMessages] = useState<{ id: number; text: string; sender: "me" | "them"; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // মোবাইল ভিউ কন্ট্রোল করার জন্য (পিসি এবং মোবাইলের আলাদা লেআউট হ্যান্ডলিং)
  const [showChatWindow, setShowChatWindow] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // চ্যাট ওপেন করার সময় মেসেজ হিস্ট্রি লোড করার জন্য Axios API কল
  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/api/messages/${activeChat.id}`);
          if (response.status === 200) {
            setMessages(response.data);
          }
        } catch (error) {
          console.error("মেসেজ লোড করতে সমস্যা হয়েছে:", error);
          // API ব্যাকআপ হিসেবে ডামি মেসেজ সেটআপ
          setMessages([
            { id: 1, text: `হ্যালো, আমি ${activeChat.name}`, sender: "them", timestamp: "10:00 AM" },
            { id: 2, text: "জ্বী ভাই বলুন, কেমন আছেন?", sender: "me", timestamp: "10:02 AM" },
            { id: 3, text: activeChat.lastMessage, sender: "them", timestamp: "10:05 AM" },
          ]);
        }
      };
      fetchMessages();
    }
  }, [activeChat]);

  // মেসেজ স্ক্রল ডাউন করার জন্য
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- মেসেজ সেন্ড করার API ফাংশন (Axios) ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageData = {
      chatId: activeChat.id,
      text: newMessage,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      // রিয়েল টাইম ডেটাবেজে পাঠানোর জন্য এক্সিওস পোস্ট রিকোয়েস্ট
      const response = await axios.post("/api/messages/send", messageData);
      if (response.status === 200 || response.status === 201) {
        setMessages((prev) => [...prev, response.data]);
      }
    } catch (error) {
      console.error("মেসেজ পাঠানো যায়নি:", error);
      // API লাইভ না থাকলে লোকাল স্টেট আপডেট (টেস্টিং পারপাস)
      setMessages((prev) => [...prev, { id: Date.now(), ...messageData as any }]);
    }

    setNewMessage("");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-[#0a0a0f] to-[#000020] text-white flex overflow-hidden font-sans">
      
      {/* ==================== LEFT SIDEBAR: CHAT LIST ==================== */}
      <div className={`w-full md:w-80 border-r border-blue-500/30 flex flex-col bg-black/40 backdrop-blur-md transition-all duration-300
        ${showChatWindow ? "hidden md:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareDot className="text-blue-400 w-6 h-6 [filter:drop-shadow(0_0_5px_#00f)]" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">CyberChats</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="flex items-center rounded-xl px-3 py-2 border border-pink-500/50 bg-black/60 [box-shadow:0_0_10px_rgba(255,0,255,0.1)]">
            <Search className="w-4 h-4 text-pink-400 mr-2" />
            <input
              type="text"
              placeholder="Search Messenger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-xs w-full text-pink-200 placeholder-pink-500"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto space-y-1 px-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setActiveChat(chat);
                setShowChatWindow(true);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
                ${activeChat?.id === chat.id 
                  ? "bg-purple-500/20 border-purple-500 [box-shadow:0_0_10px_#a0f]" 
                  : "bg-transparent border-transparent hover:bg-white/5"}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-11 h-11 rounded-full object-cover border border-cyan-400" />
                {chat.online && (
                  <Circle className="w-3 h-3 fill-green-400 text-green-400 absolute bottom-0 right-0 [filter:drop-shadow(0_0_3px_#0f0)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                  <span className="text-[10px] text-gray-500">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== RIGHT SIDEBAR: CHAT WINDOW ==================== */}
      <div className={`flex-1 flex flex-col bg-black/20 transition-all duration-300
        ${!showChatWindow ? "hidden md:flex" : "flex"}`}
      >
        {activeChat ? (
          <>
            {/* Top Navigation Bar */}
            <div className="p-3 border-b border-purple-500/30 bg-black/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 [box-shadow:0_4px_15px_rgba(160,0,255,0.1)]">
              <div className="flex items-center gap-3">
                {/* মোবাইল ব্যাক বাটন */}
                <button 
                  onClick={() => setShowChatWindow(false)} 
                  className="md:hidden p-1 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover border border-purple-400" />
                  {activeChat.online && <div className="w-2.5 h-2.5 bg-green-400 rounded-full absolute bottom-0 right-0 border border-black" />}
                </div>

                <div>
                  <h2 className="font-bold text-sm sm:text-base">{activeChat.name}</h2>
                  <p className="text-[10px] text-green-400">{activeChat.online ? "Active Now" : "Offline"}</p>
                </div>
              </div>

              {/* Actions Icons */}
              <div className="flex items-center gap-3 sm:gap-4 text-cyan-400">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-cyan-300 [filter:drop-shadow(0_0_3px_#0ff)]" />
                <Video className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-cyan-300 [filter:drop-shadow(0_0_3px_#0ff)]" />
                <Info className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-cyan-300" />
              </div>
            </div>

            {/* Messages Screen Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#030308]/60">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${msg.sender === "me" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed
                      ${msg.sender === "me" 
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 border border-cyan-400/50 [box-shadow:0_0_10px_rgba(0,255,255,0.2)] rounded-br-none" 
                        : "bg-purple-950/40 border border-purple-500/40 [box-shadow:0_0_10px_rgba(160,0,255,0.1)] rounded-bl-none"}`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Message Form Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-black/80 border-t border-blue-500/20 flex items-center gap-2">
              <div className="flex items-center gap-2 text-gray-400 px-1">
                <Image className="w-5 h-5 cursor-pointer hover:text-pink-400 transition-colors" />
                <Smile className="w-5 h-5 cursor-pointer hover:text-yellow-400 transition-colors" />
              </div>

              <div className="flex-1 flex items-center border border-blue-500 rounded-xl px-3 py-1.5 bg-black/50 [box-shadow:0_0_10px_rgba(0,0,255,0.1)]">
                <input
                  type="text"
                  placeholder="Type a cyber message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-xs sm:text-sm text-blue-200 placeholder-blue-800"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl border border-cyan-300 text-black [box-shadow:0_0_10px_#0ff]"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </>
        ) : (
          // কোনো চ্যাট সিলেক্ট না থাকলে যে স্ক্রিন দেখাবে (পিসির জন্য)
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
            <MessageSquareDot className="w-16 h-16 text-purple-500/30 animate-pulse mb-2" />
            <p className="text-sm">Select a cyber workspace chat to begin messaging</p>
          </div>
        )}
      </div>

    </div>
  );
}






// "use client";

// import { useState, useRef, useEffect } from "react";
// import { 
//   Search, Phone, Video, Info, Send, Image, Smile, 
//   MoreHorizontal, ChevronLeft, Circle, Sparkles, MessageSquareDot, Sun, Moon
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const initialFriends = [
//   {
//     id: 1,
//     name: "Rashidul Neon",
//     avatar: "https://i.pravatar.cc/150?img=33",
//     active: true,
//     lastSeen: "Active Now",
//     messages: [
//       { id: 1, sender: "them", text: "হ্যালো ভাই! ৩ডি নিয়ন ড্যাশবোর্ডের কাজ কতদূর?", time: "8:30 PM" },
//       { id: 2, sender: "me", text: "কাজ প্রায় শেষ! মাল্টি-ইমেজ গ্যালারি আর চ্যাট ইঞ্জিন রেডি করছি।", time: "8:32 PM" },
//       { id: 3, sender: "them", text: "চরম! মেসেঞ্জার ইন্টারফেসটা একটু গ্লোয়িং স্টাইলে করিয়েন। 🔥", time: "8:33 PM" },
//     ]
//   },
//   {
//     id: 2,
//     name: "Cyber Queen",
//     avatar: "https://i.pravatar.cc/150?img=47",
//     active: true,
//     lastSeen: "Active Now",
//     messages: [
//       { id: 1, sender: "them", text: "আজকের লাইভ স্ট্রিমিং ডেটা সিঙ্ক করা হয়েছে?", time: "6:15 PM" },
//       { id: 2, sender: "me", text: "হ্যাঁ, সম্পূর্ণ ডেটা ক্লাউড নোডে ট্রান্সমিট কমপ্লিট।", time: "6:18 PM" },
//     ]
//   },
//   {
//     id: 3,
//     name: "Anik Flame",
//     avatar: "https://i.pravatar.cc/150?img=12",
//     active: false,
//     lastSeen: "2h ago",
//     messages: [
//       { id: 1, sender: "them", text: "ভাই নেক্সট প্রজেক্টের কোডটা গিটহাবে পুশ করে দিয়েন।", time: "Yesterday" },
//     ]
//   }
// ];

// export default function UltimateResponsiveMessenger() {
//   const [friends, setFriends] = useState(initialFriends);
//   const [activeFriendId, setActiveFriendId] = useState(1);
//   const [typedMessage, setTypedMessage] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [isDarkMode, setIsDarkMode] = useState(true);
  
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const activeFriend = friends.find(f => f.id === activeFriendId) || friends[0];

//   const handleSendMessage = () => {
//     if (!typedMessage.trim()) return;
//     const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
//     setFriends(prev => prev.map(friend => {
//       if (friend.id === activeFriendId) {
//         return {
//           ...friend,
//           messages: [...friend.messages, { id: Date.now(), sender: "me", text: typedMessage, time: timeString }]
//         };
//       }
//       return friend;
//     }));
//     setTypedMessage("");
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [activeFriend.messages]);

//   const filteredFriends = friends.filter(f => 
//     f.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className={`flex h-screen w-full font-sans antialiased overflow-hidden relative transition-colors duration-700 ${
//       isDarkMode ? "bg-[#03030f] text-zinc-100" : "bg-[#f8fafc] text-zinc-900"
//     }`}>
      
//       {/* 🔮 Hyper-Glow Ambient Light Fields */}
//       <div className={`absolute top-[-25%] left-[-15%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none blur-[160px] transition-all duration-1000 ${
//         isDarkMode ? "bg-cyan-500/15 animate-pulse" : "bg-cyan-300/25"
//       }`} />
//       <div className={`absolute bottom-[-25%] right-[-15%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none blur-[160px] transition-all duration-1000 ${
//         isDarkMode ? "bg-fuchsia-500/15" : "bg-fuchsia-300/25"
//       }`} />

//       {/* ================= MAIN CONTAINER LAYER ================= */}
//       <div className="flex flex-1 w-full max-w-[1600px] mx-auto md:p-4 lg:p-6 h-full relative z-10">
//         <div className={`flex flex-1 w-full h-full rounded-none md:rounded-3xl border backdrop-blur-3xl overflow-hidden transition-all duration-500 ${
//           isDarkMode 
//             ? "border-zinc-800/60 bg-black/40 shadow-[0_0_80px_rgba(6,182,212,0.12)]" 
//             : "border-white/80 bg-white/60 shadow-[0_30px_70px_rgba(15,23,42,0.08)]"
//         }`}>
          
//           {/* ================= 1. PREMIUM SIDEBAR ================= */}
//           <aside className={`${
//             isSidebarOpen ? "flex w-full" : "hidden"
//           } md:flex md:w-[340px] lg:w-[420px] flex-col shrink-0 border-r transition-all duration-500 relative ${
//             isDarkMode ? "border-zinc-900 bg-zinc-950/40" : "border-slate-200 bg-slate-50/50"
//           }`}>
            
//             {/* Upper Controlling Hub */}
//             <div className={`p-5 border-b ${isDarkMode ? "border-zinc-900/80" : "border-slate-200/60"}`}>
//               <div className="flex items-center justify-between mb-5">
//                 <h2 className="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 bg-clip-text text-transparent flex items-center gap-2">
//                   <MessageSquareDot className={`w-6 h-6 ${isDarkMode ? "text-cyan-400 drop-shadow-[0_0_10px_#06b6d4]" : "text-cyan-500"}`} /> 
//                   <span className="font-extrabold tracking-tight">Quantum</span>Chat
//                 </h2>
                
//                 {/* Neon Theme Toggler */}
//                 <motion.button 
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setIsDarkMode(!isDarkMode)}
//                   className={`p-2.5 rounded-xl border transition-all duration-300 ${
//                     isDarkMode 
//                       ? "bg-zinc-900 border-zinc-800 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-400/40" 
//                       : "bg-white border-slate-200 text-indigo-600 shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:border-indigo-400"
//                   }`}
//                 >
//                   {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//                 </motion.button>
//               </div>

//               {/* Luxury Glass Search Bar */}
//               <div className={`flex items-center border rounded-2xl px-4 py-3 shadow-inner transition-all duration-300 ${
//                 isDarkMode 
//                   ? "bg-zinc-950/60 border-zinc-800/80 focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
//                   : "bg-white border-slate-200 focus-within:border-fuchsia-500 focus-within:shadow-[0_0_15px_rgba(217,70,239,0.15)]"
//               }`}>
//                 <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
//                 <input 
//                   type="text" 
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="البحث أو محادثة جديدة..." 
//                   className={`bg-transparent text-sm outline-none w-full transition-colors ${
//                     isDarkMode ? "text-zinc-200 placeholder-zinc-700" : "text-zinc-800 placeholder-slate-400"
//                   }`}
//                 />
//               </div>
//             </div>

//             {/* Micro-Interactive Chat List Feed */}
//             <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
//               {filteredFriends.map((friend) => {
//                 const lastMsg = friend.messages[friend.messages.length - 1];
//                 const isSelected = friend.id === activeFriendId;

//                 return (
//                   <motion.div
//                     key={friend.id}
//                     whileHover={{ scale: 1.01, x: 2 }}
//                     onClick={() => {
//                       setActiveFriendId(friend.id);
//                       setIsSidebarOpen(false);
//                     }}
//                     className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all duration-300 relative overflow-hidden ${
//                       isSelected 
//                         ? isDarkMode
//                           ? "bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-transparent border-cyan-500/40 shadow-[0_4px_25px_rgba(6,182,212,0.15)]" 
//                           : "bg-gradient-to-r from-fuchsia-500/5 via-cyan-500/5 to-transparent border-fuchsia-300 shadow-[0_10px_25px_rgba(217,70,239,0.06)]"
//                         : isDarkMode 
//                           ? "bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-800" 
//                           : "bg-transparent border-transparent hover:bg-white/80 hover:border-slate-200"
//                     }`}
//                   >
//                     {/* Left Neon Accent Bar */}
//                     {isSelected && (
//                       <span className="absolute left-0 top-3 bottom-3 w-[4px] bg-gradient-to-b from-cyan-400 to-fuchsia-500 rounded-r-full" />
//                     )}

//                     {/* High-Definition Avatar Matrix */}
//                     <div className="relative shrink-0">
//                       <div className={`w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr transition-all duration-500 ${
//                         isSelected ? "from-cyan-400 via-purple-500 to-fuchsia-500" : isDarkMode ? "from-zinc-800 to-zinc-900" : "from-slate-200 to-slate-300"
//                       }`}>
//                         <img src={friend.avatar} className="w-full h-full object-cover rounded-[14px]" alt="" />
//                       </div>
//                       {friend.active && (
//                         <div className="absolute bottom-[-2px] right-[-2px] w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-zinc-950 rounded-full shadow-sm">
//                           <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
//                         </div>
//                       )}
//                     </div>

//                     {/* Metadata Content Mapping */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between">
//                         <h4 className={`text-sm font-bold tracking-wide truncate ${
//                           isSelected ? (isDarkMode ? "text-cyan-400" : "text-fuchsia-600") : (isDarkMode ? "text-zinc-200" : "text-slate-800")
//                         }`}>{friend.name}</h4>
//                         <span className="text-[10px] font-medium text-zinc-500 shrink-0">{lastMsg?.time || ""}</span>
//                       </div>
//                       <p className={`text-xs truncate mt-1 font-medium ${isDarkMode ? "text-zinc-500" : "text-slate-400"}`}>
//                         {lastMsg ? (lastMsg.sender === "me" ? `You: ${lastMsg.text}` : lastMsg.text) : "No logs available."}
//                       </p>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </aside>

//           {/* ================= 2. MAIN CONSOLE ENGINE ================= */}
//           <main className={`${
//             !isSidebarOpen ? "flex" : "hidden"
//           } md:flex flex-col flex-1 overflow-hidden relative`}>
            
//             {/* Top Interactive Top-Bar */}
//             <header className={`p-4 border-b flex items-center justify-between relative z-10 transition-colors duration-500 ${
//               isDarkMode ? "border-zinc-900/80 bg-zinc-950/40" : "border-slate-200/60 bg-white/60"
//             }`}>
//               <div className="flex items-center gap-3 min-w-0">
//                 <button 
//                   onClick={() => setIsSidebarOpen(true)}
//                   className={`p-2.5 rounded-xl md:hidden mr-1 border transition-all ${
//                     isDarkMode ? "bg-zinc-900 border-zinc-800 text-cyan-400" : "bg-slate-100 border-slate-200 text-slate-700"
//                   }`}
//                 >
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>

//                 <div className="relative shrink-0">
//                   <div className="w-11 h-11 rounded-2xl p-[2px] bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_4px_15px_rgba(6,182,212,0.25)]">
//                     <img src={activeFriend.avatar} className="w-full h-full object-cover rounded-[14px]" alt="" />
//                   </div>
//                 </div>

//                 <div className="min-w-0">
//                   <h3 className={`text-sm font-black tracking-wide truncate ${isDarkMode ? "text-zinc-100" : "text-slate-800"}`}>{activeFriend.name}</h3>
//                   <span className={`text-[10px] font-semibold flex items-center gap-1.5 mt-0.5 ${isDarkMode ? "text-cyan-400" : "text-fuchsia-600"}`}>
//                     <Circle className="w-2 h-2 fill-current animate-pulse" /> {activeFriend.lastSeen}
//                   </span>
//                 </div>
//               </div>

//               {/* Utility Feature Triggers */}
//               <div className={`flex items-center gap-1 sm:gap-2 ${isDarkMode ? "text-zinc-400" : "text-slate-500"}`}>
//                 <button className="p-2.5 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"><Phone className="w-4.5 h-4.5" /></button>
//                 <button className="p-2.5 rounded-xl hover:bg-purple-500/10 hover:text-purple-400 transition-all"><Video className="w-4.5 h-4.5" /></button>
//                 <button className="hidden sm:block p-2.5 rounded-xl hover:bg-fuchsia-500/10 hover:text-fuchsia-400 transition-all"><Info className="w-4.5 h-4.5" /></button>
//               </div>
//             </header>

//             {/* Core Fluid Message Thread Logs */}
//             <div className="flex-1 overflow-y-auto p-5 space-y-5 [perspective:1200px] scrollbar-thin">
//               <AnimatePresence initial={false}>
//                 {activeFriend.messages.map((msg) => {
//                   const isMe = msg.sender === "me";

//                   return (
//                     <motion.div
//                       key={msg.id}
//                       initial={{ opacity: 0, y: 15, scale: 0.96 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       transition={{ type: "spring", stiffness: 200, damping: 20 }}
//                       className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2.5 group`}
//                     >
//                       {!isMe && (
//                         <img src={activeFriend.avatar} className="w-7 h-7 rounded-xl object-cover mb-1 border border-zinc-800 shadow-sm" alt="" />
//                       )}

//                       <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                        
//                         {/* ⚡ Premium Neon Bubble Component */}
//                         <div className={`px-4 py-3 text-xs md:text-sm font-medium rounded-2xl border relative transition-all duration-300 shadow-md ${
//                           isMe 
//                             ? isDarkMode
//                               ? "bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 border-cyan-400/30 text-zinc-950 font-bold shadow-[0_8px_30px_rgba(6,182,212,0.3)] rounded-br-none"
//                               : "bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 border-fuchsia-400/20 text-white font-bold shadow-[0_8px_30px_rgba(217,70,239,0.2)] rounded-br-none"
//                             : isDarkMode 
//                               ? "bg-zinc-900/90 border-zinc-800 text-zinc-100 rounded-bl-none hover:border-purple-500/30" 
//                               : "bg-white border-slate-200 text-slate-800 rounded-bl-none shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:border-cyan-400"
//                         }`}>
//                           {isMe && <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20 rounded-t-2xl pointer-events-none" />}
//                           <p className="leading-relaxed break-words">{msg.text}</p>
//                         </div>
//                         <span className="text-[9px] font-mono text-zinc-500 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{msg.time}</span>
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </AnimatePresence>
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Bottom Premium Command Module/Footer */}
//             <footer className={`p-4 border-t flex items-center gap-3 relative z-10 transition-colors duration-500 ${
//               isDarkMode ? "border-zinc-900/80 bg-zinc-950/40" : "border-slate-200/60 bg-white/60"
//             }`}>
//               <div className="flex gap-1">
//                 <button className="p-2 rounded-xl text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Image className="w-5 h-5" /></button>
//                 <button className="hidden sm:block p-2 rounded-xl text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"><Smile className="w-5 h-5" /></button>
//               </div>

//               {/* Dynamic Uplink Input Field */}
//               <div className={`flex-1 flex items-center border rounded-2xl px-4 py-3 transition-all duration-300 shadow-inner ${
//                 isDarkMode 
//                   ? "bg-zinc-950 border-zinc-800/80 focus-within:border-purple-500/70 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
//                   : "bg-slate-50 border-slate-200 focus-within:border-cyan-500/70 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
//               }`}>
//                 <input 
//                   type="text" 
//                   value={typedMessage}
//                   onChange={(e) => setTypedMessage(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//                   placeholder={isDarkMode ? `Secure tunnel to ${activeFriend.name}...` : `ارسل رسالة آمنة إلى ${activeFriend.name}...`} 
//                   className={`w-full bg-transparent outline-none text-sm transition-colors ${
//                     isDarkMode ? "text-zinc-200 placeholder-zinc-700" : "text-slate-800 placeholder-slate-400"
//                   }`}
//                 />
//                 <button className="text-zinc-400 hover:text-zinc-300 transition-colors ml-2"><MoreHorizontal className="w-4 h-4" /></button>
//               </div>

//               {/* High-Octane Blast Send Trigger */}
//               <motion.button 
//                 whileHover={{ scale: 1.04 }}
//                 whileTap={{ scale: 0.94 }}
//                 onClick={handleSendMessage}
//                 className={`p-3.5 rounded-2xl font-black text-white transition-all duration-300 ${
//                   isDarkMode 
//                     ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-zinc-950 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_#06b6d4]" 
//                     : "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-600 shadow-[0_5px_20px_rgba(217,70,239,0.3)] hover:shadow-[0_5px_30px_#d946ef]"
//                 }`}
//               >
//                 <Send className="w-4 h-4 text-white dark:text-zinc-950" />
//               </motion.button>
//             </footer>

//           </main>

//         </div>
//       </div>
//     </div>
//   );
// }

