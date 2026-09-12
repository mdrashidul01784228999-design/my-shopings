import { useEffect, useState } from "react";
import Api from "../api/Api";

export const usePeparIndex = () => {
  const [data, setData] = useState(null); // শুরু হবে null দিয়ে
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Api.get('/peparindex');
        // আপনার API স্ট্রাকচার অনুযায়ী response.data.data সেট করুন
        setData(response.data.data); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading };
};
