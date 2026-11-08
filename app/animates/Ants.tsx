'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  walletService,
  getStoredUserId,
  saveCoinLocally,
  getErrorMessage,
  hasClaimedToday,
  markClaimedToday,
  type UserId,
} from '../api/Waltelconisave';

/* ---------- Config ---------- */

const CLICKS_TO_REWARD = 5;
const REWARD_COIN = 200;
const FLY_DURATION_MS = 1000;
const COIN_SYNC_INTERVAL_MS = 5000;

const CREATURES = [
  { id: 1, image: '/Icon/butterfly-11465_512.gif', speed: 5500 },
  { id: 4, image: '/Icon/wasp-12292_512.gif', speed: 9000 },
  { id: 7, image: '/Icon/ladybug-5068_512.gif', speed: 4500 },
  { id: 10, image: '/Icon/butterfly-4437_512.gif', speed: 8300 },
];

const getRandomPosition = () => ({
  top: `${Math.random() * 80}vh`,
  left: `${Math.random() * 80}vw`,
});

/* ---------- Coin sync hook (polling with proper cleanup) ---------- */

function useCoinSync(userId: UserId | null) {
  const sync = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) return;
      try {
        const coin = await walletService.getCoin(userId, signal);
        saveCoinLocally(coin);
      } catch (error) {
        if ((error as any)?.name !== 'CanceledError') {
          console.error('Coin sync failed:', getErrorMessage(error));
        }
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    sync(controller.signal); // first load immediately

    const timer = setInterval(() => {
      // don't waste requests when the tab is hidden
      if (document.visibilityState === 'visible') {
        sync(controller.signal);
      }
    }, COIN_SYNC_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [userId, sync]);

  return sync;
}

/* ---------- Creature ---------- */

interface CreatureProps {
  id: number;
  image: string;
  speed: number;
  isFlying: boolean;
  onClick: (id: number) => void;
}

const Creature = ({ id, image, speed, isFlying, onClick }: CreatureProps) => {
  // null on first render => avoids SSR/client hydration mismatch
  const [pos, setPos] = useState<{ top: string; left: string } | null>(null);

  useEffect(() => {
    setPos(getRandomPosition());
    const interval = setInterval(() => setPos(getRandomPosition()), speed);
    return () => clearInterval(interval);
  }, [speed]);

  if (!pos) return null;

  return (
    <motion.img
      src={image}
      alt="creature"
      draggable={false}
      onClick={() => onClick(id)}
      initial={{ scale: 1, opacity: 1 }}
      animate={
        isFlying
          ? { scale: 0.2, opacity: 0, rotate: 360, x: '40vw', y: '-40vh' }
          : { scale: 1, opacity: 1, rotate: 0, x: 0, y: 0 }
      }
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: FLY_DURATION_MS / 1000 }}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: 80,
        height: 80,
        zIndex: 9999,
        cursor: 'pointer',
        userSelect: 'none',
        // position glide (framer-motion handles the rest above)
        transition: `top ${speed / 1000}s linear, left ${speed / 1000}s linear`,
      }}
    />
  );
};

/* ---------- Main component ---------- */

