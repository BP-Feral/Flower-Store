import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const HlsPlayer = ({ url }) => {
  const videoRef = useRef();

  useEffect(() => {
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn("Camera Feed warn:", data);
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url;
    }

    return () => {
      try {
        hls?.destroy();
      } catch (e) {
        console.debug("HLS cleanup error:", e);
      }
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="w-full max-w-3xl mx-auto mt-4 rounded shadow"
    />
  );
};

export default HlsPlayer;
