import React from 'react';

const Page = () => {
    return (
        <div>
            <h3>this a app </h3>
        </div>
    );
}

export default Page;


// import React from 'react';
// import { Wallet, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';

// export default function RCoinLanding() {
//   return (
//     <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
//       {/* Navbar */}
//       <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
//         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//           <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
//             R Coin
//           </div>
//           <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
//             <a href="#" className="hover:text-cyan-400 transition-colors">Home</a>
//             <a href="#" className="hover:text-cyan-400 transition-colors">Technology</a>
//             <a href="#" className="hover:text-cyan-400 transition-colors">Security</a>
//           </div>
//           <button className="bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-cyan-900/20">
//             Connect Wallet
//           </button>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <main className="pt-32 pb-20 px-6">
//         <div className="max-w-7xl mx-auto text-center">
//           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-8">
//             <Zap size={14} /> The Future of Digital Assets
//           </div>
//           <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
//             Next-Gen Security with <br />
//             <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
//               R Coin Network
//             </span>
//           </h1>
//           <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
//             আমাদের উন্নত ব্লকচেইন কোডিং এবং এনক্রিপশন সিস্টেম নিশ্চিত করে যে আপনার কয়েন সম্পূর্ণ সুরক্ষিত এবং নকল করা অসম্ভব।
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all">
//               Buy R Coin <ArrowRight size={20} />
//             </button>
//             <button className="flex items-center justify-center gap-2 bg-slate-900 border border-white/10 px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
//               View Smart Contract
//             </button>
//           </div>
//         </div>

//         {/* Features Section */}
//         <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
//           <FeatureCard 
//             icon={<ShieldCheck className="text-cyan-400" size={32} />}
//             title="Uncopyable Code"
//             desc="স্মার্ট কন্ট্রাক্ট একবার ডেপ্লয় হলে এটি আর কেউ কপি বা পরিবর্তন করতে পারবে না।"
//           />
//           <FeatureCard 
//             icon={<Wallet className="text-blue-400" size={32} />}
//             title="Fast Transactions"
//             desc="সবচেয়ে দ্রুত গতিতে লেনদেন নিশ্চিত করতে আমরা আধুনিক লেয়ার-২ প্রযুক্তি ব্যবহার করি।"
//           />
//           <FeatureCard 
//             icon={<Globe className="text-purple-400" size={32} />}
//             title="Global Access"
//             desc="পৃথিবীর যেকোনো প্রান্ত থেকে যে কেউ আপনার আর কয়েন ব্যবহার করতে পারবে।"
//           />
//         </div>
//       </main>
//     </div>
//   );
// }

// function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
//   return (
//     <div className="p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
//       <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div>
//       <h3 className="text-xl font-bold mb-2">{title}</h3>
//       <p className="text-slate-400 leading-relaxed">{desc}</p>
//     </div>
//   );
// }