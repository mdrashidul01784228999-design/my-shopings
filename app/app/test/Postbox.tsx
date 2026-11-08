"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function PostInput() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 AI Image Generate (Fixed: Explicit string typing added)
  const generateImage = async (prompt: string) => {
    try {
      setLoading(true);

      const res = await fetch("/api/ai-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      return data.image;
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Submit
  const handleSubmit = async () => {
    if (!text.trim()) return;

    let image = "";

    // 👉 যদি image না থাকে → AI generate
    image = await generateImage(text);

    const newPost = {
      id: Date.now(),
      user: "You",
      time: "Just now",
      post: text,
      image: image,
    };

    console.log("Post published:", newPost);
    setText("");
  };

  return (
    <div className="w-full sm:w-[500px] bg-black/60 border border-cyan-400 rounded-2xl p-3 
    shadow-[0_0_20px_#0ff,inset_0_0_10px_#0ff]">

      <div className="flex items-center gap-2">

        {/* Profile */}
        <img
          src="https://i.pravatar.cc/100"
          className="w-10 h-10 rounded-full border border-cyan-400"
          alt="User Profile avatar"
        />

        {/* Input */}
        <input
          type="text"
          placeholder="Write a post..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-full outline-none"
        />

        {/* Send Icon */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="p-2 rounded-full bg-pink-600 hover:scale-110 transition flex items-center justify-center min-w-[34px] min-h-[34px]"
        >
          {loading ? "⏳" : <Send size={18} className="text-white" />}
        </button>

      </div>
    </div>
  );
}

