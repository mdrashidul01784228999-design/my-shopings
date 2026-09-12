"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Api from "../../api/Api";

// --- কাস্টম চমৎকার এসভিজি আইকনসমূহ ---
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="2 2 20 20" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.085l-.04.04m-2.137.351V18a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-4.875c0-.621-.504-1.125-1.125-1.125h-2.25a1.125 1.125 0 00-1.125 1.125zM12 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string;
  description: string;
  seoTitle: string;
  imageUrl: string;
  status: boolean;
  highlightType?: string;
  tags?: string[];
}

const INITIAL_CATEGORIES: Category[] = [
  // পূর্বের ক্যাটাগরিগুলো
  { id: "1", name: "সর্বশেষ", slug: "latest", parentId: "", description: "মুহূর্তের সব তাজা ও ব্রেকিং নিউজ সবার আগে", seoTitle: "সর্বশেষ সংবাদ | ব্রেকিং নিউজ ও তাজা খবর", imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "top-news", tags: ["ব্রেকিং", "তাজা"] },
  { id: "2", name: "বাংলাদেশ", slug: "bangladesh", parentId: "", description: "সারা দেশের সব প্রান্তের খবর এবং সমসাময়িক ঘটনা", seoTitle: "বাংলাদেশ সংবাদ | দেশের সব সর্বশেষ খবর", imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["দেশ"] },
  { id: "3", name: "রাজনীতি", slug: "politics", parentId: "", description: "জাতীয় ও স্থানীয় রাজনীতির গরম খবর এবং রাজনৈতিক বিশ্লেষণ", seoTitle: "রাজনৈতিক খবর | রাজনীতি ও দলীয় আপডেট", imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "hilight", tags: ["ভোট", "দল"] },
  { id: "4", name: "বিশ্ব", slug: "world", parentId: "", description: "আন্তর্জাতিক অঙ্গনের খবরাখবর, যুদ্ধ, চুক্তি এবং বিশ্ব রাজনীতি", seoTitle: "আন্তর্জাতিক সংবাদ | বিশ্ব রাজনীতি ও বৈশ্বিক খবর", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["গ্লোবাল"] },
  { id: "5", name: "বাণিজ্য", slug: "business", parentId: "", description: "শেয়ার বাজার, ব্যবসা-বাণিজ্য, অর্থনীতি ও বাজেটের খবর", seoTitle: "অর্থনীতি ও বাণিজ্য | শেয়ার বাজার ও ব্যবসার খবর", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["টাকা", "বাজার"] },
  { id: "6", name: "মতামত", slug: "opinion", parentId: "", description: "বিশিষ্ট কলামিস্টদের কলাম, সম্পাদকীয় ও মুক্ত মতামত", seoTitle: "মতামত ও বিশ্লেষণ | কলাম ও সম্পাদকীয়", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["কলাম"] },
  { id: "7", name: "খেলা", slug: "sports", parentId: "", description: "ক্রিকেট, ফুটবলসহ দেশ-বিদেশের সব খেলার আপডেট ও লাইভ স্কোর", seoTitle: "খেলাধুলার খবর | লাইভ স্কোর ও খেলার সময়সূচী", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "hilight-new", tags: ["ক্রিকেট", "ফুটবল"] },
  { id: "8", name: "বিনোদন", slug: "entertainment", parentId: "", description: "চলচ্চিত্র, নাটক, ওটিটি, গান এবং শোবিজ তারকাদের খবর", seoTitle: "বিনোদন জগত | সিনেমা রিভিউ ও তারকাদের গসিপ", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["সিনেমা", "তারকা"] },
  { id: "9", name: "ধর্ম", slug: "religion", parentId: "", description: "দেশ-বিদেশের ইসলাম ও অন্যান্য ধর্মের খবর, বাণী ও সমসাময়িক বিষয়", seoTitle: "ধর্ম ও জীবন | ইসলামিক ও ধর্মীয় সর্বশেষ সংবাদ", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["ইসলাম", "নামাজ"] },
  { id: "10", name: "চাকরি", slug: "jobs", parentId: "", description: "সরকারি-বেসরকারি চাকরির বিজ্ঞপ্তি, ক্যারিয়ার গাইড ও নিয়োগ পরীক্ষা", seoTitle: "চাকরির বিজ্ঞপ্তি | নিয়োগ পরীক্ষা ও ক্যারিয়ার টিপস", imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "more-new", tags: ["নিয়োগ", "ক্যারিয়ার"] },
  { id: "11", name: "জীবনযাপন", slug: "lifestyle", parentId: "", description: "স্বাস্থ্য, ফ্যাশন, রেসিپی, ভ্রমণ এবং দৈনন্দিন লাইফস্টাইল", seoTitle: "লাইফস্টাইল ও জীবনযাপন | স্বাস্থ্য ও রূপচর্চা টিপস", imageUrl: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["টিপস"] },
  { id: "12", name: "ভিডিও", slug: "video", parentId: "", description: "গুরুত্বপূর্ণ ঘটনার ভিডিও report, টকশো এবং এক্সক্লুসিভ ক্লিপস", seoTitle: "ভিডিও গ্যালারি | বিশেষ প্রতিবেদন ও ভিডিও সংবাদ", imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["লাইভ"] },
  
  // নতুন যোগ করা ক্যাটাগরিগুলো
  { id: "13", name: "জাতীয়", slug: "national", parentId: "", description: "দেশের গুরুত্বপূর্ণ জাতীয় সংবাদ", seoTitle: "জাতীয় সংবাদ | দেশজুড়ে খবর", imageUrl: "", status: true, highlightType: "normal", tags: ["জাতীয়"] },
  { id: "14", name: "আন্তর্জাতিক", slug: "international", parentId: "", description: "বিশ্বের গুরুত্বপূর্ণ সব খবর", seoTitle: "আন্তর্জাতিক সংবাদ | বিশ্ব খবর", imageUrl: "", status: true, highlightType: "normal", tags: ["আন্তর্জাতিক"] },
  
  { id: "16", name: "প্রযুক্তি", slug: "technology", parentId: "", description: "প্রযুক্তি বিশ্বের নতুন সব খবর", seoTitle: "প্রযুক্তি সংবাদ | গ্যাজেট ও সফটওয়্যার", imageUrl: "", status: true, highlightType: "normal", tags: ["প্রযুক্তি"] },
  { id: "17", name: "অর্থনীতি", slug: "economy", parentId: "", description: "অর্থনৈতিক উন্নয়ন ও ব্যবসার খবর", seoTitle: "অর্থনীতি | ব্যবসা ও বাণিজ্য", imageUrl: "", status: true, highlightType: "normal", tags: ["অর্থনীতি"] },
  { id: "18", name: "স্বাস্থ্য", slug: "health", parentId: "", description: "স্বাস্থ্য টিপস ও চিকিৎসা সংক্রান্ত খবর", seoTitle: "স্বাস্থ্য ও চিকিৎসা | জীবনধারা", imageUrl: "", status: true, highlightType: "normal", tags: ["স্বাস্থ্য"] },
  { id: "19", name: "বিজ্ঞান", slug: "science", parentId: "", description: "বিজ্ঞান ও প্রযুক্তির আবিষ্কার", seoTitle: "বিজ্ঞান সংবাদ | বিজ্ঞান ও মহাকাশ", imageUrl: "", status: true, highlightType: "normal", tags: ["বিজ্ঞান"] },
];


