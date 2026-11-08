"use client";
import { useState, useRef } from "react";
import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

const PRESET_COLORS = [
  { name: "Transparent", value: "transparent" },
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Soft Grey", value: "#f3f4f6" },
  { name: "Neon Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Hot Pink", value: "#ec4899" },
];

export default function BgRemovalForm() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [bgColor, setBgColor] = useState("transparent");
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [isCropping, setIsCropping] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null); // আসল ফাইলটি ধরে রাখার জন্য

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropperRef = useRef<ReactCropperElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setCroppedImage(result); // শুরুতে ক্রপড ইমেজ হিসেবে বেস৬৪ ডেটা সেট হবে
        setProcessedImage(null);
        setBgColor("transparent");
        setIsCropping(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    // ক্রপ করা ইমেজ থাকলে সেটা নেবে, না থাকলে সরাসরি আসল ফাইল অবজেক্ট ব্যবহার করবে
    const targetImage = croppedImage || rawFile;
    if (!targetImage) return;

    setLoading(true);
    setProgress("এআই ইঞ্জিন লোড হচ্ছে...");

    try {
      // ডেটা সরাসরি প্রসেস করার জন্য publicPath বাদ দিয়ে রান করা নিরাপদ
      const blob = await imglyRemoveBackground(targetImage, {
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          setProgress(`ম্যাজিক চলছে: ${percent}%`);
        }
      });

      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
      setLoading(false);
    } catch (error) {
      console.error("Error removing background:", error);
      setProgress("দুঃখিত, কোনো ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (croppedCanvas) {
        setCroppedImage(croppedCanvas.toDataURL()); // বেস৬৪ ফরম্যাটে ক্রপড ইমেজ সেভ হবে
        setIsCropping(false);
      }
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    if (bgColor === "transparent") {
      const link = document.createElement("a");
      link.href = processedImage;
      link.download = "bg-removed-transparent.png";
      link.click();
      return;
    }

    const img = new Image();
    img.src = processedImage;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `bg-removed-${bgColor}.png`;
      link.click();
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-12">
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-slate-900/60 backdrop-blur-2xl p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        
        {/* ড্রপজোন / আপলোড এরিয়া */}
        {!image && !isCropping && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl p-6 md:p-12 bg-slate-950/40 transition-all duration-300 relative group overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
              disabled={loading}
            />
            <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-300 text-center text-sm md:text-base font-medium max-w-xs md:max-w-none">
              আপনার ছবি ড্র্যাগ করে এখানে ছাড়ুন অথবা <span className="text-blue-400 group-hover:underline">ব্রাউজ করুন</span>
            </p>
            <span className="text-xs text-slate-500 mt-2">Supports PNG, JPG, WEBP up to 10MB</span>
          </div>
        )}

        {/* প্রিভিউ ও রেজাল্ট গ্রিড */}
        {image && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* বাম পাশ: আসল ছবি / ক্রপ এরিয়া */}
            <div className="flex flex-col bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">আসল ফটো</span>
                {image && !processedImage && !isCropping && (
                  <button 
                    type="button"
                    onClick={() => setIsCropping(true)}
                    className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 transition-colors"
                  >
                    ✂️ ক্রপ করুন
                  </button>
                )}
              </div>
              
              <div className="flex-1 flex items-center justify-center min-h-[250px] md:min-h-[350px] bg-slate-950/80 rounded-xl overflow-hidden">
                {isCropping ? (
                  <div className="w-full flex flex-col items-center p-2 gap-4">
                    <Cropper
                      src={image}
                      style={{ height: 300, width: "100%" }}
                      initialAspectRatio={NaN}
                      guides={true}
                      ref={cropperRef}
                    />
                    <div className="flex gap-2 w-full justify-end">
                      <button 
                        type="button"
                        onClick={() => setIsCropping(false)}
                        className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700"
                      >
                        বাতিল
                      </button>
                      <button 
                        type="button"
                        onClick={handleCrop}
                        className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
                      >
                        টিক দিন
                      </button>
                    </div>
                  </div>
                ) : (
                  <img src={croppedImage || image} alt="Original" className="max-h-[300px] md:max-h-[380px] w-full object-contain p-2 rounded-xl" />
                )}
              </div>
            </div>
            
            {/* ডান পাশ: ব্যাকগ্রাউন্ড রিমুভড ফটো */}
            <div className="flex flex-col bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 justify-center min-h-[300px] md:min-h-[350px] relative overflow-hidden">
              {processedImage && (
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
                  ম্যাজিক আউটপুট
                </span>
              )}
              
              <div className="flex-1 flex items-center justify-center bg-slate-950/80 rounded-xl overflow-hidden relative">
                {processedImage ? (
                  <div 
                    style={{ backgroundColor: bgColor }}
                    className={`w-full h-full flex items-center justify-center p-4 transition-all duration-300 ${
                      bgColor === "transparent" 
                        ? "bg-[linear-gradient(45deg,#161d2a_25%,transparent_25%),linear-gradient(-45deg,#161d2a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#161d2a_75%),linear-gradient(-45deg,transparent_75%,#161d2a_75%)] bg-[size:16px_16px]" 
                        : ""
                    }`}
                  >
                    <img src={processedImage} alt="Processed" className="max-h-[280px] md:max-h-[360px] object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all" />
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin" />
                        <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">{progress}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 font-light max-w-[200px] md:max-w-none">
                        ছবি প্রসেস করার পর এখানে ম্যাজিক প্রিভিউ দেখতে পাবেন।
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 🎨 কালার প্যালেট অপশন */}
        {processedImage && (
          <div className="mt-6 p-4 md:p-6 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
            <h3 className="text-xs md:text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              🎨 ব্যাকগ্রাউন্ড কালার সেট করুন:
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-1 sm:pb-0">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setBgColor(color.value)}
                    style={{ backgroundColor: color.value !== "transparent" ? color.value : undefined }}
                    className={`px-3 py-1.5 md:px-4 md:py-2 text-xs font-medium rounded-xl border whitespace-nowrap transition-all ${
                      bgColor === color.value
                        ? "border-blue-500 text-blue-400 ring-4 ring-blue-500/10 scale-105 font-bold"
                        : "border-slate-800 text-slate-400 hover:border-slate-700"
                    } ${color.value === "transparent" ? "bg-slate-900 border-dashed" : ""} ${
                      color.value === "#ffffff" ? "text-slate-900" : ""
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start border border-slate-800 p-2 rounded-xl bg-slate-900/50">
                <span className="text-xs text-slate-400">Custom Color:</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setBgColor(e.target.value);
                  }}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* বটম অ্যাকশন বাটন গ্রুপ */}
        {image && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end border-t border-slate-800/60 pt-4">
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setProcessedImage(null);
                setCroppedImage(null);
                setRawFile(null);
                setIsCropping(false);
              }}
              className="w-full sm:w-auto px-5 py-2.5 text-xs md:text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 rounded-xl transition-all"
            >
              রিসেট করুন
            </button>
            
            {image && !processedImage && (
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={loading || isCropping}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg disabled:opacity-40 transition-all duration-300"
              >
                🪄 ব্যাকগ্রাউন্ড রিমুভ করুন
              </button>
            )}

            {processedImage && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs md:text-sm font-extrabold rounded-xl shadow-md hover:brightness-110 transition-all duration-300"
              >
                📥 এইচডি ডাউনলোড করুন
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}




// "use client";
// import { useState, useRef } from "react";
// import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

// // প্রি-সেট কিছু পপুলার ব্যাকগ্রাউন্ড কালার অপশন
// const PRESET_COLORS = [
//   { name: "Transparent", value: "transparent" },
//   { name: "White", value: "#ffffff" },
//   { name: "Black", value: "#000000" },
//   { name: "Soft Grey", value: "#f3f4f6" },
//   { name: "Neon Blue", value: "#3b82f6" },
//   { name: "Emerald", value: "#10b981" },
//   { name: "Hot Pink", value: "#ec4899" },
// ];

// export default function BgRemovalForm() {
//   const [image, setImage] = useState<string | null>(null);
//   const [processedImage, setProcessedImage] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState("");
//   const [bgColor, setBgColor] = useState("transparent"); // ব্যাকগ্রাউন্ড কালার স্টেট
//   const [customColor, setCustomColor] = useState("#3b82f6");

//   // ডাউনলোড প্রসেসের জন্য ক্যানভাস রেফারেন্স
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImage(URL.createObjectURL(file));
//       setProcessedImage(null);
//       setBgColor("transparent"); // নতুন ছবি আপলোড হলে রিসেট হবে
//     }
//   };

//   const handleRemoveBackground = async () => {
//     if (!image) return;
//     setLoading(true);
//     setProgress("এআই ইঞ্জিন লোড হচ্ছে...");

//     try {
//       const blob = await imglyRemoveBackground(image, {
//         progress: (key, current, total) => {
//           const percent = Math.round((current / total) * 100);
//           setProgress(`ম্যাজিক চলছে: ${percent}%`);
//         }
//       });

//       const url = URL.createObjectURL(blob);
//       setProcessedImage(url);
//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       setProgress("দুঃখিত, কোনো ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
//       setLoading(false);
//     }
//   };

//   // কালারসহ ইমেজ ডাউনলোড করার জন্য কাস্টম ফাংশন
//   const handleDownload = () => {
//     if (!processedImage) return;

//     // যদি ট্রান্সপারেন্ট হয়, ডিরেক্ট এংকর ট্যাগ দিয়ে ডাউনলোড হবে
//     if (bgColor === "transparent") {
//       const link = document.createElement("a");
//       link.href = processedImage;
//       link.download = "bg-removed-transparent.png";
//       link.click();
//       return;
//     }

//     // যদি কালার সিলেক্ট করা থাকে, ক্যানভাস দিয়ে ব্যাকগ্রাউন্ড কালার জোড়া দিয়ে ডাউনলোড হবে
//     const img = new Image();
//     img.src = processedImage;
//     img.onload = () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;
//       const ctx = canvas.getContext("2d");
//       if (!ctx) return;

//       canvas.width = img.naturalWidth;
//       canvas.height = img.naturalHeight;

//       // ১. ব্যাকগ্রাউন্ড কালার ফিল করুন
//       ctx.fillStyle = bgColor;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // ২. তার ওপর পিএনজি ছবিটা বসান
//       ctx.drawImage(img, 0, 0);

//       // ৩. ট্র্রিগার ডাউনলোড
//       const link = document.createElement("a");
//       link.href = canvas.toDataURL("image/png");
//       link.download = `bg-removed-${bgColor}.png`;
//       link.click();
//     };
//   };

//   return (
//     <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-800/80 mx-auto">
      
//       {/* হিডেন ক্যানভাস (ডাউনলোডের জন্য প্রয়োজনীয়) */}
//       <canvas ref={canvasRef} className="hidden" />

//       {/* প্রিমিয়াম ড্রপজোন ইনপুট */}
//       <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-2xl p-10 bg-slate-950/40 transition-all duration-300 relative group overflow-hidden">
//         <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageUpload}
//           className="absolute inset-0 opacity-0 cursor-pointer z-20"
//           disabled={loading}
//         />
//         <svg className="w-12 h-12 text-slate-500 group-hover:text-blue-400 mb-4 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
//         </svg>
//         <p className="text-slate-300 text-center font-medium">
//           আপনার ছবি ড্র্যাগ করে এখানে ছাড়ুন অথবা <span className="text-blue-400 group-hover:underline">ব্রাউজ করুন</span>
//         </p>
//         <span className="text-xs text-slate-500 mt-2">Supports PNG, JPG, WEBP up to 10MB</span>
//       </div>

//       {/* প্রিভিউ ও রেজাল্ট গ্রিড লেআউট */}
//       {image && (
//         <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* আসল ফটো */}
//           <div className="flex flex-col items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800/40">
//             <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">আসল ফটো</span>
//             <img src={image} alt="Original" className="max-h-64 rounded-xl object-contain" />
//           </div>
          
//           {/* ব্যাকগ্রাউন্ড মুক্ত ফটো ও কালার ইফেক্ট */}
//           <div className="flex flex-col items-center justify-center min-h-[18rem] bg-[#05070c] rounded-2xl p-4 border border-slate-800/60 relative overflow-hidden">
//             {processedImage ? (
//               <>
//                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 absolute top-4 z-20 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
//                   লাইভ প্রিভিউ
//                 </span>
                
//                 {/* ডাইনামিক ব্যাকগ্রাউন্ড কন্টেইনার */}
//                 <div 
//                   style={{ backgroundColor: bgColor }}
//                   className={`w-full h-full flex items-center justify-center rounded-xl p-2 transition-colors duration-300 ${
//                     bgColor === "transparent" 
//                       ? "bg-[linear-gradient(45deg,#161d2a_25%,transparent_25%),linear-gradient(-45deg,#161d2a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#161d2a_75%),linear-gradient(-45deg,transparent_75%,#161d2a_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]" 
//                       : ""
//                   }`}
//                 >
//                   <img src={processedImage} alt="Processed" className="max-h-60 object-contain z-10 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />
//                 </div>
//               </>
//             ) : (
//               <div className="flex flex-col items-center p-6 text-center">
//                 {loading ? (
//                   <div className="flex flex-col items-center space-y-4">
//                     <div className="w-10 h-10 border-4 border-t-teal-400 border-slate-800 rounded-full animate-spin" />
//                     <span className="text-sm font-medium text-teal-400 animate-pulse">{progress}</span>
//                   </div>
//                 ) : (
//                   <p className="text-sm text-slate-500 font-light">
//                     ম্যাজিক দেখতে নিচের বাটনে ক্লিক করুন।
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* 🎨 কালার সেট করার অপশন (শুধুমাত্র ব্যাকগ্রাউন্ড রিমুভ হওয়ার পর দেখাবে) */}
//       {processedImage && (
//         <div className="mt-8 p-6 bg-slate-950/50 border border-slate-800/60 rounded-2xl">
//           <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
//             🎨 ব্যাকগ্রাউন্ড কালার পরিবর্তন করুন:
//           </h3>
//           <div className="flex flex-wrap gap-3 items-center">
//             {PRESET_COLORS.map((color) => (
//               <button
//                 key={color.name}
//                 onClick={() => setBgColor(color.value)}
//                 style={{ backgroundColor: color.value !== "transparent" ? color.value : undefined }}
//                 className={`px-4 py-2 text-xs font-medium rounded-xl border transition-all ${
//                   bgColor === color.value
//                     ? "border-blue-400 text-blue-400 ring-2 ring-blue-500/20 scale-105 font-bold"
//                     : "border-slate-800 text-slate-400 hover:border-slate-700"
//                 } ${color.value === "transparent" ? "bg-slate-900 border-dashed" : ""} ${
//                   color.value === "#ffffff" ? "text-slate-900" : ""
//                 }`}
//               >
//                 {color.name}
//               </button>
//             ))}

//             {/* কাস্টম কালার পিকার (ইউজার নিজের ইচ্ছেমতো কালার দিতে পারবে) */}
//             <div className="flex items-center gap-2 ml-auto border border-slate-800 p-1.5 rounded-xl bg-slate-900/50">
//               <span className="text-xs text-slate-400 pl-1.5">Custom:</span>
//               <input
//                 type="color"
//                 value={customColor}
//                 onChange={(e) => {
//                   setCustomColor(e.target.value);
//                   setBgColor(e.target.value);
//                 }}
//                 className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* অ্যাকশন বাটন সমূহ */}
//       <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
//         {image && !processedImage && (
//           <button
//             onClick={handleRemoveBackground}
//             disabled={loading}
//             className="px-8 py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(20,184,166,0.4)] hover:brightness-110 disabled:opacity-40 transition-all duration-300"
//           >
//             {loading ? "এআই প্রসেস করছে..." : "🪄 ব্যাকগ্রাউন্ড রিমুভ করুন"}
//           </button>
//         )}

//         {processedImage && (
//           <button
//             onClick={handleDownload}
//             className="px-8 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-extrabold rounded-xl shadow-[0_4px_20px_rgba(20,184,166,0.2)] text-center transition-all duration-300"
//           >
//             📥 এইচডি ডাউনলোড করুন (PNG)
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

