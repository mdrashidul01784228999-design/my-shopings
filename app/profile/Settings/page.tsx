"use client";

import React, { useEffect, useState } from "react";
import {
  User, Lock, Bell, Palette, Globe, Shield, HelpCircle,
  Sun, Moon, CreditCard, Link as LinkIcon, Info,
  Menu, X, EyeOff, Eye, Wallet, Landmark,
  Mail, Phone, MapPin, Calendar, ShieldCheck,
  Key, BadgePercent, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Api from "../../api/Api";

// ==========================================
// 💡 Card Wrapper Component (সবার উপরে স্থানান্তরিত - NO DESIGN CHANGE)
// ==========================================
type CardProps = {
  children: React.ReactNode;
  className?: string;
};

function Card({ children, className }: CardProps) {
  return (
    <div
      className={`p-4 rounded-xl ${className || ""}`}
      style={{
        background: "linear-gradient(180deg,rgba(255 255 255 / 0.08) 0%,rgba(255 255 255 / 0.02) 100%)",
        border: "1px solid rgba(255 255 255 / 0.15)",
        boxShadow: "inset 0 1px 0 rgba(255 255 255 / 0.5),0 0 10px 3px rgba(255 255 255 / 0.1)",
      }}
    >
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [darkMode, setDarkMode] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [getid, setUserid] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    address: "",
    phone: "",
    nid: "",
    date_of_bird: "",
    bio: "",
    uniqid: "",
    email: "",
    pass: "",
    id: "",
  });

  const [securityData, setSecurityData] = useState({
    password: "",
    confirm: "",
    oldpassword: "",
    twoFA: false,
  });

  const [notificationsData, setNotificationsData] = useState({
    email: true,
    push: false,
  });

  const [accountData] = useState({ username: "", phone: "" });
  const [paymentsData] = useState({
    card: "",
    expiry: "",
    cvc: "",
  });

  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedMsg, setSavedMsg] = useState<Record<string, string>>({});

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("bank");
  const [accountNumber, setAccountNumber] = useState("");

  const [usedataall] = useState<any>([]);

  useEffect(() => {
    if (!getid) return; 

    Api.get(`/all_users_id/${getid}`)
      .then((response) => {
        if (response.data?.data) {
          setProfileData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error setting profile:", error);
      });
  }, [getid]);

  const paymentOptions = [
    {
      id: "bkash",
      name: "bKash",
      icon: <Wallet size={24} className="text-pink-500" />,
      desc: "Send money easily with bKash",
    },
    {
      id: "nagad",
      name: "Nagad",
      icon: <Wallet size={24} className="text-orange-500" />,
      desc: "Fast and secure Nagad payments",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: <Landmark size={24} className="text-blue-500" />,
      desc: "Pay directly with your bank account",
    },
  ];

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);
  const handleConfirm = () => {
    if (!accountNumber) return alert("Please enter your account/number");

    Api.post(`/userdata_UPDATE`, {
      accountNumber,
      bank: selectedPayment,
      id: getid,
      action: "payment",
    })
      .then((response) => {
        alert(response.data.data);
      })
      .catch((error) => {
        console.error("Error setting profile:", error);
        alert(error + " error ");
      });
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "[]");
    if (userData[0]) {
      setUserid(userData[0].id || "no name fine");
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  const menuItems = [
    { id: "account", label: "Account Info", icon: Info },
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette, disabled: true },
    { id: "language", label: "Language", icon: Globe, disabled: true },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "apps", label: "Connected Apps", icon: LinkIcon },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const fakeSave = (section: string, data: Record<string, any>) => {
    setSaving((s) => ({ ...s, [section]: true }));
    setSavedMsg((s) => ({ ...s, [section]: "" }));
    setTimeout(() => {
      console.log("Saved", section, data);
      setSaving((s) => ({ ...s, [section]: false }));
      setSavedMsg((s) => ({ ...s, [section]: "Saved successfully" }));
      setTimeout(() => setSavedMsg((s) => ({ ...s, [section]: "" })), 2500);
    }, 900);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();
    Api.post(`/userdata_UPDATE`, {
      address: profileData.address,
      email: profileData.email,
      name: profileData.name,
      phone: profileData.phone,
      nid: profileData.nid,
      pass: profileData.bio,
      dateofbirth: profileData.date_of_bird,
      uniqids: profileData.uniqid,
      action: "updateuser-data",
      id: getid,
    })
      .then((res) => {
        alert(res.data.message);
        fakeSave("profile", { status: res.data.status });
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        alert("error password or nid profile udpates ");
      });
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e?.preventDefault();
    if (securityData.password && securityData.password !== securityData.confirm) {
      setSavedMsg((s) => ({ ...s, security: "Passwords don't match" }));
      setTimeout(() => setSavedMsg((s) => ({ ...s, security: "" })), 5500);
    } else {
      Api.post(`/userdata_UPDATE`, {
        oldpass: securityData.oldpassword,
        pass: securityData.password,
        confirm: securityData.confirm,
        action: "updateall-pass",
        id: getid,
      })
        .then((response) => {
          alert(response.data.message);
          fakeSave("profile", { status: response.data.status });
          setSavedMsg((s) => ({ ...s, security: response.data.data }));
          setTimeout(() => setSavedMsg((s) => ({ ...s, security: "" })), 5500);
        })
        .catch((error) => {
          alert(error);
          console.error("Error updating password:", error);
          setSavedMsg((s) => ({
            ...s,
            security: "your password update error",
          }));
          setTimeout(() => setSavedMsg((s) => ({ ...s, security: "" })), 5500);
        });
    }
  };

  const handleNotificationsSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    fakeSave("notifications", notificationsData);
  };

  const handleAccountSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    fakeSave("account", accountData);
  };

  const handlePaymentsSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    fakeSave("payments", paymentsData);
  };

  return (
    <div
      className={`min-h-screen flex bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-600/10 via-purple-700/6 to-blue-500/6 dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-700`}
    >
      {/* Sidebar ডেক্সটপে */}
      <aside
        className={`hidden md:flex flex-col w-72 p-6 gap-6 transition-all duration-500 ${
          darkMode
            ? "bg-gradient-to-b from-black/60 via-neutral-900/50 to-black/40 border border-gray-800 backdrop-blur-md"
            : "bg-white/60 border border-gray-100 backdrop-blur-md"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
            <p className="text-sm opacity-80 mt-1">Manage your account and preferences @{getid}</p>
          </div>

          <button
            aria-label="Toggle theme"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
        </div>

        <nav className="flex-1 overflow-auto custom-scroll">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`group w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg"
                        : darkMode
                        ? "hover:bg-white/5"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <motion.span
                      animate={
                        activeTab === item.id
                          ? { rotate: [0, 6, -6, 0], scale: [1, 1.06, 1.02, 1] }
                          : { rotate: 0, scale: 1 }
                      }
                      transition={{ duration: 0.6 }}
                      className="p-2 rounded-md bg-white/8 group-hover:bg-white/6"
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pt-2 border-t border-gray-200/10">
          <button
            className="w-full p-3 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
            onClick={(e: any) => {
              e.preventDefault();
              handleProfileSubmit(e);
              handleAccountSubmit(e);
              handleNotificationsSubmit(e);
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 16v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.9 7.6l4.2 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className={`p-6 rounded-2xl ${
                darkMode
                  ? "bg-gradient-to-b from-neutral-900/60 to-black/40 border border-gray-800"
                  : "bg-white/70 border border-gray-100"
              } shadow-xl backdrop-blur-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{menuItems.find((m) => m.id === activeTab)?.label}</h2>
                  <p className="text-sm opacity-80 mt-1">{getDescription(activeTab)}</p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                  <button className="p-2 rounded-full bg-white/6 hover:bg-white/10 transition">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" />
                  </button>
                </div>
              </div>

              {/* Dynamic content */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTab === "profile" && (
                  <form onSubmit={handleProfileSubmit} className="col-span-1 md:col-span-2 space-y-6">
                    {/* Full Name Card */}
                    <Card className="p-5 hover:border-indigo-500/30 transition-all duration-300">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        Full name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                          <User className="w-5 h-5 transition-colors duration-300" />
                        </div>
                        <input
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          placeholder={"Your Full Name " + usedataall.name}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/20 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent focus:bg-black/40 transition-all duration-300 placeholder-slate-600 font-medium"
                        />
                      </div>
                    </Card>

                    {/* Input Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Email */}
                      <Card className="p-5 hover:border-indigo-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                            <Mail className="w-5 h-5" />
                          </div>
                          <input
                            value={profileData.email}
                            onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))}
                            placeholder="name@example.com"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/20 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent focus:bg-black/40 transition-all duration-300 placeholder-slate-600 font-medium"
                          />
                        </div>
                      </Card>

                      {/* Phone */}
                      <Card className="p-5 hover:border-indigo-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                          <Phone className="w-3.5 h-3.5 text-indigo-400" />
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                            <Phone className="w-5 h-5" />
                          </div>
                          <input
                            value={profileData.phone}
                            onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                            placeholder="Phone number"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/20 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent focus:bg-black/40 transition-all duration-300 placeholder-slate-600 font-medium"
                          />
                        </div>
                      </Card>

                      {/* Address */}
                      <Card className="p-5 hover:border-indigo-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <input
                            value={profileData.address}
                            onChange={(e) => setProfileData((p) => ({ ...p, address: e.target.value }))}
                            placeholder="Full Address"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/20 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent focus:bg-black/40 transition-all duration-300 placeholder-slate-600 font-medium"
                          />
                        </div>
                      </Card>

                      {/* Date of Birth */}
                      <Card className="p-5 hover:border-indigo-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          Date of Birth
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <input
                            type="date"
                            value={profileData.date_of_bird}
                            onChange={(e) => setProfileData((p) => ({ ...p, date_of_bird: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/20 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent focus:bg-black/40 transition-all duration-300 [color-scheme:dark] font-medium"
                          />
                        </div>
                      </Card>

                      {/* User Password */}
                      <Card className="p-5 hover:border-indigo-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                          <Lock className="w-3.5 h-3.5 text-indigo-400" />
                          User Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                            <Lock className="w-5 h-5" />
                          </div>
                          <input
                            value={profileData.bio}
                            onChange={(e) => setProfileData((p) => ({ ...p, bio: e.target.value }))}
                            placeholder="*******"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/20 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent focus:bg-black/40 transition-all duration-300 placeholder-slate-600 font-medium"
                          />
                        </div>
                      </Card>

                      {/* NID Number */}
                      <Card className="p-5 hover:border-indigo-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                          NID Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <input
                            value={profileData.nid}
                            onChange={(e) => setProfileData((p) => ({ ...p, nid: e.target.value }))}
                            placeholder="132465498"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/20 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-transparent focus:bg-black/40 transition-all duration-300 placeholder-slate-600 font-medium"
                          />
                        </div>
                      </Card>
                    </div>

                    {/* Form Actions / Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="submit"
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                      >
                        {saving.profile ? "Saving..." : "Save Profile"}
                      </button>
                      
                      {savedMsg.profile && (
                        <div className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 shadow-inner">
                          {savedMsg.profile}
                        </div>
                      )}
                    </div>
                  </form>
                )}

                {activeTab === "account" && (
                  <form onSubmit={handleAccountSubmit} className="col-span-1 md:col-span-2 space-y-6">
                    <div className="overflow-hidden py-2">
                      <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                      >
                        Account Details
                      </motion.h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Card className="p-5 hover:border-cyan-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                          <ShieldCheck className="w-4 h-4 text-cyan-400" />
                          Account No
                        </label>
                        <div className="w-full p-3.5 rounded-xl bg-black/30 border border-slate-800 text-cyan-400 font-mono text-base tracking-wider shadow-inner">
                          {profileData.uniqid ? `${profileData.uniqid}-${profileData.id}` : profileData.id}
                        </div>
                      </Card>

                      <Card className="p-5 hover:border-purple-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                          <User className="w-4 h-4 text-purple-400" />
                          Username
                        </label>
                        <div className="w-full p-3.5 rounded-xl bg-black/30 border border-slate-800 text-white font-medium text-base shadow-inner">
                          {profileData.name}
                        </div>
                      </Card>

                      <Card className="p-5 hover:border-pink-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                          <Phone className="w-4 h-4 text-pink-400" />
                          Phone Number
                        </label>
                        <div className="w-full p-3.5 rounded-xl bg-black/30 border border-slate-800 text-white font-medium text-base shadow-inner">
                          {profileData.phone}
                        </div>
                      </Card>

                      <Card className="p-5 hover:border-indigo-500/30 transition-all duration-300">
                        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                          <Mail className="w-4 h-4 text-indigo-400" />
                          Email Address
                        </label>
                        <div className="w-full p-3.5 rounded-xl bg-black/30 border border-slate-800 text-white font-medium text-base shadow-inner overflow-hidden text-ellipsis">
                          {profileData.email}
                        </div>
                      </Card>
                    </div>
                  </form>
                )}

                {activeTab === "security" && (
                  <form onSubmit={handleSecuritySubmit} className="col-span-1 md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5 col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Old Password Box */}
                        <div className="relative md:col-span-1">
                          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pink-400 mb-2.5">
                            <Key className="w-3.5 h-3.5" />
                            Old password
                          </label>
                          <div className="relative group">
                            <input
                              type={showPassword1 ? "text" : "password"}
                              value={securityData.oldpassword}
                              onChange={(e) =>
                                setSecurityData((s) => ({ ...s, oldpassword: e.target.value }))
                              }
                              placeholder="•••••••"
                              className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-pink-500/30 text-white outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 placeholder-slate-600 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword1(!showPassword1)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-pink-400 transition-colors duration-200 cursor-pointer"
                            >
                              {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        {/* New Password Box */}
                        <div className="relative md:col-span-1">
                          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2.5">
                            <Lock className="w-3.5 h-3.5" />
                            New password
                          </label>
                          <div className="relative group">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={securityData.password}
                              onChange={(e) =>
                                setSecurityData((s) => ({ ...s, password: e.target.value }))
                              }
                              placeholder="•••••••"
                              className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/30 text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-600 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors duration-200 cursor-pointer"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password Box */}
                        <div className="relative md:col-span-1">
                          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400 mb-2.5">
                            <Lock className="w-3.5 h-3.5" />
                            Confirm password
                          </label>
                          <div className="relative group">
                            <input
                              type={showConfirm ? "text" : "password"}
                              value={securityData.confirm}
                              onChange={(e) =>
                                setSecurityData((s) => ({ ...s, confirm: e.target.value }))
                              }
                              placeholder="•••••••"
                              className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-purple-500/30 text-white outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-slate-600 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors duration-200 cursor-pointer"
                            >
                              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Two-Factor Authentication Card */}
                    <Card className="p-5 hover:border-indigo-500/40 transition-all duration-300">
                      <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
                        <div className="flex items-start gap-3.5">
                          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 mt-0.5 text-indigo-400">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-slate-100 tracking-wide block">
                              Enable Two-Factor Authentication (2FA)
                            </span>
                            <span className="text-xs text-slate-400 block">
                              Keep your profile hyper-secure against unauthorized access.
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={securityData.twoFA}
                            onChange={(e) => setSecurityData((s) => ({ ...s, twoFA: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-slate-800 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:via-indigo-500 peer-checked:to-purple-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-400 peer-checked:after:bg-white peer-checked:after:translate-x-7 after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                        </div>
                      </label>
                    </Card>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer uppercase tracking-wider"
                      >
                        {saving.security ? "Saving..." : "Save Security"}
                      </button>
                      {savedMsg.security && (
                        <div className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 shadow-md">
                          {savedMsg.security}
                        </div>
                      )}
                    </div>
                  </form>
                )}

                {activeTab === "notifications" && (
                  <form onSubmit={handleNotificationsSubmit} className="col-span-1 md:col-span-2 space-y-5">
                    <Card className="p-5 hover:border-cyan-500/40 transition-all duration-300">
                      <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 mt-0.5 text-cyan-400">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-slate-100 tracking-wide block">
                              Email Notifications
                            </span>
                            <span className="text-xs text-slate-400 block">
                              Receive critical updates, account activity, and alerts directly in your inbox.
                            </span>
                          </div>
                        </div>
                        <div className="relative shrink-0">
                          <input
                            type="checkbox"
                            checked={notificationsData.email}
                            onChange={(e) => setNotificationsData((n) => ({ ...n, email: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-slate-800 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-400 peer-checked:after:bg-white peer-checked:after:translate-x-7 after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                        </div>
                      </label>
                    </Card>

                    <Card className="p-5 hover:border-pink-500/40 transition-all duration-300">
                      <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 mt-0.5 text-pink-400">
                            <Bell className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-slate-100 tracking-wide block">
                              Push Notifications
                            </span>
                            <span className="text-xs text-slate-400 block">
                              Get real-time instant desktop or system notifications for immediate actions.
                            </span>
                          </div>
                        </div>
                        <div className="relative shrink-0">
                          <input
                            type="checkbox"
                            checked={notificationsData.push}
                            onChange={(e) => setNotificationsData((n) => ({ ...n, push: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-slate-800 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-400 peer-checked:after:bg-white peer-checked:after:translate-x-7 after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                        </div>
                      </label>
                    </Card>

                    <Card className="p-5 hover:border-amber-500/40 transition-all duration-300">
                      <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 mt-0.5 text-amber-400">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-slate-100 tracking-wide block">
                              Security & Login Alerts
                            </span>
                            <span className="text-xs text-slate-400 block">
                              Get instantly notified when a new device or suspicious location logs into your account.
                            </span>
                          </div>
                        </div>
                        <div className="relative shrink-0">
                          <input type="checkbox" defaultChecked={true} className="sr-only peer" />
                          <div className="w-14 h-7 bg-slate-800 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-400 peer-checked:after:bg-white peer-checked:after:translate-x-7 after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                        </div>
                      </label>
                    </Card>

                    <Card className="p-5 hover:border-emerald-500/40 transition-all duration-300">
                      <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mt-0.5 text-emerald-400">
                            <BadgePercent className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-sm font-bold text-slate-100 tracking-wide block">
                              Marketing & Promotional Offers
                            </span>
                            <span className="text-xs text-slate-400 block">
                              Stay tuned with our latest event updates, premium rewards, and personalized discount news.
                            </span>
                          </div>
                        </div>
                        <div className="relative shrink-0">
                          <input type="checkbox" defaultChecked={false} className="sr-only peer" />
                          <div className="w-14 h-7 bg-slate-800 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-400 peer-checked:after:bg-white peer-checked:after:translate-x-7 after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                        </div>
                      </label>
                    </Card>

                    <div className="flex items-center gap-4 pt-3">
                      <button
                        type="submit"
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer uppercase tracking-wider"
                      >
                        {saving.notifications ? "Saving..." : "Save Notifications"}
                      </button>
                      {savedMsg.notifications && (
                        <div className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 shadow-md">
                          {savedMsg.notifications}
                        </div>
                      )}
                    </div>
                  </form>
                )}

                {activeTab === "payments" && (
                  <form onSubmit={handlePaymentsSubmit} className="col-span-1 md:col-span-2 space-y-4">
                    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-2xl shadow-xl text-white space-y-6">
                      <h2 className="text-2xl font-bold text-center">💳 Payment Step {step}</h2>
                      {step === 1 && (
                        <div className="space-y-4">
                          {paymentOptions.map(opt => (
                            <div
                              key={opt.id}
                              onClick={() => setSelectedPayment(opt.id)}
                              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition ${
                                selectedPayment === opt.id ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg scale-105" : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                              }`}
                            >
                              <div>{opt.icon}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{opt.name}</h3>
                                <p className="text-xs text-gray-400">{opt.desc}</p>
                              </div>
                              <input type="radio" checked={selectedPayment === opt.id} readOnly className="w-5 h-5 accent-indigo-500" />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={handleNext}
                            className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 py-3 rounded-xl font-semibold transition cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-4">
                          <label className="block font-semibold text-sm">Enter {selectedPayment} Number / Account</label>
                          <input
                            type="text"
                            placeholder="Enter number or account"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:ring-2 focus:ring-indigo-400 transition"
                          />
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={handleBack}
                              className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-xl transition"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirm}
                              className="flex-1 bg-indigo-500 hover:bg-indigo-600 py-2 rounded-xl transition"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                )}

                {["privacy", "appearance", "language", "apps", "help", "logout"].includes(activeTab) && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    <p>{`This section "${activeTab}" is coming soon...`}</p>
                  </div>
                )}
              </section>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Floating Menu Button */}
      <button
        aria-label="Open menu"
        onClick={() => setShowMobileMenu(true)}
        className="md:hidden fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-2xl z-50 transform-gpu hover:scale-105 transition"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile modal menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileMenu(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.15 }}
              className="relative bg-white dark:bg-neutral-900 p-6 rounded-t-2xl border-t border-gray-300 dark:border-gray-700 shadow-lg flex flex-col mt-auto"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Menu</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                    aria-label="Toggle theme"
                  >
                    {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
                  </button>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div 
                      key={item.id} 
                      className={`w-full ${item.disabled ? "cursor-not-allowed" : ""}`}
                    >
                      <motion.button
                        whileTap={item.disabled ? {} : { scale: 0.97 }}
                        disabled={item.disabled}
                        onClick={(e) => {
                          if (item.disabled) {
                            e.preventDefault();
                            return;
                          }
                          setActiveTab(item.id);
                          setShowMobileMenu(false);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition w-full ${
                          item.disabled
                            ? "opacity-40 pointer-events-none select-none bg-gray-500/10" 
                            : activeTab === item.id
                            ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
                            : darkMode
                            ? "bg-white/10 hover:bg-white/20"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className={`p-2 rounded-md ${item.disabled ? 'bg-transparent' : 'bg-white/20'}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs opacity-70">{getDescriptionShort(item.id)}</div>
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
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

function getDescription(id: string): string {
  switch (id) {
    case "account": return "Manage your account information, username and contact details.";
    case "profile": return "Edit your personal information, bio, and email.";
    case "security": return "Change your password and security settings.";
    case "privacy": return "Adjust your privacy settings.";
    case "notifications": return "Manage your notification preferences.";
    case "appearance": return "Customize the look and feel of your app.";
    case "language": return "Select your preferred language.";
    case "payments": return "Manage payment methods and billing information.";
    case "apps": return "Connected third-party applications.";
    case "help": return "Help articles and support.";
    default: return "";
  }
}

function getDescriptionShort(id: string): string {
  switch (id) {
    case "account": return "Account & contact info";
    case "profile": return "Personal info & bio";
    case "security": return "Password & 2FA";
    case "privacy": return "Privacy settings";
    case "notifications": return "Email & push";
    case "appearance": return "Theme & colors";
    case "language": return "Language select";
    case "payments": return "Billing & cards";
    case "apps": return "Third-party apps";
    case "help": return "Support center";
    default: return "";
  }
}