export default function CreatureAnimation() {
  const [userId, setUserId] = useState<UserId | null>(null);
  const [count, setCount] = useState(0);
  const [flyingId, setFlyingId] = useState<number | null>(null);
  // null = not checked yet (prevents a flash of creatures on load)
  const [claimedToday, setClaimedToday] = useState<boolean | null>(null);

  const isSaving = useRef(false); // blocks double reward requests

  // Load user once
  useEffect(() => {
    setUserId(getStoredUserId());
  }, []);

  // Check daily claim now, and re-check every minute so the creatures
  // come back automatically when the next day starts (no reload needed).
  useEffect(() => {
    const check = () => {
      const claimed = hasClaimedToday(userId);
      setClaimedToday(prev => {
        if (prev === true && !claimed) setCount(0); // new day: fresh start
        return claimed;
      });
    };
    check();
    const timer = setInterval(check, 60_000);
    return () => clearInterval(timer);
  }, [userId]);

  const syncCoin = useCoinSync(userId);

  const collectReward = useCallback(async () => {
    if (!userId) {
      toast.error('আয় শুরু করতে আগে লগইন করুন।');
      return false;
    }
    if (isSaving.current) return false;

    isSaving.current = true;
    try {
      const res = await walletService.addCoin(userId, REWARD_COIN);
      if (res?.status === false) {
        toast.error(res.message || 'আজকের কয়েন আগেই নেওয়া হয়েছে।');
        return false;
      }
      toast.success(res?.message || 'আপনাকে স্বাগতম কয়েন সংগ্রহ করার জন্য');
      await syncCoin(); // take the real balance from the server
      return true;
    } catch (error) {
      toast.error(`আপনার কয়েনটি যোগ হচ্ছে না। ${getErrorMessage(error)}`);
      return false;
    } finally {
      isSaving.current = false;
    }
  }, [userId, syncCoin]);

  const handleCreatureClick = useCallback(
    async (id: number) => {
      if (flyingId !== null) return; // ignore clicks during animation

      const newCount = count + 1;
      setFlyingId(id);

      const isRewardClick = newCount >= CLICKS_TO_REWARD;
      if (isRewardClick) {
        const ok = await collectReward();
        if (!ok) {
          // reward failed: keep creatures, keep count, try again next click
          setTimeout(() => setFlyingId(null), FLY_DURATION_MS);
          return;
        }
        setCount(0);
        markClaimedToday(userId!);
        // let the fly animation finish, then hide ALL creatures for today
        setTimeout(() => {
          setFlyingId(null);
          setClaimedToday(true);
        }, FLY_DURATION_MS);
        return;
      }

      setCount(newCount);
      setTimeout(() => setFlyingId(null), FLY_DURATION_MS);
    },
    [count, flyingId, collectReward, userId]
  );

  return (
    <AnimatePresence>
      {claimedToday === false &&
        CREATURES.map(creature => (
        <Creature
          key={creature.id}
          id={creature.id}
          image={creature.image}
          speed={creature.speed}
          isFlying={creature.id === flyingId}
          onClick={handleCreatureClick}
        />
        ))}
    </AnimatePresence>
  );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import Api from '../api/Api';



// // Image paths
// const Iimg1 = '/Icon/butterfly-4437_512.gif';
// const Iimg2 = '/Icon/butterfly-11465_512.gif';
// const Iimg3 = '/Icon/ladybug-5068_512.gif';
// const Iimg4 = '/Icon/wasp-12292_512.gif';

// // Random position
// const getRandomPosition = () => ({
//   top: `${Math.random() * 80}vh`,
//   left: `${Math.random() * 80}vw`,
// });

// // Creature type
// interface CreatureProps {
//   id: number;
//   image: string;
//   speed: number;
//   onClick: (id: number) => void;
//   isFlying: boolean;
// }

// const Creature = ({ id, image, speed, onClick, isFlying }: CreatureProps) => {
//   const [pos, setPos] = useState(getRandomPosition());

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setPos(getRandomPosition());
//     }, speed);
//     return () => clearInterval(interval);
//   }, [speed]);

//   return (
//     <motion.img
//       src={image}
//       alt="creature"
//       onClick={() => onClick(id)}
//       initial={{ scale: 1, opacity: 1 }}
//       animate={
//         isFlying
//           ? {
//               top: '10px',
//               left: 'calc(100% - 60px)',
//               scale: 0.2,
//               opacity: 0,
//               rotate: 360,
//             }
//           : {}
//       }
//       exit={{ opacity: 0, scale: 0 }}
//       transition={{ duration: 1 }}
//       style={{
//         position: 'fixed',
//         top: pos.top,
//         left: pos.left,
//         width: '80px',
//         height: '80px',
//         zIndex: 9999,
//         pointerEvents: 'auto',
//         cursor: 'pointer',
 
//  transition: `top ${speed / 1000}s linear, left ${speed / 1000}s linear`,
//       }}
//     />
//   );
// };

// export default function CreatureAnimation() {


// const [uniid, setUnid] = useState(null)

// const [datetime, setDateTime] = useState('')


//   const [count, setCount] = useState(0);
//   const [removedIds, setRemovedIds] = useState<number[]>([]);
//   const [flyingId, setFlyingId] = useState<number | null>(null);

//   // List of creatures
//   const [creatures] = useState([
//     { id: 1, image: Iimg2, speed: 5500 },

//     { id: 4, image: Iimg4, speed: 9000 },
  
//     { id: 7, image: Iimg3, speed: 4500 },
   
//     { id: 10, image: Iimg1, speed: 8300 },

//   ]);

//   // const handleCreatureClick = (id: number) => {
//   //   const newCount = count + 1;
//   //   setCount(newCount);

//   //   if (newCount === 5) {
//   //     // alert('🎉 তুমি ১০ বার ক্লিক করেছো!');
    
    
    
//   //      // Trigger flying animation for clicked ID
//   //   setFlyingId(id);

//   //   // Remove it after animation ends
//   //   setTimeout(() => {
//   //     setRemovedIds(prev => [...prev, id]);
//   //     setFlyingId(null); // Reset fly state
//   //   }, 1000);

//   //     setCount(0);
//   // }
    
//   //   }

//   const handleCreatureClick = (id: number) => {
//   const newCount = count + 1;
//   setCount(newCount);

//   // ✅ প্রতি ক্লিকে ফ্লাই করবে
//   setFlyingId(id);

//   // ✅ প্রতি ক্লিকেই লোকালহোস্টে ডেটা যাবে
//   // fetch('http://localhost/insert.php', {
//   //   method: 'POST',
//   //   headers: {
//   //     'Content-Type': 'application/json',
//   //   },
//   //   body: JSON.stringify({
//   //     creatureId: id,
//   //     clickNumber: newCount,
//   //     time: new Date().toISOString(),
//   //   }),
//   // });

//   // ✅ ফ্লাই শেষ হলে যদি এটা ৫ম ক্লিক হয়, তাহলে remove করবে
//   if (newCount === 5) {

// Savesdata();


//     setTimeout(() => {
//       setRemovedIds(prev => [...prev, id]);
//       setFlyingId(null); // অ্যানিমেশন শেষ
//     }, 1000); // ফ্লাই অ্যানিমেশনের সময়
//     setCount(0); 
    
    
//       localStorage.setItem("coin", '500');
    
    
//     // ক্লিক কাউন্ট রিসেট
//   } else {
//     // ❌ না হলে শুধু ফ্লাই করে, মুছে যাবে না
//     setTimeout(() => {
//       setFlyingId(null); // শুধু fly state off করবে
//     }, 1000);
//   }
// };


//     // Trigger flying animation for clicked ID
//   //   setFlyingId(id);

//   //   // Remove it after animation ends
//   //   setTimeout(() => {
//   //     setRemovedIds(prev => [...prev, id]);
//   //     setFlyingId(null); // Reset fly state
//   //   }, 1000);
//   // }

// useEffect(() => {

// const now = new Date();
// const formatted = new Intl.DateTimeFormat('en-US', {
//   year: 'numeric',

//     day: 'numeric',
//       month:'numeric',


// }).format(now); // e.g., "8/15/2025, 3:30:00 PM"
//     setDateTime(formatted);




    
//  const userData = JSON.parse(localStorage.getItem('userData') || '[]');
//     if (userData[0]) {
//       setUnid(userData[0].id || 'no name fine');
      
//     }



//     setInterval(() => {
      
    


//   if (uniid) {
//       Api.get(`/wallate_get/${uniid}`) // Laravel API URL
//         .then(response => {
// console.log('============ccccccccccccccccccccccoinnnnnnnnnnn=======================');
// console.log(response.data.data[0].coin);


//   //  const selectedItems = res.data.user.slice(0, 3).map((item) => ({
//   //           id: item.id,
//   //           name: item.name,
//   //           img: item.img,
//   //           unid: item.uniqid,
//   //         }));
//   //         localStorage.setItem("userData", JSON.stringify(selectedItems)); 
   
//   localStorage.setItem("coin",response.data.data[0].coin );







// console.log('====================================');
//      console.log(uniid+ 'userid         ====================================');
//      console.log(response.data.data);
//      console.log('====================================');
//         })
//         .catch(error => {
//           console.error('Error fetching user:', error);
       
 
//         });
//     }



// }, 5000);


// }, [uniid])
  




// // const getData=()=>{


// //   Api.get(`/wallate_get/${uniid}`)




// //   .then(function (response) {

// //     console.log(response.data.coin+'===============================কয়েন দেখা যাবে=');
// //     console.log(uniid);
// //     toast.success('get all');
// //   })
// //   .catch(function (error) {

// //         console.log('eRRROR DATA COINS');
// //   toast.error('আমরা আন্তরীক ভাবে দুঃখিত আপনার কয়েনটি যোগ হচেছ না');
// //   });

// // }




//   const Savesdata=()=>{

// if (uniid) {
  

//         Api.post("/add_coin", {
 
//   user_id:uniid,
//   coin:'200',
//   home_coin:'home_icon_coine'

//         })

//   .then(function (response) {
//     toast.success('আপনাকে স্বাগতম কয়েন সংগ্রহ করার জন্য');

//     console.log('====================================');
//     console.log(response.data.status);
//     console.log('====================================');
//   })
//   .catch(function (error) {
//   toast.error(error+'আমরা আন্তরীক ভাবে দুঃখিত আপনার কয়েনটি যোগ হচেছ না');
//   });
// // user_id	refer_id	coin_name	coin_actons	crurrent_time	update_time	coin	shareid	uinq_id	tranztion_id	



// }else{

//      toast.error('আপনে লগইন ছাড়া আয় করতে পারবে না আপনে আগে লগিন করুন তার পর আয় শুরু করুন।');

// }



//   }






//   return (
//     <>
//       {/* Profile Icon (fly target) */}
//       <div
//         className=" hidden  fixed top-2 right-2 w-10 h-10 rounded-full border-2 border-pink-500 bg-white z-[9999]"
//         style={{
//           backgroundImage: `url('/Icon/profile.png')`,
//           backgroundSize: 'cover',
//         }}
//       />




//       <AnimatePresence>
//         {creatures.map(creature =>
//           !removedIds.includes(creature.id) ? (
//             <Creature
//               key={creature.id}
//               id={creature.id}
//               image={creature.image}
//               speed={creature.speed}
//               isFlying={creature.id === flyingId}
//               onClick={handleCreatureClick}
//             />
//           ) : null
//         )}
//       </AnimatePresence>
//     </>
//   );
// }


