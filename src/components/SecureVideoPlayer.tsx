"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react";

interface SecureVideoPlayerProps {
  src: string;
  userEmail: string;
}

export default function SecureVideoPlayer({ src, userEmail }: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });

  // Move watermark every 10 seconds to prevent cropping
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 80) + 10;
      const randomLeft = Math.floor(Math.random() * 80) + 10;
      setWatermarkPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Prevent keyboard shortcuts for saving (Ctrl+S) or inspecting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Failed to play video:", err);
        });
      }
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group select-none"
      onContextMenu={(e) => e.preventDefault()} // Disable right-click
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain cursor-pointer"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        playsInline
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Dynamic Anti-Piracy Watermark */}
      <div 
        className="absolute pointer-events-none text-white/30 text-xs md:text-sm font-bold transition-all duration-1000"
        style={{ top: watermarkPos.top, left: watermarkPos.left }}
      >
        {userEmail} <br />
        {new Date().toISOString().split('T')[0]}
      </div>

      {/* Custom Controls (Overlay) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:text-blue-400 transition-colors">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <Volume2 size={20} className="text-white" />
            <input type="range" onClick={(e) => e.stopPropagation()} className="w-20 h-1 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          <button className="text-white hover:text-blue-400 transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white hover:text-blue-400 transition-colors">
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
