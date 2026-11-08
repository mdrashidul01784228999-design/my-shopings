'use client';

import { useState, ReactNode  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, BarChart2, Settings, Bell,ScanIcon ,User, Lock, CreditCard, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export default function ColorfulBottomNavbar() {
  const [settingsOpen, setSettingsOpen] = useState(false);


  

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-0 left-0 w-full flex justify-center z-50"
      >
        <div className="relative w-[420px] bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 rounded-t-3xl shadow-2xl flex justify-around items-center py-3 px-2">
          
          <NavItem icon={<Home size={22} />} label="Home" gradient="from-pink-500 to-yellow-400" />
          <NavItem icon={<Search size={22} />} label="Explore" gradient="from-green-400 to-blue-500" />

          {/* Center Scanner Button */}
          <motion.div
        
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2"
          >
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-full p-5 shadow-lg border-4 border-white" style={{background:'0 0 12px rgba(255,140,0,0.6)' }}>
              <ScanIcon className="text-white" size={25} />
            </div>
          </motion.div>

          {/* Track */}
          <NavItem icon={<BarChart2 size={22} />} label="Scanner" gradient="from-orange-400 to-red-500" />

          {/* Notification with badge */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="relative"
          >
            <NavItem icon={<Bell size={22} />} label="Alerts" gradient="from-red-500 to-pink-500" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
              5
            </span>
          </motion.div>

          {/* Settings with rotate hover and click */}
          <motion.div 
            whileHover={{ rotate: 90 }} 
            transition={{ duration: 0.4 }}
            onClick={() => 
              redirect('/profile/Settings')}
           
            className="cursor-pointer"
          >
            <NavItem icon={<Settings size={22} />} label="Settings" gradient="from-blue-400 to-purple-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Modal Content */}
          
{/* Modal Content */}
<motion.div
  initial={{ opacity: 0, y: 50, scale: 0.8 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 50, scale: 0.8 }}
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
  className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 rounded-3xl shadow-2xl p-6 w-[340px] z-50 text-white"
>
  <h3 className="text-2xl font-semibold mb-6 tracking-wide">Settings</h3>

  <motion.ul
    initial="hidden"
    animate="visible"
    exit="hidden"
    variants={{
      visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
    }}
    className="flex flex-col gap-4"
  >
    {[
      { label: "Profile", icon: <User size={22} /> },
      { label: "Notifications", icon: <Bell size={22} /> },
      { label: "Privacy", icon: <Lock size={22} /> },
      { label: "Account", icon: <CreditCard size={22} /> },
      { label: "Logout", icon: <LogOut size={22} /> },
    ].map(({ label, icon }, i) => (
      <motion.li
        key={label}
        variants={{
          hidden: { opacity: 0, x: 30, scale: 0.9 },
          visible: { opacity: 1, x: 0, scale: 1 }
        }}
        whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(128, 90, 213, 0.6)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => alert(`Clicked ${label}`)}
        className="flex items-center gap-4 p-4 rounded-xl cursor-pointer bg-gray-800 hover:bg-purple-700 transition-shadow duration-300 select-none"
      >
        <div className="text-purple-400">{icon}</div>
        <span className="text-lg font-semibold tracking-wide">{label}</span>
      </motion.li>
    ))}
  </motion.ul>

  <button
    onClick={() => setSettingsOpen(false)}
    className="mt-8 w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-2xl font-bold transition"
  >
    Close
  </button>
</motion.div>

          </>
        )}
      </AnimatePresence>
    </>
  );
}

type NavItemProps = {
  icon: ReactNode;       // যেকোনো JSX আইকন বা React এলিমেন্ট
  label: string;         // লেবেল টেক্সট
  gradient?: string;     // অপশনাল, যদি না দেন তবে undefined হবে
};

function NavItem({ icon, label, gradient }: NavItemProps) {

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      className={`flex flex-col items-center text-white transition-colors`}
    >
      <motion.div
        whileHover={{ scale: 1.2 }}
        className={`p-2 rounded-full bg-gradient-to-r ${gradient} shadow-md`}
      >
        {icon}
      </motion.div>
      <span className="text-xs mt-1">{label}</span>
    </motion.button>
  );
}

