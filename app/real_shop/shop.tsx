import axios from 'axios';

// কোনো টাইপ ইন্টারফেস ছাড়া যেকোনো ধরনের Raw Data রিসিভ করার জন্য 'any' বা 'unknown' ব্যবহার করা হয়
const API_URL = 'http://localhost:8000/api/versual_shop'; // উদাহরণস্বরূপ একটি API

async function getRawJsonData() {
  try {
    // Axios দিয়ে GET রিকোয়েস্ট পাঠানো
    const response = await axios.get(API_URL);

    // ১. Axios নিজেই রিমোট রেসপন্সকে স্বয়ংক্রিয়ভাবে JSON-এ পার্স করে `response.data`-তে রেখে দেয়।
    const rawJsonData = response.data;

    // ২. Raw Data কনসোলে প্রিন্ট করা (অরিজিনাল ফরম্যাটে)
    console.log('--- RAW JSON DATA ---');
    console.log(rawJsonData);

    // ৩. যদি একদম রও টেক্সট বা স্ট্রিং (Raw String) আকারে দেখতে চান:
    console.log('--- RAW JSON STRINGIFY FORMAT ---');
    console.log(JSON.stringify(rawJsonData, null, 2));

    return rawJsonData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Message:', error.message);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

// ফাংশনটি রান করা
getRawJsonData();