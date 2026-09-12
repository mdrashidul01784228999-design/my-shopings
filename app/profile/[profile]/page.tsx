'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Package, Settings, ChevronRight, Wallet, ArrowUpRight,
  TrendingUp, LayoutDashboard, Zap, 
  AlertTriangle, LogOut, X, Menu,
  CheckCircle2, CreditCard, ShieldCheck, Plus, Wifi, QrCode,
  Camera,
  Home,
  HomeIcon
} from 'lucide-react';

import Api from '../../api/Api';
import CountUp from 'react-countup';
import { MdRemove } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  
  // Status Popup Modal State
  const [updateModal, setUpdateModal] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    status: "success" 
  });

  const shoerroralidate = () => {
    toast.error("🚀 Img Size MB Size 2 MB Limits ", {
      position: "top-center",
    });
  };

  const shoerror = () => {
    toast.error("🚀 profile upload error ! api re try ", {
      position: "top-center",
    });
  };

  const showToast = () => {
    toast.success("🚀 Success! profile upload ", {
      position: "top-center",
    });
  };

  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orderFilter, setOrderFilter] = useState('all');
  const [showWarning, setShowWarning] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [names, setNames] = useState('User');
  const [coissnss, setCoin] = useState<number>(0);
  const [useid, setUserid] = useState<number>(0);
  const [uniid, setUniqid] = useState<number>(0);
  const [images, setImages] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  const [prossioncout, setProssing] = useState<number>(0);

  // Profile Form Data State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<any>(null);

  const handleLogout = () => {
    const confirmLogout = window.confirm("আপনি কি নিশ্চিত যে লগআউট করতে চান?");
    if (confirmLogout) {
      localStorage.removeItem('userData');
      router.push('/Login'); 
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generic Change Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Profile Update Submission Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await Api.post(`/user_profile_update`, {
        uniqid: uniid,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        password: formData.password
      });

      if (response.status === 200 || response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully! 🔄' });
        
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const userData = JSON.parse(storedData);
          if (Array.isArray(userData) && userData[0]) {
            userData[0].name = formData.name;
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        }

        setNames(formData.name);
        setUpdateModal({
          isOpen: true,
          title: "SUCCESS",
          message: "Your profile has been updated perfectly.",
          status: "success"
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Local storage data loading
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        const userData = JSON.parse(storedData);
        if (Array.isArray(userData) && userData[0]) {
          const currentName = userData[0].name || 'Rashidul';
          const currentImg = userData[0].img || '';
          const currentId = userData[0].id || 0;
          const currentUniqId = userData[0].uniqid || 0;
          const currentPhone = userData[0].phone || '';
          const currentAddress = userData[0].address || '';

          setNames(currentName);
          setImages(currentImg);
          setUserid(Number(currentId));
          setUniqid(Number(currentUniqId));

          setFormData({
            name: currentName,
            phone: currentPhone,
            address: currentAddress,
            password: ''
          });
        }
      }
    } catch (error) {
      console.error("Error parsing userData", error);
    }
  }, []);

  const itemdelteds = async (id: number) => {
    try {
      const response = await Api.delete(`/order_delelet/${id}`);
      if (response.status === 200 || response.data.success) {
        setProducts((prevProducts) => prevProducts.filter((item) => item.id !== id));
        setProssing((prevCount) => Math.max(0, prevCount - 1));
        alert("Remove your product ✅");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to remove product. Please try again. ❌");
    }
  };

  // Fetch Orders
  useEffect(() => {
    if (!useid) return;
    
    const fetchOrders = () => {
      Api.get(`/all_ordersget_img_and_id/${useid}`)
        .then((response) => {
          setProducts(response.data);
          setProssing(response.data.length);
        })
        .catch((error) => {
          console.error("error page order all id by id:", error);
        });
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [useid]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [user] = useState({
    name: "Tanvir Ahmed",
    email: "tanvir@example.com",
    uniqid: " ",
    phone: "+880 17XX-XXXXXX",
    address: "new address ",
    totalProfit: "8,450",
    isVerified: true,
  });

  useEffect(() => {
    setCoin(4543);
  }, []);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [, setMainImage] = useState<string | null>(null); 

  // ✅ ফিক্সড: Vercel ইভেন্ট টাইপ প্যারামিটার (Implicit any টাইপ ফিক্স)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);

    const formDataInstance = new FormData();
    formDataInstance.append("img", file); 
    formDataInstance.append("id", String(useid)); 

    try {
      const response = await Api.post(`/profile_upload`, formDataInstance, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.status === true) {
        showToast();
        console.log('Upload Success:', response.data);

        const newImageName = response.data.filename; 
        const storedData = localStorage.getItem('userData');
        
        if (storedData) {
          const userData = JSON.parse(storedData);
          if (Array.isArray(userData) && userData[0]) {
            userData[0].img = newImageName;
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log("LocalStorage-এ ছবি সফলভাবে আপডেট হয়েছে:", newImageName);
          }
        }
        if (response.data.filename) {
          setMainImage(response.data.filename);
        }
      } else {
        console.log('Upload Success:', response.data);  
        shoerroralidate(); 
        throw new Error("Backend validation failed.");
      }
    } catch (error) {
      console.error("API Transmission Error:", error);
      shoerror(); 
      setPreviewImage(null); 
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
    { id: 'orders', icon: Package, label: 'Order History' },
    { id: 'deposit', icon: Wallet, label: 'Deposit Hub' },  
    { id: 'settings', icon: Settings, label: 'Security Panel' },
  ];

  // Updatename মডিউল কম্পোনেন্ট
  const Updatename = () => (
    <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6">Edit Profile Info</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 block mb-2 font-mono">FULL NAME</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-2 font-mono">PHONE NUMBER</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-2 font-mono">SHIPPING ADDRESS</label>
          <textarea name="address" value={formData.address} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white h-24 resize-none" />
        </div>
        {message && <p className={`text-xs font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{message.text}</p>}
        <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl bg-cyan-500 font-black text-xs text-black uppercase tracking-widest hover:bg-cyan-400 transition-all">
          {isLoading ? "Saving Parameters..." : "Update Profile Now"}
        </button>
      </form>
    </div>
  );

  const ProductListModule = () => (
    <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Order Vault</h3>
          <p className="text-slate-500 text-sm mt-1">Track your active transactions</p>
        </div>
        <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
          {['all', 'Completed', 'pending','Processing', 'waiting', 'Cancelled'].map((items) => (
            <button 
              key={items} onClick={() => setOrderFilter(items)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${orderFilter === items ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              {items}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02]">
              <th className="px-8 py-5">Product</th>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Amount</th>
              <th className="px-8 py-5 text-right">Status</th>
              <th className="px-8 py-5 text-right">action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products
              ?.filter((o) => {
                if (!orderFilter || orderFilter.toLowerCase() === 'all') return true;
                if (!o.status) return false;
                return o.status.toLowerCase() === orderFilter.toLowerCase();
              })
              .map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
                        <motion.img
                          whileHover={{ scale: 1.15, rotate: 2 }}
                          transition={{ duration: 0.6 }}
                          src={order.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${order.img}` : order.imglink}
                          alt={order.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                          <p className="text-white font-bold text-sm group-hover:text-cyan-300 transition-colors duration-300">{order.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{order.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-400 font-medium">{order.create_data}</td>
                  <td className="px-8 py-6 font-black text-white text-base tracking-tight group-hover:text-cyan-400 transition-colors duration-300">৳{order.price}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border transition-all duration-300 ${
                      order.status === 'Completed' 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.7)]' 
                        : order.status === 'Processing' 
                        ? 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.4)] group-hover:shadow-[0_0_25px_rgba(232,121,249,0.7)]' 
                        : order.status === 'waiting' || order.status === 'Pending' 
                        ? 'bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]' 
                        : 'bg-rose-500/15 text-rose-400 border-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.4)] group-hover:shadow-[0_0_25px_rgba(251,113,133,0.7)]'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => itemdelteds(order.id)} 
                      className="p-2 text-red-400 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
                    >
                      <MdRemove size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ✅ ফিক্সড: টাইপস্ক্রিপ্ট ফ্রেমার মোশন ভ্যারিয়েন্ট কনফিগারেশন টাইপ সেফটি
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 90, damping: 14 } },
  };

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-300 font-medium selection:bg-cyan-500/30">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[160px] rounded-full animate-pulse" />
      </div>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-3 bg-[#080a14]/90 backdrop-blur-2xl border-b border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10">
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/40">
                        <Zap size={22} className="text-black fill-black" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter uppercase hidden sm:block">Rashidul <span className="text-cyan-500">Official</span></span>
                </div>
            </div>

        {/* PROFILE DROPDOWN TRIGGER */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 rounded-2xl cursor-pointer group bg-gradient-to-b from-white/[0.03] to-transparent hover:from-white/[0.08] hover:to-transparent border border-white/[0.04] hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          >
            <div className="text-right hidden sm:block select-none pl-3">
              <div className="flex items-center justify-end gap-1.5">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300 tracking-wide">
                  {names}
                </p>
                {user?.isVerified && (
                  <CheckCircle2 size={12} className="text-cyan-400 fill-cyan-400/10 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                )}
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                </span>
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">Online</p>
              </div>
            </div>
            
            <div className="relative flex-shrink-0">
              <div className={`absolute -inset-0.5 bg-gradient-to-b from-cyan-400 to-fuchsia-600 rounded-full transition-all duration-500 blur-[5px] ${isProfileOpen ? 'opacity-100 scale-105' : 'opacity-30 group-hover:opacity-100'}`}></div>
              <img 
                src={previewImage || (images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`)} 
                alt="User Avatar" 
                className="relative w-8 h-8 rounded-full border border-slate-950 object-cover bg-slate-950 group-hover:scale-102 transition-transform duration-300" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#0a0c16] rounded-full flex items-center justify-center border border-white/10">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981]"></div>
              </div>
            </div>
          </div>

          {/* DROPDOWN MENU */}
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="absolute top-full right-0 mt-3 w-80 bg-slate-950/70 backdrop-blur-3xl border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_50px_-10px_rgba(6,182,212,0.15),0_30px_70px_-10px_rgba(0,0,0,0.85)] z-[110] overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/25 blur-3xl pointer-events-none -z-10 animate-pulse"></div>
                <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-fuchsia-600/15 blur-3xl pointer-events-none -z-10"></div>
                
                <div className="relative flex flex-col items-center p-4 mb-3 rounded-xl bg-slate-900/40 border border-white/[0.04] shadow-inner overflow-hidden group/card">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] to-fuchsia-500/[0.03] opacity-100" />
                  
                  <label className="relative w-16 h-16 rounded-2xl border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden group/avatar cursor-pointer block transition-all duration-300 hover:scale-[1.05] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange} 
                    />
                    <img 
                      src={previewImage || (images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`)} 
                      alt="User Avatar" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" 
                    />
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 opacity-0 group-hover/avatar:opacity-100 transition-all duration-300">
                      <Camera size={16} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.85)]" />
                      <span className="text-[8px] font-black text-cyan-400 tracking-widest uppercase shadow-sm">Change</span>
                    </div>
                  </label>

                  <div className="text-center mt-3 max-w-full z-10 select-none">
                    <div className="flex items-center justify-center gap-1.5">
                      <p className="text-sm font-bold text-slate-100 tracking-wide truncate max-w-[180px] group-hover/card:text-cyan-400 transition-colors duration-300">{names}</p>
                      {user?.isVerified && <CheckCircle2 size={13} className="text-cyan-400 fill-cyan-400/10 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)] flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium tracking-tight truncate max-w-[220px] mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button onClick={() => router.push('/') } className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-cyan-500/[0.04] border border-transparent hover:border-cyan-500/10 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-200">
                        <HomeIcon size={14} />
                      </div>
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">Home </span>
                    </div>
                    <Home size={13} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-200" />
                  </button>
                  
                  <button onClick={() => { setActiveTab('orders'); setIsProfileOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-fuchsia-500/[0.04] border border-transparent hover:border-fuchsia-500/10 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.15)] group-hover:shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all duration-200">
                        <CreditCard size={14} />
                      </div>
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-fuchsia-400 transition-colors">Transactions</span>
                    </div>
                    <ChevronRight size={13} className="text-slate-600 group-hover:text-fuchsia-400 group-hover:translate-x-0.5 transition-all duration-200" />
                  </button>
                  
                  <button onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-emerald-500/[0.04] border border-transparent hover:border-emerald-500/10 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-200">
                        <ShieldCheck size={14} />
                      </div>
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">Security Hub</span>
                    </div>
                    <ChevronRight size={13} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.05]">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-500/5 hover:bg-red-500 border border-red-500/20 hover:border-transparent hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-xl text-red-400 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
                  >
                    <LogOut size={13} />
                    <span>Log Out Account</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </nav>

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#080a14] border-r border-white/10 z-[200] p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2">
                    <Zap className="text-cyan-500" size={24} />
                    <span className="font-black text-white uppercase text-lg">Menu</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-lg">
                    <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:bg-white/5'}`}>
                    <item.icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* PC SIDEBAR */}
          <aside className="lg:col-span-3 hidden lg:block">
            <nav className="bg-[#0c0e1a]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 sticky top-32 shadow-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-4">Menu Navigation</p>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group overflow-hidden ${
                        activeTab === item.id ? 'text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {activeTab === item.id && (
                      <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-cyan-500 z-0 shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
                    )}
                    <span className="relative z-10"><item.icon size={19} /></span>
                    <span className="relative z-10 text-sm tracking-wide">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }} 
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
                    {/* HERO CARD BALANCE HEAD */}
                    <div className="flex items-center justify-center p-6 bg-slate-900 min-h-[400px] rounded-[2.5rem]">
                      <div className="relative group w-full max-w-lg perspective-1000">
                        <div className="relative rounded-[2.5rem] p-8 md:p-10 bg-slate-950 border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 transform-gpu group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/40">
                          
                          <div className="absolute top-0 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] group-hover:bg-purple-600/30 transition-all"></div>
                          <div className="absolute bottom-0 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] group-hover:bg-cyan-600/30 transition-all"></div>

                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                              <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-80 shadow-inner"></div>
                              <Wifi className="text-white/40 rotate-90" size={24} />
                            </div>

                            <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Available Balance</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl md:text-4xl font-black text-white/30">৳</span>
                              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                                <CountUp end={coissnss} duration={2} separator="," />
                              </h2>
                            </div>

                            <div className="mt-10 flex justify-between items-end">
                              <div>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Card Number</p>
                                <p className="text-white font-mono text-lg tracking-[0.2em]">{uniid}/{useid}</p>
                                
                                <div className="mt-4">
                                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Created At</p>
                                  <p className="text-white/80 font-bold text-sm">05 / 2026</p>
                                </div>
                              </div>

                              <div className="bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md group-hover:border-cyan-500/50 transition-all">
                                <QrCode size={48} className="text-white/70 group-hover:text-cyan-400" />
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-8">
                              <button 
                                onClick={() => setActiveTab('deposit')} 
                                className="bg-cyan-500 px-6 py-3 rounded-xl text-black font-black text-xs uppercase flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-cyan-500/20 active:scale-95"
                              >
                                <Plus size={16} strokeWidth={4} /> RECHARGE
                              </button>
                              <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-black text-xs text-white hover:bg-white/10 transition backdrop-blur-md">
                                WITHDRAW
                              </button>
                            </div>
                          </div>

                          <CreditCard size={240} className="absolute -right-16 -bottom-16 text-white/[0.03] -rotate-12 group-hover:rotate-0 transition-all duration-1000 hidden md:block" />
                        </div>
                      </div>
                    </div>

                    {showWarning && (
                        <div className="bg-red-500/5 border border-red-500/20 p-5 md:p-6 rounded-3xl flex items-center justify-between shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-500/20 p-3 rounded-xl"><AlertTriangle size={22} className="text-red-500" /></div>
                                <div>
                                    <p className="text-red-500 font-black text-xs md:text-sm uppercase tracking-wider">Identity Verification Required</p>
                                    <p className="text-slate-500 text-[10px] md:text-xs mt-0.5">Unlock high-tier limits by verifying your account.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowWarning(false)} className="text-red-500/30 hover:text-red-500 transition-colors"><X size={20}/></button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Profits</p>
                                <h3 className="text-2xl font-black text-white mt-1">৳ {user.totalProfit}</h3>
                            </div>
                        </div>
                        <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>
                            <div>
                                <p className="text-[11px] font-bold text-amber-400">Orders-Processing</p>
                                <h3 className="text-2xl font-black text-white mt-1">{prossioncout}</h3>
                            </div>
                        </div>
                        <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    <ProductListModule />
                  </div>
                )}
                
                {activeTab === 'orders' && <ProductListModule />}
                {activeTab === 'profile' && <Updatename />}
                
                {activeTab === 'settings' && (() => {
                    router.push('/profile/Settings');
                    return null;
                })()}

                {activeTab === 'deposit' && (
                   <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-10 md:p-16 rounded-[3rem] text-center shadow-2xl">
                      <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <Wallet size={48} className="text-cyan-500" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Deposit Hub</h2>
                      <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">Select your preferred payment gateway to recharge your wallet instantly.</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                        {['bKash', 'Nagad', 'Rocket', 'Bank'].map(m => (
                          <button key={m} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all active:scale-95 group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                <Plus size={20} className="text-cyan-400 group-hover:text-inherit" />
                            </div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{m}</span>
                          </button>
                        ))}
                      </div>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* NEON REAL-TIME MODAL ALERT CONTAINER */}
      <AnimatePresence>
        {updateModal.isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUpdateModal(p => ({ ...p, isOpen: false }))} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300]" />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[310] pointer-events-none">
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="pointer-events-auto w-full max-w-md bg-[#0c0e1a]/95 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden text-center">
                <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 ${updateModal.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  {updateModal.status === 'success' ? (
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"><CheckCircle2 size={32} /></div>
                  ) : (
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]"><AlertTriangle size={32} /></div>
                  ) /* ফিক্সড: ছোট হাতের <center> এবং পুরনো HTML ট্যাগ এড়ানো হয়েছে */}
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{updateModal.title}</h4>
                <p className="text-slate-400 text-sm font-medium px-2 leading-relaxed">{updateModal.message}</p>
                <button onClick={() => setUpdateModal(p => ({ ...p, isOpen: false }))} className={`mt-8 w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-black transition-all duration-300 active:scale-95 shadow-lg ${updateModal.status === 'success' ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20' : 'bg-red-400 hover:bg-red-300 shadow-red-500/20'}`}>Acknowledge System</button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        body { background-color: #04060c; overflow-x: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}






// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Package, Settings, ChevronRight, Wallet, ArrowUpRight,
//   TrendingUp, LayoutDashboard, Zap, 
//   AlertTriangle, LogOut, X, Menu,
//   CheckCircle2, UserCheck, CreditCard, ShieldCheck, Plus, Wifi, QrCode,
//   Camera,
//   Home,
//   HomeIcon
// } from 'lucide-react';

// import Api from '../../api/Api';
// import CountUp from 'react-countup';
// import { MdRemove } from 'react-icons/md';
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';

// export default function ProfilePage() {
//   const router = useRouter();
  
//   // Status Popup Modal State
//   const [updateModal, setUpdateModal] = useState({ 
//     isOpen: false, 
//     title: "", 
//     message: "", 
//     status: "success" 
//   });




// const shoerroralidate = () => {
//     // You can override default configurations right here
//     toast.error("🚀 Img Size MB Size 2 MB Limits ", {
//       position: "top-center", // Stays centered
//     });
//   };



// const shoerror = () => {
//     // You can override default configurations right here
//     toast.error("🚀 profile upload error ! api re try ", {
//       position: "top-center", // Stays centered
//     });
//   };

// const showToast = () => {
//     // You can override default configurations right here
//     toast.success("🚀 Success! profile upload ", {
//       position: "top-center", // Stays centered
//     });
//   };


//   const [products, setProducts] = useState<any[]>([]);
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [orderFilter, setOrderFilter] = useState('all');
//   const [showWarning, setShowWarning] = useState(true);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
  
//   const [names, setNames] = useState('User');
//   const [coissnss, setCoin] = useState<number>(0);
//   const [useid, setUserid] = useState<number>(0);
//   const [uniid, setUniqid] = useState<number>(0);
//   const [images, setImages] = useState('');
//   const profileRef = useRef<HTMLDivElement>(null);

//   const [prossioncout, setProssing] = useState<number>(0);

//   // Profile Form Data State
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     address: '',
//     password: ''
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState<any>(null);








// const handleLogout = () => {
//   // ১. ইউজারকে একটি কনফার্মেশন অ্যালার্ট দেখানো হচ্ছে
//   const confirmLogout = window.confirm("আপনি কি নিশ্চিত যে লগআউট করতে চান?");
  
//   // ২. ইউজার যদি "OK" বাটনে ক্লিক করেন (যা true রিটার্ন করবে)
//   if (confirmLogout) {
//     // LocalStorage থেকে ইউজার ডাটা মুছে ফেলা হচ্ছে
//     localStorage.removeItem('userData');
    
//     // লগইন পেজে রিডাইরেক্ট করা হচ্ছে
//     router.push('/Login'); 
//   }
//   // ইউজার "Cancel" ক্লিক করলে এই ব্লকের বাইরের কোড বা হোম পেজেই থেকে যাবে
// };








//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: any) => {
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setIsProfileOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Generic Change Handler
//   const handleChange = (e: any) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Profile Update Submission Handler
//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage(null);

//     try {
//       const response = await Api.post(`/user_profile_update`, {
//         uniqid: uniid,
//         name: formData.name,
//         phone: formData.phone,
//         address: formData.address,
//         password: formData.password
//       });

//       if (response.status === 200 || response.data.success) {
//         setMessage({ type: 'success', text: 'Profile updated successfully! 🔄' });
        
//         const storedData = localStorage.getItem('userData');
//         if (storedData) {
//           const userData = JSON.parse(storedData);
//           if (Array.isArray(userData) && userData[0]) {
//             userData[0].name = formData.name;
//             localStorage.setItem('userData', JSON.stringify(userData));
//           }
//         }

//         setNames(formData.name);
//         setUpdateModal({
//           isOpen: true,
//           title: "SUCCESS",
//           message: "Your profile has been updated perfectly.",
//           status: "success"
//         });

//         setTimeout(() => {
//           window.location.reload();
//         }, 1500);
//       }
//     } catch (error) {
//       console.error(error);
//       setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Local storage data loading
//   useEffect(() => {
//     try {
//       const storedData = localStorage.getItem('userData');
//       if (storedData) {
//         const userData = JSON.parse(storedData);
//         if (Array.isArray(userData) && userData[0]) {
//           const currentName = userData[0].name || 'Rashidul';
//           const currentImg = userData[0].img || '';
//           const currentId = userData[0].id || '';
//           const currentUniqId = userData[0].uniqid || '';
//           const currentPhone = userData[0].phone || '';
//           const currentAddress = userData[0].address || '';

//           setNames(currentName);
//           setImages(currentImg);
//           setUserid(currentId);
//           setUniqid(currentUniqId);

//           setFormData({
//             name: currentName,
//             phone: currentPhone,
//             address: currentAddress,
//             password: ''
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error parsing userData", error);
//     }
//   }, []);

//   const itemdelteds = async (id: number) => {
//     try {
//       const response = await Api.delete(`/order_delelet/${id}`);
//       if (response.status === 200 || response.data.success) {
//         setProducts((prevProducts) => prevProducts.filter((item) => item.id !== id));
//         setProssing((prevCount) => Math.max(0, prevCount - 1));
//         alert("Remove your product ✅");
//       }
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       alert("Failed to remove product. Please try again. ❌");
//     }
//   };


//   // Fetch Orders
//   useEffect(() => {
//     if (!useid) return;
    
//     const fetchOrders = () => {
//       Api.get(`/all_ordersget_img_and_id/${useid}`)
//         .then((response) => {
//           setProducts(response.data);
//           setProssing(response.data.length);
//         })
//         .catch((error) => {
//           console.error("error page order all id by id:", error);
//         });
//     };

//     fetchOrders();
//     const interval = setInterval(fetchOrders, 3000);
//     return () => clearInterval(interval);
//   }, [useid]);

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 20);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const [user] = useState({
//     name: "Tanvir Ahmed",
//     email: "tanvir@example.com",
//     uniqid: " ",
//     phone: "+880 17XX-XXXXXX",
//     address: "new address ",
//     totalProfit: "8,450",
//     isVerified: true,
//   });

//   useEffect(() => {
//     setCoin(4543);
//   }, []);


















  
// const [previewImage, setPreviewImage] = useState(null);
// // মনে করুন আপনার আগের ইমেজ স্টেটটি হলো mainImage
// const [mainImage, setMainImage] = useState(null); 

// const handleAvatarChange = async (e) => {
//   const file = e.target.files?.[0];
//   if (!file) return;

//   // ১. মেমোরি লিক বন্ধ করতে আগের প্রিভিউ থাকলে তা ডিলিট করা
//   if (previewImage) {
//     URL.revokeObjectURL(previewImage);
//   }

//   // ২. ইনস্ট্যান্ট ক্লায়েন্ট-সাইড প্রিভিউ
//   const localUrl = URL.createObjectURL(file);
//   setPreviewImage(localUrl);

//   // ৩. মাল্টিপার্ট ফর্ম ডেটাতে ফাইল পুশ
//   const formData = new FormData();
//   formData.append("img", file); 
//   formData.append("id", useid); // ⚠️ 'useid' বানানটি আপনার প্রজেক্ট অনুযায়ী thik করে নিন (যেমন: userId)

//   try {
//     // ৪. API রিকোয়েস্ট সেন্ড 
//     // ⚠️ রাউট নাম চেক করুন: /profile_upload নাকি /profile_uploadSS
//     const response = await Api.post(`/profile_upload`, formData, {
//   headers: {
//     'Content-Type': 'multipart/form-data'
//   }
// });
//     if (response.data.status === true) {
//       showToast();
//       console.log('Upload Success:', response.data);

     


// const newImageName = response.data.filename; 

//   // ২. লোকাল স্টোরেজ থেকে ডাটা আনা
//   const storedData = localStorage.getItem('userData');
  
//   if (storedData) {
  
//       const userData = JSON.parse(storedData);
      
//       // চেক করা হচ্ছে ডাটাটি অ্যারে কিনা এবং প্রথম উপাদানটি আছে কিনা
//       if (Array.isArray(userData) && userData[0]) {
        
//         // 🟢 লোকাল স্টোরেজে ছবির কলামের নাম আপডেট (যেমন: userData[0].img)
//         userData[0].img = newImageName;
        
//         // যদি একই সাথে নামও আপডেট করতে চান:
//         // userData[0].name = formData.name; 

//         // ৩. আপডেট হওয়া ডাটা আবার লোকাল স্টোরেজে সেভ করা
//         localStorage.setItem('userData', JSON.stringify(userData));
        
//         console.log("LocalStorage-এ ছবি সফলভাবে আপডেট হয়েছে:", newImageName);
        
//         // এখানে আপনার Success Alert বা স্টেট আপডেট করতে পারেন (যেমন: shosuccess())
//       }


    
//   }
//       // ৫. ডাটাবেজে সেভ হওয়া নতুন ফাইলের নাম দিয়ে মূল স্টেট আপডেট
//       if (response.data.filename) {






//          setMainImage(response.data.filename); // আপনার মেইন স্টেট ভেরিয়েবল
//       }

//     } else {
//         console.log('Upload Success:', response.data);  
//         console.log('Upload Success:', response.data);
//       shoerroralidate(); // আপনার কাস্টম এরর ফাংশন
//       throw new Error("Backend validation failed.");
//     }

//   } catch (error) {
//     console.error("API Transmission Error:", error);
//     console.error("API Transmission Error:", error);
//     console.log("API Transmission Error:", error);
//     console.log(error);
//     shoerror(); // আপনার কাস্টম এরর ফাংশন

//     // ব্যাকএন্ড ফেইল করলে প্রিভিউ আগের অবস্থায় (ফাঁকা) বা মেইন ইমেজে ফিরিয়ে নেওয়া:
//     setPreviewImage(null); 
//   }
// };


//   const menuItems = [
//     { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
//     { id: 'orders', icon: Package, label: 'Order History' },
//     { id: 'deposit', icon: Wallet, label: 'Deposit Hub' },  
//     { id: 'settings', icon: Settings, label: 'Security Panel' },
//   ];

//   // Updatename মডিউল কম্পোনেন্টটি ফাইলের ভেতরেই ডিফাইন করা হলো (Fix)
//   const Updatename = () => (
//     <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
//       <h3 className="text-xl font-bold text-white mb-6">Edit Profile Info</h3>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="text-xs text-slate-400 block mb-2 font-mono">FULL NAME</label>
//           <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white" />
//         </div>
//         <div>
//           <label className="text-xs text-slate-400 block mb-2 font-mono">PHONE NUMBER</label>
//           <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white" />
//         </div>
//         <div>
//           <label className="text-xs text-slate-400 block mb-2 font-mono">SHIPPING ADDRESS</label>
//           <textarea name="address" value={formData.address} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white h-24 resize-none" />
//         </div>
//         {message && <p className={`text-xs font-bold ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{message.text}</p>}
//         <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl bg-cyan-500 font-black text-xs text-black uppercase tracking-widest hover:bg-cyan-400 transition-all">
//           {isLoading ? "Saving Parameters..." : "Update Profile Now"}
//         </button>
//       </form>
//     </div>
//   );

//   const ProductListModule = () => (
//     <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
//       <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
//         <div>
//           <h3 className="text-2xl font-bold text-white">Order Vault</h3>
//           <p className="text-slate-500 text-sm mt-1">Track your active transactions</p>
//         </div>
//         <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
//           {['all', 'Completed', 'pending','Processing', 'waiting', 'Cancelled'].map((items) => (
//             <button 
//               key={items} onClick={() => setOrderFilter(items)}
//               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${orderFilter === items ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
//             >
//               {items}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div className="overflow-x-auto no-scrollbar">
//         <table className="w-full text-left min-w-[600px]">
//           <thead>
//             <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02]">
//               <th className="px-8 py-5">Product</th>
//               <th className="px-8 py-5">Date</th>
//               <th className="px-8 py-5">Amount</th>
//               <th className="px-8 py-5 text-right">Status</th>
//               <th className="px-8 py-5 text-right">action</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-white/5">
//             {products
//               ?.filter((o) => {
//                 if (!orderFilter || orderFilter.toLowerCase() === 'all') return true;
//                 if (!o.status) return false;
//                 return o.status.toLowerCase() === orderFilter.toLowerCase();
//               })
//               .map((order) => (
//                 <tr key={order.id} className="hover:bg-white/[0.02] hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300 group">
//                   <td className="px-8 py-6">
//                     <div className="flex items-center gap-4">
//                       <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
//                         <motion.img
//                           whileHover={{ scale: 1.15, rotate: 2 }}
//                           transition={{ duration: 0.6 }}
//                           src={order.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${order.img}` : order.imglink}
//                           alt={order.name}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                       <div>
//                           <p className="text-white font-bold text-sm group-hover:text-cyan-300 transition-colors duration-300">{order.name}</p>
//                           <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{order.model}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-8 py-6 text-sm text-slate-400 font-medium">{order.create_data}</td>
//                   <td className="px-8 py-6 font-black text-white text-base tracking-tight group-hover:text-cyan-400 transition-colors duration-300">৳{order.price}</td>
//                   <td className="px-8 py-6 text-right">
//                     <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border transition-all duration-300 ${
//                       order.status === 'Completed' 
//                         ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.7)]' 
//                         : order.status === 'Processing' 
//                         ? 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.4)] group-hover:shadow-[0_0_25px_rgba(232,121,249,0.7)]' 
//                         : order.status === 'waiting' || order.status === 'Pending' 
//                         ? 'bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]' 
//                         : 'bg-rose-500/15 text-rose-400 border-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.4)] group-hover:shadow-[0_0_25px_rgba(251,113,133,0.7)]'
//                     }`}>
//                       {order.status}
//                     </span>
//                   </td>
//                   <td className="px-8 py-6 text-right">
//                     <button 
//                       onClick={() => itemdelteds(order.id)} 
//                       className="p-2 text-red-400 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
//                     >
//                       <MdRemove size={14} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#04060c] text-slate-300 font-medium selection:bg-cyan-500/30">
      
//       {/* BACKGROUND EFFECTS */}
//       <div className="fixed inset-0 pointer-events-none z-0">
//         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[160px] rounded-full animate-pulse" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[160px] rounded-full animate-pulse" />
//       </div>

//       {/* NAVBAR */}
//       <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-3 bg-[#080a14]/90 backdrop-blur-2xl border-b border-white/5' : 'py-6 bg-transparent'}`}>
//         <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
//             <div className="flex items-center gap-4">
//                 <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10">
//                     <Menu size={24} />
//                 </button>
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/40">
//                         <Zap size={22} className="text-black fill-black" />
//                     </div>
//                     <span className="text-xl font-black text-white tracking-tighter uppercase hidden sm:block">Rashidul <span className="text-cyan-500">Official</span></span>
//                 </div>
//             </div>




//         {/* PROFILE DROPDOWN TRIGGER */}
// {/* PROFILE DROPDOWN TRIGGER */}
// {/* PROFILE DROPDOWN TRIGGER */}
// <div className="relative" ref={profileRef}>
//   <div 
//     onClick={() => setIsProfileOpen(!isProfileOpen)}
//     className="flex items-center gap-3 p-1 rounded-2xl cursor-pointer group bg-gradient-to-b from-white/[0.03] to-transparent hover:from-white/[0.08] hover:to-transparent border border-white/[0.04] hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
//   >
//     {/* User Meta System */}
//     <div className="text-right hidden sm:block select-none pl-3">
//       <div className="flex items-center justify-end gap-1.5">
//         <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300 tracking-wide">
//           {names}
//         </p>
//         {user?.isVerified && (
//           <CheckCircle2 size={12} className="text-cyan-400 fill-cyan-400/10 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
//         )}
//       </div>
//       <div className="flex items-center justify-end gap-1.5 mt-0.5">
//         <span className="relative flex h-1.5 w-1.5">
//           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//           <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
//         </span>
//         <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]">Online</p>
//       </div>
//     </div>
    
//     {/* Navbar Avatar Trigger Frame with Active Neon Glow Ring */}
//     <div className="relative flex-shrink-0">
//       <div className={`absolute -inset-0.5 bg-gradient-to-b from-cyan-400 to-fuchsia-600 rounded-full transition-all duration-500 blur-[5px] ${isProfileOpen ? 'opacity-100 scale-105' : 'opacity-30 group-hover:opacity-100'}`}></div>
//       <img 
//         src={previewImage || (images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`)} 
//         alt="User Avatar" 
//         className="relative w-8 h-8 rounded-full border border-slate-950 object-cover bg-slate-950 group-hover:scale-102 transition-transform duration-300" 
//       />
//       <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#0a0c16] rounded-full flex items-center justify-center border border-white/10">
//         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981]"></div>
//       </div>
//     </div>
//   </div>

//   {/* DROPDOWN MENU */}
//   <AnimatePresence>
//     {isProfileOpen && (
//       <motion.div 
//         initial={{ opacity: 0, y: 12, scale: 0.96 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         exit={{ opacity: 0, y: 12, scale: 0.96 }}
//         transition={{ type: "spring", stiffness: 420, damping: 26 }}
//         className="absolute top-full right-0 mt-3 w-80 bg-slate-950/70 backdrop-blur-3xl border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_50px_-10px_rgba(6,182,212,0.15),0_30px_70px_-10px_rgba(0,0,0,0.85)] z-[110] overflow-hidden"
//       >
//         {/* Layered High-Intensity Ambient Neon Blur Fields */}
//         <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/25 blur-3xl pointer-events-none -z-10 animate-pulse"></div>
//         <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-fuchsia-600/15 blur-3xl pointer-events-none -z-10"></div>
        
//         {/* Profile Card Compartment with Neon Edge Highlights */}
//         <div className="relative flex flex-col items-center p-4 mb-3 rounded-xl bg-slate-900/40 border border-white/[0.04] shadow-inner overflow-hidden group/card">
//           <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] to-fuchsia-500/[0.03] opacity-100" />
          
//           {/* INTERACTIVE NEON FILE INPUT CONTAINER */}
//           <label className="relative w-16 h-16 rounded-2xl border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden group/avatar cursor-pointer block transition-all duration-300 hover:scale-[1.05] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] z-10">
//             <input 
//               type="file" 
//               accept="image/*" 
//               className="hidden" 
//               onChange={handleAvatarChange} 
//             />
//             <img 
//               src={previewImage || (images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`)} 
//               alt="User Avatar" 
//               className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" 
//             />
//             {/* Cinematic Cyber Overlay */}
//             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 opacity-0 group-hover/avatar:opacity-100 transition-all duration-300">
//               <Camera size={16} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.85)]" />
//               <span className="text-[8px] font-black text-cyan-400 tracking-widest uppercase shadow-sm">Change</span>
//             </div>
//           </label>

//           <div className="text-center mt-3 max-w-full z-10 select-none">
//             <div className="flex items-center justify-center gap-1.5">
//               <p className="text-sm font-bold text-slate-100 tracking-wide truncate max-w-[180px] group-hover/card:text-cyan-400 transition-colors duration-300">{names}</p>
//               {user?.isVerified && <CheckCircle2 size={13} className="text-cyan-400 fill-cyan-400/10 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)] flex-shrink-0" />}
//             </div>
//             <p className="text-[11px] text-slate-400 font-medium tracking-tight truncate max-w-[220px] mt-0.5">{user?.email}</p>
//           </div>
//         </div>

//         {/* Action Link Clusters with Hover Neon Strips */}
//         <div className="space-y-1">
//           <button onClick={() =>  router.push('/') } className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-cyan-500/[0.04] border border-transparent hover:border-cyan-500/10 transition-all duration-200 group">
//             <div className="flex items-center gap-3">
//               <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-200">
//                 <HomeIcon size={14} />
//               </div>
//               <span className="text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">Home </span>
//             </div>
//             <Home size={13} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all duration-200" />
//           </button>
          
//           <button onClick={() => { setActiveTab('orders'); setIsProfileOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-fuchsia-500/[0.04] border border-transparent hover:border-fuchsia-500/10 transition-all duration-200 group">
//             <div className="flex items-center gap-3">
//               <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.15)] group-hover:shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all duration-200">
//                 <CreditCard size={14} />
//               </div>
//               <span className="text-xs font-semibold text-slate-400 group-hover:text-fuchsia-400 transition-colors">Transactions</span>
//             </div>
//             <ChevronRight size={13} className="text-slate-600 group-hover:text-fuchsia-400 group-hover:translate-x-0.5 transition-all duration-200" />
//           </button>
          
//           <button onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-emerald-500/[0.04] border border-transparent hover:border-emerald-500/10 transition-all duration-200 group">
//             <div className="flex items-center gap-3">
//               <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-200">
//                 <ShieldCheck size={14} />
//               </div>
//               <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">Security Hub</span>
//             </div>
//             <ChevronRight size={13} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
//           </button>
//         </div>

//         {/* System Safe-Exit Footer Button */}
//         <div className="mt-3 pt-3 border-t border-white/[0.05]">
//           <button 
//             onClick={handleLogout}
//             className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-500/5 hover:bg-red-500 border border-red-500/20 hover:border-transparent hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] rounded-xl text-red-400 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
//           >
//             <LogOut size={13} />
//             <span>Log Out Account</span>
//           </button>
//         </div>
//       </motion.div>
//     )}
//   </AnimatePresence>
// </div>







// {/* profle add new  */}




























//         </div>
//       </nav>

//       {/* MOBILE SIDEBAR OVERLAY */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <>
//             <motion.div 
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden"
//             />
//             <motion.div 
//               initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
//               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//               className="fixed top-0 left-0 bottom-0 w-72 bg-[#080a14] border-r border-white/10 z-[200] p-6 lg:hidden"
//             >
//               <div className="flex items-center justify-between mb-10">
//                 <div className="flex items-center gap-2">
//                     <Zap className="text-cyan-500" size={24} />
//                     <span className="font-black text-white uppercase text-lg">Menu</span>
//                 </div>
//                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-lg">
//                     <X size={20} />
//                 </button>
//               </div>
//               <div className="space-y-3">
//                 {menuItems.map((item) => (
//                   <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
//                     className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:bg-white/5'}`}>
//                     <item.icon size={20} />
//                     <span className="text-sm">{item.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
//           {/* PC SIDEBAR */}
//           <aside className="lg:col-span-3 hidden lg:block">
//             <nav className="bg-[#0c0e1a]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 sticky top-32 shadow-2xl">
//               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-4">Menu Navigation</p>
//               <div className="space-y-2">
//                 {menuItems.map((item) => (
//                   <button 
//                     key={item.id} 
//                     onClick={() => setActiveTab(item.id)}
//                     className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group overflow-hidden ${
//                         activeTab === item.id ? 'text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
//                     }`}
//                   >
//                     {activeTab === item.id && (
//                       <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-cyan-500 z-0 shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
//                     )}
//                     <span className="relative z-10"><item.icon size={19} /></span>
//                     <span className="relative z-10 text-sm tracking-wide">{item.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </nav>
//           </aside>

//           {/* MAIN CONTENT AREA */}
//           <main className="lg:col-span-9">
//             <AnimatePresence mode="wait">
//               <motion.div 
//                 key={activeTab} 
//                 initial={{ opacity: 0, y: 15 }} 
//                 animate={{ opacity: 1, y: 0 }} 
//                 exit={{ opacity: 0, y: -15 }} 
//                 transition={{ duration: 0.3 }}
//               >
//                 {activeTab === 'dashboard' && (
//                   <div className="space-y-8">
//                     {/* HERO CARD BALANCE HEAD */}
//                     <div className="flex items-center justify-center p-6 bg-slate-900 min-h-[400px] rounded-[2.5rem]">
//                       <div className="relative group w-full max-w-lg perspective-1000">
//                         <div className="relative rounded-[2.5rem] p-8 md:p-10 bg-slate-950 border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 transform-gpu group-hover:rotate-x-2 group-hover:rotate-y-2 group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/40">
                          
//                           <div className="absolute top-0 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] group-hover:bg-purple-600/30 transition-all"></div>
//                           <div className="absolute bottom-0 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] group-hover:bg-cyan-600/30 transition-all"></div>

//                           <div className="relative z-10">
//                             <div className="flex justify-between items-start mb-8">
//                               <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-80 shadow-inner"></div>
//                               <Wifi className="text-white/40 rotate-90" size={24} />
//                             </div>

//                             <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Available Balance</p>
//                             <div className="flex items-baseline gap-2">
//                               <span className="text-2xl md:text-4xl font-black text-white/30">৳</span>
//                               <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
//                                 <CountUp end={coissnss} duration={2} separator="," />
//                               </h2>
//                             </div>

//                             <div className="mt-10 flex justify-between items-end">
//                               <div>
//                                 <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Card Number</p>
//                                 <p className="text-white font-mono text-lg tracking-[0.2em]">{uniid}/{useid}</p>
                                
//                                 <div className="mt-4">
//                                   <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Created At</p>
//                                   <p className="text-white/80 font-bold text-sm">05 / 2026</p>
//                                 </div>
//                               </div>

//                               <div className="bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md group-hover:border-cyan-500/50 transition-all">
//                                 <QrCode size={48} className="text-white/70 group-hover:text-cyan-400" />
//                               </div>
//                             </div>

//                             <div className="flex flex-wrap gap-4 mt-8">
//                               <button 
//                                 onClick={() => setActiveTab('deposit')} 
//                                 className="bg-cyan-500 px-6 py-3 rounded-xl text-black font-black text-xs uppercase flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-cyan-500/20 active:scale-95"
//                               >
//                                 <Plus size={16} strokeWidth={4} /> RECHARGE
//                               </button>
//                               <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-black text-xs text-white hover:bg-white/10 transition backdrop-blur-md">
//                                 WITHDRAW
//                               </button>
//                             </div>
//                           </div>

//                           <CreditCard size={240} className="absolute -right-16 -bottom-16 text-white/[0.03] -rotate-12 group-hover:rotate-0 transition-all duration-1000 hidden md:block" />
//                         </div>
//                       </div>
//                     </div>

//                     {showWarning && (
//                         <div className="bg-red-500/5 border border-red-500/20 p-5 md:p-6 rounded-3xl flex items-center justify-between shadow-xl">
//                             <div className="flex items-center gap-4">
//                                 <div className="bg-red-500/20 p-3 rounded-xl"><AlertTriangle size={22} className="text-red-500" /></div>
//                                 <div>
//                                     <p className="text-red-500 font-black text-xs md:text-sm uppercase tracking-wider">Identity Verification Required</p>
//                                     <p className="text-slate-500 text-[10px] md:text-xs mt-0.5">Unlock high-tier limits by verifying your account.</p>
//                                 </div>
//                             </div>
//                             <button onClick={() => setShowWarning(false)} className="text-red-500/30 hover:text-red-500 transition-colors"><X size={20}/></button>
//                         </div>
//                     )}

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">
//                         <div className="flex items-center gap-4">
//                             <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>
//                             <div>
//                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Profits</p>
//                                 <h3 className="text-2xl font-black text-white mt-1">৳ {user.totalProfit}</h3>
//                             </div>
//                         </div>
//                         <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
//                       </div>

//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">
//                         <div className="flex items-center gap-4">
//                             <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>
//                             <div>
//                                 <p className="text-[11px] font-bold text-amber-400">Orders-Processing</p>
//                                 <h3 className="text-2xl font-black text-white mt-1">{prossioncout}</h3>
//                             </div>
//                         </div>
//                         <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
//                       </div>
//                     </div>

//                     <ProductListModule />
//                   </div>
//                 )}
                
//                 {activeTab === 'orders' && <ProductListModule />}
//                 {activeTab === 'profile' && <Updatename />}
                
//                 {activeTab === 'settings' && (() => {
//                     router.push('/profile/Settings');
//                     return null;
//                 })()}

//                 {activeTab === 'deposit' && (
//                    <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-10 md:p-16 rounded-[3rem] text-center shadow-2xl">
//                       <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
//                         <Wallet size={48} className="text-cyan-500" />
//                       </div>
//                       <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Deposit Hub</h2>
//                       <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">Select your preferred payment gateway to recharge your wallet instantly.</p>
                      
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
//                         {['bKash', 'Nagad', 'Rocket', 'Bank'].map(m => (
//                           <button key={m} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all active:scale-95 group">
//                             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-black transition-all">
//                                 <Plus size={20} className="text-cyan-400 group-hover:text-inherit" />
//                             </div>
//                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{m}</span>
//                           </button>
//                         ))}
//                       </div>
//                    </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </main>
//         </div>
//       </div>

//       {/* NEON REAL-TIME MODAL ALERT CONTAINER */}
//       <AnimatePresence>
//         {updateModal.isOpen && (
//           <>
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUpdateModal(p => ({ ...p, isOpen: false }))} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300]" />
//             <div className="fixed inset-0 flex items-center justify-center p-4 z-[310] pointer-events-none">
//               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="pointer-events-auto w-full max-w-md bg-[#0c0e1a]/95 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden text-center">
//                 <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 ${updateModal.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
//                 <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
//                   {updateModal.status === 'success' ? (
//                     <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"><CheckCircle2 size={32} /></div>
//                   ) : (
//                     <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]"><AlertTriangle size={32} /></div>
//                   )}
//                 </div>
//                 <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{updateModal.title}</h4>
//                 <p className="text-slate-400 text-sm font-medium px-2 leading-relaxed">{updateModal.message}</p>
//                 <button onClick={() => setUpdateModal(p => ({ ...p, isOpen: false }))} className={`mt-8 w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-black transition-all duration-300 active:scale-95 shadow-lg ${updateModal.status === 'success' ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20' : 'bg-red-400 hover:bg-red-300 shadow-red-500/20'}`}>Acknowledge System</button>
//               </motion.div>
//             </div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         body { background-color: #04060c; overflow-x: hidden; }
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         html { scroll-behavior: smooth; }
//       `}</style>
//     </div>
//   );
// }





// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Package, Settings, ChevronRight, Wallet, ArrowUpRight,
//   TrendingUp, LayoutDashboard, ShoppingBag, Gamepad2, Zap, 
//   AlertTriangle, Lock, Mail, PencilLine, LogOut, X, Menu,
//   CheckCircle2, UserCheck, CreditCard, ShieldCheck, Plus, DollarSign, Wifi, QrCode,
//   User2, EyeOff, Eye
// } from 'lucide-react';

// import Api from '../../api/Api';
// import CountUp from 'react-countup';
// import { MdRemove } from 'react-icons/md';
// import SettingsPage from '../Settings/page';
// import { Router } from 'next/router';
// import { useRouter } from 'next/navigation';

// export default function ProfilePage() {
//   useRouter
// const router = useRouter();
//   // Status Popup Modal State
//   const [updateModal, setUpdateModal] = useState({ 
//     isOpen: false, 
//     title: "", 
//     message: "", 
//     status: "success" 
//   });

//   const [products, setProducts] = useState<any[]>([]);
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [orderFilter, setOrderFilter] = useState('all');
//   const [showWarning, setShowWarning] = useState(true);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
  
//   const [names, setNames] = useState('User');
//   const [coissnss, setCoin] = useState<number>(0);
//   const [useid, setUserid] = useState<number>(0);
//   const [uniid, setUniqid] = useState<number>(0);
//   const [images, setImages] = useState('');
//   const profileRef = useRef<HTMLDivElement>(null);

