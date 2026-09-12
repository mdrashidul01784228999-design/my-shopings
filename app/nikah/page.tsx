import React from 'react'


import { Heart, Users, Search, Bell, Menu, MessageCircle } from 'lucide-react';

const MatrimonyApp = () => {
  const profiles = [
    { id: 1, name: "রাশেদুল ইসলাম", age: 28, profession: "সফটওয়্যার ইঞ্জিনিয়ার", location: "ঢাকা", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400" },
    { id: 2, name: "আয়েশা সিদ্দিকা", age: 24, profession: "ডাক্তার", location: "সিলেট", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" },
    { id: 3, name: "তানভীর আহমেদ", age: 30, profession: "ব্যবসায়ী", location: "চট্টগ্রাম", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" },
    { id: 4, name: "নাসরিন সুলতানা", age: 22, profession: "শিক্ষার্থী", location: "রাজশাহী", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 font-sans">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500 p-2 rounded-lg">
              <Heart className="text-white fill-current" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              বন্ধন
            </h1>
          </div>
          <div className="hidden md:flex gap-8 font-medium text-gray-600">
            <a href="#" className="hover:text-rose-500 transition">হোম</a>
            <a href="#" className="hover:text-rose-500 transition">প্রোফাইল খুঁজুন</a>
            <a href="#" className="hover:text-rose-500 transition">প্যাকেজ</a>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-500 cursor-pointer" />
            <button className="bg-rose-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-rose-600 transition shadow-lg shadow-rose-200">
              লগইন
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-4 py-12 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4 leading-tight">
          আপনার <span className="text-rose-500">জীবনসঙ্গিনী</span> খুঁজে নিন সহজেই
        </h2>
        <p className="text-gray-600 text-lg mb-8">হাজারো ভেরিফাইড প্রোফাইল থেকে বেছে নিন আপনার পছন্দের মানুষকে।</p>
        
        {/* Quick Search Card */}
        <div className="bg-white p-4 rounded-3xl shadow-2xl flex flex-wrap gap-4 items-center justify-center border border-rose-50">
          <select className="bg-rose-50 p-3 rounded-xl outline-none border-none text-gray-700 min-w-[150px]">
            <option>আমি খুঁজছি</option>
            <option>পাত্র</option>
            <option>পাত্রী</option>
          </select>
          <select className="bg-rose-50 p-3 rounded-xl outline-none border-none text-gray-700 min-w-[150px]">
            <option>বয়স</option>
            <option>১৮ - ২৫</option>
            <option>২৬ - ৩৫</option>
          </select>
          <button className="bg-purple-600 text-white p-3 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition w-full md:w-auto justify-center">
            <Search size={20} /> প্রোফাইল খুঁজুন
          </button>
        </div>
      </header>

      {/* Profile Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-rose-500" /> নতুন প্রোফাইল সমূহ
          </h3>
          <button className="text-rose-500 font-semibold text-sm">সব দেখুন</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((user) => (
            <div key={user.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:scale-105 transition-transform duration-300 border border-rose-50">
              <div className="relative h-64">
                <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-2 rounded-full">
                  <Heart className="text-white" size={20} />
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-800">{user.name}</h4>
                <p className="text-rose-500 text-sm font-medium mb-3">{user.profession}</p>
                <div className="flex justify-between text-gray-500 text-sm border-t pt-4">
                  <span>বয়স: {user.age}</span>
                  <span>{user.location}</span>
                </div>
                <button className="w-full mt-4 bg-rose-50 text-rose-600 font-bold py-3 rounded-2xl hover:bg-rose-500 hover:text-white transition-colors">
                  বায়োডাটা দেখুন
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-lg border border-rose-100 shadow-2xl px-8 py-4 rounded-full flex gap-10 items-center">
        <Heart className="text-rose-500 fill-current" size={24} />
        <Search className="text-gray-400" size={24} />
        <MessageCircle className="text-gray-400" size={24} />
        <Menu className="text-gray-400" size={24} />
      </div>

    </div>
  );
};

export default MatrimonyApp;

