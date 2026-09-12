
 'use client';

 import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {};

type Order = {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: 'Active' | 'Pending' | 'Completed';
  date: string;
};

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  stock: number;
};

function PremiumDashboard({}: Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'analytics'>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // ফর্ম স্টেট
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // লাইভ প্রোডাক্ট লিস্ট স্টেট (ডিফল্ট কিছু প্রিমিয়াম প্রোডাক্ট সহ)
  const [products, setProducts] = useState<Product[]>([
    { id: 'PROD-01', name: 'Premium Leather Jacket', price: '৪,৫০০', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80', stock: 25 },
    { id: 'PROD-02', name: 'Luxury Smart Watch S9', price: '৩,২০০', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', stock: 12 },
    { id: 'PROD-03', name: 'Wireless Noise Cancelling ANC', price: '৫,৮০০', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', stock: 8 },
  ]);

  // লাইভ অর্ডার লিস্ট স্টেট
  const [orders, setOrders] = useState<Order[]>([
    { id: '#ORD-9921', customer: 'Anik Rahman', product: 'Premium Leather Jacket', amount: '৳৪৫০০', status: 'Active', date: '১১ জুলাই, ২০২৬' },
    { id: '#ORD-9922', customer: 'Sumaiya Akter', product: 'Luxury Smart Watch S9', amount: '৳৩২০০', status: 'Pending', date: '১০ জুলাই, ২০২৬' },
    { id: '#ORD-9923', customer: 'Rakib Hasan', product: 'Wireless Noise Cancelling ANC', amount: '৳৫৮০০', status: 'Completed', date: '০৯ জুলাই, ২০২৬' },
  ]);

  // ইমেজ সিলেক্ট এবং প্রিভিউ হ্যান্ডলার
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file)); // লোকাল প্রিভিউ ইউআরএল তৈরি
    }
  };

  // প্রোডাক্ট আপলোড ও লিস্টে অ্যাড করার হ্যান্ডলার
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productImage) {
      toast.error('❌ দয়া করে একটি প্রোডাক্ট ইমেজ সিলেক্ট করুন!');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('📤 প্রোডাক্টটি গ্লোবাল ডাটাবেজে আপলোড হচ্ছে...');

    // এপিআই বা লোকাল স্টেটে ডাটা পুশ করার সিমুলেশন (২ সেকেন্ড লোডিং ইফেক্ট)
    setTimeout(() => {
      const newProduct: Product = {
        id: `PROD-0${products.length + 1}`,
        name: productName,
        price: Number(productPrice).toLocaleString('bn-BD'), // বাংলা নাম্বারে কনভার্ট
        image: imagePreview || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        stock: 50 // নতুন প্রোডাক্টের ডিফল্ট স্টক ৫০ পিস
      };

      setProducts([newProduct, ...products]);
      
      toast.update(toastId, { 
        render: '🎉 প্রোডাক্টটি সফলভাবে লাইভ মার্কেটে যুক্ত হয়েছে!', 
        type: 'success', 
        isLoading: false, 
        autoClose: 3000 
      });

      // ফর্ম রিসেট
      setProductName('');
      setProductPrice('');
      setProductImage(null);
      setImagePreview(null);
      setIsUploading(false);
    }, 1500);
  };

  // প্রোডাক্ট ডিলিট হ্যান্ডলার
  const handleDeleteProduct = (id: string, name: string) => {
    if(confirm(`আপনি কি নিশ্চিতভাবে "${name}" প্রোডাক্টটি মুছে ফেলতে চান?`)) {
      setProducts(products.filter(p => p.id !== id));
      toast.success('🗑️ প্রোডাক্টটি ডিলিট করা হয়েছে!');
    }
  };

  // অর্ডার ডিলিট বা অ্যাকশন হ্যান্ডলার
  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    toast.error(`❌ অর্ডার ${id} ক্যানসেল করা হয়েছে!`);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <ToastContainer theme="dark" position="top-right" />

      {/* ==================== প্রিমিয়াম সাইডবার ==================== */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white font-black text-xl tracking-wider shadow-md shadow-indigo-600/30">PD</div>
            <span className="text-lg font-black tracking-widest bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PRO CORE</span>
          </div>
          
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'orders', label: 'Orders List', icon: '🛒' },
              { id: 'products', label: 'Products Hub', icon: '📦' },
              { id: 'analytics', label: 'Analytics Pro', icon: '📈' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-600/10' : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'}`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <a href="/" className="text-center py-2.5 px-4 bg-slate-900 border border-slate-800 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-xs font-semibold uppercase tracking-wider">🌐 View Website</a>
      </aside>

      {/* ==================== মেইন স্ক্রিন এরিয়া ==================== */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* টপ গ্লোবাল হেডার */}
        <header className="bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/80 h-20 px-8 flex items-center justify-between sticky top-0 z-50">
          <h1 className="text-xl font-black tracking-wide uppercase hidden sm:block">
            {activeTab === 'dashboard' ? '💎 Live Dashboard' : `✨ ${activeTab}`}
          </h1>
          
          <div className="relative ml-auto">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800/80 p-1.5 pr-4 rounded-full border border-slate-800 transition-all">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Admin" className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500" />
              <span className="font-semibold text-sm hidden md:block">Nusrat Jahan</span>
              <span className="text-xs text-slate-500 hidden md:block">▼</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-2xl">
                <div className="px-4 py-3 border-b border-slate-800 text-sm">
                  <p className="text-slate-400">Role: <span className="text-emerald-400 font-bold">Super Admin</span></p>
                </div>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 hover:bg-slate-900 rounded-lg text-sm">⚙️ Profile Settings</a>
                  <a href="#" className="block px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-sm mt-1">🚪 Logout</a>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ডাইনামিক কন্টেন্ট বডি */}
        <div className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          
          {/* ================= TAB 1: DASHBOARD ================= */}
          {activeTab === 'dashboard' && (
            <>
              {/* স্ট্যাটাস ইনফো কার্ডস */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all">
                  <p className="text-slate-400 font-medium text-sm">Active Orders</p>
                  <h3 className="text-3xl font-black mt-2 text-indigo-400">{orders.filter(o => o.status === 'Active').length + 120} টি</h3>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-amber-500/30 transition-all">
                  <p className="text-slate-400 font-medium text-sm">Pending Counter</p>
                  <h3 className="text-3xl font-black mt-2 text-amber-400">{orders.filter(o => o.status === 'Pending').length} টি</h3>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all">
                  <p className="text-slate-400 font-medium text-sm">Total Unique Items</p>
                  <h3 className="text-3xl font-black mt-2 text-emerald-400">{products.length} টি আইটেম</h3>
                </div>
              </section>

              {/* আপলোড ফর্ম ও রিসেন্ট অর্ডারস */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* প্রোডাক্ট ক্রিয়েটর বাটন */}
                <div className="lg:col-span-1 bg-slate-950 border border-slate-800 p-6 rounded-2xl h-fit">
                  <h2 className="text-lg font-bold mb-6 text-indigo-400 flex items-center gap-2">📤 New Product Release</h2>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product Full Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                    <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Price in BDT (e.g. 1500)" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                    
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer bg-slate-900/40 transition-all relative overflow-hidden h-28">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      ) : (
                        <>
                          <span className="text-xl mb-1">🖼️</span>
                          <span className="text-xs text-slate-400">Upload Product Mockup Image</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    <button type="submit" disabled={isUploading} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm uppercase">
                      {isUploading ? 'Syncing...' : '⚡ Publish to Store'}
                    </button>
                  </form>
                </div>

                {/* রিসেন্ট অর্ডার টেবিল অ্যাকশন বাটন সহ */}
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-2xl overflow-x-auto">
                  <h2 className="text-lg font-bold mb-6 text-indigo-400">📦 Recent Order Flow</h2>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <th className="pb-4">Customer</th>
                        <th className="pb-4">Product Name</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-900/30 transition-all">
                          <td className="py-4 font-medium">{order.customer}</td>
                          <td className="py-4 text-slate-300 truncate max-w-[150px]">{order.product}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.status === 'Active' ? 'bg-indigo-500/10 text-indigo-400' : order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{order.status}</span>
                          </td>
                          <td className="py-4 text-center flex items-center justify-center gap-2">
                            <button onClick={() => alert(`Viewing info for ${order.id}`)} className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-lg border border-slate-800 text-xs">👁️ View</button>
                            <button onClick={() => handleDeleteOrder(order.id)} className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white p-1.5 rounded-lg text-xs transition-all">❌ Cancel</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* ================= TAB 2: ALL PRODUCTS HUB ================= */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-indigo-400">📦 Live Store Inventory ({products.length} Products)</h2>
                <button onClick={() => setActiveTab('dashboard')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">+ Add New Product</button>
              </div>

              {/* আপগ্রেডেড প্রোডাক্ট গ্রিড কার্ডস */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
                    <div className="relative h-48 bg-slate-900 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                      <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-xs font-mono text-indigo-400 px-2 py-1 rounded-md border border-slate-800">{product.id}</span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-base text-slate-100 line-clamp-1 mb-1">{product.name}</h4>
                        <p className="text-sm text-slate-400">Stock Available: <span className="text-emerald-400 font-semibold">{product.stock} pcs</span></p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-lg font-black text-indigo-400">৳{product.price}</span>
                        
                        {/* অ্যাকশন বাটনস */}
                        <div className="flex gap-2">
                          <button onClick={() => alert(`Product Details:\nID: ${product.id}\nName: ${product.name}\nPrice: ৳${product.price}`)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl text-sm transition-all" title="View details">👁️</button>
                          <button onClick={() => handleDeleteProduct(product.id, product.name)} className="bg-rose-500/10 hover:bg-rose-500 p-2 rounded-xl text-rose-400 hover:text-white text-sm transition-all" title="Delete product">🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3 & 4: OTHER TABS ================= */}
          {activeTab === 'orders' && (
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-indigo-400 mb-4">🛒 Database Order Flow Management</h2>
              <p className="text-slate-400 text-sm">সমস্ত কাস্টমার পেমেন্ট ভেরিফিকেশন এবং ইনভয়েস ডাউনলোড প্যানেল এটি।</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-pink-400 mb-4">📈 Core Analytics & Data Logs</h2>
              <p className="text-slate-400 text-sm">সাপ্তাহিক সেলস ভলিউম ট্র্যাকিং গ্রাফ এখানে শো করবে।</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default PremiumDashboard;


// import React, { useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS অবশ্যই লাগবে

// type Props = {};

// type Order = {
//   id: string;
//   customer: string;
//   product: string;
//   amount: string;
//   status: 'Active' | 'Pending' | 'Completed';
//   date: string;
// };

// function Dashboard({}: Props) {
//   const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'analytics'>('dashboard');
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
  
//   // প্রডাক্ট আপলোড স্টেট
//   const [productName, setProductName] = useState('');
//   const [productPrice, setProductPrice] = useState('');
//   const [productImage, setProductImage] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false); // লোডিং স্টেট

//   // ডামি অর্ডার ডেটা
//   const recentOrders: Order[] = [
//     { id: '#ORD-9921', customer: 'Anik Rahman', product: 'Premium T-Shirt', amount: '৳১২০০', status: 'Active', date: '১১ জুলাই, ২০২৬' },
//     { id: '#ORD-9922', customer: 'Sumaiya Akter', product: 'Wireless Headphone', amount: '৳৩৫০০', status: 'Pending', date: '১০ জুলাই, ২০২৬' },
//     { id: '#ORD-9923', customer: 'Rakib Hasan', product: 'Smart Watch Series 9', amount: '৳৪৫০০', status: 'Completed', date: '০৯ জুলাই, ২০২৬' },
//   ];

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setProductImage(e.target.files[0]);
//     }
//   };

//   // ==================== API এবং Toastify হ্যান্ডলার ====================
//   const handleUpload = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!productImage) {
//       toast.error('❌ দয়া করে একটি প্রোডাক্ট ইমেজ সিলেক্ট করুন!');
//       return;
//     }

//     setIsUploading(true);
//     const toastId = toast.loading('📤 প্রোডাক্ট আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');

//     // FormData তৈরি করা (ইমেজ ফাইল পাঠানোর জন্য FormData লাগে)
//     const formData = new FormData();
//     formData.append('name', productName);
//     formData.append('price', productPrice);
//     formData.append('image', productImage);

//     try {
//       // আপনার আসল API URL এখানে বসাবেন (যেমন: /api/products)
//       const response = await fetch('https://api.example.com/v1/products', {
//         method: 'POST',
//         body: formData,
//         // FormData ব্যবহার করলে Content-Type হেডার দেওয়ার প্রয়োজন নেই, ব্রাউজার নিজে থেকেই সেট করে নেয়।
//       });

//       if (response.ok) {
//         // সফল হলে
//         toast.update(toastId, { 
//           render: '🎉 প্রোডাক্টটি সফলভাবে আপলোড এবং পাবলিশ হয়েছে!', 
//           type: 'success', 
//           isLoading: false, 
//           autoClose: 4000 
//         });
        
//         // ফর্ম রিসেট
//         setProductName('');
//         setProductPrice('');
//         setProductImage(null);
//       } else {
//         // সার্ভার ভুল রেসপন্স দিলে
//         throw new Error('Server error');
//       }
//     } catch (error) {
//       // কোনো সমস্যা হলে বা API ফেইল করলে
//       toast.update(toastId, { 
//         render: '💥 দুঃখিত! প্রোডাক্ট আপলোড করা সম্ভব হয়নি। আবার চেষ্টা করুন।', 
//         type: 'error', 
//         isLoading: false, 
//         autoClose: 4000 
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
//       {/* Toastify কন্টেইনার (এটি মেসেজগুলো স্ক্রিনে রেন্ডার করে) */}
//       <ToastContainer theme="dark" position="top-right" />

//       {/* ==================== সাইডবার ==================== */}
//       <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
//         <div>
//           <div className="flex items-center gap-3 mb-8">
//             <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold text-xl">PD</div>
//             <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">PREMIUM DASH</span>
//           </div>
          
//           <nav className="space-y-2">
//             <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>📊 Dashboard</button>
//             <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>🛒 Orders</button>
//             <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>📦 Products</button>
//             <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900'}`}>📈 Analytics</button>
//           </nav>
//         </div>
//         <a href="/" className="text-center py-2 px-4 border border-indigo-500/30 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-sm font-medium">🌐 View Landing Page</a>
//       </aside>

