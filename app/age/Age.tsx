'use client';

import React, { useState } from 'react';

// Define the type for the calculated age state
interface AgeStats {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  daysToNextBirthday: number;
}

export default function AgeCalculator() {
  const [birthDay, setBirthDay] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('June');
  const [birthYear, setBirthYear] = useState<string>('');
  
  const [calculatedAge, setCalculatedAge] = useState<AgeStats | null>(null);

  const months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDay || !birthYear) return;

    const monthIndex = months.indexOf(birthMonth);
    const birthDate = new Date(parseInt(birthYear), monthIndex, parseInt(birthDay));
    const today = new Date(2026, 5, 15); // Target calculation timeline

    if (isNaN(birthDate.getTime()) || birthDate > today) {
      alert("Please enter a valid past date.");
      return;
    }

    // Age Calculation Logic
    let years = today.getFullYear() - birthDate.getFullYear();
    let monthsDiff = today.getMonth() - birthDate.getMonth();
    let daysDiff = today.getDate() - birthDate.getDate();

    if (daysDiff < 0) {
      monthsDiff--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      daysDiff += prevMonth.getDate();
    }

    if (monthsDiff < 0) {
      years--;
      monthsDiff += 12;
    }

    // Extra statistics
    const totalTimeDiff = today.getTime() - birthDate.getTime();
    const totalDays = Math.floor(totalTimeDiff / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + monthsDiff;

    // Next Birthday calculation
    let nextBirthday = new Date(today.getFullYear(), monthIndex, parseInt(birthDay));
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setCalculatedAge({
      years,
      months: monthsDiff,
      days: daysDiff,
      totalMonths,
      totalWeeks,
      totalDays,
      daysToNextBirthday: daysToNextBirthday === 365 ? 0 : daysToNextBirthday
    });
  };

  const handleReset = () => {
    setBirthDay('');
    setBirthMonth('June');
    setBirthYear('');
    setCalculatedAge(null);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] bg-gradient-to-b from-[#161b22] to-[#0d1117] text-gray-200 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-[#121824] rounded-3xl border border-amber-500/20 shadow-[0_0_50px_rgba(212,163,89,0.05)] overflow-hidden backdrop-blur-md">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-800 relative">
          <div className="absolute top-6 right-6 text-amber-400 text-xs tracking-widest border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10">
            PREMIUM
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase mt-2">
            Age Calculator
          </h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-400/70 mb-2 font-medium">Date of Birth</label>
              <div className="grid grid-cols-3 gap-3">
                
                {/* Day Input */}
                <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
                  <span className="block text-[10px] text-gray-500 uppercase">Day</span>
                  <input 
                    type="number" 
                    placeholder="DD" 
                    min="1" max="31"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm"
                  />
                </div>

                {/* Month Dropdown */}
                <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
                  <span className="block text-[10px] text-gray-500 uppercase">Month</span>
                  <select 
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm cursor-pointer"
                  >
                    {months.map((m) => (
                      <option key={m} value={m} style={{ backgroundColor: '#121824', color: '#ffffff' }}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Input */}
                <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
                  <span className="block text-[10px] text-gray-500 uppercase">Year</span>
                  <input 
                    type="number" 
                    placeholder="YYYY" 
                    min="1900" max="2026"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm"
                  />
                </div>

              </div>
            </div>

            {/* Target Calculation Date Display */}
            <div className="bg-[#1f293d]/30 rounded-xl p-3 border border-gray-800/80 flex justify-between items-center text-xs">
              <span className="text-gray-400 uppercase tracking-wider">Calculate At:</span>
              <span className="font-semibold text-amber-300">June 15, 2026</span>
            </div>
          </div>

          {/* Results Area */}
          <div className="bg-[#182030] rounded-2xl p-5 border border-amber-500/10 space-y-4">
            <div className="text-center">
              <span className="text-[11px] uppercase tracking-widest text-amber-400/60 block mb-1">Your Calculated Age</span>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {calculatedAge ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-300">
                    {calculatedAge.years} <span className="text-xl font-normal text-gray-400">Years</span>
                  </span>
                ) : (
                  <span className="text-gray-600">-- Years</span>
                )}
              </div>
            </div>

            <hr className="border-gray-800" />

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Total Months:</span>
                <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.totalMonths : '--'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Months Left:</span>
                <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.months : '--'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Total Weeks:</span>
                <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.totalWeeks : '--'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Days Left:</span>
                <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.days : '--'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs bg-[#121824]/60 p-3 rounded-xl border border-gray-800">
              <span className="text-gray-400">Next Birthday In:</span>
              <span className="font-bold text-emerald-400">
                {calculatedAge ? `${calculatedAge.daysToNextBirthday} Days` : '--'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button 
              onClick={handleCalculate}
              className="col-span-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition duration-200 transform active:scale-95 shadow-lg shadow-amber-600/20 text-sm uppercase tracking-wider"
            >
              Calculate
            </button>
            <button 
              onClick={handleReset}
              className="py-3.5 px-4 bg-[#1f293d] hover:bg-[#28354f] text-gray-300 font-medium rounded-xl transition duration-200 border border-gray-700/60 active:scale-95 text-sm uppercase tracking-wider"
            >
              Reset
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}


// 'use client';

// import { useState } from 'react';

// export default function AgeCalculator() {
//   const [birthDay, setBirthDay] = useState('');
//   const [birthMonth, setBirthMonth] = useState('June');
//   const [birthYear, setBirthYear] = useState('');
  
//   const [calculatedAge, setCalculatedAge] = useState(null);

//   const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   const handleCalculate = (e) => {
//     e.preventDefault();
//     if (!birthDay || !birthYear) return;

//     const monthIndex = months.indexOf(birthMonth);
//     const birthDate = new Date(parseInt(birthYear), monthIndex, parseInt(birthDay));
//     const today = new Date(2026, 5, 15); // June 15, 2026 based on image context

//     if (isNaN(birthDate.getTime()) || birthDate > today) {
//       alert("Please enter a valid past date.");
//       return;
//     }

//     // Age Calculation
//     let years = today.getFullYear() - birthDate.getFullYear();
//     let monthsDiff = today.getMonth() - birthDate.getMonth();
//     let daysDiff = today.getDate() - birthDate.getDate();

//     if (daysDiff < 0) {
//       monthsDiff--;
//       const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
//       daysDiff += prevMonth.getDate();
//     }

//     if (monthsDiff < 0) {
//       years--;
//       monthsDiff += 12;
//     }

//     // Extra statistics
//     const totalTimeDiff = today.getTime() - birthDate.getTime();
//     const totalDays = Math.floor(totalTimeDiff / (1000 * 60 * 60 * 24));
//     const totalWeeks = Math.floor(totalDays / 7);
//     const totalMonths = (years * 12) + monthsDiff;

//     // Next Birthday calculation
//     let nextBirthday = new Date(today.getFullYear(), monthIndex, parseInt(birthDay));
//     if (nextBirthday < today) {
//       nextBirthday.setFullYear(today.getFullYear() + 1);
//     }
//     const daysToNextBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

//     setCalculatedAge({
//       years,
//       months: monthsDiff,
//       days: daysDiff,
//       totalMonths,
//       totalWeeks,
//       totalDays,
//       daysToNextBirthday: daysToNextBirthday === 365 ? 0 : daysToNextBirthday
//     });
//   };

//   const handleReset = () => {
//     setBirthDay('');
//     setBirthMonth('June');
//     setBirthYear('');
//     setCalculatedAge(null);
//   };

//   return (
//     <div className="min-h-screen bg-[#0d1117] bg-gradient-to-b from-[#161b22] to-[#0d1117] text-gray-200 flex items-center justify-center p-4 antialiased">
//       <div className="w-full max-w-md bg-[#121824] rounded-3xl border border-amber-500/20 shadow-[0_0_50px_rgba(212,163,89,0.05)] overflow-hidden backdrop-blur-md">
        
//         {/* Header */}
//         <div className="p-6 text-center border-b border-gray-800 relative">
//           <div className="absolute top-6 right-6 text-amber-400 text-xs tracking-widest border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10">
//             PREMIUM
//           </div>
//           <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase mt-2">
//             Age Calculator
//           </h1>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Inputs */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-xs uppercase tracking-wider text-amber-400/70 mb-2 font-medium">Date of Birth</label>
//               <div className="grid grid-cols-3 gap-3">
                
//                 {/* Day Input */}
//                 <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
//                   <span className="block text-[10px] text-gray-500 uppercase">Day</span>
//                   <input 
//                     type="number" 
//                     placeholder="DD" 
//                     min="1" max="31"
//                     value={birthDay}
//                     onChange={(e) => setBirthDay(e.target.value)}
//                     className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm"
//                   />
//                 </div>

//                 {/* Month Dropdown */}
//                 <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
//                   <span className="block text-[10px] text-gray-500 uppercase">Month</span>
//                   <select 
//                     value={birthMonth}
//                     onChange={(e) => setBirthMonth(e.target.value)}
//                     className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm cursor-pointer"
//                   >
//                     {months.map((m) => (
//                       <option key={m} value={m} className="bg-[#121824] text-white">{m}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Year Input */}
//                 <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
//                   <span className="block text-[10px] text-gray-500 uppercase">Year</span>
//                   <input 
//                     type="number" 
//                     placeholder="YYYY" 
//                     min="1900" max="2026"
//                     value={birthYear}
//                     onChange={(e) => setBirthYear(e.target.value)}
//                     className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm"
//                   />
//                 </div>

//               </div>
//             </div>

//             {/* Target Calculation Date Display */}
//             <div className="bg-[#1f293d]/30 rounded-xl p-3 border border-gray-800/80 flex justify-between items-center text-xs">
//               <span className="text-gray-400 uppercase tracking-wider">Calculate At:</span>
//               <span className="font-semibold text-amber-300">June 15, 2026</span>
//             </div>
//           </div>

//           {/* Results Area */}
//           <div className="bg-[#182030] rounded-2xl p-5 border border-amber-500/10 space-y-4">
//             <div className="text-center">
//               <span className="text-[11px] uppercase tracking-widest text-amber-400/60 block mb-1">Your Calculated Age</span>
//               <div className="text-3xl font-extrabold text-white tracking-tight">
//                 {calculatedAge ? (
//                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-300">
//                     {calculatedAge.years} <span className="text-xl font-normal text-gray-400">Years</span>
//                   </span>
//                 ) : (
//                   <span className="text-gray-600">-- Years</span>
//                 )}
//               </div>
//             </div>

//             <hr className="border-gray-800" />

//             {/* Breakdown Grid */}
//             <div className="grid grid-cols-2 gap-4 text-xs">
//               <div className="flex justify-between py-1 border-b border-gray-800/40">
//                 <span className="text-gray-400">Total Months:</span>
//                 <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.totalMonths : '--'}</span>
//               </div>
//               <div className="flex justify-between py-1 border-b border-gray-800/40">
//                 <span className="text-gray-400">Months Left:</span>
//                 <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.months : '--'}</span>
//               </div>
//               <div className="flex justify-between py-1 border-b border-gray-800/40">
//                 <span className="text-gray-400">Total Weeks:</span>
//                 <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.totalWeeks : '--'}</span>
//               </div>
//               <div className="flex justify-between py-1 border-b border-gray-800/40">
//                 <span className="text-gray-400">Days Left:</span>
//                 <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.days : '--'}</span>
//               </div>
//             </div>

//             <div className="pt-2 flex justify-between items-center text-xs bg-[#121824]/60 p-3 rounded-xl border border-gray-800">
//               <span className="text-gray-400">Next Birthday In:</span>
//               <span className="font-bold text-emerald-400">
//                 {calculatedAge ? `${calculatedAge.daysToNextBirthday} Days` : '--'}
//               </span>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="grid grid-cols-3 gap-3 pt-2">
//             <button 
//               onClick={handleCalculate}
//               className="col-span-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition duration-200 transform active:scale-95 shadow-lg shadow-amber-600/20 text-sm uppercase tracking-wider"
//             >
//               Calculate
//             </button>
//             <button 
//               onClick={handleReset}
//               className="py-3.5 px-4 bg-[#1f293d] hover:bg-[#28354f] text-gray-300 font-medium rounded-xl transition duration-200 border border-gray-700/60 active:scale-95 text-sm uppercase tracking-wider"
//             >
//               Reset
//             </button>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }




// // 'use client';

// // import { useState } from 'react';

// // export default function AgeCalculator() {
// //   const [birthDay, setBirthDay] = useState('');
// //   const [birthMonth, setBirthMonth] = useState('June');
// //   const [birthYear, setBirthYear] = useState('');
  
// //   const [calculatedAge, setCalculatedAge] = useState(null);

// //   const months = [
// //     'January', 'February', 'March', 'April', 'May', 'June',
// //     'July', 'August', 'September', 'October', 'November', 'December'
// //   ];

// //   const handleCalculate = (e) => {
// //     e.preventDefault();
// //     if (!birthDay || !birthYear) return;

// //     const monthIndex = months.indexOf(birthMonth);
// //     const birthDate = new Date(parseInt(birthYear), monthIndex, parseInt(birthDay));
// //     const today = new Date(2026, 5, 15); // June 15, 2026 based on image context

// //     if (isNaN(birthDate.getTime()) || birthDate > today) {
// //       alert("Please enter a valid past date.");
// //       return;
// //     }

// //     // Age Calculation
// //     let years = today.getFullYear() - birthDate.getFullYear();
// //     let monthsDiff = today.getMonth() - birthDate.getMonth();
// //     let daysDiff = today.getDate() - birthDate.getDate();

// //     if (daysDiff < 0) {
// //       monthsDiff--;
// //       const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
// //       daysDiff += prevMonth.getDate();
// //     }

// //     if (monthsDiff < 0) {
// //       years--;
// //       monthsDiff += 12;
// //     }

// //     // Extra statistics
// //     const totalTimeDiff = today.getTime() - birthDate.getTime();
// //     const totalDays = Math.floor(totalTimeDiff / (1000 * 60 * 60 * 24));
// //     const totalWeeks = Math.floor(totalDays / 7);
// //     const totalMonths = (years * 12) + monthsDiff;

// //     // Next Birthday calculation
// //     let nextBirthday = new Date(today.getFullYear(), monthIndex, parseInt(birthDay));
// //     if (nextBirthday < today) {
// //       nextBirthday.setFullYear(today.getFullYear() + 1);
// //     }
// //     const daysToNextBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

// //     setCalculatedAge({
// //       years,
// //       months: monthsDiff,
// //       days: daysDiff,
// //       totalMonths,
// //       totalWeeks,
// //       totalDays,
// //       daysToNextBirthday: daysToNextBirthday === 365 ? 0 : daysToNextBirthday
// //     });
// //   };

// //   const handleReset = () => {
// //     setBirthDay('');
// //     setBirthMonth('June');
// //     setBirthYear('');
// //     setCalculatedAge(null);
// //   };

// //   return (
// //     <div className="min-h-screen bg-[#0d1117] bg-gradient-to-b from-[#161b22] to-[#0d1117] text-gray-200 flex items-center justify-center p-4 antialiased">
// //       <div className="w-full max-w-md bg-[#121824] rounded-3xl border border-amber-500/20 shadow-[0_0_50px_rgba(212,163,89,0.05)] overflow-hidden backdrop-blur-md">
        
// //         {/* Header */}
// //         <div className="p-6 text-center border-b border-gray-800 relative">
// //           <div className="absolute top-6 right-6 text-amber-400 text-xs tracking-widest border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10">
// //             PREMIUM
// //           </div>
// //           <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase mt-2">
// //             Age Calculator
// //           </h1>
// //         </div>

// //         <div className="p-6 space-y-6">
// //           {/* Inputs */}
// //           <div className="space-y-4">
// //             <div>
// //               <label className="block text-xs uppercase tracking-wider text-amber-400/70 mb-2 font-medium">Date of Birth</label>
// //               <div className="grid grid-cols-3 gap-3">
                
// //                 {/* Day Input */}
// //                 <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
// //                   <span className="block text-[10px] text-gray-500 uppercase">Day</span>
// //                   <input 
// //                     type="number" 
// //                     placeholder="DD" 
// //                     min="1" max="31"
// //                     value={birthDay}
// //                     onChange={(e) => setBirthDay(e.target.value)}
// //                     className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm"
// //                   />
// //                 </div>

// //                 {/* Month Dropdown */}
// //                 <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
// //                   <span className="block text-[10px] text-gray-500 uppercase">Month</span>
// //                   <select 
// //                     value={birthMonth}
// //                     onChange={(e) => setBirthMonth(e.target.value)}
// //                     className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm cursor-pointer"
// //                   >
// //                     {months.map((m) => (
// //                       <option key={m} value={m} className="bg-[#121824] text-white">{m}</option>
// //                     ))}
// //                   </select>
// //                 </div>

// //                 {/* Year Input */}
// //                 <div className="bg-[#1f293d]/50 rounded-xl p-2 border border-gray-800 focus-within:border-amber-500/50 transition">
// //                   <span className="block text-[10px] text-gray-500 uppercase">Year</span>
// //                   <input 
// //                     type="number" 
// //                     placeholder="YYYY" 
// //                     min="1900" max="2026"
// //                     value={birthYear}
// //                     onChange={(e) => setBirthYear(e.target.value)}
// //                     className="w-full bg-transparent border-none outline-none text-white font-semibold mt-0.5 text-sm"
// //                   />
// //                 </div>

// //               </div>
// //             </div>

// //             {/* Target Calculation Date Display */}
// //             <div className="bg-[#1f293d]/30 rounded-xl p-3 border border-gray-800/80 flex justify-between items-center text-xs">
// //               <span className="text-gray-400 uppercase tracking-wider">Calculate At:</span>
// //               <span className="font-semibold text-amber-300">June 15, 2026</span>
// //             </div>
// //           </div>

// //           {/* Results Area */}
// //           <div className="bg-[#182030] rounded-2xl p-5 border border-amber-500/10 space-y-4">
// //             <div className="text-center">
// //               <span className="text-[11px] uppercase tracking-widest text-amber-400/60 block mb-1">Your Calculated Age</span>
// //               <div className="text-3xl font-extrabold text-white tracking-tight">
// //                 {calculatedAge ? (
// //                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-300">
// //                     {calculatedAge.years} <span className="text-xl font-normal text-gray-400">Years</span>
// //                   </span>
// //                 ) : (
// //                   <span className="text-gray-600">-- Years</span>
// //                 )}
// //               </div>
// //             </div>

// //             <hr className="border-gray-800" />

// //             {/* Breakdown Grid */}
// //             <div className="grid grid-cols-2 gap-4 text-xs">
// //               <div className="flex justify-between py-1 border-b border-gray-800/40">
// //                 <span className="text-gray-400">Total Months:</span>
// //                 <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.totalMonths : '--'}</span>
// //               </div>
// //               <div className="flex justify-between py-1 border-b border-gray-800/40">
// //                 <span className="text-gray-400">Months Left:</span>
// //                 <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.months : '--'}</span>
// //               </div>
// //               <div className="flex justify-between py-1 border-b border-gray-800/40">
// //                 <span className="text-gray-400">Total Weeks:</span>
// //                 <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.totalWeeks : '--'}</span>
// //               </div>
// //               <div className="flex justify-between py-1 border-b border-gray-800/40">
// //                 <span className="text-gray-400">Days Left:</span>
// //                 <span className="font-mono text-amber-200">{calculatedAge ? calculatedAge.days : '--'}</span>
// //               </div>
// //             </div>

// //             <div className="pt-2 flex justify-between items-center text-xs bg-[#121824]/60 p-3 rounded-xl border border-gray-800">
// //               <span className="text-gray-400">Next Birthday In:</span>
// //               <span className="font-bold text-emerald-400">
// //                 {calculatedAge ? `${calculatedAge.daysToNextBirthday} Days` : '--'}
// //               </span>
// //             </div>
// //           </div>

// //           {/* Action Buttons */}
// //           <div className="grid grid-cols-3 gap-3 pt-2">
// //             <button 
// //               onClick={handleCalculate}
// //               className="col-span-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition duration-200 transform active:scale-95 shadow-lg shadow-amber-600/20 text-sm uppercase tracking-wider"
// //             >
// //               Calculate
// //             </button>
// //             <button 
// //               onClick={handleReset}
// //               className="py-3.5 px-4 bg-[#1f293d] hover:bg-[#28354f] text-gray-300 font-medium rounded-xl transition duration-200 border border-gray-700/60 active:scale-95 text-sm uppercase tracking-wider"
// //             >
// //               Reset
// //             </button>
// //           </div>

// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