//   const [prossioncout, setProssing] = useState<number>(0);

//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

//   const [showCurrent, setShowCurrent] = useState(false);
//   const [showNew, setShowNew] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);



//   const [usename, setName] = useState('');

  

//   // 1. Initialized Form Data State with Proper Structure
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     address: '',
//     password: ''
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState<any>(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: any) => {
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setIsProfileOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Generic Change Handler
//   const handleChange = (e: any) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Form Submission Handler for Profile Update (Fixed & Connected with Reload)
//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage(null);

//     try {
//       // Backend API call to update profile info using unique ID
//       const response = await Api.post(`/user_profile_update`, {
//         uniqid: uniid,
//         name: formData.name,
//         phone: formData.phone,
//         address: formData.address,
//         password: formData.password
//       });

//       if (response.status === 200 || response.data.success) {
//         setMessage({ type: 'success', text: 'Profile updated successfully! 🔄' });
        
//         // LocalStorage Data Auto Update
//         const storedData = localStorage.getItem('userData');
//         if (storedData) {
//           const userData = JSON.parse(storedData);
//           if (Array.isArray(userData) && userData[0]) {
//             userData[0].name = formData.name;
//             localStorage.setItem('userData', JSON.stringify(userData));
//           }
//         }

//         // Auto Refresh System State & Reload Profile Tab smoothly
//         setNames(formData.name);
//         setUpdateModal({
//           isOpen: true,
//           title: "SUCCESS",
//           message: "Your profile has been updated perfectly.",
//           status: "success"
//         });

//         // Optional: Complete Page Reload after 1.5 seconds if you want hard reset
//         setTimeout(() => {
//           window.location.reload();
//         }, 1500);
//       }
//     } catch (error) {
//       console.error(error);
//       setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Local storage data loading (Fixed to fill inputs automatically)
//   useEffect(() => {
//     try {
//       const storedData = localStorage.getItem('userData');
//       if (storedData) {
//         const userData = JSON.parse(storedData);
//         if (Array.isArray(userData) && userData[0]) {
//           const currentName = userData[0].name || 'Rashidul';
//           const currentImg = userData[0].img || '';
//           const currentId = userData[0].id || '';
//           const currentUniqId = userData[0].uniqid || '';
//           const currentPhone = userData[0].phone || '';
//           const currentAddress = userData[0].address || '';

//           setNames(currentName);
//           setImages(currentImg);
//           setUserid(currentId);
//           setUniqid(currentUniqId);

//           // Populating Form Data Inputs
//           setFormData({
//             name: currentName,
//             phone: currentPhone,
//             address: currentAddress,
//             password: ''
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error parsing userData", error);
//     }
//   }, []);

//   const itemdelteds = async (id: number) => {
//     try {
//       const response = await Api.delete(`/order_delelet/${id}`);
//       if (response.status === 200 || response.data.success) {
//         setProducts((prevProducts) => prevProducts.filter((item) => item.id !== id));
//         setProssing((prevCount) => Math.max(0, prevCount - 1));
//         alert("Remove your product ✅");
//       }
//     } catch (error) {
//       console.error("Error deleting product:", error);
//       alert("Failed to remove product. Please try again. ❌");
//     }
//   };

//   // Real-time Fetch Orders
//   useEffect(() => {
//     if (!useid) return;
    
//     const fetchOrders = () => {
//       Api.get(`/all_ordersget_img_and_id/${useid}`)
//         .then((response) => {
//           console.log('all order data get width img 12');
//           console.log(response.data);
          
//           setProducts(response.data);
//           setProssing(response.data.length);
//         })
//         .catch((error) => {
//           console.error("error page order all id by id:", error);
//         });
//     };

//     fetchOrders(); // Initial call
//     const interval = setInterval(fetchOrders, 3000);
//     return () => clearInterval(interval);
//   }, [useid]);

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 20);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const [user] = useState({
//     name: "Tanvir Ahmed",
//     email: "tanvir@example.com",
//     uniqid: " ",
//     phone: "+880 17XX-XXXXXX",
//     passwrod: "******XX-XXXXXX",
//     address: "new address ",
//     newPassword:'',
//     balance: "45,200",
//     totalProfit: "8,450",
//     isVerified: true,
//     img: ""
//   });

//   useEffect(() => {
//     setCoin(4543);
//   }, []);

//   const handlePasswordUpdate = async (e: any) => {
//     e.preventDefault();

//     if (!currentPassword || !newPassword) {
//       alert("Please fill in all password fields! ⚠️");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       alert("New password and Confirm password do not match! ❌");
//       return;
//     }

//     try {
//       setIsUpdatingPassword(true);
//       const response = await Api.post(`/user_change_password_udpate`, {
//         uniqid: uniid,
//         currentPassword: currentPassword,
//         newPassword: newPassword
//       });

//       if (response.status === 200 || response.data.success) {
//         alert("Password updated successfully! ✅");
//         setCurrentPassword('');
//         setNewPassword('');
//         setConfirmPassword('');
//       }
//     } catch (error: any) {
//       console.error("Error updating password:", error);
//     } finally {
//       setIsUpdatingPassword(false);
//     }
//   };

//   const menuItems = [
//     { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
//     { id: 'orders', icon: Package, label: 'Order History' },
//     { id: 'deposit', icon: Wallet, label: 'Deposit Hub' },  
//     { id: 'settings', icon: Settings, label: 'Security Panel' },
//   ];


 

//   const ProductListModule = () => (
//     <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
//       <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
//         <div>
//           <h3 className="text-2xl font-bold text-white">Order Vault</h3>
//           <p className="text-slate-500 text-sm mt-1">Track your active transactions</p>
//         </div>
//         <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
//           {['all', 'Completed', 'pending','Processing', 'waiting', 'Cancelled'].map((items) => (
//             <button 
//               key={items} onClick={() => setOrderFilter(items)}
//               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${orderFilter === items ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
//             >
//               {items}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div className="overflow-x-auto no-scrollbar">
//         <table className="w-full text-left min-w-[600px]">
//           <thead>
//             <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02]">
//               <th className="px-8 py-5">Product</th>
//               <th className="px-8 py-5">Date</th>
//               <th className="px-8 py-5">Amount</th>
//               <th className="px-8 py-5 text-right">Status</th>
//               <th className="px-8 py-5 text-right">action</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-white/5">
//             {products
//               ?.filter((o) => {
//                 if (!orderFilter || orderFilter.toLowerCase() === 'all') return true;
//                 if (!o.status) return false;
//                 return o.status.toLowerCase() === orderFilter.toLowerCase();
//               })
//               .map((order) => (
//                 <tr key={order.id} className="hover:bg-white/[0.02] hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300 group">
//                   <td className="px-8 py-6">
//                     <div className="flex items-center gap-4">
//                       <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
//                         <motion.img
//                           whileHover={{ scale: 1.15, rotate: 2 }}
//                           transition={{ duration: 0.6 }}
//                           src={order.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${order.img}` : order.imglink}
//                           alt={order.name}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                       <div>
//                           <p className="text-white font-bold text-sm group-hover:text-cyan-300 transition-colors duration-300">{order.name}</p>
//                           <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{order.model}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-8 py-6 text-sm text-slate-400 font-medium">{order.create_data}</td>
//                   <td className="px-8 py-6 font-black text-white text-base tracking-tight group-hover:text-cyan-400 transition-colors duration-300">৳{order.price}</td>
//                   <td className="px-8 py-6 text-right">
//                     <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border transition-all duration-300 ${
//                       order.status === 'Completed' 
//                         ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.7)]' 
//                         : order.status === 'Processing' 
//                         ? 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.4)] group-hover:shadow-[0_0_25px_rgba(232,121,249,0.7)]' 
//                         : order.status === 'waiting' || order.status === 'Pending' 
//                         ? 'bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]' 
//                         : 'bg-rose-500/15 text-rose-400 border-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.4)] group-hover:shadow-[0_0_25px_rgba(251,113,133,0.7)]'
//                     }`}>
//                       {order.status}
//                     </span>
//                   </td>
//                   <td className="px-8 py-6 text-right">
//                     <button 
//                       onClick={() => itemdelteds(order.id)} 
//                       className="p-2 text-red-400 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
//                     >
//                       <MdRemove size={14} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#04060c] text-slate-300 font-medium selection:bg-cyan-500/30">
      
//       {/* BACKGROUND EFFECTS */}
//       <div className="fixed inset-0 pointer-events-none z-0">
//         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[160px] rounded-full animate-pulse" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[160px] rounded-full animate-pulse" />
//       </div>

//       {/* NAVBAR */}
//       <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-3 bg-[#080a14]/90 backdrop-blur-2xl border-b border-white/5' : 'py-6 bg-transparent'}`}>
//         <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
//             <div className="flex items-center gap-4">
//                 <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10">
//                     <Menu size={24} />
//                 </button>
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/40">
//                         <Zap size={22} className="text-black fill-black" />
//                     </div>
//                     <span className="text-xl font-black text-white tracking-tighter uppercase hidden sm:block">Rashidul <span className="text-cyan-500">Official</span></span>
//                 </div>
//             </div>

//             {/* PROFILE DROPDOWN TRIGGER */}
//             <div className="relative" ref={profileRef}>
//                 <div 
//                   onClick={() => setIsProfileOpen(!isProfileOpen)}
//                   className="flex items-center gap-4 cursor-pointer group p-1.5 rounded-2xl hover:bg-white/5 transition-all"
//                 >
//                     <div className="text-right hidden sm:block">
//                         <div className="flex items-center justify-end gap-1">
//                           <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{names}</p>
//                           {user.isVerified && <CheckCircle2 size={14} className="text-cyan-400 fill-cyan-400/10" />}
//                         </div>
//                         <div className="flex items-center justify-end gap-1.5 mt-0.5">
//                             <span className="relative flex h-1.5 w-1.5">
//                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
//                                 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
//                             </span>
//                             <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Active Now</p>
//                         </div>
//                     </div>
//                     <div className="relative">
//                         <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition blur-sm ${isProfileOpen ? 'opacity-100 scale-110' : 'opacity-20 group-hover:opacity-100'}`}></div>
//                         <img 
//                           src={images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} 
//                           alt="avatar" 
//                           className="relative w-10 h-10 rounded-full border-2 border-slate-800 object-cover bg-slate-900 group-hover:scale-105 transition" 
//                         />
//                         <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#04060c] rounded-full flex items-center justify-center border border-white/10">
//                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* DROPDOWN MENU */}
//                 <AnimatePresence>
//                   {isProfileOpen && (
//                     <motion.div 
//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                       className="absolute top-full right-0 mt-4 w-72 bg-[#0c0e1a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] overflow-hidden"
//                     >
//                       <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -z-10"></div>
                      
//                       <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
//                         <img 
//                           src={images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} 
//                           alt="avatar" 
//                           className="w-12 h-12 rounded-2xl border border-white/10 object-cover" 
//                         />
//                         <div>
//                           <p className="text-white font-black text-sm uppercase tracking-tighter">{names}</p>
//                           <p className="text-slate-500 text-[10px] font-medium">{user.email}</p>
//                         </div>
//                       </div>

//                       <div className="space-y-1.5">
//                         <button onClick={() => {setActiveTab('settings'); setIsProfileOpen(false);}} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-all group">
//                           <div className="flex items-center gap-3">
//                             <UserCheck size={18} className="text-cyan-400" />
//                             <span className="text-xs font-bold text-slate-300 group-hover:text-white">Verify Identity</span>
//                           </div>
//                           <ChevronRight size={14} className="text-slate-600" />
//                         </button>
//                         <button onClick={() => {setActiveTab('orders'); setIsProfileOpen(false);}} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-all group">
//                           <div className="flex items-center gap-3">
//                             <CreditCard size={18} className="text-purple-400" />
//                             <span className="text-xs font-bold text-slate-300 group-hover:text-white">Transactions</span>
//                           </div>
//                           <ChevronRight size={14} className="text-slate-600" />
//                         </button>
//                         <button onClick={() => {setActiveTab('settings'); setIsProfileOpen(false);}} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-all group">
//                           <div className="flex items-center gap-3">
//                             <ShieldCheck size={18} className="text-emerald-400" />
//                             <span className="text-xs font-bold text-slate-300 group-hover:text-white">Security Hub</span>
//                           </div>
//                           <ChevronRight size={14} className="text-slate-600" />
//                         </button>
//                       </div>

//                       <div className="mt-6 pt-2">
//                         <button className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group">
//                           <LogOut size={16} />
//                           <span>Log Out Account</span>
//                         </button>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//             </div>
//         </div>
//       </nav>

//       {/* MOBILE SIDEBAR OVERLAY */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <>
//             <motion.div 
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               onClick={() => setIsMobileMenuOpen(false)}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden"
//             />
//             <motion.div 
//               initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
//               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//               className="fixed top-0 left-0 bottom-0 w-72 bg-[#080a14] border-r border-white/10 z-[200] p-6 lg:hidden"
//             >
//               <div className="flex items-center justify-between mb-10">
//                 <div className="flex items-center gap-2">
//                     <Zap className="text-cyan-500" size={24} />
//                     <span className="font-black text-white uppercase text-lg">Menu</span>
//                 </div>
//                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-lg">
//                     <X size={20} />
//                 </button>
//               </div>
//               <div className="space-y-3">
//                 {menuItems.map((item) => (
//                   <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
//                     className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:bg-white/5'}`}>
//                     <item.icon size={20} />
//                     <span className="text-sm">{item.label}</span>
//                   </button>
//                 ))}
//               </div>
//               <div className="absolute bottom-10 left-6 right-6">
//                  <button className="flex items-center gap-4 text-red-500 font-bold p-4 w-full bg-red-500/5 rounded-2xl">
//                     <LogOut size={20} />
//                     <span>Sign Out</span>
//                  </button>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
//           {/* PC SIDEBAR */}
//           <aside className="lg:col-span-3 hidden lg:block">
//             <nav className="bg-[#0c0e1a]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 sticky top-32 shadow-2xl">
//               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-4">Menu Navigation</p>
//               <div className="space-y-2">
//                 {menuItems.map((item) => (
//                   <button 
//                     key={item.id} 
//                     onClick={() => setActiveTab(item.id)}
//                     className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group overflow-hidden ${
//                         activeTab === item.id ? 'text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
//                     }`}
//                   >
//                     {activeTab === item.id && (
//                       <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-cyan-500 z-0 shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
//                     )}
//                     <span className="relative z-10"><item.icon size={19} /></span>
//                     <span className="relative z-10 text-sm tracking-wide">{item.label}</span>
//                   </button>
//                 ))}
//               </div>
//               {/* <div className="mt-8 pt-6 border-t border-white/5">
//                  <button className="flex items-center gap-4 text-red-400 hover:text-red-300 font-bold transition-all text-sm w-full p-4 hover:bg-red-500/10 rounded-2xl group">
//                     <LogOut size={18} />
//                     <span>Sign Out</span>
//                  </button>
//               </div> */}
//             </nav>
//           </aside>

//           {/* MAIN CONTENT AREA */}
//           <main className="lg:col-span-9">
//             <AnimatePresence mode="wait">
//               <motion.div 
//                 key={activeTab} 
//                 initial={{ opacity: 0, y: 15 }} 
//                 animate={{ opacity: 1, y: 0 }} 
//                 exit={{ opacity: 0, y: -15 }} 
//                 transition={{ duration: 0.3 }}
//               >
//                 {activeTab === 'dashboard' && (
//                   <div className="space-y-8">
//                     {/* HERO CARD BALANCE HEAD */}
//                     <div className="flex items-center justify-center p-6 bg-slate-900 min-h-[400px]">
//                       <div className="relative group w-full max-w-lg perspective-1000">
//                         <div className="relative rounded-[2.5rem] p-8 md:p-10 bg-slate-950 border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 transform-gpu group-hover:rotate-x-2 group-hover:rotate-y-2 group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/40">
                          
//                           <div className="absolute top-0 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] group-hover:bg-purple-600/30 transition-all"></div>
//                           <div className="absolute bottom-0 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] group-hover:bg-cyan-600/30 transition-all"></div>

//                           <div className="relative z-10">
//                             <div className="flex justify-between items-start mb-8">
//                               <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-80 shadow-inner"></div>
//                               <Wifi className="text-white/40 rotate-90" size={24} />
//                             </div>

//                             <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Available Balance</p>
//                             <div className="flex items-baseline gap-2">
//                               <span className="text-2xl md:text-4xl font-black text-white/30">৳</span>
//                               <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
//                                 <CountUp end={coissnss} duration={2} separator="," />
//                               </h2>
//                             </div>

//                             <div className="mt-10 flex justify-between items-end">
//                               <div>
//                                 <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Card Number</p>
//                                 <p className="text-white font-mono text-lg tracking-[0.2em]">{uniid}/{useid}</p>
                                
//                                 <div className="mt-4">
//                                   <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Created At</p>
//                                   <p className="text-white/80 font-bold text-sm">05 / 2026</p>
//                                 </div>
//                               </div>

//                               <div className="bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md group-hover:border-cyan-500/50 transition-all">
//                                 <QrCode size={48} className="text-white/70 group-hover:text-cyan-400" />
//                               </div>
//                             </div>

//                             <div className="flex flex-wrap gap-4 mt-8">
//                               <button 
//                                 onClick={() => setActiveTab('deposit')} 
//                                 className="bg-cyan-500 px-6 py-3 rounded-xl text-black font-black text-xs uppercase flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-cyan-500/20 active:scale-95"
//                               >
//                                 <Plus size={16} strokeWidth={4} /> RECHARGE
//                               </button>
//                               <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-black text-xs text-white hover:bg-white/10 transition backdrop-blur-md">
//                                 WITHDRAW
//                               </button>
//                             </div>
//                           </div>

//                           <CreditCard size={240} className="absolute -right-16 -bottom-16 text-white/[0.03] -rotate-12 group-hover:rotate-0 transition-all duration-1000 hidden md:block" />
//                         </div>
//                       </div>
//                     </div>

//                     {showWarning && (
//                         <div className="bg-red-500/5 border border-red-500/20 p-5 md:p-6 rounded-3xl flex items-center justify-between shadow-xl">
//                             <div className="flex items-center gap-4">
//                                 <div className="bg-red-500/20 p-3 rounded-xl"><AlertTriangle size={22} className="text-red-500" /></div>
//                                 <div>
//                                     <p className="text-red-500 font-black text-xs md:text-sm uppercase tracking-wider">Identity Verification Required</p>
//                                     <p className="text-slate-500 text-[10px] md:text-xs mt-0.5">Unlock high-tier limits by verifying your account.</p>
//                                 </div>
//                             </div>
//                             <button onClick={() => setShowWarning(false)} className="text-red-500/30 hover:text-red-500 transition-colors"><X size={20}/></button>
//                         </div>
//                     )}

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">
//                         <div className="flex items-center gap-4">
//                             <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>
//                             <div>
//                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Profits</p>
//                                 <h3 className="text-2xl font-black text-white mt-1">৳ {user.totalProfit}</h3>
//                             </div>
//                         </div>
//                         <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
//                       </div>

//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">
//                         <div className="flex items-center gap-4">
//                             <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>
//                             <div>
//                                 <p className="text-[11px] font-bold text-amber-400">Orders-Processing</p>
//                                 <h3 className="text-2xl font-black text-white mt-1">{prossioncout}</h3>
//                             </div>
//                         </div>
//                         <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
//                       </div>
//                     </div>

//                     <ProductListModule />
//                   </div>
//                 )}
                
//                 {activeTab === 'orders' && <ProductListModule />}
//                 {activeTab === 'profile' && <Updatename />}
//         {/* 🔥 FIX: settings ট্যাব অ্যাক্টিভ হলে সাথে সাথে রাউটার পুশ রান হবে */}
// {activeTab === 'settings' && (() => {
//     router.push('/profile/Settings');
//     return null;
// })()}
//                 {activeTab === 'deposit' && (
//                    <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-10 md:p-16 rounded-[3rem] text-center shadow-2xl">
//                       <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
//                         <Wallet size={48} className="text-cyan-500" />
//                       </div>
//                       <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Deposit Hub</h2>
//                       <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">Select your preferred payment gateway to recharge your wallet instantly.</p>
                      
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
//                         {['bKash', 'Nagad', 'Rocket', 'Bank'].map(m => (
//                           <button key={m} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all active:scale-95 group">
//                             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-black transition-all">
//                                 <Plus size={20} className="text-cyan-400 group-hover:text-inherit" />
//                             </div>
//                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{m}</span>
//                           </button>
//                         ))}
//                       </div>
//                    </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </main>
//         </div>
//       </div>

//       {/* NEON REAL-TIME MODAL ALERT CONTAINER */}
//       <AnimatePresence>
//         {updateModal.isOpen && (
//           <>
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUpdateModal(p => ({ ...p, isOpen: false }))} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300]" />
//             <div className="fixed inset-0 flex items-center justify-center p-4 z-[310] pointer-events-none">
//               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="pointer-events-auto w-full max-w-md bg-[#0c0e1a]/95 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden text-center">
//                 <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 ${updateModal.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
//                 <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
//                   {updateModal.status === 'success' ? (
//                     <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"><CheckCircle2 size={32} /></div>
//                   ) : (
//                     <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]"><AlertTriangle size={32} /></div>
//                   )}
//                 </div>
//                 <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{updateModal.title}</h4>
//                 <p className="text-slate-400 text-sm font-medium px-2 leading-relaxed">{updateModal.message}</p>
//                 <button onClick={() => setUpdateModal(p => ({ ...p, isOpen: false }))} className={`mt-8 w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-black transition-all duration-300 active:scale-95 shadow-lg ${updateModal.status === 'success' ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20' : 'bg-red-400 hover:bg-red-300 shadow-red-500/20'}`}>Acknowledge System</button>
//               </motion.div>
//             </div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         body { background-color: #04060c; overflow-x: hidden; }
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         html { scroll-behavior: smooth; }
//       `}</style>
//     </div>
//   );
// }



