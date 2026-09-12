"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import Api from "../api/Api";
import { useCartStore } from "../api/Carssotres";

interface Particle {
  startX: number;
  startY: number;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  vz: number;
  angleX: number;
  angleY: number;
  opacity: number;
  isGathering: boolean;
}

interface Product {
  id: number;
  name: string;
  model: string;
  price: number; // ✨ Fixed property name mapping
  reprice?: number;
  qty: number;
  img?: string;
  imglink?: string;
  rating?: number;
  type?: string;
}

export default function PremiumSlider() {
  const { cart, addToCart, removeFromCart, updateQty } = useCartStore();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fadeText, setFadeText] = useState(false);
  const [showFloor, setShowFloor] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<{ [key: number]: HTMLImageElement | null }>({});
  const currentIndexRef = useRef(currentIndex);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 📡 API Data Load
  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching all data for index sliders...');
      try {
        const res = await Api.get('/products_index'); 
        if (res.data && res.data.data && res.data.data.length > 0) {
          setProducts(res.data.data);
          console.log('📦 Products fetched:', res.data.data);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
      } finally {
        setIsLoading(false);
        console.log('Product slider fetch attempt completed.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isAnimating) return;
    const box = containerRef.current.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setTilt({ x: -y / (box.height / 15), y: x / (box.width / 15) });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    startAutoPlay();
  };

  const getImageUrl = (slide: any) => {
    if (!slide) return "";
    if (slide.img) {
      const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      return `${cleanBaseUrl}/uploads_product/${slide.img}`;
    }
    return slide.imglink || "";
  };

  const drawCoverImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let cx, cy, cw, ch;

    if (imgRatio > canvasRatio) {
      ch = img.naturalHeight;
      cw = img.naturalHeight * canvasRatio;
      cx = (img.naturalWidth - cw) / 2;
      cy = 0;
    } else {
      cw = img.naturalWidth;
      ch = img.naturalWidth / canvasRatio;
      cx = 0;
      cy = (img.naturalHeight - ch) / 2;
    }
    ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
  };

  const drawImageOnCanvas = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    canvas.width = parent ? parent.offsetWidth : 1000;
    canvas.height = parent ? parent.offsetHeight : 600;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = imagesRef.current[index];
    
    if (img) {
      if (img.complete && img.naturalWidth > 0) {
        drawCoverImage(ctx, img, canvas.width, canvas.height);
      } else {
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawCoverImage(ctx, img, canvas.width, canvas.height);
        };
        const currentSrc = img.src;
        img.src = currentSrc;
      }
    }
  };

  // 🛒 Handle Add To Cart Function
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (!product) return;
    addToCart(product);
    alert('Product added to cart successfully! ' + product.name);
  };

  const handleNext = () => {
    if (isAnimating || products.length === 0) return;
    setIsAnimating(true);
    setFadeText(true);
    setTilt({ x: 0, y: 0 });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const activeIndex = currentIndexRef.current;
    const nextIndex = (activeIndex + 1) % products.length;

    const currentImg = imagesRef.current[activeIndex];
    const nextImg = imagesRef.current[nextIndex];

    if (!currentImg || !nextImg || !currentImg.naturalWidth || !nextImg.naturalWidth) {
      setCurrentIndex(nextIndex);
      setFadeText(false);
      setIsAnimating(false);
      setTimeout(() => drawImageOnCanvas(nextIndex), 50);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    let currentImgData: Uint8ClampedArray;
    let nextImgData: Uint8ClampedArray;

    try {
      const tempCanvas1 = document.createElement("canvas");
      tempCanvas1.width = w;
      tempCanvas1.height = h;
      const tempCtx1 = tempCanvas1.getContext("2d");
      if (!tempCtx1) throw new Error("Could not get temp context 1");
      drawCoverImage(tempCtx1, currentImg, w, h);
      currentImgData = tempCtx1.getImageData(0, 0, w, h).data;

      const tempCanvas2 = document.createElement("canvas");
      tempCanvas2.width = w;
      tempCanvas2.height = h;
      const tempCtx2 = tempCanvas2.getContext("2d");
      if (!tempCtx2) throw new Error("Could not get temp context 2");
      drawCoverImage(tempCtx2, nextImg, w, h);
      nextImgData = tempCtx2.getImageData(0, 0, w, h).data;
    } catch (e) {
      console.warn("⚠️ CORS issues or Canvas Error, skipping particle animation:", e);
      setCurrentIndex(nextIndex);
      setFadeText(false);
      setIsAnimating(false);
      setTimeout(() => drawImageOnCanvas(nextIndex), 50);
      return;
    }

    const particles: Particle[] = [];
    const sampleSize = 15; 

    for (let y = 0; y < h; y += sampleSize) {
      for (let x = 0; x < w; x += sampleSize) {
        const idx = (y * w + x) * 4;
        if (currentImgData[idx + 3] < 50) continue;

        particles.push({
          startX: x,
          startY: y,
          x: x,
          y: y,
          z: 0,
          size: sampleSize + 1,
          color: `rgb(${currentImgData[idx]}, ${currentImgData[idx + 1]}, ${currentImgData[idx + 2]})`,
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() - 0.5) * 8,
          vz: (Math.random() - 0.5) * 12,
          angleX: 0,
          angleY: 0,
          opacity: 1,
          isGathering: false,
        });
      }
    }

    let phase = "pageFlip"; 
    let globalFlipAngle = 0; 
    let holdTimer = 0;

    const animateSlider = () => {
      ctx.clearRect(0, 0, w, h);
      particles.sort((a, b) => b.z - a.z);

      let activeParticles = 0;

      if (phase === "pageFlip") {
        globalFlipAngle += 0.06;
        if (globalFlipAngle >= Math.PI / 2) { 
          phase = "shatter";
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (phase === "pageFlip") {
          const originX = w / 2;
          const dx = p.startX - originX;
          p.x = originX + dx * Math.cos(globalFlipAngle);
          p.z = -dx * Math.sin(globalFlipAngle);
          p.y = p.startY + Math.sin(p.startX / w * Math.PI) * (globalFlipAngle * 40);
          activeParticles++;
        }
        else if (phase === "shatter") {
          p.vy += 0.55; 
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.angleX += 0.04;

          const floorY = h - p.size;
          if (p.y >= floorY) {
            p.y = floorY;
            p.vx *= 0.3;
            p.vy = 0;
            p.vz *= 0.3;
            p.angleX *= 0.5; 
          }
          activeParticles++;
        } 
        else if (phase === "gather") {
          if (!p.isGathering) {
            p.isGathering = true;
            const idx = (Math.floor(p.startY) * w + Math.floor(p.startX)) * 4;
            p.color = `rgb(${nextImgData[idx]}, ${nextImgData[idx + 1]}, ${nextImgData[idx + 2]})`;
          }

          p.x += (p.startX - p.x) * 0.14;
          p.y += (p.startY - p.y) * 0.14;
          p.z += (0 - p.z) * 0.14;
          p.angleX += (0 - p.angleX) * 0.14;
          
          const dist = Math.abs(p.x - p.startX) + Math.abs(p.y - p.startY);
          if (dist > 0.8) {
            activeParticles++;
          }
        }

        const perspective = 500;
        const scale = perspective / (perspective + p.z);
        const drawX = p.x * scale + w / 2 * (1 - scale);
        const drawY = p.y * scale + h / 2 * (1 - scale);
        const drawSize = p.size * scale;

        if (drawSize > 0 && p.opacity > 0) {
          ctx.save();
          ctx.translate(drawX, drawY);
          if (phase !== "pageFlip") ctx.rotate(p.angleX);
          
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          
          ctx.beginPath();
          ctx.rect(-drawSize / 2, -drawSize / 2, drawSize, drawSize);
          ctx.fill();
          ctx.restore();
        }
      }

      if (phase === "shatter") {
        setShowFloor(true);
      }

      if (phase === "shatter" && holdTimer < 35) {
        let landedCount = particles.filter(p => p.y >= h - (p.size * 2)).length;
        if (landedCount > particles.length * 0.70) {
          holdTimer++;
          if (holdTimer >= 35) {
            phase = "gather";
            setCurrentIndex(nextIndex);
            setShowFloor(false);
          }
        }
      }

      if (phase === "gather" && activeParticles === 0) {
        setFadeText(false);
        setIsAnimating(false);
        drawImageOnCanvas(nextIndex);
        return;
      }

      requestAnimationFrame(animateSlider);
    };

    animateSlider();
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if (products.length === 0) return;
    autoPlayTimerRef.current = setInterval(() => {
      if (!isAnimating) handleNext();
    }, 6500);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
  };

  useEffect(() => {
    if (products.length > 0) {
      if (!isAnimating) {
        drawImageOnCanvas(currentIndex);
        startAutoPlay();
      }
    }
    return () => stopAutoPlay();
  }, [currentIndex, isAnimating, products]);

  useEffect(() => {
    const handleResize = () => drawImageOnCanvas(currentIndexRef.current);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading || products.length === 0) {
    return (
      <div className="w-[95%] max-w-[1100px] h-[550px] sm:h-[600px] bg-[#050505] rounded-[40px] flex items-center justify-center text-white font-medium border border-white/10">
        Loading Premium Experience...
      </div>
    );
  }

  return (
    <div className="relative w-full flex items-center justify-center">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={stopAutoPlay}
        className="relative w-[95%] max-w-[1100px] h-[550px] sm:h-[600px] bg-[#050505] rounded-[40px] overflow-hidden flex items-center justify-center border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.85)] transition-transform duration-300 ease-out select-none"
        style={{
          perspective: "1200px",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d"
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

        {/* ৩ডি ফ্লোর শ্যাডো */}
        <div 
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[160px] bg-gradient-to-t from-orange-500/20 via-amber-500/5 to-transparent pointer-events-none z-10 transition-all duration-1000 blur-md ${showFloor ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} 
          style={{
            transform: "rotateX(80deg)",
            transformOrigin: "bottom center",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90 z-20 pointer-events-none" />

        {/* টেক্সট ও কন্টেন্ট */}
        <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 max-w-[680px]" style={{ transform: "translateZ(60px)" }}>
          <div className={`flex flex-col items-center transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${fadeText ? "opacity-0 translate-y-16 scale-90 blur-md" : "opacity-100 translate-y-0 scale-100 blur-0"}`}>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] bg-gradient-to-b from-white to-gray-400 bg-clip-text">
              {products[currentIndex]?.name || "Premium Product"}
            </h2>
            
            <p className="text-xs sm:text-sm md:text-base text-gray-300/90 font-light leading-relaxed mb-4 px-4 max-w-[550px]">
              {products[currentIndex]?.discript || "Description not available."}
            </p>

            <p className="text-xs sm:text-sm md:text-base text-gray-400 font-mono tracking-wider mb-2 px-4 max-w-[550px]">
              {products[currentIndex]?.model || "Model not available."}
            </p>

            <p className="text-lg sm:text-xl font-bold text-orange-400 mb-8 px-4 max-w-[550px]">
              {products[currentIndex]?.price ? `Price: ${products[currentIndex].price}` : "Price not available."}
            </p>
            
            <button 
              onClick={(e) => handleAddToCart(e, products[currentIndex])} 
              className="relative px-12 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_25px_50px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 tracking-wider text-sm border border-white/10 overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              ORDER NOW
            </button>
          </div>
        </div>

        {/* 🖼️ হিডেন ইমেজ প্রি-লোডার */}
        <div className="opacity-0 pointer-events-none absolute w-0 h-0 overflow-hidden">
          {products.map((slide, index) => {
            const srcUrl = getImageUrl(slide);
            if (!srcUrl) return null;
            return (
              <img
                key={slide.id || index}
                ref={(el) => { imagesRef.current[index] = el; }}
                src={srcUrl}
                alt={slide.name || "slider"}
                crossOrigin="anonymous"
                onLoad={() => {
                  if (index === currentIndexRef.current) {
                    drawImageOnCanvas(index);
                  }
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ➡️ নেভিগেশন বাটন */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 z-40" style={{ transform: "translateZ(80px)" }}>
        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 bg-black/40 text-white flex items-center justify-center backdrop-blur-xl transition-all duration-300 hover:bg-white hover:text-black hover:scale-110 active:scale-90 disabled:opacity-20 shadow-2xl"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
}

