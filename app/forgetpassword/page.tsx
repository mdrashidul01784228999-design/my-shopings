
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Password reset link sent to your email ✅");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
      >
        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Forgot Password 🔐
        </h2>
        <p className="text-white/80 text-center mb-6 text-sm">
          Enter your email to receive a reset link
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-white/70" size={18} />
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-white text-purple-600 font-semibold py-3 rounded-xl shadow-lg hover:bg-gray-100 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
            <ArrowRight size={18} />
          </motion.button>
        </form>

        {/* Back to login */}
        <p className="text-center text-white/80 text-sm mt-6">
          Remember password? 
          <a href="/Login" className="text-white font-semibold hover:underline">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}