//       {/* ==================== মেইন কন্টেন্ট ==================== */}
//       <main className="flex-1 flex flex-col overflow-y-auto">
        
//         {/* টপ হেডার ও প্রোফাইল */}
//         <header className="bg-slate-950/50 backdrop-blur-md border-b border-slate-800 h-20 px-8 flex items-center justify-between sticky top-0 z-50">
//           <h1 className="text-2xl font-bold hidden sm:block capitalize">{activeTab} Overview</h1>
          
//           <div className="relative ml-auto">
//             <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 p-2 rounded-full border border-slate-800 transition-all">
//               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Admin" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500" />
//               <span className="font-medium pr-2 hidden md:block">Nusrat Jahan</span>
//             </button>

//             {isProfileOpen && (
//               <div className="absolute right-0 mt-3 w-56 bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-2xl">
//                 <div className="px-4 py-3 border-b border-slate-800">
//                   <p className="text-sm text-slate-400">Signed in as</p>
//                   <p className="font-semibold text-indigo-400 truncate">nusrat@premium.com</p>
//                 </div>
//                 <div className="py-2">
//                   <a href="#" className="block px-4 py-2 hover:bg-slate-900 rounded-lg text-sm transition-all">⚙️ Settings</a>
//                   <a href="#" className="block px-4 py-2 hover:bg-slate-900 rounded-lg text-sm transition-all">💳 Billing</a>
//                   <hr className="border-slate-800 my-2" />
//                   <a href="#" className="block px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-sm transition-all">🚪 Sign Out</a>
//                 </div>
//               </div>
//             )}
//           </div>
//         </header>

