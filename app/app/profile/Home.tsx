'use client';

import { useState,useEffect } from 'react';
import { User, Gift, RotateCcw, Users, Send, Router } from 'lucide-react';
import { motion } from 'framer-motion';


import CountUp from 'react-countup';
import { redirect, useRouter } from 'next/navigation';




export default function WalletPage() {
const router = useRouter();

const [telegramCount, setTelegramCount] = useState(150);
  const [facebookCount, setFacebookCount] = useState(150);

  // load from localStorage
  useEffect(() => {
    const tg = localStorage.getItem("telegramCount");
    const fb = localStorage.getItem("facebookCount");

    if (tg) setTelegramCount(parseInt(tg));
    if (fb) setFacebookCount(parseInt(fb));
  }, []);


  //   const { name, balance, coin, setUser  } = useUserStore();

  const handleSend = () => {
    
 
redirect('/profile/true');
//redirect('/earning-history');


};


//  const { status, response, sendData } = useApiStore();

//   const handleSend = () => {
//     sendData({
//     type:'success',
    
//     });
//   };

  const [usersname, setUsername] = useState('');

const [coissnss, setCoin] = useState<number>(0);





useEffect(() => {
 
   const userData = JSON.parse(localStorage.getItem('userData') || '[]');
    if (userData[0]) {
      setUsername(userData[0].name || 'set-img');
     
    }

 
setInterval(() => {



 const userData2 = localStorage.getItem("coin");
  if (userData2) {
    setCoin(Number(userData2) || 0.0); // string → number কনভার্ট করা হলো
  }
  

}, 3000);



}, [])


const handleShare = async () => {
  const url = window.location.href;

  const shareData = {
    title: "🛒 My--Shopings | Online Shopping",
    text: `🔥 দারুণ অফার মিস করো না!

👉 নতুন বন্ধদের শেয়ার করে আয় করুন 💰  
🎁 একাউন্ট খুললেই পাচ্ছেন স্পেশাল বোনাস  
🚀 এখনই দেখে নিন:

${url}

#OnlineShopping #EarnMoney #Offer`,
    url: url,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // fallback
      navigator.clipboard.writeText(url);
      alert("Link copied! এখন manually share করুন 😊");
    }
  } catch (err) {
    console.log("Share cancelled", err);
  }
};


// const handleShare = async () => {
//   try {
//     await navigator.share({
//       title: "my-shopings.com",
//       text: " নতুন বন্ধদের শেয়ার করে আয় করুন ",
//       url: window.location.href,
//     });
//   } catch (err) {
//     console.log("Share cancelled");
//   }
// };



const handleAction = (label = "") => {
  switch (label.trim()) {
    case "Hourly Check-in":
      alert("✅ Check-in successful!");
      break;

    case "Spin & Win":
    router.push('/profile/tabs-coine/home');
      break;

    case "Invite & Earn":
      if (typeof window !== "undefined") {
        handleShare();
      }
      break;

    default:
      console.log("No action found");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 to-yellow-200 p-4 pb-24 flex flex-col max-w-md mx-auto">

      {/* Top User Info */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-white font-semibold text-lg drop-shadow-lg">Hi {usersname}</h2>
          <p className="text-white text-sm drop-shadow-md">Welcome Back 👋</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
        <img src="https://i.pravatar.cc/100" />
          
        </div>
      </motion.div>

 
      {/* Balance Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 100 }}
        className="bg-red-700 rounded-3xl p-6 mt-6 text-center text-white shadow-2xl"
      >

        <p className="text-sm font-semibold tracking-wide">Current Balance</p>
        <h1 className="text-4xl font-extrabold mt-1 drop-shadow-md">🪙   <CountUp end={coissnss} duration={2} separator="," /></h1>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255,165,0,0.7)' }}
          whileTap={{ scale: 0.95 }}
     onClick={handleSend}
          className="mt-6 bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-3 rounded-full text-white font-semibold shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
        >
            🛒 My Orders
        </motion.button>
 
       

   {/* {status && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <p>📌 Status: {status}</p>
          <p>📩 Message: {response?.message}</p>
          {response?.data && <pre>{JSON.stringify(response.data, null, 2)}</pre>}
        </div>
      )} */}

      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="grid grid-cols-3 gap-5 mt-8"
      >
        {[
          { icon: Gift, label: 'Hourly Check-in' },
          { icon: RotateCcw, label: 'Spin & Win' },
          { icon: Users, label: 'Invite & Earn' },
        ].map(({ icon: IconComp, label }) => (
          <motion.div
            key={label}
      onClick={() => handleAction(label)}  // 👈 THIS LINE ADD
            whileHover={{ scale: 1.07, boxShadow: '0 0 12px rgba(255,140,0,0.6)' }}
            className="bg-white rounded-xl p-4 flex flex-col items-center shadow-md cursor-pointer select-none"
          >
            <IconComp className="text-orange-500" size={30} />
            <p className="text-sm mt-2 font-medium text-gray-700">{label}</p>
          </motion.div>
        ))}





      </motion.div>

      {/* More Tasks */}
      <h2 className="mt-10 text-gray-800 font-semibold text-lg select-none">More Tasks</h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="grid grid-cols-2 gap-5 mt-4"
      >
        <div className="bg-white rounded-xl p-5 flex flex-col items-center shadow-lg select-none">
          <div className="bg-blue-100 p-3 rounded-full">
            <Send onClick={()=>handleShare()}  className="text-blue-600" size={30} />
          </div>
          <p className="mt-3 font-semibold text-gray-800">youtube</p>
          <p className="text-sm text-gray-500 mt-1">🪙 150</p>
          <button   onClick={()=>handleShare()}  className="mt-4 bg-orange-500 hover:bg-orange-600 transition-colors text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400">
            Join Group
          </button>
        </div>





   <div className="bg-white rounded-xl p-5 flex flex-col items-center shadow-lg select-none">
          <div className="bg-blue-100 p-3 rounded-full">
            <Send onClick={()=>handleShare()}  className="text-blue-600" size={30} />
          </div>
          <p className="mt-3 font-semibold text-gray-800">Facebook </p>
          <p className="text-sm text-gray-500 mt-1">🪙 150</p>
          <button   onClick={()=>handleShare()}  className="mt-4 bg-orange-500 hover:bg-orange-600 transition-colors text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400">
            Join Group
          </button>
        </div>

        
 
      </motion.div>

      {/* Bottom Navbar */}
      {/* <motion.nav
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 120 }}
        className="fixed bottom-0 left-0 w-full bg-white shadow-inner flex justify-around py-3 max-w-md mx-auto"
      >
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveNav(id)}
            className={`flex flex-col items-center text-sm font-semibold select-none focus:outline-none ${
              activeNav === id ? 'text-orange-500' : 'text-gray-400 hover:text-orange-400'
            }`}
          >
            <span className="material-icons">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </motion.nav> */}
    </div>
  );
}