// 'use client';



// import { useState, useEffect, useRef } from 'react';

// import { motion, AnimatePresence } from 'framer-motion';

// import { 

//   Package, Settings, ChevronRight, Wallet, ArrowUpRight,

//   TrendingUp, LayoutDashboard, ShoppingBag, Gamepad2, Zap, 

//   AlertTriangle, Lock, Mail, PencilLine, LogOut, X, Menu,

//   CheckCircle2, UserCheck, CreditCard, ShieldCheck, Plus, DollarSign, Wifi, QrCode,

//   User2,

//   EyeOff,

//   Eye

// } from 'lucide-react';



// import Api, { getorder_by_id } from '../../api/Api';

// import CountUp from 'react-countup';

// import { MdRemove } from 'react-icons/md';



// export default function ProfilePage() {



//   // Status Popup Modal State

//   const [updateModal, setUpdateModal] = useState({ 

//     isOpen: false, 

//     title: "", 

//     message: "", 

//     status: "success" 

//   });





//   const [products, setProducts] = useState<any[]>([]);



//   const [activeTab, setActiveTab] = useState('dashboard');

//   const [orderFilter, setOrderFilter] = useState('all');

//   const [showWarning, setShowWarning] = useState(true);

//   const [isScrolled, setIsScrolled] = useState(false);

