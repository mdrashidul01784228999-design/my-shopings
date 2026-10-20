import axios from 'axios';

export const http = axios.create({ baseURL: '/api', timeout: 120000 });

/* ডাটাবেস থেকে দোকান+পণ্য আনা */
export const getShops = async () => (await http.get('/shops')).data.shops as any[];
/* পুরো তালিকা সেভ */
export const saveShops = async (shops: unknown[]) => (await http.put('/shops', { shops })).data;
/* shops.json/products.json ধরনের ডেটা আপলোড (replace=true হলে আগের সব মুছে যায়) */
export const importData = async (data: unknown, replace = false) => (await http.post('/import', data, { params: { replace: replace ? 1 : 0 } })).data;
/* ছবি আপলোড → URL ফেরত */
export const uploadImage = async (file: File) => {
  const fd = new FormData(); fd.append('file', file);
  return (await http.post('/upload', fd)).data.url as string;
};


