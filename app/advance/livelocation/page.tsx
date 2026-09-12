"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ডিফল্ট মার্কার আইকন ফিক্স
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ম্যাপ সেন্টার এবং জুম লাইভ আপডেট করার সাব-কম্পোনেন্ট
function RecenterMap({ lat, lng, isFirstLoad }: { lat: number; lng: number; isFirstLoad: boolean }) {
  const map = useMap();
  useEffect(() => {
    // প্রথমবার লোড হলে একটু বেশি জুম (17) হবে, পরে ইউজার নড়াচড়া করলে জুম লেভেল ঠিক থাকবে
    const currentZoom = isFirstLoad ? 17 : map.getZoom();
    map.setView([lat, lng], currentZoom, { animate: true });
  }, [lat, lng, map, isFirstLoad]);
  return null;
}

export default function LiveTracker() {
  const [position, setPosition] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [address, setAddress] = useState<string>("লোকেশন ট্র্যাক করা হচ্ছে...");
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef<boolean>(true);

  // কোঅর্ডিনেট (Lat, Lng) থেকে জায়গার নাম (Address) বের করার ফাংশন
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "User-Agent": "NextJS-Live-Location-App", // Nominatim API-র জন্য রিকুয়েস্ট হেডার জরুরি
          },
        }
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress("লোকেশন নাম পাওয়া যায়নি।");
      }
    } catch (err) {
      console.error("Address fetch error:", err);
      setAddress("লোকেশন নাম লোড করতে সমস্যা হয়েছে।");
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("আপনার ব্রাউজারটি Geolocation সাপোর্ট করে না।");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPosition({ lat: latitude, lng: longitude, accuracy });
        setError(null);

        // লোকেশনের নাম ফেচ করা
        fetchAddress(latitude, longitude);
      },
      (err) => {
        if (err.code === 1) {
          setError("অনুগ্রহ করে ব্রাউজারের লোকেশন পারমিশন (Allow) দিন।");
        } else {
          setError(`লোকেশন পেতে সমস্যা: ${err.message}`);
        }
      },
      {
        enableHighAccuracy: true, // মোবাইল জিপিএস অন থাকলে একদম নিখুঁত জুম হবে
        timeout: 15000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // প্রথমবার ম্যাপ রেন্ডার হওয়ার পর flag ফলস করে দেওয়া
  useEffect(() => {
    if (position) {
      isFirstLoad.current = false;
    }
  }, [position]);

  if (error) {
    return <div className="p-6 text-red-500 font-bold text-center max-w-md mx-auto">{error}</div>;
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center p-10 max-w-md mx-auto space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm font-medium animate-pulse text-center">
          লাইভ লোকেশন ও ম্যাপ জুম করা হচ্ছে... পারমিশন দিন।
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center px-2 sm:px-4">
      {/* মোবাইল রেসপন্সিভ অ্যাড্রেস বক্স */}
      <div className="w-full max-w-3xl mb-4 bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100 text-center">
        <span className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
          📍 বর্তমান অবস্থান (Live)
        </span>
        <p className="text-sm sm:text-base font-medium text-gray-800 leading-snug break-words">
          {address}
        </p>
        <span className="inline-block mt-2 text-[10px] sm:text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
          Accuracy: ±{Math.round(position.accuracy)} meters
        </span>
      </div>

      {/* ফুল মোবাইল রেসপন্সিভ ম্যাপ কন্টেইনার */}
      <div className="w-full max-w-3xl h-[65vh] sm:h-[500px] md:h-[550px] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={17} // ইনিশিয়াল হাই জুম লেভেল
          style={{ height: "100%", width: "100%" }}
          zoomControl={true} // মোবাইলে ম্যানুয়ালি জুম করার বাটন সচল থাকবে
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* লাইভ মার্কার */}
          <Marker position={[position.lat, position.lng]} icon={markerIcon}>
            <Popup className="custom-popup">
              <div className="text-xs font-bold">আপনি এখানে আছেন</div>
            </Popup>
          </Marker>

          {/* জিপিএস এক্যুরেসির জন্য বৃত্ত */}
          <Circle
            center={[position.lat, position.lng]}
            radius={position.accuracy}
            pathOptions={{ fillColor: "blue", fillOpacity: 0.1, stroke: false }}
          />

          {/* লোকেশন বদলালে অটো জুম ও সেন্টার করার কম্পোনেন্ট */}
          <RecenterMap lat={position.lat} lng={position.lng} isFirstLoad={isFirstLoad.current} />
        </MapContainer>
      </div>
    </div>
  );
}