//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const [isProfileOpen, setIsProfileOpen] = useState(false);

  

//   const [names, setNames] = useState('User');

//   const [coissnss, setCoin] = useState<number>(0);

//   const [useid, setUserid] = useState<number>(0);

//   const [uniid, setUniqid] = useState<number>(0);



//   const [images, setImages] = useState('');

//   const profileRef = useRef<HTMLDivElement>(null);



//   const [prossioncout, setProssing] = useState<number>(0);

//   const [paindngcount, setPandingcurnt] = useState<number>(0);

//   const [waitingcournt, setWatingcount] = useState<number>(0);



//   const [prossings, setOredres] = useState('');

//   const [pannding, setPainding] = useState('');

//   const [wainting, setWaiting] = useState('');

//   const [success, setSuccess] = useState('');



//   const [currentPassword, setCurrentPassword] = useState('');

//   const [newPassword, setNewPassword] = useState('');

//   const [confirmPassword, setConfirmPassword] = useState('');

//   const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);



//   const [showCurrent, setShowCurrent] = useState(false);

//   const [showNew, setShowNew] = useState(false);

//   const [showConfirm, setShowConfirm] = useState(false);



//   // Close dropdown when clicking outside

//   useEffect(() => {

//     const handleClickOutside = (event: any) => {