// const INITIAL_CATEGORIES: Category[] = [
//   { id: "1", name: "সর্বশেষ", slug: "latest", parentId: "", description: "মুহূর্তের সব তাজা ও ব্রেকিং নিউজ সবার আগে", seoTitle: "সর্বশেষ সংবাদ | ব্রেকিং নিউজ ও তাজা খবর", imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "top-news", tags: ["ব্রেকিং", "তাজা"] },
//   { id: "2", name: "বাংলাদেশ", slug: "bangladesh", parentId: "", description: "সারা দেশের সব প্রান্তের খবর এবং সমসাময়িক ঘটনা", seoTitle: "বাংলাদেশ সংবাদ | দেশের সব সর্বশেষ খবর", imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["দেশ"] },
//   { id: "3", name: "রাজনীতি", slug: "politics", parentId: "", description: "জাতীয় ও স্থানীয় রাজনীতির গরম খবর এবং রাজনৈতিক বিশ্লেষণ", seoTitle: "রাজনৈতিক খবর | রাজনীতি ও দলীয় আপডেট", imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "hilight", tags: ["ভোট", "দল"] },
//   { id: "4", name: "বিশ্ব", slug: "world", parentId: "", description: "আন্তর্জাতিক অঙ্গনের খবরাখবর, যুদ্ধ, চুক্তি এবং বিশ্ব রাজনীতি", seoTitle: "আন্তর্জাতিক সংবাদ | বিশ্ব রাজনীতি ও বৈশ্বিক খবর", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["গ্লোবাল"] },
//   { id: "5", name: "বাণিজ্য", slug: "business", parentId: "", description: "শেয়ার বাজার, ব্যবসা-বাণিজ্য, অর্থনীতি ও বাজেটের খবর", seoTitle: "অর্থনীতি ও বাণিজ্য | শেয়ার বাজার ও ব্যবসার খবর", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["টাকা", "বাজার"] },
//   { id: "6", name: "মতামত", slug: "opinion", parentId: "", description: "বিশিষ্ট কলামিস্টদের কলাম, সম্পাদকীয় ও মুক্ত মতামত", seoTitle: "মতামত ও বিশ্লেষণ | কলাম ও সম্পাদকীয়", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["কলাম"] },
//   { id: "7", name: "খেলা", slug: "sports", parentId: "", description: "ক্রিকেট, ফুটবলসহ দেশ-বিদেশের সব খেলার আপডেট ও লাইভ স্কোর", seoTitle: "খেলাধুলার খবর | লাইভ স্কোর ও খেলার সময়সূচী", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "hilight-new", tags: ["ক্রিকেট", "ফুটবল"] },
//   { id: "8", name: "বিনোদন", slug: "entertainment", parentId: "", description: "চলচ্চিত্র, নাটক, ওটিটি, গান এবং শোবিজ তারকাদের খবর", seoTitle: "বিনোদন জগত | সিনেমা রিভিউ ও তারকাদের গসিপ", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["সিনেমা", "তারকা"] },
//   { id: "9", name: "ধর্ম", slug: "religion", parentId: "", description: "দেশ-বিদেশের ইসলাম ও অন্যান্য ধর্মের খবর, বাণী ও সমসাময়িক বিষয়", seoTitle: "ধর্ম ও জীবন | ইসলামিক ও ধর্মীয় সর্বশেষ সংবাদ", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["ইসলাম", "নামাজ"] },
//   { id: "10", name: "চাকরি", slug: "jobs", parentId: "", description: "সরকারি-বেসরকারি চাকরির বিজ্ঞপ্তি, ক্যারিয়ার গাইড ও নিয়োগ পরীক্ষা", seoTitle: "চাকরির বিজ্ঞপ্তি | নিয়োগ পরীক্ষা ও ক্যারিয়ার টিপস", imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "more-new", tags: ["নিয়োগ", "ক্যারিয়ার"] },
//   { id: "11", name: "জীবনযাপন", slug: "lifestyle", parentId: "", description: "স্বাস্থ্য, ফ্যাশন, রেসিپی, ভ্রমণ এবং দৈনন্দিন লাইফস্টাইল", seoTitle: "লাইফস্টাইল ও জীবনযাপন | স্বাস্থ্য ও রূপচর্চা টিপস", imageUrl: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["টিপস"] },
//   { id: "12", name: "ভিডিও", slug: "video", parentId: "", description: "গুরুত্বপূর্ণ ঘটনার ভিডিও report, টকশো এবং এক্সক্লুসিভ ক্লিপস", seoTitle: "ভিডিও গ্যালারি | বিশেষ প্রতিবেদন ও ভিডিও সংবাদ", imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=150&auto=format&fit=crop&q=60", status: true, highlightType: "normal", tags: ["লাইভ"] },
// ];

