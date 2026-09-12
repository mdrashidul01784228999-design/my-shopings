"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  Bell, Search, User, Coins, MoreVertical, ThumbsUp, MessageCircle, 
  Share2, Send, Home, Rss, Settings, Bookmark, ShieldAlert, Image, Plus, X,
  LogOut, ShieldCheck, Zap, Sparkles,
  Copy,
  HomeIcon
} from "lucide-react";

import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale'; 

import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import Api from "../api/Api";
import { useRouter } from "next/navigation";





const initialNotifications = [
  { id: 1, text: "Rashidul Neon আপনার পোস্টে লাইক দিয়েছেন।", time: "৫ মিনিট আগে", unread: true },
  { id: 2, text: "Cyber Glow আপনার কমেন্টে রিপ্লাই দিয়েছেন।", time: "২০ মিনিট আগে", unread: true },
  { id: 3, text: "Bangla Tech একটি নতুন সাইবার পোস্ট শেয়ার করেছেন।", time: "১ ঘণ্টা আগে", unread: false },
];

export default function FbFeedNeon() {


  const [posts, setPosts] = useState<any[]>([]);

const router=useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activities, setActivities] = useState<string[]>(["সিস্টেম বুটআপ সফল হয়েছে।", "ফিড লোড করা হয়েছে।"]);
  
  const [activeCommentBox, setActiveCommentBox] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loadingPostId, setLoadingPostId] = useState<number | null>(null);
  
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeDotMenuId, setActiveDotMenuId] = useState<number | null>(null);

  const [newPostText, setNewPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState<{file: File, preview: string}[]>([]);
  
  // ইউজার স্টেটসমূহ
  const [username, setUsername] = useState('');
  const [userid, setUserid] = useState('');
  const [userCoin, setUserCoin] = useState(0);

  const [userimglocalstoreage, setuserImgs] = useState([]);

  // ==================== INFINITE SCROLL STATES ====================
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null); // স্ক্রোল ডিটেক্ট করার জন্য রেফ
  // ================================================================

  // Placeholder Auto-typing logic
  const placeholders = [
    "তোমার অনুভূতি প্রকাশ করার এই তো সময় ?...",
    "বুকে জমে থাকা কথাগুলো সাইবার স্পেসে ছড়িয়ে দাও! 🌐",
    "নিয়ন আলোয় রাঙিয়ে দাও সবার টাইমলাইন... ✨",
    "আজকের অনুভূতি কেমন? লিখে ফেলো এই ডিজিটাল ওয়ালে... ⚡"
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // টাইম এগো ফরম্যাটার
  const timeAgo = (date: any) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: bn 
      });
    } catch (error) {
      return "এখন";
    }
  };

  // ১. প্রথম পেজ লোড এবং রিয়েল-টাইম পোলিং ফাংশন (নতুন পোস্ট উপরে যুক্ত করবে)
  const fetchPosts = async () => {
    try {
      const response = await Api.get("/allpost?page=1");
      if (response.data.status === 'success') {
        if (page === 1) {
          setPosts(response.data.data);
        } else {
          // ইউজার যদি স্ক্রোল করে নিচে থাকে, তবে শুধু নতুন আসা পোস্টগুলো উপরে পুশ (Prepend) হবে
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id || p.post_id));
            const newPosts = response.data.data.filter((p: any) => !existingIds.has(p.id || p.post_id));
            return [...newPosts, ...prev];
          });
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // ২. স্ক্রোল করলে পরবর্তী পেজের ডাটা লোড করার ফাংশন
  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await Api.get(`/allpost?page=${nextPage}`);
      if (response.data.status === 'success') {
        const newPosts = response.data.data;
        
        if (newPosts.length === 0) {
          setHasMore(false); // আর কোনো ডাটা নেই
        } else {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id || p.post_id));
            const uniqueNewPosts = newPosts.filter((p: any) => !existingIds.has(p.id || p.post_id));
            return [...prev, ...uniqueNewPosts]; // পুরানো ডাটার নিচে নতুন ডাটা অ্যাপেন্ড হবে
          });
          setPage(nextPage);
        }
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // আপনি কাদের ফলো করে রেখেছেন তাদের আইডি ট্র্যাক করার স্টেট
  const [followingList, setFollowingList] = useState<string[]>([]); 

  // ফলো এবং আনফলো টগল করার সাইবার ফাংশন
  const handleFollowToggle = async (targetUserId: string, targetUserName: string) => {
    const isFollowing = followingList.includes(targetUserId);
    
    try {
      if (isFollowing) {
        setFollowingList(prev => prev.filter(id => id !== targetUserId));
        toast.info(`${targetUserName}-কে আনফলো করা হয়েছে।`);
        logActivity(`${targetUserName}-কে আনফলো করা হয়েছে।`);
      } else {
        setFollowingList(prev => [...prev, targetUserId]);
        toast.success(`${targetUserName}-কে ফলো করা হয়েছে! ⚡`);
        logActivity(`${targetUserName}-কে ফলো করা হয়েছে।`);
      }
    } catch (error) {
      toast.error("ফলো/আনফলো প্রসেস ব্যর্থ হয়েছে!");
    }
  };

  // শেয়ার হ্যান্ডলার ফাংশন
  const handleShare = (postId: number) => {
    logActivity(`পোস্ট আইডি "${postId}" শেয়ার করার চেষ্টা করা হয়েছে।`);
    toast.success("Cyber Space-এ শেয়ার সফল হয়েছে!");
  };

  // কমেন্ট সাবমিট ফাংশন
  const handleCommentSubmit = async (postId: number) => {
    if (!commentText.trim()) return;
    setLoadingPostId(postId);
    try {
      logActivity(`পোস্ট আইডি "${postId}" এ কমেন্ট করা হয়েছে।`);
      toast.success("কমেন্ট সফলভাবে যুক্ত হয়েছে!");
      setCommentText("");
      setActiveCommentBox(null);
    } catch (error) {
      toast.error("কমেন্ট ব্যর্থ হয়েছে!");
    } finally {
      setLoadingPostId(null);
    }
  };

  // এফেক্ট ১: পোলিং ম্যানেজমেন্ট (৫ সেকেন্ড পর পর প্রথম পেজ চেক করবে)
  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => {
      fetchPosts();
    }, 5000); 

    return () => clearInterval(interval);
  }, [page]);

  // ==================== INTERSECTION OBSERVER FOR AUTO LOAD ====================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [page, hasMore, isLoadingMore]);
  // =============================================================================

  // এফেক্ট ২: ইউজার ও কয়েন ডাটা লোড
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '[]');
    if (userData[0]) {
      setUsername(userData[0].name || 'set-img');
      setuserImgs(userData[0].img || '');
      setUserid(userData[0].id || '55');
    }

    const coinInterval = setInterval(() => {
      const storedCoin = localStorage.getItem("coin");
      if (storedCoin) {
        setUserCoin(Number(storedCoin) || 0.0);
      }
    }, 3000);

    return () => clearInterval(coinInterval);
  }, []);

  // タイピングエフェクト (Typing Effect)
  useEffect(() => {
    const currentFullText = placeholders[textIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && charIndex < currentFullText.length) {
      timer = setTimeout(() => {
        setCurrentPlaceholder((prev) => prev + currentFullText[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 120);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setCurrentPlaceholder((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      }, 50);
    } else if (!isDeleting && charIndex === currentFullText.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % placeholders.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex]);

  // রেফ ও আউটসাইড ক্লিক লজিক
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const dotMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifPopup(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileModal(false);
      if (dotMenuRef.current && !dotMenuRef.current.contains(event.target as Node)) setActiveDotMenuId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logActivity = (message: string) => {
    setActivities(prev => [message, ...prev.slice(0, 4)]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map((file) => ({
        file: file,
        preview: URL.createObjectURL(file)
      }));
      setSelectedImages((prevImages) => prevImages.concat(newImages));
      logActivity(`${filesArray.length}টি ছবি প্রিভিউতে যুক্ত করা হয়েছে।`);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    logActivity("প্রিভিউ থেকে ছবি রিমুভ করা হয়েছে।");
  };

  // নতুন পোস্ট ক্রিয়েট করার ফাংশন
  const handleCreatePost = async () => {
    if (!newPostText.trim() && selectedImages.length === 0) {
      toast.warn("ফাঁকা পোস্ট পাবলিশ করা যাবে না!");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Cyber Post পাবলিশ হচ্ছে...");

    try {
      const formData = new FormData();
      formData.append("id", userid);
      formData.append("user", username);
      formData.append("text", newPostText);

      selectedImages.forEach((imgObj) => {
        formData.append("images[]", imgObj.file); 
      });

      const response = await Api.post("/mypost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        toast.update(toastId, { render: "পোস্ট পাবলিশ হয়েছে!", type: "success", isLoading: false, autoClose: 3000 });
        setNewPostText("");
        setSelectedImages([]);
        setPage(1); // পোস্ট ক্রিয়েট হলে পেজ ১ এ রিসেট হবে
        fetchPosts(); 
      }
    } catch (error) {
      console.error(error);
      toast.update(toastId, { render: "পোস্ট ব্যর্থ হয়েছে!", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsUploading(false);
    }
  };

  const markAllAsRead = () => {
    alert(4);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020205] via-[#080812] to-[#010110] text-white flex flex-col font-sans pb-20 md:pb-0 perspective-[1000px]">
      
      {/* Toast Container */}
      <ToastContainer theme="dark" position="top-right" />

      {/* ==================== TOP BAR (3D Layered) ==================== */}
      <div className="w-full bg-black/80 backdrop-blur-md text-white shadow-lg px-4 py-2 flex items-center justify-between border-b-2 border-blue-500 rounded-b-2xl sticky top-0 z-50
      [box-shadow:0_4px_20px_rgba(0,0,255,0.4),inset_0_-2px_10px_rgba(0,191,255,0.2)]">
        
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.15, rotateY: 15 }}
            className="text-2xl font-bold text-blue-400 cursor-pointer [text-shadow:0_0_10px_#00f,0_0_20px_#0ff]"
          >
            f
          </motion.div>
          <span className="hidden sm:block font-bold tracking-wider bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">My-post</span>
        </div>

        {/* Middle - Search */}
        <div className="hidden sm:flex items-center rounded-xl px-3 py-1 w-64 md:w-72 border border-pink-500 bg-black/50 [box-shadow:0_0_15px_rgba(255,0,255,0.2),inset_0_0_5px_rgba(255,0,255,0.2)] transform [rotateX:5deg]">
          <Search className="w-4 h-4 text-pink-400" />
          <input
            type="text"
            placeholder="Search Neon Net..."
            className="bg-transparent outline-none px-2 text-sm w-full text-pink-200 placeholder-pink-500/60"
          />
        </div>

        {/* Right - Icons */}
        <div className="flex items-center gap-3 sm:gap-4 relative">
          
          {/* Coins Tracker */}
          <motion.div
            whileHover={{ scale: 1.05, translateZ: 10 }}
            className="flex items-center gap-1 px-3 py-1 rounded-xl cursor-pointer border border-yellow-400 bg-black/80 [box-shadow:0_4px_10px_rgba(255,255,0,0.3)]"
          >
            <Coins className="w-4 h-4 text-yellow-300 animate-spin-[slow]" />
            <span className="font-mono text-yellow-200 text-xs sm:text-sm">
              <CountUp end={userCoin} duration={2} separator="," /> R
            </span>
          </motion.div>

          {/* BELL NOTIFICATION */}
          <div className="relative cursor-pointer group" ref={notifRef} onClick={() => { setShowNotifPopup(!showNotifPopup); setShowProfileModal(false); }}>
            <Bell className="w-5 h-5 sm:w-6 h-6 text-cyan-300 group-hover:text-cyan-400 [filter:drop-shadow(0_0_5px_#0ff)]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
            
            <AnimatePresence>
              {showNotifPopup && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15, rotateX: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  className="absolute right-[-60px] sm:right-0 top-11 w-72 sm:w-80 bg-black/95 border-2 border-cyan-400 rounded-2xl p-3 backdrop-blur-xl z-50 [box-shadow:0_10px_30px_rgba(0,255,255,0.3)] origin-top"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
                    <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1">🔔 নোটিফিকেশন</h3>
                    {unreadCount > 0 && (
                      <button onClick={() => markAllAsRead()} className="text-[10px] text-pink-400 hover:underline">Mark read</button>
                    )}
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-2">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-2 rounded-xl text-[11px] border ${notif.id ? 'bg-cyan-950/30 border-cyan-500/30 text-white' : 'bg-transparent border-gray-900 text-gray-400'}`}>
                        <p>{notif.text}</p>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{notif.id}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Messenger Button */}
          <MessageCircle 
            className="w-5 h-5 sm:w-6 h-6 cursor-pointer text-cyan-300 hover:text-cyan-400 [filter:drop-shadow(0_0_5px_#0ff)]" 
            onClick={() => window.location.href = 'test/messanger'}
          />

          {/* USER PROFILE MODAL */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => { setShowProfileModal(!showProfileModal); setShowNotifPopup(false); }}
              className="w-8 h-8 sm:w-9 h-9 rounded-full border-2 border-green-400 p-0.5 cursor-pointer [box-shadow:0_0_10px_#0f0] overflow-hidden active:scale-95 transition-transform"
            >
              <img 
                src={
                  userimglocalstoreage
                    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userimglocalstoreage}` 
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
                } 
                className="w-full h-full rounded-full object-cover" alt="profile" 
              />
            </div>

            <AnimatePresence>
              {showProfileModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15, rotateY: -15 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  className="absolute right-0 top-12 w-72 sm:w-80 bg-gradient-to-b from-[#0b0b18] to-black border-2 border-green-400 rounded-2xl p-4 z-50 backdrop-blur-2xl [box-shadow:0_15px_35px_rgba(0,255,0,0.25)] origin-top-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-b border-green-500/20 rounded-t-2xl" />
                  
                  <div className="relative flex flex-col items-center mt-4">
                    <div className="w-16 h-16 rounded-full border-2 border-green-400 p-1 bg-black [box-shadow:0_0_15px_#0f0] overflow-hidden">
                      <img src={
                        userimglocalstoreage
                          ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userimglocalstoreage}` 
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
                      } className="w-full h-full rounded-full object-cover" alt="avatar" />
                    </div>
                    <div className="absolute top-12 bg-black border border-green-400 text-green-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Verified
                    </div>
                    <h3 className="mt-4 font-bold text-sm tracking-wide text-white flex items-center gap-1">
                      {username} <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    </h3>
                    <p className="text-[10px] text-gray-400">my-post</p>
                    <p className="text-[11px] text-green-300 text-center mt-2 px-2 italic">""স্বপ্ন যত বড় হবে, পরিশ্রমও তত বড় হতে হবে।" ✨💪✨"</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-4 border-y border-gray-900 py-2.5 text-center">
                    <div>
                      <p className="text-xs font-bold text-cyan-400"><CountUp end={142} />K</p>
                      <p className="text-[9px] text-gray-500 uppercase">Followers</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-400"><CountUp end={840} /></p>
                      <p className="text-[9px] text-gray-500 uppercase">Posts</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-0.5">Level 8 <Zap className="w-3 h-3 fill-yellow-400" /></p>
                      <p className="text-[9px] text-gray-500 uppercase">Rank</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <button   onClick={()=> router.push('/') }  className="flex items-center gap-2 w-full p-2 rounded-xl bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20 transition-all">
                      <HomeIcon className="w-4 h-4" /> Home
                    </button>
                    <button className="flex items-center gap-2 w-full p-2 rounded-xl text-gray-300 hover:bg-white/5 transition-all">
                      <Settings className="w-4 h-4" /> Account Settings
                    </button>
                    <button 
                      onClick={() => { setShowProfileModal(false); logActivity("সিস্টেম থেকে লগআউট রিকোয়েস্ট পাঠানো হয়েছে।"); }}
                      className="flex items-center gap-2 w-full p-2 rounded-xl text-pink-400 hover:bg-pink-500/10 transition-all mt-2 border border-transparent hover:border-pink-500/30"
                    >
                      <LogOut className="w-4 h-4" /> Secure Disconnect
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Main Responsive Layout Body */}
      <div className="w-full max-w-6xl mx-auto flex flex-1 px-2 sm:px-4 gap-6">
        
        {/* ==================== SIDEBAR + ACTIVITY LOG ==================== */}
        <aside className="hidden md:flex flex-col w-64 mt-8 gap-6 h-fit sticky top-24">
          <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-4 backdrop-blur-sm [box-shadow:5px_5px_15px_rgba(0,0,255,0.05)] flex flex-col gap-2 w-full transform [rotateY:10deg]">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider px-3 mb-1">Navigation</p>
            <button className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30">
              <Home className="w-5 h-5" /> <span className="text-sm font-medium">Neon Feed</span>
            </button>
            <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-300 hover:text-purple-300 hover:bg-purple-500/10 transition-all">
              <Rss className="w-5 h-5" /> <span className="text-sm">Latest Stories</span>
            </button>
            <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-300 hover:text-pink-300 hover:bg-pink-500/10 transition-all">
              <Bookmark className="w-5 h-5" /> <span className="text-sm">Bookmarks</span>
            </button>
          </div>

          {/* LIVE LOG */}
          <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-sm [box-shadow:-5px_5px_15px_rgba(160,0,255,0.05)] w-full transform [rotateY:10deg]">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span> Live Activity Log
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {activities.map((act, index) => (
                <div key={index} className="text-[11px] text-gray-400 bg-purple-950/10 p-1.5 rounded-lg border border-purple-900/30">
                  ⚡ {act}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ==================== MIDDLE FEED SECTION ==================== */}
        <div className="flex-1 flex flex-col items-center mt-8 gap-8 w-full max-w-[500px] mx-auto z-10">
          
          {/* 3D POST GENERATOR BOX */}
          <motion.div 
            whileHover={{ rotateX: 3, rotateY: -3, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-full bg-[#05050f]/90 border-2 border-blue-500/80 rounded-2xl p-5 transform-gpu
            [box-shadow:0_15px_30px_rgba(0,0,255,0.25),inset_0_4px_15px_rgba(0,191,255,0.15)]
            before:absolute before:inset-0 before:rounded-2xl before:border before:border-white/10 before:pointer-events-none"
          >
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder={currentPlaceholder}
              className="w-full bg-transparent outline-none resize-none text-sm text-blue-200 placeholder-blue-700/80 h-20 font-medium"
            />

            {/* Image Preview Grid */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 border border-pink-500/30 p-2 rounded-xl mb-3 bg-black/40 [box-shadow:0_5px_10px_rgba(255,0,255,0.1)]">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative h-20 rounded-lg overflow-hidden border border-pink-400 [box-shadow:0_0_5px_#f0f]">
                    <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeSelectedImage(index)}
                      className="absolute top-1 right-1 bg-black/80 rounded-full p-0.5 text-pink-400 border border-pink-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-800/60 pt-3 mt-1">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-pink-400 hover:text-pink-300 text-xs sm:text-sm font-medium cursor-pointer bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/30 transition-all [box-shadow:0_2px_8px_rgba(255,0,255,0.15)]"
              >
                <Image className="w-4 h-4" />
                <span>my Image</span>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" className="hidden" />
              </div>

              <motion.button
                whileHover={!isUploading ? { scale: 1.05 } : {}}
                whileTap={!isUploading ? { scale: 0.95 } : {}}
                onClick={handleCreatePost}
                className={`flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-xl border border-cyan-400 shadow-[0_5px_15px_rgba(0,191,255,0.4)] ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> my Post
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* 3D POST FEED CARDS */}
          {posts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ 
                rotateX: 4, 
                rotateY: -4, 
                y: -6,
                boxShadow: "0px 25px 50px rgba(160, 0, 255, 0.35)"
              }}
              transition={{ type: "spring", stiffness: 250, damping: 18 }}
              className="w-full bg-gradient-to-b from-[#060614] to-[#020208] border-2 border-purple-500 rounded-2xl p-5 relative transform-gpu
              [box-shadow:0_15px_35px_rgba(160,0,255,0.2),inset_0_2px_12px_rgba(160,0,255,0.15)]
              before:absolute before:inset-0 before:rounded-2xl before:border before:border-white/5 before:pointer-events-none"
            >
              
              {/* Profile Row */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center justify-between w-full pb-3 border-b border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 sm:w-12 h-12 rounded-full border-2 border-cyan-400 [box-shadow:0_0_15px_rgba(0,255,255,0.4)] overflow-hidden transform [translateZ:15px]">
                      <img 
                        src={
                          post.user_img 
                            ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${post.user_img}` 
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
                        } 
                        alt="avatar" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base tracking-wide text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                        {post.user_name}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-400/90">{timeAgo(post.realtime)}</p>
                    </div>
                  </div>

                  {String(userid) !== String(post.id) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFollowToggle(post.id, post.user_name)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                        followingList.includes(post.id)
                          ? "bg-transparent border border-pink-500 text-pink-500 [box-shadow:0_0_10px_rgba(236,72,153,0.2)] hover:bg-pink-500/10"
                          : "bg-transparent border border-cyan-400 text-cyan-400 [box-shadow:0_0_10px_rgba(34,211,238,0.2)] hover:bg-cyan-400/10"
                      }`}
                    >
                      {followingList.includes(post.id) ? "• Unfollow" : "+ Follow"}
                    </motion.button>
                  )}
                </div>

                {/* DOT POPUP CONTAINER */}
                <div className="relative" ref={activeDotMenuId === post.id ? dotMenuRef : null}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDotMenuId(activeDotMenuId === post.id ? null : post.id); }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
                  >
                    <MoreVertical className="w-5 h-5 cursor-pointer" />
                  </button>

                  {/* 3D DOT MENU OVERLAY */}
                  <AnimatePresence>
                    {activeDotMenuId === post.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10, rotateX: -15 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute right-0 top-10 w-48 bg-black/95 border-2 border-purple-500 rounded-xl p-1.5 backdrop-blur-xl z-50 [box-shadow:0_10px_25px_rgba(160,0,255,0.5)] origin-top-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col text-xs font-semibold">
                          <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টটি সেভ করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10 text-left"><Bookmark className="w-3.5 h-3.5" /> Save bookmark</button>
                          <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টের লিংক কপি করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-300 hover:text-purple-300 hover:bg-purple-500/10 text-left"><Copy className="w-3.5 h-3.5" /> Copy Link</button>
                          <button onClick={() => { setActiveDotMenuId(null); handleShare(post.id); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-300 hover:text-purple-300 hover:bg-purple-500/10 text-left"><Share2 className="w-3.5 h-3.5" /> share </button>
                          <div className="border-t border-gray-800 my-1"></div>
                          <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টটি হাইড করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-pink-400 hover:bg-pink-500/10 text-left"><X className="w-3.5 h-3.5" /> deleted</button>
                          <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টের বিরুদ্ধে রিপোর্ট করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-red-500 hover:bg-red-500/10 text-left"><ShieldAlert className="w-3.5 h-3.5" /> Report</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Post Content */}
              <p className="mb-4 text-gray-200 text-xs sm:text-sm leading-relaxed tracking-wide font-medium [translateZ:10px]">{post.post}</p>
              
              {/* 3D Deep Grid Images Container */}
              <div className="rounded-xl overflow-hidden border-2 border-pink-500/80 [box-shadow:0_8px_20px_rgba(255,0,255,0.25)] bg-black transform [translateZ:5px]">
                {(() => {
                  const images = post.imgs || [];
                  const getImgUrl = (imgName: string) => `${process.env.NEXT_PUBLIC_IMAGE_URL}/my_post_img/${imgName}`;

                  if (images.length === 0) return null;

                  return images.length === 1 ? (
                    <img 
                      src={getImgUrl(images[0])} 
                      alt="post" 
                      className="w-full object-cover max-h-[300px] hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      {images.slice(0, 4).map((img: string, idx: number) => (
                        <div key={idx} className="relative h-36 sm:h-40 overflow-hidden bg-gray-950">
                          <img 
                            src={getImgUrl(img)} 
                            alt="grid-post" 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                          />
                          {idx === 3 && images.length > 4 && (
                            <div className="absolute inset-0 bg-black/85 flex items-center justify-center text-lg font-bold text-pink-400">
                              +{images.length - 4} More
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons Row */}
              <div className="flex justify-between mt-5 text-xs sm:text-sm border-b border-gray-800/80 pb-3 relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => logActivity(`আপনি "${post.id}" এর পোস্টে লাইক দিয়েছেন।`)} 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-400 bg-blue-950/10 shadow-[0_3px_8px_rgba(0,0,255,0.2)] hover:bg-blue-500/20 transition-all"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-400" /> <span>Like</span>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => setActiveCommentBox(activeCommentBox === post.id ? null : post.id)} 
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border border-green-400 bg-green-950/10 shadow-[0_3px_8px_rgba(0,255,0,0.2)] hover:bg-green-500/20 transition-all ${activeCommentBox === post.id ? 'bg-green-500/30' : ''}`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-green-400" /> <span>Comment</span>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => handleShare(post.id)} 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-yellow-400 bg-yellow-950/10 shadow-[0_3px_8px_rgba(255,255,0,0.2)] hover:bg-yellow-500/20 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-yellow-400" /> <span>Share</span>
                </motion.button>
              </div>

              {/* Comment Input Component */}
              {activeCommentBox === post.id && (
                <motion.div 
                  initial={{ opacity: 0, y: -15, rotateX: -10 }} 
                  animate={{ opacity: 1, y: 0, rotateX: 0 }} 
                  className="mt-4 flex items-center gap-2 border-2 border-green-500 rounded-xl p-2 bg-black/60 shadow-[0_4px_12px_rgba(0,255,0,0.2)]"
                >
                  <input type="text" placeholder="Write a cyber comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="bg-transparent flex-1 outline-none text-xs text-green-200 placeholder-green-800 px-2" />
                  <button onClick={() => handleCommentSubmit(post.id)} disabled={loadingPostId === post.id} className="p-1 text-green-400 hover:text-green-300 transition-colors"><Send className="w-3.5 h-3.5" /></button>
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* ==================== INFINITE SCROLL TRIGGER TARGET ==================== */}
          <div ref={loadMoreRef} className="h-10 w-full flex items-center justify-center">
            {isLoadingMore && (
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {!hasMore && posts.length > 0 && (
              <p className="text-xs text-gray-500 font-medium">✨ আর কোনো সাইবার পোস্ট নেই ✨</p>
            )}
          </div>
          {/* ======================================================================== */}

        </div>

      </div>

      {/* ==================== MOBILE BOTTOM BAR ==================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-lg border-t-2 border-blue-500 flex items-center justify-around px-4 z-50 rounded-t-2xl [box-shadow:0_-5px_20px_rgba(0,0,255,0.3)]">
        <button className="flex flex-col items-center gap-0.5 text-blue-400">
          <Home className="w-5 h-5 [filter:drop-shadow(0_0_5px_#00f)]" /><span className="text-[10px] font-bold">Feed</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-gray-500">
          <Rss className="w-5 h-5" /><span className="text-[10px]">Stories</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-gray-500">
          <Bookmark className="w-5 h-5" /><span className="text-[10px]">Saved</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-gray-500">
          <Settings className="w-5 h-5" /><span className="text-[10px]">Setup</span>
        </button>
      </div>

    </div>
  );
}

// "use client";

// import { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { 
//   Bell, Search, User, Coins, MoreVertical, ThumbsUp, MessageCircle, 
//   Share2, Send, Home, Rss, Settings, Bookmark, ShieldAlert, Image, Plus, X,
//   LogOut, ShieldCheck, Zap, Sparkles,
//   Copy
// } from "lucide-react";

// import { formatDistanceToNow } from 'date-fns';
// import { bn } from 'date-fns/locale'; 

// import { motion, AnimatePresence } from "framer-motion";
// import CountUp from "react-countup";
// import { ToastContainer, toast } from "react-toastify";

// import "react-toastify/dist/ReactToastify.css";

// import Api from "../api/Api";

// const initialNotifications = [
//   { id: 1, text: "Rashidul Neon আপনার পোস্টে লাইক দিয়েছেন।", time: "৫ মিনিট আগে", unread: true },
//   { id: 2, text: "Cyber Glow আপনার কমেন্টে রিপ্লাই দিয়েছেন।", time: "২০ মিনিট আগে", unread: true },
//   { id: 3, text: "Bangla Tech একটি নতুন সাইবার পোস্ট শেয়ার করেছেন।", time: "১ ঘণ্টা আগে", unread: false },
// ];

// export default function FbFeedNeon() {
//   const [posts, setPosts] = useState<any[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [notifications, setNotifications] = useState(initialNotifications);
//   const [activities, setActivities] = useState<string[]>(["সিস্টেম বুটআপ সফল হয়েছে।", "ফিড লোড করা হয়েছে।"]);
  
//   const [activeCommentBox, setActiveCommentBox] = useState<number | null>(null);
//   const [commentText, setCommentText] = useState("");
//   const [loadingPostId, setLoadingPostId] = useState<number | null>(null);
  
//   const [showNotifPopup, setShowNotifPopup] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [activeDotMenuId, setActiveDotMenuId] = useState<number | null>(null);

//   const [newPostText, setNewPostText] = useState("");
//   const [selectedImages, setSelectedImages] = useState<{file: File, preview: string}[]>([]);
  
//   // ইউজার স্টেটসমূহ
//   const [username, setUsername] = useState('');
//   const [userid, setUserid] = useState('');
//   const [userCoin, setUserCoin] = useState(0);

//   const [userimglocalstoreage, setuserImgs] = useState([]);

//   // ==================== INFINITE SCROLL STATES ====================
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const loadMoreRef = useRef<HTMLDivElement>(null); // স্ক্রোল ডিটেক্ট করার জন্য রেফ
//   // ================================================================

//   // Placeholder Auto-typing logic
//   const placeholders = [
//     "তোমার অনুভূতি প্রকাশ করার এই তো সময় ?...",
//     "বুকে জমে থাকা কথাগুলো সাইবার স্পেসে ছড়িয়ে দাও! 🌐",
//     "নিয়ন আলোয় রাঙিয়ে দাও সবার টাইমলাইন... ✨",
//     "আজকের অনুভূতি কেমন? লিখে ফেলো এই ডিজিটাল ওয়ালে... ⚡"
//   ];
//   const [currentPlaceholder, setCurrentPlaceholder] = useState("");
//   const [textIndex, setTextIndex] = useState(0);
//   const [charIndex, setCharIndex] = useState(0);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // টাইম এগো ফরম্যাটার
//   const timeAgo = (date: any) => {
//     if (!date) return "";
//     try {
//       return formatDistanceToNow(new Date(date), { 
//         addSuffix: true, 
//         locale: bn 
//       });
//     } catch (error) {
//       return "এখন";
//     }
//   };

//   // ১. প্রথম পেজ লোড এবং রিয়েল-টাইম পোলিং ফাংশন (নতুন পোস্ট উপরে যুক্ত করবে)
//   const fetchPosts = async () => {
//     try {
//       const response = await Api.get("/allpost?page=1");
//       if (response.data.status === 'success') {
//         if (page === 1) {
//           setPosts(response.data.data);
//         } else {
//           // ইউজার যদি স্ক্রোল করে নিচে থাকে, তবে শুধু নতুন আসা পোস্টগুলো উপরে পুশ (Prepend) হবে
//           setPosts(prev => {
//             const existingIds = new Set(prev.map(p => p.id || p.post_id));
//             const newPosts = response.data.data.filter((p: any) => !existingIds.has(p.id || p.post_id));
//             return [...newPosts, ...prev];
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching posts:", error);
//     }
//   };

//   // ২. স্ক্রোল করলে পরবর্তী পেজের ডাটা লোড করার ফাংশন
//   const loadMorePosts = async () => {
//     if (isLoadingMore || !hasMore) return;
//     setIsLoadingMore(true);
//     const nextPage = page + 1;

//     try {
//       const response = await Api.get(`/allpost?page=${nextPage}`);
//       if (response.data.status === 'success') {
//         const newPosts = response.data.data;
        
//         if (newPosts.length === 0) {
//           setHasMore(false); // আর কোনো ডাটা নেই
//         } else {
//           setPosts(prev => {
//             const existingIds = new Set(prev.map(p => p.id || p.post_id));
//             const uniqueNewPosts = newPosts.filter((p: any) => !existingIds.has(p.id || p.post_id));
//             return [...prev, ...uniqueNewPosts]; // পুরানো ডাটার নিচে নতুন ডাটা অ্যাপেন্ড হবে
//           });
//           setPage(nextPage);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading more posts:", error);
//     } finally {
//       setIsLoadingMore(false);
//     }
//   };












// // আপনি কাদের ফলো করে রেখেছেন তাদের আইডি ট্র্যাক করার স্টেট
// const [followingList, setFollowingList] = useState<string[]>([]); 

// // ফলো এবং আনফলো টগল করার সাইবার ফাংশন
// const handleFollowToggle = async (targetUserId: string, targetUserName: string) => {
//   const isFollowing = followingList.includes(targetUserId);
  
//   try {
//     if (isFollowing) {
//       // আনফলো করার API কল (আপনার ব্যাকএন্ড রাউট অনুযায়ী চেঞ্জ করে নিতে পারেন)
//       // await Api.post('/unfollow', { user_id: userid, target_id: targetUserId });
      
//       setFollowingList(prev => prev.filter(id => id !== targetUserId));
//       toast.info(`${targetUserName}-কে আনফলো করা হয়েছে।`);
//       logActivity(`${targetUserName}-কে আনফলো করা হয়েছে।`);
//     } else {
//       // ফলো করার API কল
//       // await Api.post('/follow', { user_id: userid, target_id: targetUserId });
      
//       setFollowingList(prev => [...prev, targetUserId]);
//       toast.success(`${targetUserName}-কে ফলো করা হয়েছে! ⚡`);
//       logActivity(`${targetUserName}-কে ফলো করা হয়েছে।`);
//     }
//   } catch (error) {
//     toast.error("ফলো/আনফলো প্রসেস ব্যর্থ হয়েছে!");
//   }
// };







//   // এফেক্ট ১: পোলিং ম্যানেজমেন্ট (৫ সেকেন্ড পর পর প্রথম পেজ চেক করবে)
//   useEffect(() => {
//     fetchPosts();
//     const interval = setInterval(() => {
//       fetchPosts();
//     }, 5000); 

//     return () => clearInterval(interval);
//   }, [page]);

//   // ==================== INTERSECTION OBSERVER FOR AUTO LOAD ====================
//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
//           loadMorePosts();
//         }
//       },
//       { threshold: 0.5 }
//     );

//     if (loadMoreRef.current) {
//       observer.observe(loadMoreRef.current);
//     }

//     return () => {
//       if (loadMoreRef.current) {
//         observer.unobserve(loadMoreRef.current);
//       }
//     };
//   }, [page, hasMore, isLoadingMore]);
//   // =============================================================================

//   // এফেক্ট ২: ইউজার ও কয়েন ডাটা লোড
//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem('userData') || '[]');
//     if (userData[0]) {
//       setUsername(userData[0].name || 'set-img');
//       setuserImgs(userData[0].img || '');
//       setUserid(userData[0].id || '55');
//     }

//     const coinInterval = setInterval(() => {
//       const storedCoin = localStorage.getItem("coin");
//       if (storedCoin) {
//         setUserCoin(Number(storedCoin) || 0.0);
//       }
//     }, 3000);

//     return () => clearInterval(coinInterval);
//   }, []);

//   // টাইপিং ইফেক্ট
//   useEffect(() => {
//     const currentFullText = placeholders[textIndex];
//     let timer: NodeJS.Timeout;

//     if (!isDeleting && charIndex < currentFullText.length) {
//       timer = setTimeout(() => {
//         setCurrentPlaceholder((prev) => prev + currentFullText[charIndex]);
//         setCharIndex((prev) => prev + 1);
//       }, 120);
//     } else if (isDeleting && charIndex > 0) {
//       timer = setTimeout(() => {
//         setCurrentPlaceholder((prev) => prev.slice(0, -1));
//         setCharIndex((prev) => prev - 1);
//       }, 50);
//     } else if (!isDeleting && charIndex === currentFullText.length) {
//       timer = setTimeout(() => setIsDeleting(true), 2000);
//     } else if (isDeleting && charIndex === 0) {
//       setIsDeleting(false);
//       setTextIndex((prev) => (prev + 1) % placeholders.length);
//     }

//     return () => clearTimeout(timer);
//   }, [charIndex, isDeleting, textIndex]);

//   // রেফ ও আউটসাইড ক্লিক লজিক
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const notifRef = useRef<HTMLDivElement>(null);
//   const profileRef = useRef<HTMLDivElement>(null);
//   const dotMenuRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifPopup(false);
//       if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileModal(false);
//       if (dotMenuRef.current && !dotMenuRef.current.contains(event.target as Node)) setActiveDotMenuId(null);
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const logActivity = (message: string) => {
//     setActivities(prev => [message, ...prev.slice(0, 4)]);
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files);
//       const newImages = filesArray.map((file) => ({
//         file: file,
//         preview: URL.createObjectURL(file)
//       }));
//       setSelectedImages((prevImages) => prevImages.concat(newImages));
//       logActivity(`${filesArray.length}টি ছবি প্রিভিউতে যুক্ত করা হয়েছে।`);
//     }
//   };

//   const removeSelectedImage = (index: number) => {
//     setSelectedImages((prev) => prev.filter((_, i) => i !== index));
//     logActivity("প্রিভিউ থেকে ছবি রিমুভ করা হয়েছে।");
//   };

//   // নতুন পোস্ট ক্রিয়েট করার ফাংশন
//   const handleCreatePost = async () => {
//     if (!newPostText.trim() && selectedImages.length === 0) {
//       toast.warn("ফাঁকা পোস্ট পাবলিশ করা যাবে না!");
//       return;
//     }

//     setIsUploading(true);
//     const toastId = toast.loading("Cyber Post পাবলিশ হচ্ছে...");

//     try {
//       const formData = new FormData();
//       formData.append("id", userid);
//       formData.append("user", username);
//       formData.append("text", newPostText);

//       selectedImages.forEach((imgObj) => {
//         formData.append("images[]", imgObj.file); 
//       });

//       const response = await Api.post("/mypost", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data) {
//         toast.update(toastId, { render: "পোস্ট পাবলিশ হয়েছে!", type: "success", isLoading: false, autoClose: 3000 });
//         setNewPostText("");
//         setSelectedImages([]);
//         setPage(1); // পোস্ট ক্রিয়েট হলে পেজ ১ এ রিসেট হবে
//         fetchPosts(); 
//       }
//     } catch (error) {
//       console.error(error);
//       toast.update(toastId, { render: "পোস্ট ব্যর্থ হয়েছে!", type: "error", isLoading: false, autoClose: 3000 });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const markAllAsRead=()=>{

//     alert(4);
//   }


//   const unreadCount = notifications.filter(n => n.unread).length;

//   return (

//     <div className="min-h-screen bg-gradient-to-br from-[#020205] via-[#080812] to-[#010110] text-white flex flex-col font-sans pb-20 md:pb-0 perspective-[1000px]">
      
//       {/* Toast Container */}
//       <ToastContainer theme="dark" position="top-right" />

//       {/* ==================== TOP BAR (3D Layered) ==================== */}
//       <div className="w-full bg-black/80 backdrop-blur-md text-white shadow-lg px-4 py-2 flex items-center justify-between border-b-2 border-blue-500 rounded-b-2xl sticky top-0 z-50
//       [box-shadow:0_4px_20px_rgba(0,0,255,0.4),inset_0_-2px_10px_rgba(0,191,255,0.2)]">
        
//         {/* Left - Logo */}
//         <div className="flex items-center gap-2">
//           <motion.div
//             whileHover={{ scale: 1.15, rotateY: 15 }}
//             className="text-2xl font-bold text-blue-400 cursor-pointer [text-shadow:0_0_10px_#00f,0_0_20px_#0ff]"
//           >
//             f
//           </motion.div>
//           <span className="hidden sm:block font-bold tracking-wider bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">My-post</span>
//         </div>

//         {/* Middle - Search */}
//         <div className="hidden sm:flex items-center rounded-xl px-3 py-1 w-64 md:w-72 border border-pink-500 bg-black/50 [box-shadow:0_0_15px_rgba(255,0,255,0.2),inset_0_0_5px_rgba(255,0,255,0.2)] transform [rotateX:5deg]">
//           <Search className="w-4 h-4 text-pink-400" />
//           <input
//             type="text"
//             placeholder="Search Neon Net..."
//             className="bg-transparent outline-none px-2 text-sm w-full text-pink-200 placeholder-pink-500/60"
//           />
//         </div>






















//         {/* Right - Icons */}
//         <div className="flex items-center gap-3 sm:gap-4 relative">
          
//           {/* Coins Tracker */}
//           <motion.div
//             whileHover={{ scale: 1.05, translateZ: 10 }}
//             className="flex items-center gap-1 px-3 py-1 rounded-xl cursor-pointer border border-yellow-400 bg-black/80 [box-shadow:0_4px_10px_rgba(255,255,0,0.3)]"
//           >
//             <Coins className="w-4 h-4 text-yellow-300 animate-spin-[slow]" />
//             <span className="font-mono text-yellow-200 text-xs sm:text-sm">
//               <CountUp end={userCoin} duration={2} separator="," /> R
//             </span>
//           </motion.div>

//           {/* BELL NOTIFICATION */}
//           <div className="relative cursor-pointer group" ref={notifRef} onClick={() => { setShowNotifPopup(!showNotifPopup); setShowProfileModal(false); }}>
//             <Bell className="w-5 h-5 sm:w-6 h-6 text-cyan-300 group-hover:text-cyan-400 [filter:drop-shadow(0_0_5px_#0ff)]" />
//             {unreadCount > 0 && (
//               <span className="absolute -top-1 -right-1 bg-pink-500 text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
//                 {unreadCount}
//               </span>
//             )}
            
//             <AnimatePresence>
//               {showNotifPopup && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9, y: 15, rotateX: -10 }}
//                   animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
//                   exit={{ opacity: 0, scale: 0.9, y: 15 }}
//                   className="absolute right-[-60px] sm:right-0 top-11 w-72 sm:w-80 bg-black/95 border-2 border-cyan-400 rounded-2xl p-3 backdrop-blur-xl z-50 [box-shadow:0_10px_30px_rgba(0,255,255,0.3)] origin-top"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
//                     <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1">🔔 নোটিফিকেশন</h3>
//                     {unreadCount > 0 && (
//                       <button onClick={()=> markAllAsRead()} className="text-[10px] text-pink-400 hover:underline">Mark read</button>
//                     )}
//                   </div>
//                   <div className="max-h-52 overflow-y-auto space-y-2">
//                     {notifications.map((notif) => (
//                       <div key={notif.id} className={`p-2 rounded-xl text-[11px] border ${notif.id ? 'bg-cyan-950/30 border-cyan-500/30 text-white' : 'bg-transparent border-gray-900 text-gray-400'}`}>
//                         <p>{notif.text}</p>
//                         <span className="text-[9px] text-gray-500 block mt-0.5">{notif.id}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Messenger Button */}
//           <MessageCircle 
//             className="w-5 h-5 sm:w-6 h-6 cursor-pointer text-cyan-300 hover:text-cyan-400 [filter:drop-shadow(0_0_5px_#0ff)]" 
//             onClick={() => window.location.href ='test/messanger' }
//           />










//           {/* USER PROFILE MODAL */}
//           <div className="relative" ref={profileRef}>
//             <div 
//               onClick={() => { setShowProfileModal(!showProfileModal); setShowNotifPopup(false); }}
//               className="w-8 h-8 sm:w-9 h-9 rounded-full border-2 border-green-400 p-0.5 cursor-pointer [box-shadow:0_0_10px_#0f0] overflow-hidden active:scale-95 transition-transform"
//             >
//               <img 
              
//                 src={
//    userimglocalstoreage
//       ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userimglocalstoreage}` 
//       : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix` }
              
//               className="w-full h-full rounded-full object-cover" alt="profile" />
//             </div>

//             <AnimatePresence>
//               {showProfileModal && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9, y: 15, rotateY: -15 }}
//                   animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
//                   exit={{ opacity: 0, scale: 0.9, y: 15 }}
//                   className="absolute right-0 top-12 w-72 sm:w-80 bg-gradient-to-b from-[#0b0b18] to-black border-2 border-green-400 rounded-2xl p-4 z-50 backdrop-blur-2xl [box-shadow:0_15px_35px_rgba(0,255,0,0.25)] origin-top-right"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border-b border-green-500/20 rounded-t-2xl" />
                  
//                   <div className="relative flex flex-col items-center mt-4">
//                     <div className="w-16 h-16 rounded-full border-2 border-green-400 p-1 bg-black [box-shadow:0_0_15px_#0f0] overflow-hidden">
//                       <img   src={
//    userimglocalstoreage
//       ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userimglocalstoreage}` 
//       : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
//   }  className="w-full h-full rounded-full object-cover" alt="avatar" />
//                     </div>
//                     <div className="absolute top-12 bg-black border border-green-400 text-green-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
//                       <ShieldCheck className="w-2.5 h-2.5" /> Verified
//                     </div>
//                     <h3 className="mt-4 font-bold text-sm tracking-wide text-white flex items-center gap-1">
//                      {username} <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
//                     </h3>
//                     <p className="text-[10px] text-gray-400">my-post</p>
//                     <p className="text-[11px] text-green-300 text-center mt-2 px-2 italic">"কোডিংই জীবন, গ্লোয়িং থিমই ভালোবাসা। ✨"</p>
//                   </div>

//                   <div className="grid grid-cols-3 gap-2 my-4 border-y border-gray-900 py-2.5 text-center">
//                     <div>
//                       <p className="text-xs font-bold text-cyan-400"><CountUp end={142} />K</p>
//                       <p className="text-[9px] text-gray-500 uppercase">Followers</p>
//                     </div>
//                     <div>
//                       <p className="text-xs font-bold text-purple-400"><CountUp end={840} /></p>
//                       <p className="text-[9px] text-gray-500 uppercase">Posts</p>
//                     </div>
//                     <div>
//                       <p className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-0.5">Level 8 <Zap className="w-3 h-3 fill-yellow-400" /></p>
//                       <p className="text-[9px] text-gray-500 uppercase">Rank</p>
//                     </div>
//                   </div>

//                   <div className="space-y-1.5 text-xs">
//                     <button className="flex items-center gap-2 w-full p-2 rounded-xl bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20 transition-all">
//                       <User className="w-4 h-4" /> View My Profile Space
//                     </button>
//                     <button className="flex items-center gap-2 w-full p-2 rounded-xl text-gray-300 hover:bg-white/5 transition-all">
//                       <Settings className="w-4 h-4" /> Account Settings
//                     </button>
//                     <button 
//                       onClick={() => { setShowProfileModal(false); logActivity("সিস্টেম থেকে লগআউট রিকোয়েস্ট পাঠানো হয়েছে।"); }}
//                       className="flex items-center gap-2 w-full p-2 rounded-xl text-pink-400 hover:bg-pink-500/10 transition-all mt-2 border border-transparent hover:border-pink-500/30"
//                     >
//                       <LogOut className="w-4 h-4" /> Secure Disconnect
//                     </button>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//         </div>
//       </div>

//       {/* Main Responsive Layout Body */}
//       <div className="w-full max-w-6xl mx-auto flex flex-1 px-2 sm:px-4 gap-6">
        
//         {/* ==================== SIDEBAR + ACTIVITY LOG ==================== */}
//         <aside className="hidden md:flex flex-col w-64 mt-8 gap-6 h-fit sticky top-24">
//           <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-4 backdrop-blur-sm [box-shadow:5px_5px_15px_rgba(0,0,255,0.05)] flex flex-col gap-2 w-full transform [rotateY:10deg]">
//             <p className="text-xs font-bold text-blue-400 uppercase tracking-wider px-3 mb-1">Navigation</p>
//             <button className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30">
//               <Home className="w-5 h-5" /> <span className="text-sm font-medium">Neon Feed</span>
//             </button>
//             <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-300 hover:text-purple-300 hover:bg-purple-500/10 transition-all">
//               <Rss className="w-5 h-5" /> <span className="text-sm">Latest Stories</span>
//             </button>
//             <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-300 hover:text-pink-300 hover:bg-pink-500/10 transition-all">
//               <Bookmark className="w-5 h-5" /> <span className="text-sm">Bookmarks</span>
//             </button>
//           </div>

//           {/* LIVE LOG */}
//           <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-sm [box-shadow:-5px_5px_15px_rgba(160,0,255,0.05)] w-full transform [rotateY:10deg]">
//             <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1">
//               <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span> Live Activity Log
//             </p>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {activities.map((act, index) => (
//                 <div key={index} className="text-[11px] text-gray-400 bg-purple-950/10 p-1.5 rounded-lg border border-purple-900/30">
//                   ⚡ {act}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </aside>

//         {/* ==================== MIDDLE FEED SECTION ==================== */}
//         <div className="flex-1 flex flex-col items-center mt-8 gap-8 w-full max-w-[500px] mx-auto z-10">
          
//           {/* 3D POST GENERATOR BOX */}
//           <motion.div 
//             whileHover={{ rotateX: 3, rotateY: -3, y: -4 }}
//             transition={{ type: "spring", stiffness: 300, damping: 15 }}
//             className="w-full bg-[#05050f]/90 border-2 border-blue-500/80 rounded-2xl p-5 transform-gpu
//             [box-shadow:0_15px_30px_rgba(0,0,255,0.25),inset_0_4px_15px_rgba(0,191,255,0.15)]
//             before:absolute before:inset-0 before:rounded-2xl before:border before:border-white/10 before:pointer-events-none"
//           >
//             {/* অটো টাইপিং প্লেসহোল্ডার এখানে যুক্ত করা হয়েছে */}
//             <textarea
//               value={newPostText}
//               onChange={(e) => setNewPostText(e.target.value)}
//               placeholder={currentPlaceholder}
//               className="w-full bg-transparent outline-none resize-none text-sm text-blue-200 placeholder-blue-700/80 h-20 font-medium"
//             />

//             {/* Image Preview Grid */}
//             {selectedImages.length > 0 && (
//               <div className="grid grid-cols-3 gap-2 border border-pink-500/30 p-2 rounded-xl mb-3 bg-black/40 [box-shadow:0_5px_10px_rgba(255,0,255,0.1)]">
//                 {selectedImages.map((img, index) => (
//                   <div key={index} className="relative h-20 rounded-lg overflow-hidden border border-pink-400 [box-shadow:0_0_5px_#f0f]">
//                     <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
//                     <button 
//                       onClick={() => removeSelectedImage(index)}
//                       className="absolute top-1 right-1 bg-black/80 rounded-full p-0.5 text-pink-400 border border-pink-500"
//                     >
//                       <X className="w-3 h-3" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <div className="flex items-center justify-between border-t border-gray-800/60 pt-3 mt-1">
//               <div 
//                 onClick={() => fileInputRef.current?.click()}
//                 className="flex items-center gap-2 text-pink-400 hover:text-pink-300 text-xs sm:text-sm font-medium cursor-pointer bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/30 transition-all [box-shadow:0_2px_8px_rgba(255,0,255,0.15)]"
//               >
//                 <Image className="w-4 h-4" />
//                 <span>my Image</span>
//                 <input type="file" ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" className="hidden" />
//               </div>


//              <motion.button
//   whileHover={!isUploading ? { scale: 1.05 } : {}}
//   whileTap={!isUploading ? { scale: 0.95 } : {}}
//   onClick={handleCreatePost}
//    className={`flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-xl border border-cyan-400 shadow-[0_5px_15px_rgba(0,191,255,0.4)] ${
//     isUploading ? "opacity-50 cursor-not-allowed" : ""
//   }`}
// >
//   {isUploading ? (
//     <>
//       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//       Uploading...
//     </>
//   ) : (
//     <>
//       <Plus className="w-4 h-4" /> my Post
//     </>
//   )}
// </motion.button>


//             </div>
//           </motion.div>

//           {/* 3D POST FEED CARDS */}
//           {posts.map((post) => (
//             <motion.div
//               key={post.id}
//               whileHover={{ 
//                 rotateX: 4, 
//                 rotateY: -4, 
//                 y: -6,
//                 boxShadow: "0px 25px 50px rgba(160, 0, 255, 0.35)"
//               }}
//               transition={{ type: "spring", stiffness: 250, damping: 18 }}
//               className="w-full bg-gradient-to-b from-[#060614] to-[#020208] border-2 border-purple-500 rounded-2xl p-5 relative transform-gpu
//               [box-shadow:0_15px_35px_rgba(160,0,255,0.2),inset_0_2px_12px_rgba(160,0,255,0.15)]
//               before:absolute before:inset-0 before:rounded-2xl before:border before:border-white/5 before:pointer-events-none"
//             >
              
//               {/* Profile Row */}
//               <div className="flex items-center justify-between mb-4 relative z-10">
           
//            <div className="flex items-center justify-between w-full pb-3 border-b border-gray-800/50">
//   {/* বাম পাশের প্রোফাইল ইনফো */}
//   <div className="flex items-center gap-3">
//     <div className="w-11 h-11 sm:w-12 h-12 rounded-full border-2 border-cyan-400 [box-shadow:0_0_15px_rgba(0,255,255,0.4)] overflow-hidden transform [translateZ:15px]">
//       {/* প্রোফাইল পিকচার হিসেবে post.user_avatar ব্যবহার করা ভালো (আগের কন্ট্রোলারে যেটা সেট করা হয়েছে) */}
      
   
// <img 
//   src={
//     post.user_img 
//       ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${post.user_img}` 
//       : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
//   } 
//   alt="avatar" 
//   className="w-full h-full object-cover" 
// />


//     </div>
//     <div>
//       <h4 className="font-bold text-sm sm:text-base tracking-wide text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
//         {post.user_name}
//       </h4>
//       <p className="text-[10px] sm:text-xs text-gray-400/90">{timeAgo(post.realtime)}</p>
//     </div>
//   </div>

//   {/* ডান পাশের নিয়ন ফলো/আনফলো বাটন (নিজে নিজেকে ফলো করা যাবে না) */}
//   {String(userid) !== String(post.id) && (
//     <motion.button
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       onClick={() => handleFollowToggle(post.id, post.user_name)}
//       className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
//         followingList.includes(post.id)
//           ? "bg-transparent border border-pink-500 text-pink-500 [box-shadow:0_0_10px_rgba(236,72,153,0.2)] hover:bg-pink-500/10"
//           : "bg-transparent border border-cyan-400 text-cyan-400 [box-shadow:0_0_10px_rgba(34,211,238,0.2)] hover:bg-cyan-400/10"
//       }`}
//     >
//       {followingList.includes(post.userid) ? "• Unfollow" : "+ Follow"}
//     </motion.button>
//   )}
// </div>

               

//                 {/* DOT POPUP CONTAINER */}
//                 <div className="relative" ref={activeDotMenuId === post.id ? dotMenuRef : null}>
//                   <button 
//                     onClick={(e) => { e.stopPropagation(); setActiveDotMenuId(activeDotMenuId === post.id ? null : post.id); }}
//                     className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
//                   >
//                     <MoreVertical className="w-5 h-5 cursor-pointer" />
//                   </button>

//                   {/* 3D DOT MENU OVERLAY */}
//                   <AnimatePresence>
//                     {activeDotMenuId === post.id && (
//                       <motion.div
//                         initial={{ opacity: 0, scale: 0.9, y: -10, rotateX: -15 }}
//                         animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
//                         exit={{ opacity: 0, scale: 0.9, y: -10 }}
//                         className="absolute right-0 top-10 w-48 bg-black/95 border-2 border-purple-500 rounded-xl p-1.5 backdrop-blur-xl z-50 [box-shadow:0_10px_25px_rgba(160,0,255,0.5)] origin-top-right"
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         <div className="flex flex-col text-xs font-semibold">
//                           <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টটি সেভ করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10 text-left"><Bookmark className="w-3.5 h-3.5" /> Save bookmark</button>
//                           <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টের লিংক কপি করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-300 hover:text-purple-300 hover:bg-purple-500/10 text-left"><Copy className="w-3.5 h-3.5" /> Copy  Link</button>
//                           <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টের লিংক কপি করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-300 hover:text-purple-300 hover:bg-purple-500/10 text-left"><Share2 className="w-3.5 h-3.5" /> share </button>
//                           <div className="border-t border-gray-800 my-1"></div>
//                           <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টটি হাইড করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-pink-400 hover:bg-pink-500/10 text-left"><X className="w-3.5 h-3.5" /> deleted</button>
//                           <button onClick={() => { setActiveDotMenuId(null); logActivity("পোস্টের বিরুদ্ধে রিপোর্ট করা হয়েছে।"); }} className="flex items-center gap-2 w-full p-2 rounded-lg text-red-500 hover:bg-red-500/10 text-left"><ShieldAlert className="w-3.5 h-3.5" /> Report</button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </div>

//               {/* Post Content */}
//               <p className="mb-4 text-gray-200 text-xs sm:text-sm leading-relaxed tracking-wide font-medium [translateZ:10px]">{post.post}</p>
              
//       {/* 3D Deep Grid Images Container */}
// <div className="rounded-xl overflow-hidden border-2 border-pink-500/80 [box-shadow:0_8px_20px_rgba(255,0,255,0.25)] bg-black transform [translateZ:5px]">
//   {(() => {
//     // API থেকে সরাসরি অ্যারে আসছে, তাই JSON.parse করার দরকার নেই। 
//     // যদি কোনো কারণে ডাটা মিসিং থাকে তাই ডিফোল্ট খালি অ্যারে [] দেওয়া হলো।
//     const images = post.imgs || [];

//     // ইমেজ পাথ ফিক্স
//     const getImgUrl = (imgName) => `${process.env.NEXT_PUBLIC_IMAGE_URL}/my_post_img/${imgName}`;

//     if (images.length === 0) return null;

//     // ১টি ইমেজ থাকলে ফুল স্ক্রিন শো করবে
//     return images.length === 1 ? (
//       <img 
//         src={getImgUrl(images[0])} 
//         alt="post" 
//         className="w-full object-cover max-h-[300px] hover:scale-105 transition-transform duration-500" 
//       />
//     ) : (
//       // একাধিক ইমেজ থাকলে গ্রিড লেআউট
//       <div className="grid grid-cols-2 gap-1">
//         {images.slice(0, 4).map((img, idx) => (
//           <div key={idx} className="relative h-36 sm:h-40 overflow-hidden bg-gray-950">
//             <img 
//               src={getImgUrl(img)} 
//               alt="grid-post" 
//               className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
//             />
//             {/* যদি ৪টির বেশি ইমেজ থাকে, তবে ৪র্থ ইমেজের ওপর প্লাস কাউন্ট দেখাবে */}
//             {idx === 3 && images.length > 4 && (
//               <div className="absolute inset-0 bg-black/85 flex items-center justify-center text-lg font-bold text-pink-400">
//                 +{images.length - 4} More
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   })()}
// </div>

//               {/* Action Buttons Row */}
//               <div className="flex justify-between mt-5 text-xs sm:text-sm border-b border-gray-800/80 pb-3 relative z-10">
//                 <motion.button 
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.95 }} 
//                   onClick={() => logActivity(`আপনি "${post.id}" এর পোস্টে লাইক দিয়েছেন।`)} 
//                   className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-400 bg-blue-950/10 shadow-[0_3px_8px_rgba(0,0,255,0.2)] hover:bg-blue-500/20 transition-all"
//                 >
//                   <ThumbsUp className="w-3.5 h-3.5 text-blue-400" /> <span>Like</span>
//                 </motion.button>

//                 <motion.button 
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.95 }} 
//                   onClick={() => setActiveCommentBox(activeCommentBox === post.id ? null : post.id)} 
//                   className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border border-green-400 bg-green-950/10 shadow-[0_3px_8px_rgba(0,255,0,0.2)] hover:bg-green-500/20 transition-all ${activeCommentBox === post.id ? 'bg-green-500/30' : ''}`}
//                 >
//                   <MessageCircle className="w-3.5 h-3.5 text-green-400" /> <span>Comment ({post.id})</span>
//                 </motion.button>

//                 <motion.button 
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.95 }} 
//                   onClick={() => handleShare(post.id)} 
//                   className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-yellow-400 bg-yellow-950/10 shadow-[0_3px_8px_rgba(255,255,0,0.2)] hover:bg-yellow-500/20 transition-all"
//                 >
//                   <Share2 className="w-3.5 h-3.5 text-yellow-400" /> <span>Share</span>
//                 </motion.button>
//               </div>

//               {/* Comment Input Component */}
//               {activeCommentBox === post.id && (
//                 <motion.div 
//                   initial={{ opacity: 0, y: -15, rotateX: -10 }} 
//                   animate={{ opacity: 1, y: 0, rotateX: 0 }} 
//                   className="mt-4 flex items-center gap-2 border-2 border-green-500 rounded-xl p-2 bg-black/60 shadow-[0_4px_12px_rgba(0,255,0,0.2)]"
//                 >
//                   <input type="text" placeholder="Write a cyber comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="bg-transparent flex-1 outline-none text-xs text-green-200 placeholder-green-800 px-2" />
//                   <button onClick={() => handleCommentSubmit(post.id)} disabled={loadingPostId === post.id} className="p-1 text-green-400 hover:text-green-300 transition-colors"><Send className="w-3.5 h-3.5" /></button>
//                 </motion.div>
//               )}
//             </motion.div>
//           ))}
//         </div>

//       </div>

//       {/* ==================== MOBILE BOTTOM BAR ==================== */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-lg border-t-2 border-blue-500 flex items-center justify-around px-4 z-50 rounded-t-2xl [box-shadow:0_-5px_20px_rgba(0,0,255,0.3)]">
//         <button className="flex flex-col items-center gap-0.5 text-blue-400">
//           <Home className="w-5 h-5 [filter:drop-shadow(0_0_5px_#00f)]" /><span className="text-[10px] font-bold">Feed</span>
//         </button>
//         <button className="flex flex-col items-center gap-0.5 text-gray-500">
//           <Rss className="w-5 h-5" /><span className="text-[10px]">Stories</span>
//         </button>
//         <button className="flex flex-col items-center gap-0.5 text-gray-500">
//           <Bookmark className="w-5 h-5" /><span className="text-[10px]">Saved</span>
//         </button>
//         <button className="flex flex-col items-center gap-0.5 text-gray-500">
//           <Settings className="w-5 h-5" /><span className="text-[10px]">Setup</span>
//         </button>
//       </div>

//     </div>
//   );
// }