//       if (profileRef.current && !profileRef.current.contains(event.target)) {

//         setIsProfileOpen(false);

//       }

//     };



//     document.addEventListener('mousedown', handleClickOutside);

//     return () => document.removeEventListener('mousedown', handleClickOutside);

//   }, []);



























// const [formData, setFormData] = useState({

    

//   });



//   // 2. Status & Loading States

//   const [isLoading, setIsLoading] = useState(false);

//   const [message, setMessage] = useState(null); // format: { type: 'success' | 'error', text: string }



//   // 3. Generic Change Handler

//   const handleChange = (e) => {

//     const { name, value } = e.target;

//     setFormData((prev) => ({

//       ...prev,

//       [name]: value,

//     }));

//   };



//   // 4. Form Submission Handler

//   const handleSubmit = async (e) => {

//     e.preventDefault();

//     setIsLoading(true);

//     setMessage(null);



//     try {

//       // Simulate an API call

//       await new Promise((resolve) => setTimeout(resolve, 1500));

      

//       setMessage({ type: 'success', text: 'Profile updated successfully!' });

//       if (onUpdateSuccess) onUpdateSuccess(formData);

//     } catch (error) {

//       setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });

//     } finally {

//       setIsLoading(false);

//     }

//   };











//   // Local storage data

//   useEffect(() => {

//     try {

//       const storedData = localStorage.getItem('userData');

//       if (storedData) {

//         const userData = JSON.parse(storedData);

//         if (Array.isArray(userData) && userData[0]) {

//           setNames(userData[0].name || 'Rashidul');

//           setImages(userData[0].img || '');

//           setUserid(userData[0].id || '');

//           setUniqid(userData[0].uniqid || '');

//         }

//       }

//     } catch (error) {

//       console.error("Error parsing userData", error);

//     }

//   }, []);



//   const itemdelteds = async (id: number) => {

//     try {

//       // 1. Send delete request to your Api instance

//       const response = await Api.delete(`/order_delelet/${id}`);



//       if (response.status === 200 || response.data.success) {

//         // 2. Filter out the deleted item from UI instantly without reloading page

//         setProducts((prevProducts) => prevProducts.filter((item) => item.id !== id));

        

//         // 3. Update the processing order counter smoothly

//         setProssing((prevCount) => Math.max(0, prevCount - 1));



//         alert("Remove your product ✅");

//       }

//     } catch (error) {

//       console.error("Error deleting product:", error);

//       alert("Failed to remove product. Please try again. ❌");

//     }

//   };



//   useEffect(() => {

//     const interval = setInterval(() => {

//       if (useid) {

//         Api.get(`/all_ordres_imgs_users_id/${useid}`)

//           .then((response) => {

//             console.log("ordre get by id :", response.data.length);

//             setProducts(response.data);

//             setProssing(response.data.length);

//           })

//           .catch((error) => {

//             console.error("error page order all id by id:", error);

//           });

//       }

//     }, 3000);

    

//     // Clear interval on unmount to prevent memory leaks

//     return () => clearInterval(interval);

//   }, [useid]);



//   useEffect(() => {

//     const handleScroll = () => setIsScrolled(window.scrollY > 20);

//     window.addEventListener('scroll', handleScroll);

//     return () => window.removeEventListener('scroll', handleScroll);

//   }, []);



//   const [user] = useState({

//     name: "Tanvir Ahmed",

//     email: "tanvir@example.com",

//     uniqid: " ",

//     phone: "+880 17XX-XXXXXX",

//     passwrod: "******XX-XXXXXX",

//     address: "new address ",

//     newPassword:'',

//     balance: "45,200",

//     totalProfit: "8,450",

//     isVerified: true, // Added verification status

//     img: "" // Added missing property to satisfy TS

//   });



//   useEffect(() => {

//     setCoin(4543);

//   }, []);





// const change_passwrod_api = async (e) => {

//   // 1. Stop the page from refreshing!

//   e.preventDefault();





// alert('this profile settiongs');

// }



//   const handlePasswordUpdate = async (e) => {

//   // 1. Stop the page from refreshing!

//   e.preventDefault();



 



//  // Basic Validation

//     if (!currentPassword || !newPassword) {

//       alert("Please fill in all password fields! ⚠️");

//       return;

//     }



//     if (newPassword !== confirmPassword) {

//       alert("New password and Confirm password do not match! ❌");

//       return;

//     }



//     try {





//       setIsUpdatingPassword(true);



//       // Payload sending to your backend API

//       const response = await Api.post(`/user_change_password_udpate`, {

//         uniqid:uniid,

//         currentPassword: currentPassword,

//         newPassword: newPassword



//       });





// console.log('get user password change==========================');

// console.log(response.data);







//       if (response.status === 200 || response.data.success) {

//         alert("Password updated successfully! ✅");

//         // Clear fields after success

//         setCurrentPassword('');

//         setNewPassword('');

//         setConfirmPassword('');

//       }

//     } catch (error: any) {

//       console.error("Error updating password:", error);





//       const errorMsg = error.response?.data?.message || "Failed to update password. Please try again. ❌";

    



//     } finally {

//       setIsUpdatingPassword(false);

//     }





         

//     //  alert( currentPassword: currentPassword +' = ' + newPassword: newPassword );

// };





//   const menuItems = [

//     { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },

//     { id: 'orders', icon: Package, label: 'Order History' },

//     { id: 'deposit', icon: Wallet, label: 'Deposit Hub' },

//     { id: 'profile', icon: User2, label: 'profile Settings' },

//     { id: 'settings', icon: Settings, label: 'Security Panel' },

//   ];



//   const allOrders = [

