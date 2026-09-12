import React from 'react';
import { Home, Flame,  Users, Wallet, UserCircle } from 'lucide-react';

const PKOKLayout = () => {
  return (
    <div className="min-h-screen bg-pkok-green text-white font-sans pb-20">
      
      {/* Header / Top Bar */}
      <div className="p-4 flex justify-between items-center bg-[#002d15]">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1 rounded font-bold text-xs">PKOK</div>
          <span className="text-pkok-yellow text-xl font-black">PKOK ✌️</span>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-400 text-black px-4 py-1 rounded text-sm font-bold">লগইন</button>
          <button className="bg-yellow-200 text-black px-4 py-1 rounded text-sm font-bold">নিবন্ধন</button>
        </div>
      </div>

      {/* Hero Banner Area */}
      <div className="mx-4 mt-2 rounded-xl overflow-hidden bg-gradient-to-r from-green-800 to-green-600 p-4 relative border border-green-400">
        <div className="z-10 relative">
          <h2 className="text-xl font-bold">স্লট গেম</h2>
          <p className="text-yellow-400 text-2xl font-black italic">৩০% পর্যন্ত বোনাস</p>
          <div className="flex gap-1 mt-2">
            <div className="bg-white px-2 py-1 rounded text-[10px] text-black">bKash</div>
            <div className="bg-white px-2 py-1 rounded text-[10px] text-black">Nagad</div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-50 text-6xl">🎰</div>
      </div>

      {/* Category Icons */}
      <div className="grid grid-cols-4 gap-2 p-4">
        {[
          { name: 'হোম', icon: <Home className="text-blue-400" />, active: true },
          { name: 'গরম', icon: <Flame className="text-orange-500" /> },
          { name: 'স্লট', icon: <span className="font-bold text-yellow-500">777</span> },
          { name: 'ফিশিং', icon: <span className="text-lg">🐟</span> },
        ].map((item, index) => (
          <div key={index} className={`flex flex-col items-center p-2 rounded-lg ${item.active ? 'bg-green-700' : 'bg-[#004d26]'}`}>
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Game Grid */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-orange-500" />
          <h3 className="font-bold">গরম খেলা</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {['Super Ace', 'Aviator', 'Fortune'].map((game, i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg border-2 border-green-500 overflow-hidden flex items-center justify-center relative">
               <div className="text-[10px] absolute top-0 left-0 bg-red-600 px-1">JILI</div>
               <span className="text-xs font-bold text-center">{game}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-[#002d15] border-t border-green-800 flex justify-around p-3 z-50">
        <div className="flex flex-col items-center text-yellow-500">
          <Home size={20} />
          <span className="text-[10px]">হোম</span>
        </div>
        <div className="flex flex-col items-center">
          <Flame size={20} />
          <span className="text-[10px]">প্রমোশন</span>
        </div>
        <div className="relative -mt-8 bg-yellow-500 p-3 rounded-full border-4 border-pkok-green shadow-lg">
          <Users size={24} className="text-black" />
        </div>
        <div className="flex flex-col items-center">
          <Wallet size={20} />
          <span className="text-[10px]">ডিপোজিট</span>
        </div>
        <div className="flex flex-col items-center">
          <UserCircle size={20} />
          <span className="text-[10px]">একাউন্ট</span>
        </div>
      </div>
    </div>
  );
};

export default PKOKLayout;