

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BsCheckCircleFill } from 'react-icons/bs'
import { Typewriter } from 'react-simple-typewriter'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Api from '../../api/Api'

export default function HoldToConfirmButton() {
  const [alldatasent, setAllCartdata] = useState<any[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [progress, setProgress] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [getid, setUserid] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isSubmitting = useRef(false) // ডুপ্লিকেট সাবমিশন রোধ করার জন্য এটি যোগ করা হয়েছে
  const router = useRouter()

  

  

  useEffect(() => {
    const storedData = localStorage.getItem('cart-storage')
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      const cartItems = parsedData?.state?.items || parsedData?.state?.cart || []
      setAllCartdata(cartItems)
    }

    const userData = JSON.parse(localStorage.getItem("userData") || "[]")
    if (userData[0]) {
      setUserid(userData[0].id || null)  
    




      
    }
  }, [])

  // Redirect Countdown
  useEffect(() => {
    if (count === null) return
    if (count <= 0) {
      setShowPopup(false)
      localStorage.removeItem('cart-storage')
      router.push('/')
      return
    }
    const timer = setTimeout(() => setCount(count - 1), 1000)
    return () => clearTimeout(timer)
  }, [count, router])

  // Improved Submit Function
  const handleSubmit = async (items: any[]) => {
    // যদি অলরেডি সাবমিশন প্রসেস চালু থাকে, তবে দ্বিতীয়বার কাজ করবে না
    if (isSubmitting.current) return; 
    
    if (!items || items.length === 0) {
      toast.error('আপনার কার্ট খালি!')
      setConfirmed(false)
      setProgress(0)
      return
    }

    setLoading(true)
    isSubmitting.current = true; // সাবমিশন শুরু হলো

    try {
      // Loop through items
      for (const item of items) {
        toast(`প্রসেসিং: ${item.name}`, { icon: '⏳' });

console.log('============');
console.log(item);
console.log();




        const res = await Api.post('/order_card', {
          user_id: getid,
            items: [item], 
          status: 'pending'
        })




  console.log(`or: ${item.name}`)






        if (res.status === 200 || res.status === 201) {
          console.log(`Success for: ${item.name}`)




        }
      }

      localStorage.removeItem('cart-storage')
      toast.success('সবগুলো অর্ডার সম্পন্ন হয়েছে ✅')
      setCount(10)
      setShowPopup(true)
    } catch (err) {
      console.error('Submission Error:', err)
      toast.error('কিছু অর্ডার ব্যর্থ হয়েছে। আবার চেষ্টা করুন।')


      
      setConfirmed(false)
      setProgress(0)
      isSubmitting.current = false; // এরর হলে আবার সাবমিট করার সুযোগ দেয়া হলো
    } finally {
      setLoading(false)
    }
  }

  const handleHoldStart = () => {
    if (confirmed || loading || isSubmitting.current) return
    
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          if (!isSubmitting.current) {
             setConfirmed(true)
             handleSubmit(alldatasent)
          }
          return 100
        }
        return prev + 2
      })
    }, 30)
  }

  const handleHoldEnd = () => {
    if (!confirmed) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setProgress(0)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6 mt-10">
      {!confirmed ? (
        <div className="text-center">
          <p className="mb-4 text-gray-400 text-sm">অর্ডার কনফার্ম করতে চেপে ধরে রাখুন</p>
          <motion.button
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 text-white shadow-xl text-lg font-bold overflow-hidden outline-none"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 flex items-center justify-center z-10">
              {loading ? "..." : progress > 0 ? `${progress}%` : 'HOLD'}
            </div>
            <motion.div
              className="absolute bottom-0 left-0 w-full bg-white/30 z-0"
              initial={{ height: 0 }}
              animate={{ height: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          {showPopup && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="p-8 rounded-2xl shadow-2xl text-center bg-gray-900 text-white border border-gray-700 max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Redirecting to Home</h2>
                <div className="relative flex items-center justify-center">
                  <p className="text-7xl font-mono text-pink-500 animate-pulse">{count}</p>
                </div>
                <p className="mt-4 text-gray-400">Please wait while we redirect you...</p>
              </div>
            </div>
          )}

          <BsCheckCircleFill className="text-green-400 text-6xl mx-auto animate-bounce" />
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">অর্ডার সফল হয়েছে!</p>
            <div className="text-lg text-gray-300 h-12">
              <Typewriter
                words={['ধন্যবাদ আপনার অর্ডারের জন্য!', 'আমরা খুব শীঘ্রই যোগাযোগ করব।']}
                loop={0}
                cursor
                cursorStyle="_"
                typeSpeed={60}
                deleteSpeed={40}
                delaySpeed={2000}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