//     { id: "ORD-9921", product: "Gaming Keyboard Pro", date: "May 12, 2024", total: "2,500", status: "Success" },

//     { id: "ORD-8842", product: "Wireless Mouse G5", date: "May 10, 2024", total: "1,400", status: "Pending" },

//     { id: "ORD-7712", product: "LED Monitor 24'", date: "May 08, 2024", total: "15,200", status: "Waiting" },

//   ];



//   // --- COMPONENTS ---

//   const SettingsModule = () => (

// <div className="space-y-6">

//       {/* Cyber Neon Password Form */}

//       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">

//         <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl pointer-events-none"></div>

//         <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-8">

//           <Lock className="text-purple-400" size={24} /> Security update

//         </h3>

        

//         <form onSubmit={handlePasswordUpdate} className="space-y-6">

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            

//             {/* Current Password Field */}

//             <div className="space-y-3">

//               <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>

//               <div className="relative w-full">

//                 <input 

//                   type={showCurrent ? "text" : "password"} 

//                   value={currentPassword} 

//                   onChange={(e) => setCurrentPassword(e.target.value)} 

//                   placeholder="••••••••" 

//                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white placeholder-slate-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all" 

//                 />

//                 <button

//                   type="button"

//                   onClick={() => setShowCurrent(!showCurrent)}

//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors duration-200"

//                 >

//                   {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}

//                 </button>

//               </div>

//             </div>



//             {/* New Password Field */}

//             <div className="space-y-3">

//               <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>

//               <div className="relative w-full">

//                 <input 

//                   type={showNew ? "text" : "password"} 

//                   value={newPassword} 

//                   onChange={(e) => setNewPassword(e.target.value)} 

//                   placeholder="New code structure" 

//                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white placeholder-slate-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all" 

//                 />

//                 <button

//                   type="button"

//                   onClick={() => setShowNew(!showNew)}

//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors duration-200"

//                 >

//                   {showNew ? <EyeOff size={20} /> : <Eye size={20} />} 

//                 </button>

//               </div>

//             </div>



//             {/* Confirm Password Field */}

//             <div className="space-y-3">

//               <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>

//               <div className="relative w-full">

//                 <input 

//                   type={showConfirm ? "text" : "password"} 

//                   value={confirmPassword} 

//                   onChange={(e) => setConfirmPassword(e.target.value)} 

//                   placeholder="Re-enter code" 

//                   className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white placeholder-slate-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all" 

//                 />

//                 <button

//                   type="button"

//                   onClick={() => setShowConfirm(!showConfirm)}

//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors duration-200"

//                 >

//                   {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}

//                 </button>

//               </div>

//             </div>



//           </div>



//           {/* Password Match Message */}

//           {/* {passwordMatchMessage && (

//             <p className={`text-sm font-medium ${passwordMatchMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>

//               {passwordMatchMessage}

//             </p> */}

        



//           <button 

//             type="submit" disabled={isUpdatingPassword || (newPassword !== confirmPassword && confirmPassword.length > 0)}

//             className="mt-4 w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"

//           >

//             {isUpdatingPassword ? "PROCESSING UPDATE..." : "UPDATE SECURITY KEY"}

//           </button>

//         </form>

//       </div>

//     </div>

//   );















//   // --- COMPONENTS ---

//   const Updatename = () => (

// <div className="space-y-6">

//       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">

//         <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-8">

//           <PencilLine className="text-cyan-400" size={24} /> Profile Settings

//         </h3>



//         {/* Status Message Display */}

//         {message && (

//           <div

//             className={`mb-6 p-4 rounded-xl text-sm font-bold ${

//               message.type === 'success'

//                 ? 'bg-green-500/20 text-green-400 border border-green-500/30'

//                 : 'bg-red-500/20 text-red-400 border border-red-500/30'

//             }`}

//           >

//             {message.text}

//           </div>

//         )}



//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

//           <div className="space-y-3">

//             <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">

//               Full Name

//             </label>

//             <input

//               type="text"

//               name="name"

//               value={formData.name}

//               onChange={handleChange}

//               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"

//               required

//             />

//           </div>



//           <div className="space-y-3">

//             <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">

//               Phone Number

//             </label>

//             <input

//               type="text"

//               name="phone"

//               value={formData.phone}

//               onChange={handleChange}

//               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"

//             />

//           </div>



//           <div className="space-y-3">

//             <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">

//               Update Address

//             </label>

//             <input

//               type="text"

//               name="address"

//               value={formData.address}

//               onChange={handleChange}

//               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"

//             />

//           </div>



//           <div className="space-y-3">

//             <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest ml-1">

//               Your Password

//             </label>

//             <input

//               type="password"

//               name="password"

//               value={formData.password}

//               onChange={handleChange}

//               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"

//               placeholder="••••••••"

//             />

//           </div>



//           <div className="space-y-3 md:col-span-2 bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4">

//             <div className="relative group">

//               <img

//                 src={user?.img || '/placeholder-avatar.png'}

//                 alt="Profile"

//                 className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/50"

//               />

//               <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">

//                 <PencilLine size={16} className="text-white" />

//               </div>

//             </div>

//             <div>

//               <p className="text-sm font-bold text-white flex items-center gap-2">

//                 <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>

//                       Sidebar Connected

//               </p>

//               <p className="text-xs text-slate-400 mt-0.5">

//                      Image dynamically updates across your navigation layout.

//               </p>

//             </div>

//           </div>



//           <div className="md:col-span-2">

//             <button

//               type="submit"

//               disabled={isLoading}

//               className="bg-cyan-500 text-black px-10 py-4 rounded-2xl font-black hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"

//             >

//               {isLoading ? 'SAVING...' : 'SAVE CHANGES'}

//             </button>

//           </div>

//         </form>





// <input type='name' placeholder='enter name'   className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"  />



//       </div>

//     </div>



//   );







  



//   const ProductListModule = () => (

//     <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">

//       <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">

//         <div>

//           <h3 className="text-2xl font-bold text-white">             Order Vault</h3>

//           <p className="text-slate-500 text-sm mt-1">Track your active transactions</p>

//         </div>

//         <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">

//           {['all', 'Completed', 'pending','Processing', 'waiting', 'Cancelled'].map((items) => (

//             <button 

//               key={items} onClick={() => setOrderFilter(items)}

//               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${orderFilter === items ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}

//             >

//               {items}

//             </button>

//           ))}

//         </div>

//       </div>

//       <div className="overflow-x-auto no-scrollbar">

//        <table className="w-full text-left min-w-[600px]">

//   <thead>

//     <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02]">

//       <th className="px-8 py-5">Product</th>

//       <th className="px-8 py-5">Date</th>

//       <th className="px-8 py-5">Amount</th>

//       <th className="px-8 py-5 text-right">Status</th>

//       <th className="px-8 py-5 text-right">action</th>

//     </tr>

//   </thead>

//   <tbody className="divide-y divide-white/5">

//     {products

//       ?.filter((o) => {

//         // যদি orderFilter এর মান 'all' হয়, তবে সব ডেটা দেখাবে

//         if (!orderFilter || orderFilter.toLowerCase() === 'all') return true;

        

//         // প্রোডাক্টের status না থাকলে সেটি ফিল্টার আউট করবে (ক্র্যাশ প্রতিরোধে)

//         if (!o.status) return false;

        

//         // দুটোর মানকেই ছোট হাতের অক্ষরে রূপান্তর করে নিখুঁতভাবে চেক করা হচ্ছে

//         return o.status.toLowerCase() === orderFilter.toLowerCase();

//       })

//       .map((order) => (

//         <tr key={order.id} className="hover:bg-white/[0.02] hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300 group">

//           <td className="px-8 py-6">

//             <div className="flex items-center gap-4">

//               <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">

//                 <motion.img

//                   whileHover={{ scale: 1.15, rotate: 2 }}

//                   transition={{ duration: 0.6 }}

//                   src={order.img ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/uploads_product/${order.img}` : order.imglink}

//                   alt={order.name}

//                   className="w-full h-full object-cover"

//                 />

//               </div>

//               <div>

//                   <p className="text-white font-bold text-sm group-hover:text-cyan-300 transition-colors duration-300">{order.name}</p>

//                   <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{order.model}</p>

//               </div>

//             </div>

//           </td>

//           <td className="px-8 py-6 text-sm text-slate-400 font-medium">{order.create_data}</td>

//           <td className="px-8 py-6 font-black text-white text-base tracking-tight group-hover:text-cyan-400 transition-colors duration-300">৳{order.price}</td>

//           <td className="px-8 py-6 text-right">

//             <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border transition-all duration-300 ${

//               order.status === 'Completed' 

//                 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.7)]' 

//                 : order.status === 'Processing' 

//                 ? 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.4)] group-hover:shadow-[0_0_25px_rgba(232,121,249,0.7)]' 

//                 : order.status === 'waiting' || order.status === 'Pending' 

//                 ? 'bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]' 

//                 : 'bg-rose-500/15 text-rose-400 border-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.4)] group-hover:shadow-[0_0_25px_rgba(251,113,133,0.7)]'

//             }`}>

//               {order.status}

//             </span>

//           </td>

//           <td className="px-8 py-6 text-right">

//             <button 

//               onClick={() => itemdelteds(order.id)} 

//               className="p-2 text-red-400 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"

//             >

//                      <MdRemove size={14} />

//             </button>

//           </td>

//         </tr>

//       ))}

//   </tbody>

// </table>

//       </div>

//     </div>

//   );



//   return (

//     <div className="min-h-screen bg-[#04060c] text-slate-300 font-medium selection:bg-cyan-500/30">

      

//       {/* BACKGROUND EFFECTS */}

//       <div className="fixed inset-0 pointer-events-none z-0">

//         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[160px] rounded-full animate-pulse" />

//         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[160px] rounded-full animate-pulse" />

//       </div>



//       {/* NAVBAR */}

//       <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-3 bg-[#080a14]/90 backdrop-blur-2xl border-b border-white/5' : 'py-6 bg-transparent'}`}>

//         <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

//             <div className="flex items-center gap-4">

//                 <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10">

//                     <Menu size={24} />

//                 </button>

//                 <div className="flex items-center gap-3">

//                     <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/40">

//                         <Zap size={22} className="text-black fill-black" />

//                     </div>

//                     <span className="text-xl font-black text-white tracking-tighter uppercase hidden xs:block">Rashidul <span className="text-cyan-500">Official</span></span>

//                 </div>

//             </div>



//             {/* PROFILE DROPDOWN TRIGGER */}

//             <div className="relative" ref={profileRef}>

//                 <div 

//                   onClick={() => setIsProfileOpen(!isProfileOpen)}

//                   className="flex items-center gap-4 cursor-pointer group p-1.5 rounded-2xl hover:bg-white/5 transition-all"

//                 >

//                     <div className="text-right hidden sm:block">

//                         <div className="flex items-center justify-end gap-1">

//                           <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{names}</p>

//                           {user.isVerified && <CheckCircle2 size={14} className="text-cyan-400 fill-cyan-400/10" />}

//                         </div>

//                         <div className="flex items-center justify-end gap-1.5 mt-0.5">

//                             <span className="relative flex h-1.5 w-1.5">

//                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>

//                                 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>

//                             </span>

//                             <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Active Now</p>

//                         </div>

//                     </div>

//                     <div className="relative">

//                         <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition blur-sm ${isProfileOpen ? 'opacity-100 scale-110' : 'opacity-20 group-hover:opacity-100'}`}></div>

//                         <img 

//                           src={images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} 

//                           alt="avatar" 

//                           className="relative w-10 h-10 rounded-full border-2 border-slate-800 object-cover bg-slate-900 group-hover:scale-105 transition" 

//                         />

//                         <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#04060c] rounded-full flex items-center justify-center border border-white/10">

//                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>

//                         </div>

//                     </div>

//                 </div>



//                 {/* DROPDOWN MENU */}

//                 <AnimatePresence>

//                   {isProfileOpen && (

//                     <motion.div 

//                       initial={{ opacity: 0, y: 10, scale: 0.95 }}

//                       animate={{ opacity: 1, y: 0, scale: 1 }}

//                       exit={{ opacity: 0, y: 10, scale: 0.95 }}

//                       className="absolute top-full right-0 mt-4 w-72 bg-[#0c0e1a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] overflow-hidden"

//                     >

//                       <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -z-10"></div>

                      

//                       <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">

//                         <img 

//                           src={images ? `http://localhost:8000/profile_users/${images}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} 

//                           alt="avatar" 

//                           className="w-12 h-12 rounded-2xl border border-white/10 object-cover" 

//                         />

//                         <div>

//                           <p className="text-white font-black text-sm uppercase tracking-tighter">{names}</p>

//                           <p className="text-slate-500 text-[10px] font-medium">{user.email}</p>

//                         </div>

//                       </div>



//                       <div className="space-y-1.5">

//                         <button onClick={() => {setActiveTab('settings'); setIsProfileOpen(false);}} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-all group">

//                           <div className="flex items-center gap-3">

//                             <UserCheck size={18} className="text-cyan-400" />

//                             <span className="text-xs font-bold text-slate-300 group-hover:text-white">Verify Identity</span>

//                           </div>

//                           <ChevronRight size={14} className="text-slate-600" />

//                         </button>

//                         <button onClick={() => {setActiveTab('orders'); setIsProfileOpen(false);}} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-all group">

//                           <div className="flex items-center gap-3">

//                             <CreditCard size={18} className="text-purple-400" />

//                             <span className="text-xs font-bold text-slate-300 group-hover:text-white">Transactions</span>

//                           </div>

//                           <ChevronRight size={14} className="text-slate-600" />

//                         </button>

//                         <button onClick={() => {setActiveTab('settings'); setIsProfileOpen(false);}} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 transition-all group">

//                           <div className="flex items-center gap-3">

//                             <ShieldCheck size={18} className="text-emerald-400" />

//                             <span className="text-xs font-bold text-slate-300 group-hover:text-white">Security Hub</span>

//                           </div>

//                           <ChevronRight size={14} className="text-slate-600" />

//                         </button>

//                       </div>



//                       <div className="mt-6 pt-2">

//                         <button className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group">

//                           <LogOut size={16} />

//                           <span>Log Out Account</span>

//                         </button>

//                       </div>

//                     </motion.div>

//                   )}

//                 </AnimatePresence>

//             </div>

//         </div>

//       </nav>



//       {/* MOBILE SIDEBAR OVERLAY */}

//       <AnimatePresence>

//         {isMobileMenuOpen && (

//           <>

//             <motion.div 

//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}

//               onClick={() => setIsMobileMenuOpen(false)}

//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden"

//             />

//             <motion.div 

//               initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}

//               transition={{ type: 'spring', damping: 25, stiffness: 200 }}

//               className="fixed top-0 left-0 bottom-0 w-72 bg-[#080a14] border-r border-white/10 z-[200] p-6 lg:hidden"

//             >

//               <div className="flex items-center justify-between mb-10">

//                 <div className="flex items-center gap-2">

//                     <Zap className="text-cyan-500" size={24} />

//                     <span className="font-black text-white uppercase text-lg">Menu</span>

//                 </div>

//                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-lg">

//                     <X size={20} />

//                 </button>

//               </div>

//               <div className="space-y-3">

//                 {menuItems.map((item) => (

//                   <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}

//                     className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:bg-white/5'}`}>

//                     <item.icon size={20} />

//                     <span className="text-sm">{item.label}</span>

//                   </button>

//                 ))}

//               </div>

//               <div className="absolute bottom-10 left-6 right-6">

//                  <button className="flex items-center gap-4 text-red-500 font-bold p-4 w-full bg-red-500/5 rounded-2xl">

//                     <LogOut size={20} />

//                     <span>Sign Out</span>

//                  </button>

//               </div>

//             </motion.div>

//           </>

//         )}

//       </AnimatePresence>



//       <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          

//           {/* PC SIDEBAR */}

//           <aside className="lg:col-span-3 hidden lg:block">

//             <nav className="bg-[#0c0e1a]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 sticky top-32 shadow-2xl">

//               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-4">Menu Navigation</p>

//               <div className="space-y-2">

//                 {menuItems.map((item) => (

//                   <button 

//                     key={item.id} 

//                     onClick={() => setActiveTab(item.id)}

//                     className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group overflow-hidden ${

//                         activeTab === item.id ? 'text-black font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'

//                     }`}

//                   >

//                     {activeTab === item.id && (

//                       <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-cyan-500 z-0 shadow-[0_0_20px_rgba(6,182,212,0.4)]" />

//                     )}

//                     <span className="relative z-10"><item.icon size={19} /></span>

//                     <span className="relative z-10 text-sm tracking-wide">{item.label}</span>

//                   </button>

//                 ))}

//               </div>

//               <div className="mt-8 pt-6 border-t border-white/5">

//                  <button className="flex items-center gap-4 text-red-400 hover:text-red-300 font-bold transition-all text-sm w-full p-4 hover:bg-red-500/10 rounded-2xl group">

//                     <LogOut size={18} />

//                     <span>Sign Out</span>

//                  </button>

//               </div>

//             </nav>

//           </aside>



//           {/* MAIN CONTENT AREA */}

//           <main className="lg:col-span-9">

//             <AnimatePresence mode="wait">

//               <motion.div 

//                 key={activeTab} 

//                 initial={{ opacity: 0, y: 15 }} 

//                 animate={{ opacity: 1, y: 0 }} 

//                 exit={{ opacity: 0, y: -15 }} 

//                 transition={{ duration: 0.3 }}

//               >

//                 {activeTab === 'dashboard' && (

//                   <div className="space-y-8">

//                     {/*-------------------- HERO CARD  BALANCE HEAD ------------------------------------------- */}

//                     <div className="flex items-center justify-center p-6 bg-slate-900 min-h-[400px]">

//                       {/* Main Card Container */}

//                       <div className="relative group w-full max-w-lg perspective-1000">

//                         <div className="relative rounded-[2.5rem] p-8 md:p-10 bg-slate-950 border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 transform-gpu group-hover:rotate-x-2 group-hover:rotate-y-2 group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/40">

                          

//                           {/* Animated Background Orbs */}

//                           <div className="absolute top-0 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] group-hover:bg-purple-600/30 transition-all"></div>

//                           <div className="absolute bottom-0 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] group-hover:bg-cyan-600/30 transition-all"></div>



//                           {/* Card Content */}

//                           <div className="relative z-10">

//                             {/* Header: Chip & NFC */}

//                             <div className="flex justify-between items-start mb-8">

//                               <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-80 shadow-inner"></div>

//                               <Wifi className="text-white/40 rotate-90" size={24} />

//                             </div>



//                             {/* Balance Section */}

//                             <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Available Balance</p>

//                             <div className="flex items-baseline gap-2">

//                               <span className="text-2xl md:text-4xl font-black text-white/30">৳</span>

//                               <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">

//                                 <CountUp end={coissnss} duration={2} separator="," />

//                               </h2>

//                             </div>



//                             {/* Card Details (Number & Date) */}

//                             <div className="mt-10 flex justify-between items-end">

//                               <div>

//                                 <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Card Number</p>

//                                 <p className="text-white font-mono text-lg tracking-[0.2em]">{uniid}/{useid}</p>

                                

//                                 <div className="mt-4">

//                                   <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Created At</p>

//                                   <p className="text-white/80 font-bold text-sm">05 / 2026</p>

//                                 </div>

//                               </div>



//                               {/* QR Code Placeholder */}

//                               <div className="bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md group-hover:border-cyan-500/50 transition-all">

//                                 <QrCode size={48} className="text-white/70 group-hover:text-cyan-400" />

//                               </div>

//                             </div>



//                             {/* Action Buttons */}

//                             <div className="flex flex-wrap gap-4 mt-8">

//                               <button 

//                                 onClick={() => setActiveTab('deposit')} 

//                                 className="bg-cyan-500 px-6 py-3 rounded-xl text-black font-black text-xs uppercase flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-cyan-500/20 active:scale-95"

//                               >

//                                 <Plus size={16} strokeWidth={4} /> RECHARGE

//                               </button>

//                               <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-black text-xs text-white hover:bg-white/10 transition backdrop-blur-md">

//                                 WITHDRAW

//                               </button>

//                             </div>

//                           </div>



//                           {/* Background Decorative Icon */}

//                           <CreditCard size={240} className="absolute -right-16 -bottom-16 text-white/[0.03] -rotate-12 group-hover:rotate-0 transition-all duration-1000 hidden md:block" />

//                         </div>

//                       </div>

//                     </div>



//                     {showWarning && (







//                         <div className="bg-red-500/5 border border-red-500/20 p-5 md:p-6 rounded-3xl flex items-center justify-between shadow-xl">

//                             <div className="flex items-center gap-4">

//                                 <div className="bg-red-500/20 p-3 rounded-xl"><AlertTriangle size={22} className="text-red-500" /></div>

//                                 <div>

//                                     <p className="text-red-500 font-black text-xs md:text-sm uppercase tracking-wider">Identity Verification Required</p>

//                                     <p className="text-slate-500 text-[10px] md:text-xs mt-0.5">Unlock high-tier limits by verifying your account.</p>

//                                 </div>

//                             </div>

//                             <button onClick={() => setShowWarning(false)} className="text-red-500/30 hover:text-red-500 transition-colors"><X size={20}/></button>

//                         </div>

//                     )}



//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">









//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">

//                         <div className="flex items-center gap-4">

//                             <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>

//                             <div>

//                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Profits</p>

//                                 <h3 className="text-2xl font-black text-white mt-1">৳ {user.totalProfit}</h3>

//                             </div>

//                         </div>

//                         <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />

//                       </div>







//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">

//                         <div className="flex items-center gap-4">

//                             <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>

//                             <div>

//                                 <p className=" bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]">Orders-Processing</p>

//                                 <h3 className="text-2xl font-black text-white mt-1">{prossioncout}</h3>

//                             </div>

//                         </div>

//                         <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />

//                       </div>







//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-purple-500/40 transition-all">

//                         <div className="flex items-center gap-4">

//                             <div className="bg-purple-500/10 p-3.5 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform"><Gamepad2 size={24}/></div>

//                             <div>

//  <p className=" bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]">Orders-Processing</p>

//                                 <h3 className="text-2xl font-black text-white mt-1">Elite V</h3>

//                             </div>

//                         </div>

//                         <span className="bg-purple-500/20 text-purple-400 text-[8px] font-black px-2.5 py-1.5 rounded-lg tracking-widest uppercase">Max Tier</span>

//                       </div>



                      



//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">

//                         <div className="flex items-center gap-4">

//                             <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>

//                             <div>

//                                 <p className=" bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]">Earning</p>

//                                 <h3 className="text-2xl font-black text-white mt-1">৳{user.totalProfit}</h3>

//                             </div>

//                         </div>

//                         <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />

//                       </div>









//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-cyan-500/40 transition-all">

//                         <div className="flex items-center gap-4">

//                             <div className="bg-cyan-500/10 p-3.5 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform"><TrendingUp size={24}/></div>

//                             <div>

//              <p className=" bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]">Profit</p>

//                                 <h3 className="text-2xl font-black text-white mt-1">৳{user.totalProfit}</h3>

//                             </div>

//                         </div>

//                         <ArrowUpRight className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />

//                       </div>



//                       <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] flex items-center justify-between group hover:border-purple-500/40 transition-all">

//                         <div className="flex items-center gap-4">

//                             <div className="bg-purple-500/10 p-3.5 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform"><Gamepad2 size={24}/></div>

//                             <div>

//                                <p className=" bg-amber-500/15 text-amber-400 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.7)]">Games level</p>

//                                 <h3 className="text-2xl font-black text-white mt-1">Elite V</h3>

//                             </div>

//                         </div>

//                         <span className="bg-purple-500/20 text-purple-400 text-[8px] font-black px-2.5 py-1.5 rounded-lg tracking-widest uppercase">Max Tier</span>

//                       </div>









//                     </div>



//                     <ProductListModule />

//                   </div>

//                 )}

                

//                    {activeTab === 'orders' && <ProductListModule />}

//                     {activeTab === 'profile' && <Updatename />}

//                    {activeTab === 'settings' && <SettingsModule />}

//                     {activeTab === 'deposit' && (

//                    <div className="bg-[#0c0e1a]/60 backdrop-blur-xl border border-white/10 p-10 md:p-16 rounded-[3rem] text-center shadow-2xl">

//                       <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">

//                         <Wallet size={48} className="text-cyan-500" />

//                       </div>

//                       <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Deposit Hub</h2>

//                       <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">Select your preferred payment gateway to recharge your wallet instantly.</p>

                      

//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">

//                         {['bKash', 'Nagad', 'Rocket', 'Bank'].map(m => (

//                           <button key={m} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all active:scale-95 group">

//                             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-500 group-hover:text-black transition-all">

//                                 <Plus size={20} className="text-cyan-400 group-hover:text-inherit" />

//                             </div>

//                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{m}</span>

//                           </button>

//                         ))}

//                       </div>

//                    </div>

//                 )}

//               </motion.div>

//             </AnimatePresence>

//           </main>

//         </div>

//       </div>



//       {/* NEON REAL-TIME MODAL ALERT CONTAINER */}

//       <AnimatePresence>

//         {updateModal.isOpen && (

//           <>

//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUpdateModal(p => ({ ...p, isOpen: false }))} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300]" />

//             <div className="fixed inset-0 flex items-center justify-center p-4 z-[310] pointer-events-none">

//               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="pointer-events-auto w-full max-w-md bg-[#0c0e1a]/95 border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden text-center">

//                 <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 ${updateModal.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />

//                 <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6">

//                   {updateModal.status === 'success' ? (

//                     <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"><CheckCircle2 size={32} /></div>

//                   ) : (

//                     <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]"><AlertTriangle size={32} /></div>

//                   )}

//                 </div>

//                 <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{updateModal.title}</h4>

//                 <p className="text-slate-400 text-sm font-medium px-2 leading-relaxed">{updateModal.message}</p>

//                 <button onClick={() => setUpdateModal(p => ({ ...p, isOpen: false }))} className={`mt-8 w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-black transition-all duration-300 active:scale-95 shadow-lg ${updateModal.status === 'success' ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20' : 'bg-red-400 hover:bg-red-300 shadow-red-500/20'}`}>Acknowledge System</button>

//               </motion.div>

//             </div>

//           </>

//         )}

//       </AnimatePresence>



//       <style jsx global>{`

//         body { background-color: #04060c; overflow-x: hidden; }

//         .no-scrollbar::-webkit-scrollbar { display: none; }

//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

//         html { scroll-behavior: smooth; }

//       `}</style>

//     </div>

//   );

// }

