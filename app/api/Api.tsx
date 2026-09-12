// lib/Api.ts
import axios from "axios";

// 🔗 Laravel API Base Instance
const Api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api", 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =====================
   📦 Item APIs
   ===================== */

// ✅ GET (সব ডাটা আনা)
export const getItems = async () => {
  const { data } = await Api.get(`/get_all_product_brandName/`);
  return data;
};

// ✅ GET (একটা ডাটা আনা by ID)
export const getItemById = async (id: number | string) => {
  const { data } = await Api.get(`/items/${id}`);
  return data;
};











// ✅ GET (একটা ডাটা আনা by ID)
export const getwallate = async (id: number | string) => {
  const { data } = await Api.get(`/getwallates/${id}`);
  return data;
};


// ✅ POST (নতুন আইটেম তৈরি করা)
export const createItem = async (data: any) => {
  const { data: res } = await Api.post("/items", data);
  return res;
};

// ✅ PUT (ডাটা আপডেট করা by ID)
export const updateItem = async (id: number | string, data: any) => {
  const { data: res } = await Api.put(`/items/${id}`, data);
  return res;
};

// ✅ DELETE (ডাটা ডিলিট করা by ID)
export const deleteItem = async (id: number | string) => {
  const { data: res } = await Api.delete(`/items/${id}`);
  return res;
};

/* =====================
   🪙 Wallet & Coin APIs
   ===================== */

// ✅ Add Coin
export const addCoin = async (data: any) => {
  const { data: res } = await Api.post("/add_coin", data);
  return res;
};

// ✅ Get Coin
export const getCoin = async (data: any) => {
  const { data: res } = await Api.post("/coin_get", data);
  return res;
};

// ✅ Wallet Get
export const getWallet = async (data: any) => {
  const { data: res } = await Api.post("/wallate_get", data);
  return res;
};






// ✅ GET (একটা ডাটা আনা by ID)
export const getorder_by_id = async (id: number | string) => {
  const { data } = await Api.get(`/order_card_get/${id}`);
  return data;
};






export default Api;






// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:8000/api",
// });

// export const getProducts = () => API.get("/products");
// export const getProduct = (slug) => API.get(`/products/${slug}`);