export default function App() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [description, setDescription] = useState("");
  const [highlightType, setHighlightType] = useState("normal");
  
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // --- ইমেজ সিলেকশন টাইপ স্টেট (file অথবা link) ---
  const [imageSourceType, setImageSourceType] = useState<"file" | "link">("file");
  const [imageUrlInput, setImageUrlInput] = useState(""); // সরাসরি ইমেজ লিংকের জন্য স্টেট

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [username, setUsername] = useState("set-img");
  const [userimglocalstoreage, setuserImgs] = useState("");
  const [userid, setUserid] = useState("0");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('userData') || '[]');
      if (userData[0]) {
        setUsername(userData[0].name || 'set-img');
        setuserImgs(userData[0].img || '');
        setUserid(userData[0].id || '55');
      }
    }
  }, []);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagInput.trim().replace(/,/g, "");
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
        setTagInput("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const triggerToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    const formattedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9\u0980-\u09ff\s-]/g, "") 
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(formattedSlug);

    if (value) {
      setSeoTitle(`${value} খবর | সর্বশেষ সংবাদ ও লাইভ আপডেট`);
    } else {
      setSeoTitle("");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast("error", "ছবির সাইজ অবশ্যই ২ মেগাবাইটের কম হতে হবে!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast("error", "ছবির সাইজ ২ মেগাবাইটের কম হতে হবে!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleStatusToggle = (id: string) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, status: !cat.status } : cat))
    );
    triggerToast("success", "ক্যাটাগরি স্ট্যাটাস পরিবর্তন করা হয়েছে!");
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    triggerToast("success", "ক্যাটাগরি সফলভাবে ডিলেট করা হয়েছে!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      triggerToast("error", "ক্যাটাগরির নাম এবং স্ল্যাগ অবশ্যই দিতে হবে!");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("parentId", parentId || "");
    formData.append("seoTitle", seoTitle || `${name} - খবর`);
    formData.append("description", description || "কোনো বিবরণ দেওয়া হয়নি।");
    formData.append("highlightType", highlightType);
    formData.append("userid", userid);
    formData.append("tags", JSON.stringify(tags));
    formData.append("imageUrlInput", imageUrlInput);
 
    formData.append("imageSourceType", imageSourceType); // file অথবা link পাঠানো হচ্ছে

    // ইমেজ সোর্স টাইপ অনুযায়ী ডেটা সেট করা হচ্ছে
    if (imageSourceType === "file" && imageFile) {
      formData.append("image", imageFile);
    } else if (imageSourceType === "link" && imageUrlInput) {
      formData.append("imageUrlInput", imageUrlInput);
    }

    try {





      const response = await Api.post("/Pepar_add_data", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // চূড়ান্ত ইমেজ ইউআরএল নির্ধারণ লজিক
      const finalImageUrl = imageSourceType === "link" && imageUrlInput
        ? imageUrlInput 
        : (response.data.imageUrl || imagePreview || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150");

      const newCategory: Category = {
        id: response.data.id || String(Date.now()),
        name: response.data.name || name,
        slug: response.data.slug || slug,
        parentId: response.data.parentId || parentId || "",
        description: response.data.description || description || "কোনো বিবরণ দেওয়া হয়নি।",
        seoTitle: response.data.seoTitle || seoTitle || `${name} - খবর`,
        imageUrl: finalImageUrl,
        status: true,
        highlightType: response.data.highlightType || highlightType,
        tags: response.data.tags || tags,
      };

      

      

      setCategories(prev => [newCategory, ...prev]);
      triggerToast("success", "ক্যাটাগরি সফলভাবে ডাটাবেসে যুক্ত হয়েছে!");

      // ফর্ম রিসেট
      setName("");
      setSlug("");
      setParentId("");
      setSeoTitle("");
      setDescription("");
      setHighlightType("normal");
      setTags([]);
      setImageUrlInput("");
      clearImage();
    } catch (err) {
      triggerToast("error", "ডাটা সেভ করতে ব্যর্থ হয়েছে!");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHighlightLabel = (type?: string) => {
    switch (type) {
      case "hilight": return "Highlight";
      case "hilight-new": return "Highlight New";
      case "top-news": return "Top News";
      case "more-new": return "10 More New";
      default: return "Normal";
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300" 
            : "bg-rose-950/90 border-rose-500/40 text-rose-300"
        }`}>
          {toast.type === "success" ? <CheckIcon /> : <InfoIcon />}
          <p className="text-sm font-semibold">{toast.text}</p>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
                নিউজ পোর্টাল অ্যাডমিন
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              ক্যাটাগরি ম্যানেজমেন্ট সেন্টার
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              পোর্টালের সমস্ত মেইন মেনু, সাব-মেনু, ডেসক্রিপশন এবং কাভার ইমেজ সহজে কাস্টমাইজ করুন।
            </p>
          </div>

          {/* User Profile Layout */}
          <div className="flex items-center gap-4 bg-[#0b0f19] border border-slate-800/60 p-3 rounded-2xl shadow-lg self-start md:self-auto">
            <div className="relative w-12 h-12">
              <img 
                src={
                  userimglocalstoreage
                    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}/profile_users/${userimglocalstoreage}` 
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`
                } 
                className="w-full h-full rounded-full object-cover border-2 border-emerald-500/30" 
                alt="profile" 
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0b0f19] rounded-full"></span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">{username}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-md">
                  ID: #{userid}
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-1.5 py-0.5 rounded">Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT Form */}
          <form 
            onSubmit={handleSubmit} 
            className="lg:col-span-5 bg-[#0b0f19] border border-slate-850 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>

            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <span className="text-emerald-400"><PlusIcon /></span>
              <h2 className="text-lg font-bold text-white">নতুন ক্যাটাগরি যোগ করুন</h2>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
                ক্যাটাগরির নাম <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                className="w-full bg-[#050811] border border-slate-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all text-sm focus:ring-1 focus:ring-emerald-500/30"
                placeholder="যেমন: খেলাধুলা, রাজনীতি, বিনোদন..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
                ক্যাটাগরি ডিসপ্লে টাইপ
              </label>
              <select
                value={highlightType}
                onChange={(e) => setHighlightType(e.target.value)}
                className="w-full bg-[#050811] border border-slate-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-slate-300 outline-none transition-all text-sm cursor-pointer focus:ring-1 focus:ring-emerald-500/30 appearance-none"
              >
                <option value="normal">Normal (সাধারণ মেনু)</option>
                <option value="hilight">Highlight (হাইলাইট)</option>
                <option value="hilight-new">Highlight New (হাইলাইট নিউ)</option>
                <option value="top-news">Top News (টপ নিউজ)</option>
                <option value="more-new">10 More New (১০ মোর নিউ)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
                ক্যাটাগরি ট্যাগস (Multiple Tags)
              </label>
              <div className="w-full bg-[#050811] border border-slate-800 focus-within:border-emerald-500/80 rounded-xl p-2 transition-all flex flex-wrap gap-2 items-center min-h-[46px]">
                {tags.map((tag, index) => (
                  <span key={index} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold pl-2.5 pr-1 py-1 rounded-lg flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(index)} className="w-4 h-4 rounded-full hover:bg-emerald-500/20 flex items-center justify-center text-[14px] font-bold text-emerald-400">
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-white text-sm min-w-[120px]"
                  placeholder={tags.length === 0 ? "ট্যাগ লিখে Enter বা কমা দিন..." : "আরো ট্যাগ..."}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
                স্ল্যাগ (URL Slug) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-"))}
                className="w-full bg-[#050811] border border-slate-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all text-sm font-mono focus:ring-1 focus:ring-emerald-500/30"
                placeholder="sports, politics..."
              />
            </div>

            {/* --- ইমেজ সোর্স টাইপ সিলেক্টর (File বা Link যেকোনো ১টি) --- */}
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
                কাভার ইমেজ আপলোড মেথড
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#050811] border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageSourceType("file")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    imageSourceType === "file"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ফাইল আপলোড করুন
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceType("link")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    imageSourceType === "link"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ইমেজ লিংক (URL) দিন
                </button>
              </div>
            </div>

            {/* মেথড অনুযায়ী ডাইনামিক ইনপুট ফিল্ড শো */}
            <div className="space-y-1.5">
              {imageSourceType === "file" ? (
                <>
                  {!imagePreview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("hidden-file-input")?.click()}
                      className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-[#050811] hover:bg-slate-900/40 rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group"
                    >
                      <div className="text-slate-500 group-hover:text-emerald-400 mb-2 transition-colors duration-200 flex justify-center">
                        <UploadIcon />
                      </div>
                      <span className="block text-xs font-semibold text-slate-300 mb-1">
                        ছবি আপলোড করতে ক্লিক করুন বা ফাইল ড্র্যাগ করুন
                      </span>
                      <input
                        id="hidden-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  ) : (
                    <div className="relative border border-slate-800 bg-[#050811] rounded-xl p-3 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-950">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">
                          {imageFile ? imageFile.name : "Uploaded Asset"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 rounded-lg transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all text-sm focus:ring-1 focus:ring-emerald-500/30"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
                প্যারেন্ট ক্যাটাগরি (সাব-ক্যাটাগরির জন্য)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full bg-[#050811] border border-slate-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-slate-300 outline-none transition-all text-sm cursor-pointer focus:ring-1 focus:ring-emerald-500/30 appearance-none"
              >
                <option value="">-- এটি একটি প্রধান (Parent) ক্যাটাগরি --</option>
                {categories.filter(c => !c.parentId).map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
                এসইও মেটা টাইটেল
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full bg-[#050811] border border-slate-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all text-sm focus:ring-1 focus:ring-emerald-500/30"
                placeholder="সার্চ ইঞ্জিনে দেখানোর জন্য কাস্টম টাইটেল..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
                সংक्षिप्त বিবরণ (Description)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#050811] border border-slate-800 focus:border-emerald-500/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all text-sm resize-none focus:ring-1 focus:ring-emerald-500/30"
                placeholder="ক্যাটাগরি সম্পর্কে কিছু বাক্য লিখুন..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                isSubmitting 
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-emerald-950/20"
              }`}
            >
              {isSubmitting ? "ডাটা সেভ হচ্ছে..." : "ক্যাটাগরি ডাটা সেভ করুন"}
            </button>
          </form>

          {/* RIGHT List */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Search Box */}
            <div className="bg-[#0b0f19] border border-slate-850 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute left-3 top-2.5 text-slate-500"><SearchIcon /></span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#050811] border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-600 outline-none text-xs transition-all"
                  placeholder="ক্যাটাগরির নাম বা স্ল্যাগ খুঁজুন..."
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>মোট ক্যাটাগরি: <strong className="text-emerald-400">{categories.length}</strong></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                <span>একটিভ: <strong className="text-teal-400">{categories.filter(c => c.status).length}</strong></span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#0b0f19] border border-slate-850 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#050811]/90 text-slate-400 border-b border-slate-800/80 text-[11px] font-bold tracking-wider uppercase">
                      <th className="py-3 px-5">কাভার ও নাম</th>
                      <th className="py-3 px-5">স্ল্যাগ</th>
                      <th className="py-3 px-5">ডিসপ্লে টাইপ</th>
                      <th className="py-3 px-5 text-center">স্ট্যাটাস</th>
                      <th className="py-3 px-5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => {
                        return (
                          <tr key={cat.id} className="hover:bg-slate-900/30 transition-colors group">
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex-shrink-0">
                                  <img 
                                    src={cat.imageUrl} 
                                    alt={cat.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-white text-sm md:text-base block truncate">
                                    {cat.name}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-5 text-xs font-mono text-slate-400">
                              /{cat.slug}
                            </td>

                            <td className="py-3 px-5">
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                                cat.highlightType === "hilight" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                cat.highlightType === "hilight-new" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                                cat.highlightType === "top-news" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                cat.highlightType === "more-new" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                "bg-slate-800 border-slate-700 text-slate-400"
                              }`}>
                                {getHighlightLabel(cat.highlightType)}
                              </span>
                            </td>

                            <td className="py-3 px-5 text-center">
                              <button
                                type="button"
                                onClick={() => handleStatusToggle(cat.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                                  cat.status 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" 
                                    : "bg-slate-800 text-slate-500 border border-slate-700/60 hover:bg-slate-700/50"
                                }`}
                              >
                                {cat.status ? "Active" : "Inactive"}
                              </button>
                            </td>

                            <td className="py-3 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCategory(cat)}
                                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-all"
                                >
                                  <InfoIcon />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-950/20 rounded-lg transition-all"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                          কোনো ক্যাটাগরি খুঁজে পাওয়া যায়নি!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Showcase Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            
            <button 
              onClick={() => setSelectedCategory(null)}
              className="absolute top-4 right-4 p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <CloseIcon />
            </button>

            <div className="flex items-center gap-4 pb-2 border-b border-slate-800">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0">
                <img src={selectedCategory.imageUrl} alt={selectedCategory.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Category Details</span>
                <h3 className="text-xl font-bold text-white">{selectedCategory.name}</h3>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 block text-xs font-semibold uppercase">URL Slug</span>
                <p className="font-mono text-slate-300 mt-0.5">/category/{selectedCategory.slug}</p>
              </div>

              <div>
                <span className="text-slate-500 block text-xs font-semibold uppercase">Display Type</span>
                <p className="text-slate-300 mt-0.5 font-semibold text-emerald-400">{getHighlightLabel(selectedCategory.highlightType)}</p>
              </div>

              {selectedCategory.tags && selectedCategory.tags.length > 0 && (
                <div>
                  <span className="text-slate-500 block text-xs font-semibold uppercase mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory.tags.map((t, idx) => (
                      <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-500 block text-xs font-semibold uppercase">SEO Meta Title</span>
                <p className="text-slate-300 mt-0.5">{selectedCategory.seoTitle || "কোনো মেটা টাইটেল সেট করা নেই।"}</p>
              </div>

              <div>
                <span className="text-slate-500 block text-xs font-semibold uppercase">Description</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">{selectedCategory.description}</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


