



"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

interface VideoItem {
  id: string;
  file: File;
  src: string;
}

interface ImageItem {
  id: string;
  file: File;
  src: string;
  x: number;
  y: number;
}

export default function CapCutUltimateStudio() {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [renderPercent, setRenderPercent] = useState<number>(0);

  // 🎬 Media Layers State
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [activeImgIdx, setActiveImgIdx] = useState<number | null>(null);

  // 🖲️ Export Bucket
  const [processedVideoBlob, setProcessedVideoBlob] = useState<Blob | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

  // 🎛️ Professional Timeline & Crop State
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");
  const [videoDuration, setVideoDuration] = useState<number>(10);
  const [timelineVal, setTimelineVal] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState("original");
  const [volume, setVolume] = useState("1.0");
  const [speed, setSpeed] = useState("1.0");

  // 🎨 Cinematic Effects Dashboard
  const [activeEffect, setActiveEffect] = useState("none");
  const [colorFilter, setColorFilter] = useState("none");
  const [logoScale, setLogoScale] = useState(15);
  const [logoOpacity, setLogoOpacity] = useState(100);
  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(24);

  // 🎯 Drag Positioning Control
  const [clickTarget, setClickTarget] = useState<"logo" | "text">("logo");
  const [textPosPct, setTextPosPct] = useState({ x: 50, y: 80 });
  const [isDragging, setIsDragging] = useState(false);

  // 👄 AI Mouth Tracking Engine
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);

  // ⚙️ Bootstrap FFmpeg & AI Engine
  useEffect(() => {
    const initEngines = async () => {
      try {
        setProgress("Booting High-Performance Render Engines...");
        const ffmpegInstance = new FFmpeg();
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        ffmpegInstance.on("progress", ({ progress: progVal }) => {
          setRenderPercent(Math.round(progVal * 100));
        });
        setFfmpeg(ffmpegInstance);

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });
        setFaceLandmarker(landmarker);
        setReady(true);
        setProgress("");
      } catch (error) {
        console.error(error);
        setProgress("Engine Crash. Please reload workspace.");
      }
    };
    initEngines();
  }, []);

  // 👄 Real-time AI Mouth Tracker Thread
  useEffect(() => {
    const trackFace = () => {
      if (isTracking && videoRef.current && faceLandmarker && imageList.length > 0) {
        const video = videoRef.current;
        if (video.currentTime !== undefined) {
          try {
            const result = faceLandmarker.detectForVideo(video, performance.now());
            if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
              const landmarks = result.faceLandmarks[0];
              const mouthPoint = landmarks[13];
              if (mouthPoint) {
                const targetIdx = activeImgIdx !== null ? activeImgIdx : 0;
                setImageList((prev) => {
                  const updated = [...prev];
                  if (updated[targetIdx]) {
                    updated[targetIdx] = { 
                      ...updated[targetIdx], 
                      x: Math.min(Math.max(mouthPoint.x * 100, 0), 95), 
                      y: Math.min(Math.max(mouthPoint.y * 100, 0), 95) 
                    };
                  }
                  return updated;
                });
              }
            }
          } catch (error) {
            console.error("Face tracking error:", error);
          }
        }
      }
      if (isTracking) {
        requestRef.current = requestAnimationFrame(trackFace);
      }
    };

    if (isTracking) {
      requestRef.current = requestAnimationFrame(trackFace);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isTracking, faceLandmarker, imageList.length, activeImgIdx]);

  // Sync video controls
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = parseFloat(volume);
      videoRef.current.playbackRate = parseFloat(speed);
    }
  }, [volume, speed]);

  // Update active video when index changes
  useEffect(() => {
    if (videoRef.current && videoList[activeVideoIdx]) {
      videoRef.current.src = videoList[activeVideoIdx].src;
      videoRef.current.load();
    }
  }, [activeVideoIdx, videoList]);

  const handleVideoLoadedData = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const duration = e.currentTarget.duration || 10;
    setVideoDuration(duration);
    const sec = Math.floor(duration % 60);
    const min = Math.floor((duration / 60) % 60);
    const hr = Math.floor(duration / 3600);
    setEndTime(`${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`);
  };

  const handleTimelineChange = (val: number) => {
    setTimelineVal(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  // 🖱️ Drag Calculation Logic
  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || isTracking) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 95);
    const y = Math.min(Math.max(((clientY - rect.top) / rect.height) * 100, 0), 95);

    if (clickTarget === "logo") {
      if (imageList.length > 0) {
        const targetIdx = activeImgIdx !== null ? activeImgIdx : 0;
        setImageList((prev) => {
          const updated = [...prev];
          if (updated[targetIdx]) {
            updated[targetIdx] = { ...updated[targetIdx], x, y };
          }
          return updated;
        });
      }
    } else {
      setTextPosPct({ x, y });
    }
  }, [clickTarget, isTracking, imageList.length, activeImgIdx]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseUpOrLeave = () => setIsDragging(false);

  const handleMultipleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newVideos = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substring(2, 11),
        file,
        src: URL.createObjectURL(file),
      }));
      setVideoList((prev) => [...prev, ...newVideos]);
      if (videoList.length === 0 && newVideos.length > 0) {
        setActiveVideoIdx(0);
      }
    }
  };

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substring(2, 11),
        file,
        src: URL.createObjectURL(file),
        x: 45,
        y: 45,
      }));
      setImageList((prev) => [...prev, ...newImages]);
      if (activeImgIdx === null && newImages.length > 0) {
        setActiveImgIdx(0);
      }
    }
  };

  const removeVideo = (index: number) => {
    setVideoList((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].src);
      updated.splice(index, 1);
      return updated;
    });
    if (activeVideoIdx >= index && activeVideoIdx > 0) {
      setActiveVideoIdx(activeVideoIdx - 1);
    }
  };

  const removeImage = (index: number) => {
    setImageList((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].src);
      updated.splice(index, 1);
      return updated;
    });
    if (activeImgIdx === index) {
      setActiveImgIdx(null);
    } else if (activeImgIdx !== null && activeImgIdx > index) {
      setActiveImgIdx(activeImgIdx - 1);
    }
  };

  // Live Preview Filter Sync
  const getLivePreviewStyle = () => {
    let filters = [];
    if (activeEffect === "blur") filters.push("blur(6px)");
    if (activeEffect === "grayscale") filters.push("grayscale(100%)");
    if (colorFilter === "cinematic") filters.push("contrast(130%) saturate(140%)");
    return { filter: filters.length > 0 ? filters.join(" ") : "none" };
  };

  // Canvas Aspect Ratio Class
  const getCanvasAspectClass = () => {
    if (aspectRatio === "916") return "aspect-[9/16] max-h-[460px] w-auto h-full";
    if (aspectRatio === "169") return "aspect-[16/9] w-full h-auto";
    if (aspectRatio === "11") return "aspect-square max-h-[400px] w-auto h-full";
    return "aspect-video w-full h-auto";
  };

  const forceBlobDownload = (blobData: Blob | null, defaultName: string) => {
    if (!blobData) return;
    const downloadUrl = window.URL.createObjectURL(blobData);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = defaultName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);
  };

  // ========================================================
  // 🚀 High-Performance Export System with All Effects
  // ========================================================
  const handleExportVideo = async () => {
    if (!ffmpeg || videoList.length === 0) return;

    setIsTracking(false);
    if (videoRef.current) videoRef.current.pause();

    setLoading(true);
    setRenderPercent(0);
    setProcessedVideoUrl(null);
    setProgress("Analyzing workspace data tracks...");

    try {
      // Write video files
      for (let i = 0; i < videoList.length; i++) {
        await ffmpeg.writeFile(`vid_${i}.mp4`, await fetchFile(videoList[i].file));
      }
      // Write image files
      for (let i = 0; i < imageList.length; i++) {
        await ffmpeg.writeFile(`img_${i}.png`, await fetchFile(imageList[i].file));
      }

      let filterComplexStr = "";
      let lastVideoStage = "0:v";

      // Handle multiple videos concatenation
      if (videoList.length > 1) {
        let concatInputs = "";
        for (let i = 0; i < videoList.length; i++) {
          concatInputs += `[${i}:v][${i}:a]`;
        }
        filterComplexStr += `${concatInputs}concat=n=${videoList.length}:v=1:a=1[mergedv][mergeda];`;
        lastVideoStage = "mergedv";
      }

      let currentInputIdx = videoList.length;
      let currentVStage = lastVideoStage;

      // Logo overlay chain with proper scaling and opacity
      for (let i = 0; i < imageList.length; i++) {
        const outStage = `v_img_${i}`;
        const xCoord = `W*${Math.min(Math.max(imageList[i].x / 100, 0), 0.95)}`;
        const yCoord = `H*${Math.min(Math.max(imageList[i].y / 100, 0), 0.95)}`;
        const scaleFactor = logoScale / 100;
        const opacityFactor = logoOpacity / 100;
        
        filterComplexStr += `[${currentInputIdx}:v]format=rgba,colorchannelmixer=aa=${opacityFactor},scale=iw*${scaleFactor}:-1[wm_${i}];`;
        filterComplexStr += `[${currentVStage}][wm_${i}]overlay=${xCoord}:${yCoord}[${outStage}];`;
        currentVStage = outStage;
        currentInputIdx++;
      }

      // Build extra filters array with proper effect application
      let extraFilters = [];
      
      // Speed adjustment (PTS)
      if (speed !== "1.0") {
        const speedVal = parseFloat(speed);
        if (speedVal > 0 && speedVal <= 2.0) {
          extraFilters.push(`setpts=${(1 / speedVal).toFixed(2)}*PTS`);
        }
      }

      // Aspect ratio cropping
      if (aspectRatio === "916") {
        extraFilters.push("crop=ih*9/16:ih: (iw-ih*9/16)/2:0");
      } else if (aspectRatio === "169") {
        extraFilters.push("crop=iw:iw*9/16:0:(ih-iw*9/16)/2");
      } else if (aspectRatio === "11") {
        const size = "min(iw,ih)";
        extraFilters.push(`crop=${size}:${size}:(iw-${size})/2:(ih-${size})/2`);
      }

      // Visual Effects (APPLIED CORRECTLY)
      if (activeEffect === "blur") {
        extraFilters.push("gblur=sigma=12");
      }
      if (activeEffect === "grayscale") {
        extraFilters.push("hue=s=0");
      }
      
      // Color grading (cinematic LUT)
      if (colorFilter === "cinematic") {
        extraFilters.push("eq=contrast=1.3:saturation=1.4:brightness=0.05");
      }

      // Text overlay with proper positioning
      if (overlayText) {
        const tx = `(w-text_w)*${textPosPct.x / 100}`;
        const ty = `(h-text_h)*${textPosPct.y / 100}`;
        const escapedText = overlayText.replace(/'/g, "\\'").replace(/:/g, "\\:");
        extraFilters.push(
          `drawtext=text='${escapedText}':x=${tx}:y=${ty}:fontsize=${textSize}:fontcolor=${textColor.replace('#', '0x')}:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:shadowx=2:shadowy=2:shadowcolor=0x000000@0.5`
        );
      }

      // Apply all filters to the video stream
      if (extraFilters.length > 0) {
        const filterStr = extraFilters.join(",");
        if (filterComplexStr) {
          filterComplexStr += `[${currentVStage}]${filterStr}[finalv];`;
          currentVStage = "finalv";
        } else {
          filterComplexStr += `[0:v]${filterStr}[finalv];`;
          currentVStage = "finalv";
        }
      }

      // Audio processing
      let audioStage = videoList.length > 1 ? "mergeda" : "0:a";
      let audioFilters = [];
      
      // Speed audio adjustment
      if (speed !== "1.0") {
        const speedVal = parseFloat(speed);
        if (speedVal >= 0.5 && speedVal <= 2.0) {
          if (speedVal !== 1.0) {
            audioFilters.push(`atempo=${speedVal}`);
          }
        }
      }
      
      // Volume adjustment
      if (volume !== "1.0") {
        const volVal = parseFloat(volume);
        if (volVal >= 0 && volVal <= 2.0) {
          audioFilters.push(`volume=${volVal}`);
        }
      }
      
      // Apply audio filters
      if (audioFilters.length > 0) {
        const audioFilterStr = audioFilters.join(",");
        if (filterComplexStr) {
          filterComplexStr += `[${audioStage}]${audioFilterStr}[finala];`;
          audioStage = "finala";
        } else {
          filterComplexStr += `[0:a]${audioFilterStr}[finala];`;
          audioStage = "finala";
        }
      }

      // Build command
      let cmd: string[] = [];
      
      // Input files
      videoList.forEach((_, idx) => cmd.push("-i", `vid_${idx}.mp4`));
      imageList.forEach((_, idx) => cmd.push("-i", `img_${idx}.png`));

      // Trimming
      const startSec = timeToSeconds(startTime);
      const endSec = timeToSeconds(endTime);
      if (startSec > 0 || endSec < videoDuration) {
        cmd.push("-ss", startTime);
        if (endSec > startSec && endSec <= videoDuration) {
          cmd.push("-to", endTime);
        }
      }

      // Filter complex with proper mapping
      if (filterComplexStr) {
        cmd.push("-filter_complex", filterComplexStr);
        cmd.push("-map", `[${currentVStage}]`);
        if (audioStage) {
          cmd.push("-map", `[${audioStage}]`);
        }
      }

      const outName = "capcut_studio_export.mp4";
      
      // Encoding settings
      cmd.push("-c:v", "libx264");
      cmd.push("-pix_fmt", "yuv420p");
      cmd.push("-preset", "medium");
      cmd.push("-crf", "23");
      
      // Audio settings
      if (audioStage) {
        cmd.push("-c:a", "aac");
        cmd.push("-b:a", "128k");
      }
      
      // Final output
      cmd.push("-movflags", "+faststart");
      cmd.push(outName);

      setProgress("Encoding master frames with all effects...");
      console.log("FFmpeg Command:", cmd.join(" "));
      
      await ffmpeg.exec(cmd);

      const fileData = await ffmpeg.readFile(outName);
      const binaryBlob = new Blob([fileData], { type: "video/mp4" });

      setProcessedVideoUrl(URL.createObjectURL(binaryBlob));
      setProcessedVideoBlob(binaryBlob);
      setLoading(false);
      setProgress("Export complete!");
    } catch (err) {
      console.error("Export error:", err);
      setProgress(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setLoading(false);
    }
  };

  // Helper: Convert time string to seconds
  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      videoList.forEach(v => URL.revokeObjectURL(v.src));
      imageList.forEach(i => URL.revokeObjectURL(i.src));
      if (processedVideoUrl) URL.revokeObjectURL(processedVideoUrl);
    };
  }, [videoList, imageList, processedVideoUrl]);

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30">

      {/* 👑 Professional Studio Top Navigation */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 bg-[#0d0d11] px-6 py-3.5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-sm font-black tracking-widest text-white uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">CAPCUT PRO MOTION STUDIO</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md text-zinc-400">
            {ready ? "🟢 CORE ENGINES ACTIVE" : "⏳ LOADING GPU CORE..."}
          </span>
        </div>
      </header>

      {!ready ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
          <div className="w-12 h-12 border-2 border-zinc-800 border-t-cyan-400 rounded-full animate-spin mb-4" />
          <p className="text-xs font-mono text-zinc-400 animate-pulse tracking-wide uppercase">{progress}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-zinc-900/60 min-h-[calc(100vh-60px)]">

          {/* 🧩 Left Sidebar: Media & Upload Panel */}
          <aside className="xl:col-span-3 bg-[#0d0d11] p-5 space-y-6 border-r border-zinc-800/60 overflow-y-auto max-h-[calc(100vh-60px)]">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-3">Asset Pipeline</label>
              <div className="grid grid-cols-1 gap-2">
                <div className="group border border-dashed border-zinc-800 hover:border-cyan-500/50 p-4 rounded-xl bg-zinc-950/60 text-center transition-all relative cursor-pointer">
                  <input type="file" accept="video/*" multiple onChange={handleMultipleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-xs text-zinc-400 group-hover:text-cyan-400 block transition-colors">🎬 Import Video Clips ({videoList.length})</span>
                </div>
                <div className="group border border-dashed border-zinc-800 hover:border-fuchsia-500/50 p-4 rounded-xl bg-zinc-950/60 text-center transition-all relative cursor-pointer">
                  <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-xs text-zinc-400 group-hover:text-fuchsia-400 block transition-colors">🖼️ Import Overlay Logos ({imageList.length})</span>
                </div>
              </div>
            </div>

            {/* Video List */}
            {videoList.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2">Video Tracks</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {videoList.map((video, idx) => (
                    <div key={video.id} className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${activeVideoIdx === idx ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-zinc-900/50'}`}>
                      <button onClick={() => setActiveVideoIdx(idx)} className="flex-1 text-left truncate text-zinc-300 hover:text-white">
                        🎬 Clip {idx + 1}
                      </button>
                      <button onClick={() => removeVideo(idx)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image List */}
            {imageList.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2">Overlay Layers</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {imageList.map((img, idx) => (
                    <div key={img.id} className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${activeImgIdx === idx ? 'bg-fuchsia-500/10 border border-fuchsia-500/30' : 'bg-zinc-900/50'}`}>
                      <button onClick={() => setActiveImgIdx(idx)} className="flex-1 text-left truncate text-zinc-300 hover:text-white">
                        🖼️ Overlay {idx + 1}
                      </button>
                      <button onClick={() => removeImage(idx)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aspect Ratio Panel */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2.5">Canvas Crop Aspect</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "original", label: "Original" },
                  { id: "169", label: "16:9" },
                  { id: "916", label: "9:16" },
                  { id: "11", label: "1:1" },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`py-2 text-[11px] rounded-lg font-medium border transition-all ${aspectRatio === ratio.id
                        ? "bg-cyan-500 border-cyan-500 text-black font-bold"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800/80 hover:bg-zinc-900"
                      }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Effects Dashboard */}
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2">VFX Filters</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setActiveEffect("none")}
                    className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${activeEffect === "none" ? "bg-zinc-100 text-black" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                  >
                    No Effect
                  </button>
                  <button
                    onClick={() => setActiveEffect("blur")}
                    className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${activeEffect === "blur" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                  >
                    Motion Blur
                  </button>
                  <button
                    onClick={() => setActiveEffect("grayscale")}
                    className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${activeEffect === "grayscale" ? "bg-zinc-800 text-zinc-100 font-bold" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                  >
                    Retro Gray
                  </button>
                  <button
                    onClick={() => setColorFilter(colorFilter === "cinematic" ? "none" : "cinematic")}
                    className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${colorFilter === "cinematic" ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 font-bold" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                      }`}
                  >
                    Cinematic LUT
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* 📺 Center Area: Live AI Preview Monitor & Timeline */}
          <main className="xl:col-span-6 bg-[#060608] flex flex-col justify-between p-6">

            {/* Live Screen Casting */}
            <div className="w-full flex-1 flex flex-col justify-center items-center">
              {videoList.length > 0 ? (
                <div className="w-full max-w-2xl bg-[#0d0d11] p-3 rounded-2xl border border-zinc-800/80 shadow-2xl relative">

                  <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Live Master Canvas</span>
                    {imageList.length > 0 && (
                      <button
                        onClick={() => setIsTracking(!isTracking)}
                        className={`text-[11px] font-black px-3.5 py-1 rounded-full border transition-all ${isTracking ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse" : "bg-zinc-900 text-cyan-400 border-zinc-800"
                          }`}
                      >
                        {isTracking ? "🛑 LOCK POSITION ACTIVE" : "👄 START MOUTH TRACKING AI"}
                      </button>
                    )}
                  </div>

                  {/* Responsive Viewport */}
                  <div className="w-full bg-black rounded-xl overflow-hidden relative flex items-center justify-center mx-auto transition-all shadow-inner min-h-[300px]">
                    <div
                      ref={containerRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUpOrLeave}
                      onMouseLeave={handleMouseUpOrLeave}
                      className={`relative overflow-hidden flex items-center justify-center bg-zinc-950 transition-all ${getCanvasAspectClass()}`}
                    >
                      <video
                        ref={videoRef}
                        src={videoList[activeVideoIdx]?.src}
                        onLoadedData={handleVideoLoadedData}
                        controls={false}
                        autoPlay
                        loop
                        muted
                        style={getLivePreviewStyle()}
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {imageList.map((img, index) => (
                        <div
                          key={img.id}
                          style={{ left: `${img.x}%`, top: `${img.y}%` }}
                          className={`absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 ${activeImgIdx === index ? "ring-2 ring-cyan-400" : ""
                            }`}
                        >
                          <img
                            src={img.src}
                            style={{ width: `${logoScale * 3.5}px`, opacity: logoOpacity / 100 }}
                            className="h-auto object-contain shadow-2xl"
                            alt="Watermark Layer"
                          />
                        </div>
                      ))}

                      {overlayText && (
                        <div
                          style={{
                            left: `${textPosPct.x}%`,
                            top: `${textPosPct.y}%`,
                            color: textColor,
                            fontSize: `${textSize}px`
                          }}
                          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 font-black tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-center select-none"
                        >
                          {overlayText}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-zinc-600 text-xs font-medium tracking-wide uppercase">No Clips Loaded into Viewport</div>
              )}
            </div>

            {/* 🎞️ Pro-Level Linear Timeline Module */}
            {videoList.length > 0 && (
              <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-xl p-4 mt-6">
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-2 px-1">
                  <span className="text-cyan-400 font-bold">🎬 CLIP_{activeVideoIdx + 1}.MP4</span>
                  <span>{timelineVal.toFixed(2)}s / <span className="text-zinc-600">{videoDuration.toFixed(2)}s</span></span>
                </div>
                <div className="relative flex items-center bg-zinc-950 h-8 rounded-lg border border-zinc-900 px-2 overflow-hidden">
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 px-4">
                    {[...Array(10)].map((_, i) => <div key={i} className="w-[1px] h-full bg-zinc-400" />)}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={videoDuration}
                    step="0.05"
                    value={timelineVal}
                    onChange={(e) => handleTimelineChange(parseFloat(e.target.value))}
                    className="w-full h-full appearance-none bg-transparent cursor-pointer relative z-10 accent-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </main>

          {/* 🎛️ Right Sidebar: Professional Parameters Tuning */}
          <aside className="xl:col-span-3 bg-[#0d0d11] p-5 space-y-6 border-l border-zinc-800/60 overflow-y-auto max-h-[calc(100vh-60px)]">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-3">Tuning Track Parameters</label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-zinc-400">
                    <span>Volume Audio Boost</span>
                    <span className="font-mono">{Math.round(parseFloat(volume) * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="2" step="0.1" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full accent-cyan-400" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 text-zinc-400">
                    <span>Playback Velocity</span>
                    <span className="font-mono text-cyan-400">{speed}x</span>
                  </div>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(e.target.value)} className="w-full accent-cyan-400" />
                </div>
              </div>
            </div>

            <hr className="border-zinc-800/80" />

            <div>
              <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-3">Overlay Layout Config</label>
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 mb-4 text-[11px]">
                <button onClick={() => setClickTarget("logo")} className={`flex-1 py-1.5 rounded-md font-medium ${clickTarget === "logo" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}>Watermark</button>
                <button onClick={() => setClickTarget("text")} className={`flex-1 py-1.5 rounded-md font-medium ${clickTarget === "text" ? "bg-zinc-800 text-white" : "text-zinc-400"}`}>Text</button>
              </div>

              {clickTarget === "logo" ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-zinc-400">
                      <span>Logo Scale Width</span>
                      <span className="font-mono">{logoScale}%</span>
                    </div>
                    <input type="range" min="5" max="50" value={logoScale} onChange={(e) => setLogoScale(parseInt(e.target.value))} className="w-full accent-fuchsia-400" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-zinc-400">
                      <span>Layer Transparency</span>
                      <span className="font-mono">{logoOpacity}%</span>
                    </div>
                    <input type="range" min="10" max="100" value={logoOpacity} onChange={(e) => setLogoOpacity(parseInt(e.target.value))} className="w-full accent-fuchsia-400" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-zinc-400 block mb-1">Text Overlay String</span>
                    <input type="text" value={overlayText} onChange={(e) => setOverlayText(e.target.value)} placeholder="Type captions..." className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-zinc-400 block mb-1">Font Color</span>
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-8 bg-zinc-950 rounded-md cursor-pointer border border-zinc-800" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 block mb-1">Font Size</span>
                      <input type="number" value={textSize} onChange={(e) => setTextSize(parseInt(e.target.value) || 12)} className="w-full text-xs h-8 bg-zinc-950 border border-zinc-800 rounded-lg px-2 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-zinc-800/80" />

            {/* Trimming Parameters */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2">Workspace Time Segment</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Trim Start</span>
                  <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-xs p-2 text-center rounded-lg font-mono text-white" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Trim Stop</span>
                  <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-xs p-2 text-center rounded-lg font-mono text-white" />
                </div>
              </div>
            </div>

            {/* Compile Engine Export button */}
            <div className="pt-4">
              <button
                onClick={handleExportVideo}
                disabled={loading || videoList.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black tracking-wide text-xs uppercase shadow-lg disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Rendering {renderPercent}%
                  </>
                ) : "🎬 Run Production Compile"}
              </button>

              {processedVideoUrl && (
                <button
                  onClick={() => forceBlobDownload(processedVideoBlob, "studio_export.mp4")}
                  className="w-full mt-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all"
                >
                  📥 Download Compiled Master File
                </button>
              )}
            </div>
          </aside>

        </div>
      )}
    </div>
  );
}




// "use client";
// import { useState, useRef, useEffect, useCallback } from "react";
// import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { fetchFile, toBlobURL } from "@ffmpeg/util";
// import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

// interface VideoItem {
//   id: string;
//   file: File;
//   src: string;
// }

// interface ImageItem {
//   id: string;
//   file: File;
//   src: string;
//   x: number;
//   y: number;
// }

// export default function CapCutUltimateStudio() {
//   const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
//   const [ready, setReady] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState("");
//   const [renderPercent, setRenderPercent] = useState<number>(0);

//   // 🎬 Media Layers State
//   const [videoList, setVideoList] = useState<VideoItem[]>([]);
//   const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
//   const [imageList, setImageList] = useState<ImageItem[]>([]);
//   const [activeImgIdx, setActiveImgIdx] = useState<number | null>(null);

//   // 🖲️ Export Bucket
//   const [processedVideoBlob, setProcessedVideoBlob] = useState<Blob | null>(null);
//   const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

//   // 🎛️ Professional Timeline & Crop State
//   const [startTime, setStartTime] = useState("00:00:00");
//   const [endTime, setEndTime] = useState("00:00:10");
//   const [videoDuration, setVideoDuration] = useState<number>(10);
//   const [timelineVal, setTimelineVal] = useState<number>(0);
//   const [aspectRatio, setAspectRatio] = useState("original");
//   const [volume, setVolume] = useState("1.0");
//   const [speed, setSpeed] = useState("1.0");

//   // 🎨 Cinematic Effects Dashboard
//   const [activeEffect, setActiveEffect] = useState("none");
//   const [colorFilter, setColorFilter] = useState("none");
//   const [logoScale, setLogoScale] = useState(15);
//   const [logoOpacity, setLogoOpacity] = useState(100);
//   const [overlayText, setOverlayText] = useState("");
//   const [textColor, setTextColor] = useState("#ffffff");
//   const [textSize, setTextSize] = useState(24);

//   // 🎯 Drag Positioning Control
//   const [clickTarget, setClickTarget] = useState<"logo" | "text">("logo");
//   const [textPosPct, setTextPosPct] = useState({ x: 50, y: 80 });
//   const [isDragging, setIsDragging] = useState(false);

//   // 👄 AI Mouth Tracking Engine
//   const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
//   const [isTracking, setIsTracking] = useState(false);

//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const requestRef = useRef<number | null>(null);

//   // ⚙️ Bootstrap FFmpeg & AI Engine
//   useEffect(() => {
//     const initEngines = async () => {
//       try {
//         setProgress("Booting High-Performance Render Engines...");
//         const ffmpegInstance = new FFmpeg();
//         const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
//         await ffmpegInstance.load({
//           coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
//           wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
//         });
//         ffmpegInstance.on("progress", ({ progress: progVal }) => {
//           setRenderPercent(Math.round(progVal * 100));
//         });
//         setFfmpeg(ffmpegInstance);

//         const filesetResolver = await FilesetResolver.forVisionTasks(
//           "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
//         );
//         const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
//           baseOptions: {
//             modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
//             delegate: "GPU"
//           },
//           runningMode: "VIDEO",
//           numFaces: 1
//         });
//         setFaceLandmarker(landmarker);
//         setReady(true);
//         setProgress("");
//       } catch (error) {
//         console.error(error);
//         setProgress("Engine Crash. Please reload workspace.");
//       }
//     };
//     initEngines();
//   }, []);

//   // 👄 Real-time AI Mouth Tracker Thread
//   useEffect(() => {
//     const trackFace = () => {
//       if (isTracking && videoRef.current && faceLandmarker && imageList.length > 0) {
//         const video = videoRef.current;
//         if (video.currentTime !== undefined) {
//           try {
//             const result = faceLandmarker.detectForVideo(video, performance.now());
//             if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
//               const landmarks = result.faceLandmarks[0];
//               const mouthPoint = landmarks[13];
//               if (mouthPoint) {
//                 const targetIdx = activeImgIdx !== null ? activeImgIdx : 0;
//                 setImageList((prev) => {
//                   const updated = [...prev];
//                   if (updated[targetIdx]) {
//                     updated[targetIdx] = { 
//                       ...updated[targetIdx], 
//                       x: Math.min(Math.max(mouthPoint.x * 100, 0), 95), 
//                       y: Math.min(Math.max(mouthPoint.y * 100, 0), 95) 
//                     };
//                   }
//                   return updated;
//                 });
//               }
//             }
//           } catch (error) {
//             console.error("Face tracking error:", error);
//           }
//         }
//       }
//       if (isTracking) {
//         requestRef.current = requestAnimationFrame(trackFace);
//       }
//     };

//     if (isTracking) {
//       requestRef.current = requestAnimationFrame(trackFace);
//     }
//     return () => {
//       if (requestRef.current) {
//         cancelAnimationFrame(requestRef.current);
//         requestRef.current = null;
//       }
//     };
//   }, [isTracking, faceLandmarker, imageList.length, activeImgIdx]);

//   // Sync video controls
//   useEffect(() => {
//     if (videoRef.current) {
//       videoRef.current.volume = parseFloat(volume);
//       videoRef.current.playbackRate = parseFloat(speed);
//     }
//   }, [volume, speed]);

//   // Update active video when index changes
//   useEffect(() => {
//     if (videoRef.current && videoList[activeVideoIdx]) {
//       videoRef.current.src = videoList[activeVideoIdx].src;
//       videoRef.current.load();
//     }
//   }, [activeVideoIdx, videoList]);

//   const handleVideoLoadedData = (e: React.SyntheticEvent<HTMLVideoElement>) => {
//     const duration = e.currentTarget.duration || 10;
//     setVideoDuration(duration);
//     const sec = Math.floor(duration % 60);
//     const min = Math.floor((duration / 60) % 60);
//     const hr = Math.floor(duration / 3600);
//     setEndTime(`${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`);
//   };

//   const handleTimelineChange = (val: number) => {
//     setTimelineVal(val);
//     if (videoRef.current) {
//       videoRef.current.currentTime = val;
//     }
//   };

//   // 🖱️ Drag Calculation Logic
//   const updatePosition = useCallback((clientX: number, clientY: number) => {
//     if (!containerRef.current || isTracking) return;
//     const rect = containerRef.current.getBoundingClientRect();
//     const x = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 95);
//     const y = Math.min(Math.max(((clientY - rect.top) / rect.height) * 100, 0), 95);

//     if (clickTarget === "logo") {
//       if (imageList.length > 0) {
//         const targetIdx = activeImgIdx !== null ? activeImgIdx : 0;
//         setImageList((prev) => {
//           const updated = [...prev];
//           if (updated[targetIdx]) {
//             updated[targetIdx] = { ...updated[targetIdx], x, y };
//           }
//           return updated;
//         });
//       }
//     } else {
//       setTextPosPct({ x, y });
//     }
//   }, [clickTarget, isTracking, imageList.length, activeImgIdx]);

//   const handleMouseDown = (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//     updatePosition(e.clientX, e.clientY);
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     updatePosition(e.clientX, e.clientY);
//   };

//   const handleMouseUpOrLeave = () => setIsDragging(false);

//   const handleMultipleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files) {
//       const newVideos = Array.from(files).map((file) => ({
//         id: Math.random().toString(36).substring(2, 11),
//         file,
//         src: URL.createObjectURL(file),
//       }));
//       setVideoList((prev) => [...prev, ...newVideos]);
//       if (videoList.length === 0 && newVideos.length > 0) {
//         setActiveVideoIdx(0);
//       }
//     }
//   };

//   const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files) {
//       const newImages = Array.from(files).map((file) => ({
//         id: Math.random().toString(36).substring(2, 11),
//         file,
//         src: URL.createObjectURL(file),
//         x: 45,
//         y: 45,
//       }));
//       setImageList((prev) => [...prev, ...newImages]);
//       if (activeImgIdx === null && newImages.length > 0) {
//         setActiveImgIdx(0);
//       }
//     }
//   };

//   const removeVideo = (index: number) => {
//     setVideoList((prev) => {
//       const updated = [...prev];
//       URL.revokeObjectURL(updated[index].src);
//       updated.splice(index, 1);
//       return updated;
//     });
//     if (activeVideoIdx >= index && activeVideoIdx > 0) {
//       setActiveVideoIdx(activeVideoIdx - 1);
//     }
//   };

//   const removeImage = (index: number) => {
//     setImageList((prev) => {
//       const updated = [...prev];
//       URL.revokeObjectURL(updated[index].src);
//       updated.splice(index, 1);
//       return updated;
//     });
//     if (activeImgIdx === index) {
//       setActiveImgIdx(null);
//     } else if (activeImgIdx !== null && activeImgIdx > index) {
//       setActiveImgIdx(activeImgIdx - 1);
//     }
//   };

//   // Live Preview Filter Sync
//   const getLivePreviewStyle = () => {
//     let filters = [];
//     if (activeEffect === "blur") filters.push("blur(6px)");
//     if (activeEffect === "grayscale") filters.push("grayscale(100%)");
//     if (colorFilter === "cinematic") filters.push("contrast(130%) saturate(140%)");
//     return { filter: filters.length > 0 ? filters.join(" ") : "none" };
//   };

//   // Canvas Aspect Ratio Class
//   const getCanvasAspectClass = () => {
//     if (aspectRatio === "916") return "aspect-[9/16] max-h-[460px] w-auto h-full";
//     if (aspectRatio === "169") return "aspect-[16/9] w-full h-auto";
//     if (aspectRatio === "11") return "aspect-square max-h-[400px] w-auto h-full";
//     return "aspect-video w-full h-auto";
//   };

//   const forceBlobDownload = (blobData: Blob | null, defaultName: string) => {
//     if (!blobData) return;
//     const downloadUrl = window.URL.createObjectURL(blobData);
//     const anchor = document.createElement("a");
//     anchor.href = downloadUrl;
//     anchor.download = defaultName;
//     document.body.appendChild(anchor);
//     anchor.click();
//     document.body.removeChild(anchor);
//     setTimeout(() => {
//       window.URL.revokeObjectURL(downloadUrl);
//     }, 1000);
//   };

//   // ========================================================
//   // 🚀 FIXED: High-Performance Export System with All Effects
//   // ========================================================
//   const handleExportVideo = async () => {
//     if (!ffmpeg || videoList.length === 0) return;

//     setIsTracking(false);
//     if (videoRef.current) videoRef.current.pause();

//     setLoading(true);
//     setRenderPercent(0);
//     setProcessedVideoUrl(null);
//     setProgress("Analyzing workspace data tracks...");

//     try {
//       // Write video files
//       for (let i = 0; i < videoList.length; i++) {
//         await ffmpeg.writeFile(`vid_${i}.mp4`, await fetchFile(videoList[i].file));
//       }
//       // Write image files
//       for (let i = 0; i < imageList.length; i++) {
//         await ffmpeg.writeFile(`img_${i}.png`, await fetchFile(imageList[i].file));
//       }

//       let filterComplexStr = "";
//       let lastVideoStage = "0:v";

//       // Handle multiple videos concatenation
//       if (videoList.length > 1) {
//         let concatInputs = "";
//         for (let i = 0; i < videoList.length; i++) {
//           concatInputs += `[${i}:v][${i}:a]`;
//         }
//         filterComplexStr += `${concatInputs}concat=n=${videoList.length}:v=1:a=1[mergedv][mergeda];`;
//         lastVideoStage = "mergedv";
//       }

//       let currentInputIdx = videoList.length;
//       let currentVStage = lastVideoStage;

//       // Logo overlay chain with proper scaling and opacity
//       for (let i = 0; i < imageList.length; i++) {
//         const outStage = `v_img_${i}`;
//         const xCoord = `W*${Math.min(Math.max(imageList[i].x / 100, 0), 0.95)}`;
//         const yCoord = `H*${Math.min(Math.max(imageList[i].y / 100, 0), 0.95)}`;
//         const scaleFactor = logoScale / 100;
//         const opacityFactor = logoOpacity / 100;
        
//         filterComplexStr += `[${currentInputIdx}:v]format=rgba,colorchannelmixer=aa=${opacityFactor},scale=iw*${scaleFactor}:-1[wm_${i}];`;
//         filterComplexStr += `[${currentVStage}][wm_${i}]overlay=${xCoord}:${yCoord}[${outStage}];`;
//         currentVStage = outStage;
//         currentInputIdx++;
//       }

//       // Build extra filters array with proper effect application
//       let extraFilters = [];
      
//       // Speed adjustment (PTS)
//       if (speed !== "1.0") {
//         const speedVal = parseFloat(speed);
//         if (speedVal > 0 && speedVal <= 2.0) {
//           extraFilters.push(`setpts=${(1 / speedVal).toFixed(2)}*PTS`);
//         }
//       }

//       // Aspect ratio cropping
//       if (aspectRatio === "916") {
//         extraFilters.push("crop=ih*9/16:ih: (iw-ih*9/16)/2:0");
//       } else if (aspectRatio === "169") {
//         extraFilters.push("crop=iw:iw*9/16:0:(ih-iw*9/16)/2");
//       } else if (aspectRatio === "11") {
//         const size = "min(iw,ih)";
//         extraFilters.push(`crop=${size}:${size}:(iw-${size})/2:(ih-${size})/2`);
//       }

//       // Visual Effects (APPLIED CORRECTLY)
//       if (activeEffect === "blur") {
//         extraFilters.push("gblur=sigma=12");
//       }
//       if (activeEffect === "grayscale") {
//         extraFilters.push("hue=s=0");
//       }
      
//       // Color grading (cinematic LUT)
//       if (colorFilter === "cinematic") {
//         extraFilters.push("eq=contrast=1.3:saturation=1.4:brightness=0.05");
//       }

//       // Text overlay with proper positioning
//       if (overlayText) {
//         const tx = `(w-text_w)*${textPosPct.x / 100}`;
//         const ty = `(h-text_h)*${textPosPct.y / 100}`;
//         const escapedText = overlayText.replace(/'/g, "\\'").replace(/:/g, "\\:");
//         extraFilters.push(
//           `drawtext=text='${escapedText}':x=${tx}:y=${ty}:fontsize=${textSize}:fontcolor=${textColor.replace('#', '0x')}:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:shadowx=2:shadowy=2:shadowcolor=0x000000@0.5`
//         );
//       }

//       // Apply all filters to the video stream
//       if (extraFilters.length > 0) {
//         const filterStr = extraFilters.join(",");
//         if (filterComplexStr) {
//           filterComplexStr += `[${currentVStage}]${filterStr}[finalv];`;
//           currentVStage = "finalv";
//         } else {
//           filterComplexStr += `[0:v]${filterStr}[finalv];`;
//           currentVStage = "finalv";
//         }
//       }

//       // Audio processing
//       let audioStage = videoList.length > 1 ? "mergeda" : "0:a";
//       let audioFilters = [];
      
//       // Speed audio adjustment
//       if (speed !== "1.0") {
//         const speedVal = parseFloat(speed);
//         if (speedVal >= 0.5 && speedVal <= 2.0) {
//           // For speeds other than 1.0, use atempo filter
//           if (speedVal !== 1.0) {
//             // Handle speed by adjusting audio tempo
//             audioFilters.push(`atempo=${speedVal}`);
//           }
//         }
//       }
      
//       // Volume adjustment
//       if (volume !== "1.0") {
//         const volVal = parseFloat(volume);
//         if (volVal >= 0 && volVal <= 2.0) {
//           audioFilters.push(`volume=${volVal}`);
//         }
//       }
      
//       // Apply audio filters
//       if (audioFilters.length > 0) {
//         const audioFilterStr = audioFilters.join(",");
//         if (filterComplexStr) {
//           filterComplexStr += `[${audioStage}]${audioFilterStr}[finala];`;
//           audioStage = "finala";
//         } else {
//           filterComplexStr += `[0:a]${audioFilterStr}[finala];`;
//           audioStage = "finala";
//         }
//       }

//       // Build command
//       let cmd: string[] = [];
      
//       // Input files
//       videoList.forEach((_, idx) => cmd.push("-i", `vid_${idx}.mp4`));
//       imageList.forEach((_, idx) => cmd.push("-i", `img_${idx}.png`));

//       // Trimming
//       const startSec = timeToSeconds(startTime);
//       const endSec = timeToSeconds(endTime);
//       if (startSec > 0 || endSec < videoDuration) {
//         cmd.push("-ss", startTime);
//         if (endSec > startSec && endSec <= videoDuration) {
//           cmd.push("-to", endTime);
//         }
//       }

//       // Filter complex with proper mapping
//       if (filterComplexStr) {
//         cmd.push("-filter_complex", filterComplexStr);
//         cmd.push("-map", `[${currentVStage}]`);
//         if (audioStage) {
//           cmd.push("-map", `[${audioStage}]`);
//         }
//       }

//       const outName = "capcut_studio_export.mp4";
      
//       // Encoding settings
//       cmd.push("-c:v", "libx264");
//       cmd.push("-pix_fmt", "yuv420p");
//       cmd.push("-preset", "medium");
//       cmd.push("-crf", "23");
      
//       // Audio settings
//       if (audioStage) {
//         cmd.push("-c:a", "aac");
//         cmd.push("-b:a", "128k");
//       }
      
//       // Final output
//       cmd.push("-movflags", "+faststart");
//       cmd.push(outName);

//       setProgress("Encoding master frames with all effects...");
//       console.log("FFmpeg Command:", cmd.join(" "));
      
//       await ffmpeg.exec(cmd);

//       const fileData = await ffmpeg.readFile(outName);
//       const binaryBlob = new Blob([fileData], { type: "video/mp4" });

//       setProcessedVideoUrl(URL.createObjectURL(binaryBlob));
//       setProcessedVideoBlob(binaryBlob);
//       setLoading(false);
//       setProgress("Export complete!");
//     } catch (err) {
//       console.error("Export error:", err);
//       setProgress(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`);
//       setLoading(false);
//     }
//   };

//   // Helper: Convert time string to seconds
//   const timeToSeconds = (timeStr: string): number => {
//     const parts = timeStr.split(':').map(Number);
//     if (parts.length === 3) {
//       return parts[0] * 3600 + parts[1] * 60 + parts[2];
//     }
//     return 0;
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       videoList.forEach(v => URL.revokeObjectURL(v.src));
//       imageList.forEach(i => URL.revokeObjectURL(i.src));
//       if (processedVideoUrl) URL.revokeObjectURL(processedVideoUrl);
//     };
//   }, [videoList, imageList, processedVideoUrl]);

//   return (
//     <div className="w-full max-w-[1600px] mx-auto min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30">

//       {/* 👑 Professional Studio Top Navigation */}
//       <header className="flex items-center justify-between border-b border-zinc-800/80 bg-[#0d0d11] px-6 py-3.5 backdrop-blur-md sticky top-0 z-50">
//         <div className="flex items-center gap-3">
//           <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
//           <span className="text-sm font-black tracking-widest text-white uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">CAPCUT PRO MOTION STUDIO</span>
//         </div>
//         <div className="flex items-center gap-4">
//           <span className="text-[11px] font-mono bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md text-zinc-400">
//             {ready ? "🟢 CORE ENGINES ACTIVE" : "⏳ LOADING GPU CORE..."}
//           </span>
//         </div>
//       </header>

//       {!ready ? (
//         <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
//           <div className="w-12 h-12 border-2 border-zinc-800 border-t-cyan-400 rounded-full animate-spin mb-4" />
//           <p className="text-xs font-mono text-zinc-400 animate-pulse tracking-wide uppercase">{progress}</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-px bg-zinc-900/60 min-h-[calc(100vh-60px)]">

//           {/* 🧩 Left Sidebar: Media & Upload Panel */}
//           <aside className="xl:col-span-3 bg-[#0d0d11] p-5 space-y-6 border-r border-zinc-800/60 overflow-y-auto max-h-[calc(100vh-60px)]">
//             <div>
//               <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-3">Asset Pipeline</label>
//               <div className="grid grid-cols-1 gap-2">
//                 <div className="group border border-dashed border-zinc-800 hover:border-cyan-500/50 p-4 rounded-xl bg-zinc-950/60 text-center transition-all relative cursor-pointer">
//                   <input type="file" accept="video/*" multiple onChange={handleMultipleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
//                   <span className="text-xs text-zinc-400 group-hover:text-cyan-400 block transition-colors">🎬 Import Video Clips ({videoList.length})</span>
//                 </div>
//                 <div className="group border border-dashed border-zinc-800 hover:border-fuchsia-500/50 p-4 rounded-xl bg-zinc-950/60 text-center transition-all relative cursor-pointer">
//                   <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
//                   <span className="text-xs text-zinc-400 group-hover:text-fuchsia-400 block transition-colors">🖼️ Import Overlay Logos ({imageList.length})</span>
//                 </div>
//               </div>
//             </div>

//             {/* Video List */}
//             {videoList.length > 0 && (
//               <div>
//                 <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2">Video Tracks</label>
//                 <div className="space-y-1.5 max-h-32 overflow-y-auto">
//                   {videoList.map((video, idx) => (
//                     <div key={video.id} className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${activeVideoIdx === idx ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-zinc-900/50'}`}>
//                       <button onClick={() => setActiveVideoIdx(idx)} className="flex-1 text-left truncate text-zinc-300 hover:text-white">
//                         🎬 Clip {idx + 1}
//                       </button>
//                       <button onClick={() => removeVideo(idx)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Image List */}
//             {imageList.length > 0 && (
//               <div>
//                 <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2">Overlay Layers</label>
//                 <div className="space-y-1.5 max-h-32 overflow-y-auto">
//                   {imageList.map((img, idx) => (
//                     <div key={img.id} className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${activeImgIdx === idx ? 'bg-fuchsia-500/10 border border-fuchsia-500/30' : 'bg-zinc-900/50'}`}>
//                       <button onClick={() => setActiveImgIdx(idx)} className="flex-1 text-left truncate text-zinc-300 hover:text-white">
//                         🖼️ Overlay {idx + 1}
//                       </button>
//                       <button onClick={() => removeImage(idx)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Aspect Ratio Panel */}
//             <div>
//               <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2.5">Canvas Crop Aspect</label>
//               <div className="grid grid-cols-2 gap-1.5">
//                 {[
//                   { id: "original", label: "Original" },
//                   { id: "169", label: "16:9" },
//                   { id: "916", label: "9:16" },
//                   { id: "11", label: "1:1" },
//                 ].map((ratio) => (
//                   <button
//                     key={ratio.id}
//                     onClick={() => setAspectRatio(ratio.id)}
//                     className={`py-2 text-[11px] rounded-lg font-medium border transition-all ${aspectRatio === ratio.id
//                         ? "bg-cyan-500 border-cyan-500 text-black font-bold"
//                         : "bg-zinc-950 text-zinc-400 border-zinc-800/80 hover:bg-zinc-900"
//                       }`}
//                   >
//                     {ratio.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Effects Dashboard */}
//             <div className="space-y-4">
//               <div>
//                 <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block mb-2">VFX Filters</label>
//                 <div className="grid grid-cols-2 gap-1.5">
//                   <button
//                     onClick={() => setActiveEffect("none")}
//                     className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${activeEffect === "none" ? "bg-zinc-100 text-black" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
//                       }`}
//                   >
//                     No Effect
//                   </button>
//                   <button
//                     onClick={() => setActiveEffect("blur")}
//                     className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${activeEffect === "blur" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
//                       }`}
//                   >
//                     Motion Blur
//                   </button>
//                   <button
//                     onClick={() => setActiveEffect("grayscale")}
//                     className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${activeEffect === "grayscale" ? "bg-zinc-800 text-zinc-100 font-bold" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
//                       }`}
//                   >
//                     Retro Gray
//                   </button>
//                   <button
//                     onClick={() => setColorFilter(colorFilter === "cinematic" ? "none" : "cinematic")}
//                     className={`py-2 text-[11px] font-semibold rounded-lg transition-all ${colorFilter === "cinematic" ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 font-bold" : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
//                       }`}
//                   >
//                     Cinematic LUT
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </aside>

//           {/* 📺 Center Area: Live AI Preview Monitor & Timeline */}
//           <main className="xl:col-span-6 bg-[#060608] flex flex-col justify-between p-6">

//             {/* Live Screen Casting */}
//             <div className="w-full flex-1 flex flex-col justify-center items-center">
//               {videoList.length > 0 ? (
//                 <div className="w-full max-w-2xl bg-[#0d0d11] p-3 rounded-2xl border border-zinc-800/80 shadow-2xl relative">

//                   <div className="flex justify-between items-center mb-3 px-1">
//                     <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Live Master Canvas</span>
//                     {imageList.length > 0 && (
//                       <button
//                         onClick={() => setIsTracking(!isTracking)}
//                         className={`text-[11px] font-black px-3.5 py-1 rounded-full border transition-all ${isTracking ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse" : "bg-zinc-900 text-cyan-400 border-zinc-800"
//                           }`}
//                       >
//                         {isTracking ? "🛑 LOCK POSITION ACTIVE" : "👄 START MOUTH TRACKING AI"}
//                       </button>
//                     )}
//                   </div>

//                   {/* Responsive Viewport */}
//                   <div className="w-full bg-black rounded-xl overflow-hidden relative flex items-center justify-center mx-auto transition-all shadow-inner min-h-[300px]">
//                     <div
//                       ref={containerRef}
//                       onMouseDown={handleMouseDown}
//                       onMouseMove={handleMouseMove}
//                       onMouseUp={handleMouseUpOrLeave}
//                       onMouseLeave={handleMouseUpOrLeave}
//                       className={`relative overflow-hidden flex items-center justify-center bg-zinc-950 transition-all ${getCanvasAspectClass()}`}
//                     >
//                       <video
//                         ref={videoRef}
//                         src={videoList[activeVideoIdx]?.src}
//                         onLoadedData={handleVideoLoadedData}
//                         controls={false}
//                         autoPlay
//                         loop
//                         muted
//                         style={getLivePreviewStyle()}
//                         className="w-full h-full object-cover pointer-events-none"
//                       />

//                       {imageList.map((img, index) => (
//                         <div
//                           key={img.id}
//                           style={{ left: `${img.x}%`, top: `${img.y}%` }}
//                           className={`absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 ${activeImgIdx === index ? "ring-2 ring-cyan-400" : ""
//                             }`}
//                         >
//                           <img
//                             src={img.src}
//                             style={{ width: `${logoScale * 3.5}px`, opacity: logoOpacity / 100 }}
//                             className="h-auto object-contain shadow-2xl"
//                             alt="Watermark Layer"
//                           />
//                         </div>
//                       ))}

//                       {overlayText && (
//                         <div
//                           style={{
//                             left: `${textPosPct.x}%`,
//                             top: `${textPosPct.y}%`,
//                             color: textColor,
//                             fontSize: `${textSize}px`
//                           }}
//                           className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 font-black tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-center select-none"
//                         >
//                           {overlayText}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                 </div>
//               ) : (
//                 <div className="text-zinc-600 text-xs font-medium tracking-wide uppercase">No Clips Loaded into Viewport</div>
//               )}
//             </div>

//             {/* 🎞️ Pro-Level Linear Timeline Module */}
//             {videoList.length > 0 && (
//               <div className="bg-[#0d0d11] border border-zinc-800/80 rounded-xl p-4 mt-6">
//                 <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-2 px-1">
//                   <span className="text-cyan-400 font-bold">🎬 CLIP_{activeVideoIdx + 1}.MP4</span>
//                   <span>{timelineVal.toFixed(2)}s / <span className="text-zinc-600">{videoDuration.toFixed(2)}s</span></span>
//                 </div>
//                 <div className="relative flex items-center bg-zinc-950 h-8 rounded-lg border border-zinc-900 px-2 overflow-hidden">
//                   <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 px-4">
//                     {[...Array(10)].map((_, i) => <div key={i} className="w-[1px] h-full bg-zinc-400" />)}
//                   </div>
//                   <input
//                     type="range"
//                     min="0"
//                     max={videoDuration || 10}
//                     step="0.05"
//                     value={timelineVal}
//                     onChange={(e) => handleTimelineChange(parseFloat(e.target.value))}
//                     className="w-full accent-cyan-400 bg-transparent h-full relative z-10 cursor-ew-resize opacity-80"
//                   />
//                 </div>
//               </div>
//             )}
//           </main>

//           {/* 🎚️ Right Sidebar: Advanced Coordinate Control Dashboard */}
//           <aside className="xl:col-span-3 bg-[#0d0d11] p-5 space-y-6 border-l border-zinc-800/60 overflow-y-auto max-h-[calc(100vh-60px)]">
//             <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
//               <button
//                 onClick={() => setClickTarget("logo")}
//                 className={`w-full py-2 text-[11px] font-bold rounded-lg transition-all ${clickTarget === "logo" ? "bg-zinc-900 text-white shadow-sm border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
//                   }`}
//               >
//                 Logo Adjust
//               </button>
//               <button
//                 onClick={() => setClickTarget("text")}
//                 className={`w-full py-2 text-[11px] font-bold rounded-lg transition-all ${clickTarget === "text" ? "bg-zinc-900 text-white shadow-sm border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
//                   }`}
//               >
//                 Text Adjust
//               </button>
//             </div>

//             {/* Transform Module */}
//             <div className="space-y-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
//               <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block">Layer Transformation</label>
//               <div>
//                 <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
//                   <span>Scale Size</span>
//                   <span>{logoScale}%</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="5"
//                   max="50"
//                   value={logoScale}
//                   onChange={(e) => setLogoScale(parseInt(e.target.value))}
//                   className="w-full accent-zinc-200 bg-zinc-900 h-1 rounded"
//                 />
//               </div>
//               <div>
//                 <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
//                   <span>Layer Opacity</span>
//                   <span>{logoOpacity}%</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="10"
//                   max="100"
//                   value={logoOpacity}
//                   onChange={(e) => setLogoOpacity(parseInt(e.target.value))}
//                   className="w-full accent-zinc-200 bg-zinc-900 h-1 rounded"
//                 />
//               </div>
//             </div>

//             {/* Text Editor */}
//             <div className="space-y-3">
//               <label className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase block">Text Typography</label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Type title text..."
//                   value={overlayText}
//                   onChange={(e) => setOverlayText(e.target.value)}
//                   className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs outline-none text-white focus:border-zinc-700 font-medium"
//                 />
//                 <input
//                   type="color"
//                   value={textColor}
//                   onChange={(e) => setTextColor(e.target.value)}
//                   className="w-9 h-8 bg-transparent cursor-pointer rounded-lg border-0 overflow-hidden"
//                 />
//               </div>
//               <div>
//                 <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
//                   <span>Text Size</span>
//                   <span>{textSize}px</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="12"
//                   max="72"
//                   value={textSize}
//                   onChange={(e) => setTextSize(parseInt(e.target.value))}
//                   className="w-full accent-zinc-200 bg-zinc-900 h-1 rounded"
//                 />
//               </div>
//             </div>

//             {/* Time Trim Coordinates */}
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <label className="text-[10px] font-bold text-zinc-500 block mb-1">Trim Start</label>
//                 <input
//                   type="text"
//                   value={startTime}
//                   onChange={(e) => setStartTime(e.target.value)}
//                   className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-mono text-center"
//                 />
//               </div>
//               <div>
//                 <label className="text-[10px] font-bold text-zinc-500 block mb-1">Trim End</label>
//                 <input
//                   type="text"
//                   value={endTime}
//                   onChange={(e) => setEndTime(e.target.value)}
//                   className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-mono text-center"
//                 />
//               </div>
//             </div>

//             {/* Speed and Volume */}
//             <div className="grid grid-cols-2 gap-2 bg-zinc-950/20 p-1 rounded-xl border border-zinc-900/40">
//               <select
//                 value={speed}
//                 onChange={(e) => setSpeed(e.target.value)}
//                 className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-2 py-2 text-xs text-zinc-300 font-medium outline-none"
//               >
//                 <option value="1.0">1.0x Normal</option>
//                 <option value="0.5">0.5x Slow</option>
//                 <option value="0.75">0.75x Slow</option>
//                 <option value="1.25">1.25x Fast</option>
//                 <option value="1.5">1.5x Fast</option>
//                 <option value="2.0">2.0x Fast</option>
//               </select>
//               <select
//                 value={volume}
//                 onChange={(e) => setVolume(e.target.value)}
//                 className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg px-2 py-2 text-xs text-zinc-300 font-medium outline-none"
//               >
//                 <option value="0.0">Mute</option>
//                 <option value="0.5">50%</option>
//                 <option value="0.75">75%</option>
//                 <option value="1.0">100%</option>
//                 <option value="1.5">150%</option>
//                 <option value="2.0">200%</option>
//               </select>
//             </div>

//             {/* Export Master Button */}
//             <div className="pt-4 border-t border-zinc-800/60">
//               <button
//                 onClick={handleExportVideo}
//                 disabled={loading || videoList.length === 0}
//                 className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 🚀 COMPILE & EXPORT MASTER
//               </button>
//             </div>
//           </aside>

//         </div>
//       )}

//       {/* 📥 High-Speed Rendering Status & Download Zone */}
//       {(loading || processedVideoUrl) && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
//           <div className="bg-[#0d0d11] border border-zinc-800 rounded-2xl p-6 max-w-lg w-full text-center space-y-4 shadow-2xl">
//             {loading ? (
//               <div className="py-6 space-y-3">
//                 <div className="w-8 h-8 border-2 border-t-cyan-400 border-zinc-800 rounded-full animate-spin mx-auto" />
//                 <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
//                   <div style={{ width: `${renderPercent}%` }} className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300" />
//                 </div>
//                 <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{progress} ({renderPercent}%)</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">🎉 RENDER STREAM COMPILED</span>
//                 <video
//                   src={processedVideoUrl!}
//                   controls
//                   className="w-full rounded-xl border border-zinc-800 bg-black aspect-video shadow-inner"
//                 />
//                 <button
//                   onClick={() => forceBlobDownload(processedVideoBlob, "studio_master.mp4")}
//                   className="w-full py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all"
//                 >
//                   📥 Download Final Video
//                 </button>
//                 <button
//                   onClick={() => {
//                     setProcessedVideoUrl(null);
//                     setProcessedVideoBlob(null);
//                   }}
//                   className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

