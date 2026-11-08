// // export default function SettingsPanel() {
// //   return (
// //     <div className="bg-white p-4 rounded-xl shadow-md mt-4 space-y-2">
// //       <h3 className="text-lg font-semibold">Settings</h3>
// //       <ul className="space-y-1 text-sm text-gray-700">
// //         <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">🔒 Change Password</li>
// //         <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">🌐 Language Preferences</li>
// //         <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">🧾 Billing Info</li>
// //         <li className="hover:bg-gray-100 p-2 rounded cursor-pointer text-red-600">🚪 Logout</li>
// //       </ul>
// //     </div>
// //   );
// // }



// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Moon, Sun, Settings, Lock, Globe, CreditCard, LogOut } from 'lucide-react';

// export default function SettingsPanel() {
//   const [dark, setDark] = useState(false);

//   const toggleDark = () => setDark(!dark);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className={`rounded-xl shadow-md p-6 space-y-4 ${
//         dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
//       }`}
//     >
//       <div className="flex items-center space-x-2">
//         <Settings className="w-5 h-5" />
//         <h3 className="text-xl font-semibold">Settings</h3>
//       </div>

//       <div className="space-y-2 text-sm">
//         <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer">
//           <div className="flex items-center space-x-2">
//             <Lock className="w-4 h-4" />
//             <span>Change Password</span>
//           </div>
//         </div>

//         <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer">
//           <div className="flex items-center space-x-2">
//             <Globe className="w-4 h-4" />
//             <span>Language Preference</span>
//           </div>
//           <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">EN</span>
//         </div>

//         <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer">
//           <div className="flex items-center space-x-2">
//             <CreditCard className="w-4 h-4" />
//             <span>Billing Info</span>
//           </div>
//         </div>

//         <div
//           onClick={toggleDark}
//           className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer"
//         >
//           <div className="flex items-center space-x-2">
//             {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//             <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
//           </div>
//           <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
//             {dark ? 'On' : 'Off'}
//           </span>
//         </div>

//         <div className="flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-800 p-3 rounded transition cursor-pointer text-red-600 dark:text-red-400">
//           <div className="flex items-center space-x-2">
//             <LogOut className="w-4 h-4" />
//             <span>Logout</span>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Moon,
//   Sun,
//   Settings,
//   Lock,
//   Globe,
//   CreditCard,
//   LogOut,
//   Clock,
//   TrendingUp
// } from 'lucide-react';

// export default function SettingsPanel() {
//   const [dark, setDark] = useState(false);
//   const toggleDark = () => setDark(!dark);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className={`rounded-xl shadow-md p-6 space-y-4 ${
//         dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
//       }`}
//     >
//       <div className="flex items-center space-x-2">
//         <Settings className="w-5 h-5" />
//         <h3 className="text-xl font-semibold">Settings</h3>
//       </div>

//       <div className="space-y-2 text-sm">
//         <SettingItem icon={<Lock className="w-4 h-4" />} label="Change Password" />
//         <SettingItem icon={<Globe className="w-4 h-4" />} label="Language Preference" tag="EN" />
//         <SettingItem icon={<CreditCard className="w-4 h-4" />} label="Billing Info" />
        
//         {/* New Feature 1: Old vs New Products */}
//         <SettingItem icon={<Clock className="w-4 h-4" />} label="Old vs New Products" tag="Compare" />

//         {/* New Feature 2: Stock Market Option */}
//         <SettingItem icon={<TrendingUp className="w-4 h-4" />} label="Stock Market" tag="Live" />

//         {/* Dark Mode */}
//         <div
//           onClick={toggleDark}
//           className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer"
//         >
//           <div className="flex items-center space-x-2">
//             {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//             <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
//           </div>
//           <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
//             {dark ? 'On' : 'Off'}
//           </span>
//         </div>

//         {/* Logout */}
//         <div className="flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-800 p-3 rounded transition cursor-pointer text-red-600 dark:text-red-400">
//           <div className="flex items-center space-x-2">
//             <LogOut className="w-4 h-4" />
//             <span>Logout</span>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// function SettingItem({ icon, label, tag }) {
//   return (
//     <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer">
//       <div className="flex items-center space-x-2">
//         {icon}
//         <span>{label}</span>
//       </div>
//       {tag && (
//         <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded">
//           {tag}
//         </span>
//       )}
//     </div>
//   );
// }

// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import {
//   Moon,
//   Sun,
//   Settings,
//   Lock,
//   Globe,
//   CreditCard,
//   LogOut,
//   TrendingUp
// } from 'lucide-react';

// export default function SettingsPanel() {
//   const [dark, setDark] = useState(false);
//   const [isNewProduct, setIsNewProduct] = useState(true);

//   const toggleDark = () => setDark(!dark);
//   const toggleProduct = () => setIsNewProduct(!isNewProduct);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className={`rounded-xl shadow-md p-6 space-y-4 ${
//         dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
//       }`}
//     >
//       <div className="flex items-center space-x-2">
//         <Settings className="w-5 h-5" />
//         <h3 className="text-xl font-semibold">Settings</h3>
//       </div>

//       <div className="space-y-2 text-sm">
//         <SettingItem icon={<Lock className="w-4 h-4" />} label="Change Password" />
//         <SettingItem icon={<Globe className="w-4 h-4" />} label="Language Preference" tag="EN" />
//         <SettingItem icon={<CreditCard className="w-4 h-4" />} label="Billing Info" />

//         {/* Toggle for Old/New Product */}
//         <div
//           className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer"
//           onClick={toggleProduct}
//         >
//           <div className="flex items-center space-x-2">
//             <span className="w-4 h-4 bg-gray-300 rounded-full" />
//             <span>{isNewProduct ? 'New Products' : 'Old Products'}</span>
//           </div>

//           <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
//             <input
//               type="checkbox"
//               name="toggle"
//               checked={isNewProduct}
//               onChange={toggleProduct}
//               className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
//             />
//             <span
//               className={`block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 transition duration-300 ease-in-out ${
//                 isNewProduct ? 'bg-blue-500' : ''
//               }`}
//             ></span>
//           </div>
//         </div>

//         {/* Stock Market Option */}
//         <SettingItem onclick={()=>alert('alert')}  icon={<TrendingUp className="w-4 h-4" />}   label="Stock Market" tag="Live" />

//         {/* Dark Mode Toggle */}
//         <div
//           onClick={toggleDark}
//           className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer"
//         >
//           <div className="flex items-center space-x-2">
//             {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//             <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
//           </div>
//           <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
//             {dark ? 'On' : 'Off'}
//           </span>
//         </div>

//         {/* Logout */}
//         <div className="flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-800 p-3 rounded transition cursor-pointer text-red-600 dark:text-red-400">
//           <div className="flex items-center space-x-2">
//             <LogOut className="w-4 h-4" />
//             <span>Logout</span>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// function SettingItem({ icon, label, tag }) {
//   return (
//     <div className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition cursor-pointer">
//       <div className="flex items-center space-x-2">
//         {icon}
//         <span>{label}</span>
//       </div>
//       {tag && (
//         <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded">
//           {tag}
//         </span>
//       )}
//     </div>
//   );
// }








import React from 'react'

export default function SettionsPaner() {
  return (
    <div>SettionsPaner</div>
  )
}
