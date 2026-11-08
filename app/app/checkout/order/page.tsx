



"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaMoneyCheckAlt, FaHashtag } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";
import Fromss from "./text";
import Api from "../../api/Api";

export default function OrderSteps() {
  const [step, setStep] = useState(1);
  const [getid, setUserid] = useState<string | null>(null);
  const [allname, setDatas] = useState<any>({});
  const [cardvalue, setAllCartdata] = useState<any[]>([]);
  const [state, setState] = useState({
    name: "",
    phone: "",
    address: "",
    orderid: "",
  });

  

  useEffect(() => {
    // Cart data
    const proDucts = JSON.parse(localStorage.getItem("cart-storage") || "{}");
    if (proDucts?.state?.items) {
      setAllCartdata(proDucts.state.items);
    }

    // User data
    const userData = JSON.parse(localStorage.getItem("userData") || "[]");
    if (userData[0]) {
      setUserid(userData[0].id || null);
    }
  }, []);

  useEffect(() => {
    if (getid) {
      Api.get(`/wallate_get/${getid}`)
        .then((response) => {
          console.log("Wallet data:", response.data);
        })
        .catch((error) => {
          console.error("Error fetching wallet:", error);
        });

      Api.get(`/all_users_id/${getid}`)
        .then((response) => {




          setDatas(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
        });
    }
  }, [getid]);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const steps = [
    {
      title: "অর্ডার ঠিকানা",
      content: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="আপনার নাম "
            value={allname.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
          />
          <input
            type="text"
            placeholder="আপনার মোবাইল নং"
            value={allname.phone}
            onChange={(e) => setState({ ...state, phone: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
          />
          <input
            type="text"
            placeholder="আপনার ঠিকানা"
            value={allname.address}
            onChange={(e) => setState({ ...state, address: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
          />
        </div>
      ),
    },
    {
      title: "পেমেন্ট অপশন",
      content: (
        <div className="space-y-4">
          {/* Select with icon */}
          <div className="relative">
            <FaMoneyCheckAlt className="absolute top-1/2 left-4 -translate-y-1/2 text-purple-400 text-lg pointer-events-none" />
            <select className="w-full pl-11 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 appearance-none">
              <option className="text-black">বিকাশ</option>
              <option className="text-black">নগদ</option>
              <option className="text-black">রকেট</option>
              <option className="text-black">কার্ড</option>
              <option value="cod" className="text-black">
                ক্যাশ অন ডেলিভারি
              </option>
            </select>
          </div>

          {/* Input with icon */}
          <div className="relative">
            <FaHashtag className="absolute top-1/2 left-4 -translate-y-1/2 text-purple-400 text-lg pointer-events-none" />
            <input
              type="text"
              placeholder="লেনদেন নম্বর (যদি প্রযোজ্য হয়)"
              className="w-full pl-11 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
            />
          </div>
        </div>
      ),
    },
    {
      title: "অর্ডার কনফার্ম",
      content: (
        <div className="text-center space-y-2">
          <Fromss />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white p-4 flex flex-col items-center justify-center space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-10 space-y-6 border border-gray-700"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            <TypeAnimation
              sequence={[
                "অর্ডার ধাপ সম্পন্ন করুন",
                1500,
                "পেমেন্ট করুন",
                1500,
                "অর্ডার নিশ্চিত করুন",
                1500,
              ]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
              speed={60}
              deletionSpeed={40}
            />
          </h1>
          <p className="text-gray-400 text-sm mt-1">ধাপে ধাপে অর্ডার করুন</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 mx-1 rounded-full ${
                step >= s
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-purple-400 mb-3">
              {steps[step - 1].title}
            </h2>
            {steps[step - 1].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
            >
              পূর্বের ধাপ
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-2 rounded-md hover:scale-105 flex items-center gap-2 transition-all duration-300"
            >
              পরবর্তী <FaArrowRight />
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}






// 'use client'

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Typewriter } from 'react-simple-typewriter';

// export default function OrderSteps() {
//   const [step, setStep] = useState(1);
//   const [address, setAddress] = useState('');
//   const [payment, setPayment] = useState('');

//   const nextStep = () => setStep((prev) => prev + 1);
//   const prevStep = () => setStep((prev) => prev - 1);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex flex-col items-center justify-center space-y-8">
//       <motion.h2
//         className="text-3xl md:text-4xl font-bold text-center"
//         initial={{ opacity: 0, y: -30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         <Typewriter
//           words={["অর্ডার ঠিকানা", "পেমেন্ট অপশন", "অর্ডার কনফার্ম"]}
//           loop={0}
//           cursor
//           cursorStyle="|"
//           typeSpeed={70}
//           deleteSpeed={50}
//           delaySpeed={1000}
//         />
//       </motion.h2>

//       <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6">
//         {step === 1 && (
//           <motion.div
//             key="address"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <label className="block mb-2 font-semibold">ঠিকানা দিন</label>
//             <input
//               type="text"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//               className="w-full p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//               placeholder="আপনার ঠিকানা লিখুন"
//             />
//           </motion.div>
//         )}

//         {step === 2 && (
//           <motion.div
//             key="payment"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <label className="block mb-2 font-semibold">পেমেন্ট পদ্ধতি</label>
//             <select
//               value={payment}
//               onChange={(e) => setPayment(e.target.value)}
//               className="w-full p-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">-- বেছে নিন --</option>
//               <option value="bkash">Bkash</option>
//               <option value="nogod">Nogod</option>
//               <option value="rocket">Rocket</option>
//             </select>
//           </motion.div>
//         )}

//         {step === 3 && (
//           <motion.div
//             key="confirm"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <h3 className="text-xl font-semibold mb-4">আপনার অর্ডার যাচাই করুন</h3>
//             <p><strong>ঠিকানা:</strong> {address}</p>
//             <p><strong>পেমেন্ট:</strong> {payment}</p>
//           </motion.div>
//         )}

//         <div className="flex justify-between mt-6">
//           {step > 1 && (
//             <button
//               onClick={prevStep}
//               className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
//             >
//               পিছনে
//             </button>
//           )}

//           {step < 3 ? (
//             <button
//               onClick={nextStep}
//               className="ml-auto px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 transition"
//             >
//               পরবর্তী
//             </button>
//           ) : (
//             <button
//               onClick={() => alert("✅ অর্ডার সম্পন্ন হয়েছে!")}
//               className="ml-auto px-5 py-2 rounded-lg bg-green-700 hover:bg-green-600 transition"
//             >
//               কনফার্ম
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




// 'use client';

// import { useState } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';

// export default function CheckoutPage() {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     address: '',
//     payment: '',
//   });

//   const next = () => setStep((prev) => prev + 1);
//   const prev = () => setStep((prev) => prev - 1);

//   const handleConfirm = () => {
//     alert('✅ অর্ডার সফলভাবে সম্পন্ন হয়েছে!');
//     console.log(formData);
//   };

//   return (
//    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 flex flex-col items-center justify-center space-y-8">
//       <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 md:p-10 space-y-6">
//         <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">🛍️ অর্ডার সম্পন্ন করুন</h1>

//         {/* Step Indicator */}
//         <div className="flex justify-between items-center text-xs md:text-sm font-medium">
//           {['ঠিকানা', 'পেমেন্ট', 'নিশ্চিতকরণ'].map((label, i) => (
//             <div
//               key={i}
//               className={`flex-1 text-center py-2 rounded-xl mx-1 transition-all duration-300
//                 ${step === i + 1 ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-200 text-gray-600'}`}
//             >
//               {label}
//             </div>
//           ))}
//         </div>

//         {/* Step Content */}
//         <AnimatePresence mode="wait">
//           {step === 1 && (
//             <motion.div
//               key="step1"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//               className="space-y-4"
//             >
//               <label className="text-sm font-medium text-gray-700">📍 আপনার ঠিকানা</label>
//               <textarea
//                 rows={3}
//                 placeholder="উদাহরণ: বাড়ি #১২, রোড #৪, ধানমন্ডি, ঢাকা"
//                 value={formData.address}
//                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                 className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
//               />
//               <button
//                 onClick={next}
//                 disabled={!formData.address}
//                 className="w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition disabled:opacity-50"
//               >
//                 পরবর্তী ধাপ
//               </button>
//             </motion.div>
//           )}

//           {step === 2 && (
//             <motion.div
//               key="step2"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//               className="space-y-4"
//             >
//               <label className="text-sm font-medium text-gray-700">💳 পেমেন্ট পদ্ধতি</label>
//               <select
//                 value={formData.payment}
//                 onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
//                 className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
//               >
//                 <option value="">-- পেমেন্ট নির্বাচন করুন --</option>
//                 <option value="bkash">বিকাশ</option>
//                 <option value="nagad">নগদ</option>
//                 <option value="cod">ক্যাশ অন ডেলিভারি</option>
//               </select>
//               <div className="flex justify-between gap-4">
//                 <button
//                   onClick={prev}
//                   className="w-1/2 py-3 rounded-xl bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition"
//                 >
//                   আগের ধাপ
//                 </button>
//                 <button
//                   onClick={next}
//                   disabled={!formData.payment}
//                   className="w-1/2 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition disabled:opacity-50"
//                 >
//                   পরবর্তী ধাপ
//                 </button>
//               </div>
//             </motion.div>
//           )}

//           {step === 3 && (
//             <motion.div
//               key="step3"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//               className="space-y-4"
//             >
//               <h2 className="text-lg font-bold text-gray-800">✅ অর্ডার যাচাই</h2>
//               <div className="bg-gray-100 rounded-xl p-4 text-sm text-gray-700 space-y-2">
//                 <p><strong>📍 ঠিকানা:</strong> {formData.address}</p>
//                 <p><strong>💳 পেমেন্ট:</strong> {
//                   formData.payment === 'bkash' ? 'বিকাশ' :
//                   formData.payment === 'nagad' ? 'নগদ' :
//                   'ক্যাশ অন ডেলিভারি'
//                 }</p>
//               </div>
//               <div className="flex justify-between gap-4">
//                 <button
//                   onClick={prev}
//                   className="w-1/2 py-3 rounded-xl bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition"
//                 >
//                   আগের ধাপ
//                 </button>
//                 <button
//                   onClick={handleConfirm}
//                   className="w-1/2 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition"
//                 >
//                   ✅ নিশ্চিত করুন
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </main>
//   );
// }






// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { BsCheckCircleFill } from "react-icons/bs";
// import { FaArrowRight } from "react-icons/fa";
// import { Typewriter } from "react-simple-typewriter";

// export default function OrderSteps() {
//   const [step, setStep] = useState(1);

//   const nextStep = () => {
//     if (step < 3) setStep(step + 1);
//   };

//   const prevStep = () => {
//     if (step > 1) setStep(step - 1);
//   };

//   const steps = [
//     {
//       title: "অর্ডার ঠিকানা",
//       content: (
//         <div className="space-y-4">
//           <input type="text" placeholder="আপনার ঠিকানা" className="input-style" />
//           <input type="text" placeholder="শহর" className="input-style" />
//         </div>
//       ),
//     },
//     {
//       title: "পেমেন্ট অপশন",
//       content: (
//         <div className="space-y-4">
//           <select className="input-style">
//             <option>বিকাশ</option>
//             <option>নগদ</option>
//             <option>রকেট</option>
//             <option>কার্ড</option>
//           </select>
//           <input type="text" placeholder="লেনদেন নম্বর (যদি প্রযোজ্য হয়)" className="input-style" />
//         </div>
//       ),
//     },
//     {
//       title: "অর্ডার কনফার্ম",
//       content: (
//         <div className="text-center space-y-2">
//           <BsCheckCircleFill className="text-green-500 text-5xl mx-auto animate-bounce" />
//           <p className="text-xl font-semibold">আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</p>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-green-100 flex items-center justify-center px-4 py-8">
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-6 md:p-10 border border-gray-200"
//       >
//         {/* Header */}
//         <div className="text-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-700">
//             <Typewriter
//               words={["অর্ডার ধাপ সম্পন্ন করুন", "পেমেন্ট করুন", "অর্ডার নিশ্চিত করুন"]}
//               loop={0}
//               cursor
//               cursorStyle="|"
//               typeSpeed={70}
//               deleteSpeed={50}
//               delaySpeed={1500}
//             />
//           </h1>
//           <p className="text-gray-500 text-sm mt-1">ধাপে ধাপে অর্ডার করুন</p>
//         </div>

//         {/* Step Indicator */}
//         <div className="flex justify-between items-center mb-6">
//           {[1, 2, 3].map((s) => (
//             <div
//               key={s}
//               className={`flex-1 h-2 mx-1 rounded-full ${
//                 step >= s ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gray-200'
//               }`}
//             />
//           ))}
//         </div>

//         {/* Step Content */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={step}
//             initial={{ opacity: 0, x: 40 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -40 }}
//             transition={{ duration: 0.4 }}
//           >
//             <h2 className="text-xl font-semibold text-indigo-600 mb-3">
//               {steps[step - 1].title}
//             </h2>
//             {steps[step - 1].content}
//           </motion.div>
//         </AnimatePresence>

//         {/* Navigation Buttons */}
//         <div className="flex justify-between items-center mt-8">
2







  // 'use client';
  // import { useRef, useState, useEffect } from 'react';
  // import { useCartStore } from '../product-view/api-local/store/cartStore';
  // import jsPDF from 'jspdf';
  // import autoTable from 'jspdf-autotable';
  // import { toast, ToastContainer } from 'react-toastify';
  // import 'react-toastify/dist/ReactToastify.css';
  // import { motion } from 'framer-motion';

  // function SuccessModal({ onClose }: { onClose: () => void }) {
  //   return (
  //     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
  //       <motion.div
  //         initial={{ scale: 0 }}
  //         animate={{ scale: 1 }}
  //         className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-sm text-center"
  //       >
  //         <h2 className="text-2xl font-bold text-green-600 mb-4">✅ অর্ডার সফল হয়েছে!</h2>
  //         <p className="text-gray-700 dark:text-gray-300 mb-4">আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
  //         <button
  //           onClick={onClose}
  //           className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
  //         >
  //           বন্ধ করুন
  //         </button>
  //       </motion.div>
  //     </div>
  //   );
  // }

  // export default function OrderSummary() {
  //   const printRef = useRef<HTMLDivElement>(null);
  //   const { items, clearCart } = useCartStore();

  //   const [invoiceNo, setInvoiceNo] = useState('');
  //   const [orderDate, setOrderDate] = useState('');
  //   const [showModal, setShowModal] = useState(false);
  //   const [customerInfo] = useState({
  //     name: 'জন ডো',
  //     phone: '+880123456789',
  //     address: '৪৫, গুলশান, ঢাকা',
  //   });

  //   const shipping = 5.0;
  //   const totalItems = items.reduce((acc, p) => acc + p.quantity, 0);
  //   const productTotal = items.reduce((acc, p) => acc + p.price * p.quantity, 0);
  //   const finalTotal = productTotal + shipping;

  //   useEffect(() => {
  //     const date = new Date();
  //     setOrderDate(date.toLocaleDateString('bn-BD'));
  //     const invNum =
  //       'my-shopings.com/' +
  //       date.toISOString().slice(0, 10).replace(/-/g, '') +
  //       Math.floor(100 + Math.random() * 900);
  //     setInvoiceNo(invNum);
  //   }, []);

  //   const handlePrint = () => {
  //     const content = printRef.current;
  //     if (!content) return;
  //     const WinPrint = window.open('', '', 'width=900,height=650');
  //     WinPrint?.document.write(`
  //       <html>
  //         <head>
  //           <title>Invoice</title>
  //           <style>
  //             body { font-family: Arial, sans-serif; padding: 20px; }
  //             .company { font-size: 20px; font-weight: bold; color: #dc2626; }
  //             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  //             th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
  //             .total { font-weight: bold; }
  //           </style>
  //         </head>
  //         <body>${content.innerHTML}</body>
  //       </html>
  //     `);
  //     WinPrint?.document.close();
  //     WinPrint?.focus();
  //     WinPrint?.print();
  //     WinPrint?.close();
  //   };

  //   const handleDownloadPDF = () => {
  //     if (items.length === 0) {
  //       toast.warn('⚠️ কার্ট খালি!');
  //       return;
  //     }

  //     const doc = new jsPDF();
  //     doc.setFontSize(18);
  //     doc.setTextColor('#dc2626');
  //     doc.text('EcoStyle™ ইনভয়েস', 14, 20);

  //     doc.setFontSize(11);
  //     doc.setTextColor('#000');
  //     doc.text(`ইনভয়েস নম্বর: ${invoiceNo}`, 14, 30);
  //     doc.text(`তারিখ: ${orderDate}`, 140, 30);

  //     doc.text(`গ্রাহক: ${customerInfo.name}`, 14, 40);
  //     doc.text(`ফোন: ${customerInfo.phone}`, 14, 47);
  //     doc.text(`ঠিকানা: ${customerInfo.address}`, 14, 54);

  //     const tableColumn = ['পণ্য', 'একক মূল্য', 'পরিমাণ', 'মোট'];
  //     const tableRows: any[] = [];

  //     items.forEach(item => {
  //       tableRows.push([
  //         item.name,
  //         `$${item.price.toFixed(2)}`,
  //         item.quantity.toString(),
  //         `$${(item.price * item.quantity).toFixed(2)}`,
  //       ]);
  //     });

  //     tableRows.push(['শিপিং', '', '', `$${shipping.toFixed(2)}`]);
  //     tableRows.push(['মোট পণ্য', '', totalItems.toString(), `$${finalTotal.toFixed(2)}`]);

  //     // @ts-ignore
  //     autoTable(doc, {
  //       startY: 60,
  //       head: [tableColumn],
  //       body: tableRows,
  //       theme: 'grid',
  //     });

  //     doc.save(`${invoiceNo}.pdf`);
  //   };

  //   const handleSaveOrder = async () => {
  //     if (items.length === 0) {
  //       toast.warn('⚠️ কার্ট খালি!');
  //       return;
  //     }

  //     const orderData = {
  //       invoiceNo,
  //       orderDate,
  //       customer: customerInfo,
  //       items,
  //       shipping,
  //       total: finalTotal,
  //     };

  //     try {
  //       const res = await fetch('/api/orders', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(orderData),
  //       });

  //       if (!res.ok) throw new Error('Failed to save');

  //       toast.success('✅ অর্ডার সফলভাবে সংরক্ষিত হয়েছে!');
  //       setShowModal(true);
  //       clearCart();
  //     } catch (err) {
  //       toast.error('❌ অর্ডার সংরক্ষণে সমস্যা হয়েছে।');
  //     }
  //   };

  //   return (
  //     <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl shadow-lg">
  //       <div ref={printRef}>
  //         <div className="text-center mb-6">
  //           <h1 className="text-3xl font-bold text-red-600">EcoStyle™</h1>
  //           <p className="text-sm">১২৩ ইকো স্ট্রিট, গ্রিন সিটি, বাংলাদেশ</p>
  //           <p className="text-sm">ফোন: +880-1234-567890</p>
  //         </div>

  //         <div className="text-sm mb-4">
  //           <p><strong>ইনভয়েস নম্বর:</strong> {invoiceNo}</p>
  //           <p><strong>তারিখ:</strong> {orderDate}</p>
  //           <p><strong>গ্রাহক:</strong> {customerInfo.name}</p>
  //           <p><strong>ফোন:</strong> {customerInfo.phone}</p>
  //           <p><strong>ঠিকানা:</strong> {customerInfo.address}</p>
  //         </div>

  //         <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
  //           <thead className="bg-gray-100 dark:bg-gray-700">
  //             <tr>
  //               <th className="px-3 py-2">পণ্য</th>
  //               <th className="px-3 py-2 text-right">একক মূল্য</th>
  //               <th className="px-3 py-2 text-right">পরিমাণ</th>
  //               <th className="px-3 py-2 text-right">মোট</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {items.length === 0 && (
  //               <tr>
  // দটয১                <td colSpan={4} className="text-center py-4">কার্ট খালি।</td>
  //               </tr>
  //             )}
  //             {items.map((p, idx) => (
  //               <tr key={idx} className="border-t">
  //                 <td className="px-3 py-2">{p.name}</td>
  //                 <td className="px-3 py-2 text-right">${p.price}</td>
  //                 <td className="px-3 py-2 text-right">{p.quantity}</td>
  //                 <td className="px-3 py-2 text-right">${(p.price * p.quantity).toFixed(2)}</td>
  //               </tr>
  //             ))}
  //             {items.length > 0 && (
  //               <>
  //                 <tr className="border-t">
  //                   <td colSpan={3} className="px-3 py-2 text-right font-semibold">শিপিং</td>
  //                   <td className="px-3 py-2 text-right">${shipping.toFixed(2)}</td>
  //                 </tr>
  //                 <tr className="border-t font-bold">
  //                   <td colSpan={3} className="px-3 py-2 text-right">মোট পণ্য: {totalItems}</td>
  //                   <td className="px-3 py-2 text-right">${finalTotal.toFixed(2)}</td>
  //                 </tr>
  //               </>
  //             )}
  //           </tbody>
  //         </table>
  //       </div>

  //       <div className="mt-6 flex flex-wrap justify-between gap-4">
  //         <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
  //           🖨 প্রিন্ট করুন
  //         </button>
  //         <button onClick={handleDownloadPDF} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
  //           📥 PDF ডাউনলোড
  //         </button>
  //         <button onClick={handleSaveOrder} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 dark:text-white rounded hover:shadow">
  // 🛒 অর্ডার সম্পন্ন করুন
          

  //         </button>
  //       </div>

  //       <ToastContainer position="top-right" autoClose={3000} theme="colored" />
  //       {showModal && <SuccessModal onClose={() => setShowModal(false)} />}
  //     </div>
  //   );
  // }

  // //   const [form, setForm] = useState({
  // //     name: '', email: '', address: '', payment: '',
  // //   });

  // //   const handleChange = (e) => {
  // //     setForm({ ...form, [e.target.name]: e.target.value });
  // //   };

  // //   const handleSubmit = (e) => {
  // //     e.preventDefault();
  // //     alert('✅ Order submitted!');
  // //   };

  // //   return (

  // //     <div className="min-h-screen text-dark p-6 bg-dark-50">
  // //       <h2 className="text-2xl font-bold mb-4">🛒 Checkout</h2>
  // //       <form onSubmit={handleSubmit} className="bg-dark p-4 rounded shadow space-y-4">
  // //         <input name="name" placeholder="Full Name" onChange={handleChange} required className="w-full border p-2 rounded" />
  // //         <input name="email" placeholder="Email" type="email" onChange={handleChange} required className="w-full border p-2 rounded" />
  // //         <textarea name="address" placeholder="Shipping Address" onChange={handleChange} required className="w-full border p-2 rounded" />
  // //         <select name="payment" onChange={handleChange} required className="w-full border p-2 rounded">
  // //           <option value="">Select Payment</option>
  // //           <option value="cod">Cash on Delivery</option>
  // //           <option value="bkash">bKash</option>
  // //         </select>
  // //         <button className="bg-green-600 text-white px-4 py-2 rounded">Place Order</button>
  // //       </form>
  // //     </div>
  // //   );
  // // }


  // // components/CheckoutForm.js

  // // import { useState } from "react";

  // // export default function CheckoutForm() {
  // //   const [selectedMethod, setSelectedMethod] = useState("card");

  // //   return (
  // //     <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl transition-all duration-300 dark:bg-gray-900 dark:text-white">
  // //       <h2 className="text-2xl font-bold mb-6">Checkout</h2>

  // //       {/* Order Summary */}
  // //       <div className="mb-6">
  // //         <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
  // //         <div className="flex justify-between border-b pb-2">
  // //           <span>Product 1</span>
  // //           <span>$29.99</span>
  // //         </div>
  // //         <div className="flex justify-between border-b py-2">
  // //           <span>Shipping</span>
  // //           <span>$5.00</span>
  // //         </div>
  // //         <div className="flex justify-between font-bold pt-2">
  // //           <span>Total</span>
  // //           <span>$34.99</span>
  // //         </div>
  // //       </div>

  // //       {/* Payment Methods */}
  // //       <div className="mb-6">
  // //         <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
  // //         <div className="flex gap-4">
  // //           {["card", "paypal", "crypto"].map((method) => (
  // //             <button
  // //               key={method}
  // //               onClick={() => setSelectedMethod(method)}
  // //               className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium border ${
  // //                 selectedMethod === method
  // //                   ? "bg-red-500 text-white shadow-md"
  // //                   : "bg-white dark:bg-gray-800 border-gray-300 text-gray-700 dark:text-white"
  // //               }`}
  // //             >
  // //               {method.toUpperCase()}
  // //             </button>
  // //           ))}
  // //         </div>
  // //       </div>

  // //       {/* Card Details */}
  // //       {selectedMethod === "card" && (
  // //         <div className="space-y-4 transition-opacity duration-500 ease-in">
  // //           <input
  // //             type="text"
  // //             placeholder="Cardholder Name"
  // //             className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
  // //           />
  // //           <input
  // //             type="text"
  // //             placeholder="Card Number"
  // //             className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
  // //           />
  // //           <div className="flex gap-4">
  // //             <input
  // //               type="text"
  // //               placeholder="MM/YY"
  // //               className="w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
  // //             />
  // //             <input
  // //               type="text"
  // //               placeholder="CVC"
  // //               className="w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
  // //             />
  // //           </div>
  // //         </div>
  // //       )}

  // //       {/* Submit */}
  // //       <button
  // //         className="mt-6 w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transform transition duration-300"
// //       >
// //         Confirm Payment
// //       </button>
// //     </div>
// //   );
// // }














// // components/CheckoutForm.js

// // import { useState } from "react";

// // export default function CheckoutForm() {
// //   const [selectedMethod, setSelectedMethod] = useState("card");

// //   const paymentMethods = [
// //     { key: "card", label: "Card" },
// //     { key: "paypal", label: "PayPal" },
// //     { key: "bkash", label: "bKash" },
// //     { key: "cod", label: "Cash on Delivery" },
// //     { key: "crypto", label: "Crypto" },
// //   ];

// //   return (
// //     <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl transition-all duration-300">
// //       <h2 className="text-2xl font-bold mb-6">Checkout</h2>

// //       {/* Order Summary */}
// //       <div className="mb-6">
// //         <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
// //         <div className="flex justify-between border-b pb-2 dark:border-gray-700">
// //           <span>Product 1</span>
// //           <span>$29.99</span>
// //         </div>
// //         <div className="flex justify-between border-b py-2 dark:border-gray-700">
// //           <span>Shipping</span>
// //           <span>$5.00</span>
// //         </div>
// //         <div className="flex justify-between font-bold pt-2">
// //           <span>Total</span>
// //           <span>$34.99</span>
// //         </div>
// //       </div>

// //       {/* Payment Method */}
// //       <div className="mb-6">
// //         <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
// //         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
// //           {paymentMethods.map(({ key, label }) => (
// //             <button
// //               key={key}
// //               onClick={() => setSelectedMethod(key)}
// //               className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm border font-medium ${
// //                 selectedMethod === key
// //                   ? "bg-red-500 text-white shadow-md"
// //                   : "bg-white dark:bg-gray-800 border-gray-300 text-gray-800 dark:text-white"
// //               }`}
// //             >
// //               {label}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Conditional Inputs */}
// //       {selectedMethod === "card" && (
// //         <div className="space-y-4">
// //           <input type="text" placeholder="Cardholder Name" className="form-input" />
// //           <input type="text" placeholder="Card Number" className="form-input" />
// //           <div className="flex gap-4">
// //             <input type="text" placeholder="MM/YY" className="form-input w-1/2" />
// //             <input type="text" placeholder="CVC" className="form-input w-1/2" />
// //           </div>
// //         </div>
// //       )}

// //       {selectedMethod === "bkash" && (
// //         <div className="mt-4">
// //           <input type="text" placeholder="bKash Number" className="form-input" />
// //           <input type="text" placeholder="Transaction ID" className="form-input mt-2" />
// //         </div>
// //       )}

// //       {selectedMethod === "cod" && (
// //         <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
// //           You will pay in cash when the product is delivered.
// //         </div>
// //       )}

// //       {/* Confirm Button */}
// //       <button className="mt-6 w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transform transition duration-300">
// //         Confirm Payment
// //       </button>
// //     </div>
// //   );
// // }

// // Tailwind shortcut








// // components/CheckoutForm.js
// // import { useState } from "react";
// // import { Dialog } from '@headlessui/react';

// // export default function CheckoutForm() {
// //   const [selectedMethod, setSelectedMethod] = useState("card");
// //   const [isConfirmOpen, setIsConfirmOpen] = useState(false);

// //   const [shippingInfo, setShippingInfo] = useState({
// //     name: '',
// //     phone: '',
// //     address: ''
// //   });

// //   const handleInput = (e) => {
// //     setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
// //   };

// //   const paymentMethods = [
// //     { key: "card", label: "Card" },
// //     { key: "paypal", label: "PayPal" },
// //     { key: "bkash", label: "bKash" },
// //     { key: "cod", label: "Cash on Delivery" },
// //     { key: "crypto", label: "Crypto" },
// //   ];

// //   return (
// //     <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl">
// //       <h2 className="text-2xl font-bold mb-6">Checkout</h2>

// //       {/* 1. Shipping Address */}
// //       <div className="mb-6 space-y-4">
// //         <h3 className="text-lg font-semibold">Shipping Address</h3>
// //         <input
// //           type="text"
// //           name="name"
// //           placeholder="Full Name"
// //           value={shippingInfo.name}
// //           onChange={handleInput}
// //           className="form-input"
// //         />
// //         <input
// //           type="text"
// //           name="phone"
// //           placeholder="Phone Number"
// //           value={shippingInfo.phone}
// //           onChange={handleInput}
// //           className="form-input"
// //         />
// //         <textarea
// //           name="address"
// //           placeholder="Full Address"
// //           value={shippingInfo.address}
// //           onChange={handleInput}
// //           className="form-input"
// //         ></textarea>
// //       </div>

// //       {/* 2. Payment Methods */}
// //       <div className="mb-6">
// //         <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
// //         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
// //           {paymentMethods.map(({ key, label }) => (
// //             <button
// //               key={key}
// //               onClick={() => setSelectedMethod(key)}
// //               className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm border font-medium ${
// //                 selectedMethod === key
// //                   ? "bg-red-500 text-white shadow-md"
// //                   : "bg-white dark:bg-gray-800 border-gray-300 text-gray-800 dark:text-white"
// //               }`}
// //             >
// //               {label}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* 3. Dynamic Payment Input */}
// //       {selectedMethod === "bkash" && (
// //         <div className="space-y-2">
// //           <input type="text" placeholder="bKash Number" className="form-input" />
// //           <input type="text" placeholder="Transaction ID" className="form-input" />
// //         </div>
// //       )}

// //       {selectedMethod === "card" && (
// //         <div className="space-y-4">
// //           <input type="text" placeholder="Cardholder Name" className="form-input" />
// //           <input type="text" placeholder="Card Number" className="form-input" />
// //           <div className="flex gap-4">
// //             <input type="text" placeholder="MM/YY" className="form-input w-1/2" />
// //             <input type="text" placeholder="CVC" className="form-input w-1/2" />
// //           </div>
// //         </div>
// //       )}

// //       {/* 4. Next Button to Open Modal */}
// //       <button
// //         onClick={() => setIsConfirmOpen(true)}
// //         className="mt-6 w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform"
// //       >
// //         Next
// //       </button>

// //       {/* 5. Modal */}
// //       <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} className="relative z-50">
// //         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

// //         <div className="fixed inset-0 flex items-center justify-center">
// //           <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-xl shadow-xl animate-fadeIn">
// //             <Dialog.Title className="text-xl font-bold mb-4">Confirm Your Order</Dialog.Title>

// //             <div className="space-y-2 text-sm">
// //               <p><strong>Name:</strong> {shippingInfo.name}</p>
// //               <p><strong>Phone:</strong> {shippingInfo.phone}</p>
// //               <p><strong>Address:</strong> {shippingInfo.address}</p>
// //               <p><strong>Payment Method:</strong> {paymentMethods.find(p => p.key === selectedMethod)?.label}</p>
// //               <p><strong>Total:</strong> $34.99</p>
// //             </div>

// //             <div className="mt-6 flex justify-between gap-2">
// //               <button
// //                 onClick={() => setIsConfirmOpen(false)}
// //                 className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={() => {
// //                   setIsConfirmOpen(false);
// //                   alert("🎉 Order Confirmed!");
// //                 }}
// //                 className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
// //               >
// //                 Confirm Order
// //               </button>
// //             </div>
// //           </Dialog.Panel>
// //         </div>
// //       </Dialog>
// //     </div>
// //   );
// // }














// // components/OrderSummary.js
// // 'use client'
// // import { useRef } from 'react';

// // export default function OrderSummary() {
// //   const printRef = useRef();

// //   const handlePrint = () => {
// //     const printContent = printRef.current;
// //     const WinPrint = window.open('', '', 'width=900,height=650');
// //     WinPrint.document.write(`
// //       <html>
// //         <head>
// //           <title>Order Summary</title>
// //           <style>
// //             body { font-family: sans-serif; padding: 20px; }
// //             h1 { color: #dc2626; }
// //             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
// //             td, th { padding: 10px; border: 1px solid #ccc; }
// //           </style>
// //         </head>
// //         <body>${printContent.innerHTML}</body>
// //       </html>
// //     `);
// //     WinPrint.document.close();
// //     WinPrint.focus();
// //     WinPrint.print();
// //     WinPrint.close();
// //   };

// //   return (
// //     <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl shadow-lg">
// //       <div ref={printRef}>
// //         <h1 className="text-2xl font-bold text-red-600">Order Summary</h1>

// //         {/* Shipping Info */}
// //         <div className="mt-4 text-sm">
// //           <p><strong>Name:</strong> John Doe</p>
// //           <p><strong>Phone:</strong> +880123456789</p>
// //           <p><strong>Address:</strong> Dhaka, Bangladesh</p>
// //         </div>

// //         {/* Order Items */}
// //         <div className="mt-6">
// //           <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
// //             <thead className="bg-gray-100 dark:bg-gray-700">
// //               <tr>
// //                 <th className="text-left px-3 py-2">Product</th>
// //                 <th className="text-right px-3 py-2">Price</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               <tr className="border-t">
// //                 <td className="px-3 py-2">T-shirt (Red)</td>
// //                 <td className="text-right px-3 py-2">$29.99</td>
// //               </tr>
// //               <tr className="border-t">
// //                 <td className="px-3 py-2">Shipping</td>
// //                 <td className="text-right px-3 py-2">$5.00</td>
// //               </tr>
// //               <tr className="font-bold border-t">
// //                 <td className="px-3 py-2">Total</td>
// //                 <td className="text-right px-3 py-2">$34.99</td>
// //               </tr>
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* Print/Save PDF Buttons */}
// //       <div className="mt-6 flex justify-between">
// //         <button
// //           onClick={handlePrint}
// //           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
// //         >
// //           🖨 Print / Save PDF
// //         </button>

// //         <button
// //           className="px-4 py-2 bg-gray-200 dark:bg-gray-800 dark:text-white rounded hover:shadow"
// //           onClick={() => alert('✅ Order Saved!')}
// //         >
// //           💾 Save Order
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }
