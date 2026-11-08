// import Image from 'next/image';

// export default function ProfileCard({getname,img}) {
//   return (





//  <div className="flex items-center gap-3 group cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition duration-300">
//       <div className="relative w-10 h-10">
//         <Image
//           src={`http://localhost:8000/profile_users/${img}`}
//           alt={getname}
//           fill
//           className="rounded-full object-cover border border-gray-300 group-hover:scale-105 transition-transform duration-300"
//         />
//       </div>
//       <span className="font-medium text-sm text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors duration-300">
//         {getname}
//       </span>
//     </div>





//     // <div className="flex items-center space-x-4 bg-dark p-4 rounded-xl shadow-md">
//     //    <Image
//     //         src={`http://localhost:8000/profile_users/${img}`}
//     //         alt={getname}
//     //         width={60}
//     //         height={60}
//     //         className="rounded-full object-cover border border-gray-300"
//     //       />

//     //         <div>
//     //     <h2 className="text-xl font-semibold">{getname}</h2>
    
//     //   </div>
//     // </div>
//   );
// }



// components/UserProfileMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FiMoreVertical, FiUser, FiSettings, FiLogOut } from "react-icons/fi";


export default function UserProfileMenu({
  getname,
  img,
}: {
  getname: string;
  img: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Profile Button */}
      <div className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
        onClick={() => setOpen(!open)}
      >
        <div className="relative w-10 h-10">
          <Image
            src={`http://localhost:8000/profile_users/${img}`}
   alt="Profile image"
  fill
  className="object-cover rounded-full"
          />
        </div>
        <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
          {getname}
        </span>
        <FiMoreVertical className="text-gray-500 ml-2" />
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50 animate-fade-in-up">
          <ul className="py-2">
            <li className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              <FiUser className="mr-2" /> Account Info
            </li>
            <li className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              <FiSettings className="mr-2" /> Settings
            </li>
            <li className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              <FiLogOut className="mr-2" /> Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
