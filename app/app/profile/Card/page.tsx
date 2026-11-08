'use client'
import Image from 'next/image';
import {QRCodeSVG} from 'qrcode.react';

export default function Home() {
  const user = {
    name: 'Tazbir Islam',
    id: '9876543210',
    blood: 'B- (Negative)',
    phone: '+88 01706 122313', // ✅ ফিক্স করা নাম্বার
    email: 'tazbir2018@gmail.com',
    join: '23/02/2019',
    expire: '23/02/2021',
    profile: '/profile.jpg',
    website: 'yourwebsite.com',
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="flex gap-8 flex-wrap justify-center">
          {/* Front Side */}
          <div className="w-[280px] h-[420px] bg-gradient-to-b from-gray-800 to-blue-500 text-white rounded-xl shadow-lg flex flex-col items-center p-4 relative">
            <h2 className="text-xl font-bold mb-2">logo<span className="text-blue-300">name</span></h2>
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden mb-3">
              <Image src={user.profile} width={96} height={96} alt="Profile" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm mt-1"><strong>ID:</strong> {user.id}</p>
              <p className="text-sm"><strong>Blood:</strong> {user.blood}</p>
              <p className="text-sm"><strong>Phone:</strong> {user.phone}</p>
              <p className="text-sm"><strong>Email:</strong> {user.email}</p>
              <p className="text-sm"><strong>Join:</strong> {user.join}</p>
              <p className="text-sm"><strong>Expire:</strong> {user.expire}</p>
            </div>
            <div className="absolute bottom-4 text-xs text-gray-300">
              www.{user.website}
            </div>
          </div>

          {/* Back Side */}
          <div className="w-[280px] h-[420px] bg-gray-800 text-white rounded-xl shadow-lg flex flex-col items-center p-4 relative">
            <h2 className="text-xl font-bold mb-2">logo<span className="text-blue-300">name</span></h2>
            <p className="text-sm text-center mt-8 px-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet justo nec eros.
            </p>
            <div className="my-6">
              {/* ✅ এখন ফোন নম্বর থেকে কিউআর কোড বানাবে */}
              <QRCodeSVG
            value="https://myshopings.com/app" // ✅ তোমার লিংক বসাও
            size={128}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
       
          />
              
            </div>
            <div className="italic mt-4">Yours Sincerely</div>
            <div className="absolute bottom-4 text-xs text-gray-300">
              www.{user.website}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