//         {/* কন্টেন্ট বডি */}
//         <div className="p-8 space-y-8">
//           {activeTab === 'dashboard' && (
//             <>
//               {/* স্ট্যাটাস কার্ডস */}
//               <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-950/40 border border-indigo-500/20 p-6 rounded-2xl">
//                   <p className="text-slate-400 font-medium">Total Active Orders</p>
//                   <h3 className="text-4xl font-black mt-2 text-indigo-400">১২৪ টি</h3>
//                 </div>
//                 <div className="bg-gradient-to-br from-amber-600/20 to-amber-950/40 border border-amber-500/20 p-6 rounded-2xl">
//                   <p className="text-slate-400 font-medium">Pending Orders</p>
//                   <h3 className="text-4xl font-black mt-2 text-amber-400">১৮ টি</h3>
//                 </div>
//                 <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-950/40 border border-emerald-500/20 p-6 rounded-2xl">
//                   <p className="text-slate-400 font-medium">Completed Orders</p>
//                   <h3 className="text-4xl font-black mt-2 text-emerald-400">১,৪২০ টি</h3>
//                 </div>
//               </section>

//               {/* আপলোড ফর্ম ও রিসেন্ট অর্ডার টেবিল */}
//               <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
//                 {/* প্রডাক্ট আপলোড সেকশন */}
//                 <div className="lg:col-span-1 bg-slate-950 border border-slate-800 p-6 rounded-2xl">
//                   <h2 className="text-xl font-bold mb-6 text-indigo-400">📤 Upload New Product</h2>
//                   <form onSubmit={handleUpload} className="space-y-4">
//                     <div>
//                       <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Product Name</label>
//                       <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Leather Jacket" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" required />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Price (BDT)</label>
//                       <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="e.g., 2500" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" required />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Product Image</label>
//                       <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer bg-slate-900/50 transition-all">
//                         <span className="text-2xl mb-1">🖼️</span>
//                         <span className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
//                           {productImage ? productImage.name : 'Choose Image'}
//                         </span>
//                         <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                       </label>
//                     </div>
//                     <button 
//                       type="submit" 
//                       disabled={isUploading} 
//                       className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all text-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
//                     >
//                       {isUploading ? 'Uploading...' : 'Publish Product'}
//                     </button>
//                   </form>
//                 </div>

