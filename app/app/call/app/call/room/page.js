"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si";
const ROOM_PREFIX = "PremiumCall-";

function loadJitsiScript() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const s = document.createElement("script");
    s.src = `https://${DOMAIN}/external_api.js`;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Jitsi লোড করা যায়নি"));
    document.body.appendChild(s);
  });
}

function Room() {
  const router = useRouter();
  const params = useSearchParams();
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [status, setStatus] = useState("কল শুরু হচ্ছে...");

  const code = (params.get("code") || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const mode = params.get("mode") === "audio" ? "audio" : "video";
  const name = params.get("name") || "Guest";

  useEffect(() => {
    if (code.length < 4) {
      router.replace("/");
      return;
    }
    let disposed = false;

    loadJitsiScript()
      .then(() => {
        if (disposed || !containerRef.current) return;
        const isAudio = mode === "audio";

        const api = new window.JitsiMeetExternalAPI(DOMAIN, {
          roomName: ROOM_PREFIX + code,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName: name },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: isAudio,
            startAudioOnly: isAudio,
            disableDeepLinking: true,
            enableWelcomePage: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            MOBILE_APP_PROMO: false,
            DEFAULT_BACKGROUND: "#0b1026",
          },
        });

        apiRef.current = api;
        api.addListener("videoConferenceJoined", () => setStatus(""));
        api.addListener("readyToClose", () => router.replace("/"));
      })
      .catch((e) => setStatus(e.message));

    return () => {
      disposed = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [code, mode, name, router]);

  return (
    <div className="call-root">
      <div className="call-top">{code} • {mode === "audio" ? "অডিও" : "ভিডিও"}</div>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {status && <div className="call-loading">{status}</div>}
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<div className="call-loading">লোড হচ্ছে...</div>}>
      <Room />
    </Suspense>
  );
}