//                 {/* রিসেন্ট অর্ডার টেবিল */}
//                 <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-2xl overflow-x-auto">
//                   <h2 className="text-xl font-bold mb-6 text-indigo-400">📦 Recent Orders</h2>
//                   <table className="w-full text-left border-collapse">
//                     <thead>
//                       <tr className="border-b border-slate-800 text-slate-400 text-xs">
//                         <th className="pb-4">Order ID</th>
//                         <th className="pb-4">Customer</th>
//                         <th className="pb-4">Product</th>
//                         <th className="pb-4">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-800 text-sm">
//                       {recentOrders.map((order) => (
//                         <tr key={order.id} className="hover:bg-slate-900/40">
//                           <td className="py-4 font-mono text-indigo-400">{order.id}</td>
//                           <td className="py-4 font-medium">{order.customer}</td>
//                           <td className="py-4 text-slate-300">{order.product}</td>
//                           <td className="py-4"><span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs">{order.status}</span></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </section>
//             </>
//           )}

//           {activeTab === 'orders' && <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl"><h2 className="text-xl font-bold text-indigo-400">🛒 Orders Management Page</h2></div>}
//           {activeTab === 'products' && <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl"><h2 className="text-xl font-bold text-indigo-400">📦 All Products List</h2></div>}
//           {activeTab === 'analytics' && <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl"><h2 className="text-xl font-bold text-indigo-400">📈 Sales Reports & Charts</h2></div>}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Dashboard;
