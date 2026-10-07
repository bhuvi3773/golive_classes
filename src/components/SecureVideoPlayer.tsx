"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, RotateCcw, RotateCw } from "lucide-react";

interface SecureVideoPlayerProps {
  src: string;
  userEmail: string;
}

export interface SecureVideoPlayerRef {
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
}

const SecureVideoPlayer = forwardRef<SecureVideoPlayerRef, SecureVideoPlayerProps>(({ src, userEmail }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => videoRef.current?.currentTime || 0,
    seekTo: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  }));

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
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
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col pointer-events-none">
        
        {/* Progress Bar */}
        <div className="w-full mb-3 pointer-events-auto flex items-center gap-3">
          <span className="text-xs text-slate-900 font-medium w-10 text-right">{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
          />
          <span className="text-xs text-slate-900 font-medium w-10">{formatTime(duration)}</span>
        </div>

        {/* Bottom Controls Row */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-slate-900 hover:text-blue-400 transition-colors">
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-slate-900 hover:text-blue-400 transition-colors" title="Skip backward 10s">
              <RotateCcw size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-slate-900 hover:text-blue-400 transition-colors" title="Skip forward 10s">
              <RotateCw size={18} />
            </button>
            <div className="flex items-center gap-2 ml-2 group/vol">
              <button onClick={(e) => { e.stopPropagation(); handleVolumeChange({ target: { value: isMuted ? 1 : 0 } } as any); }} className="text-slate-900 hover:text-blue-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                onClick={(e) => e.stopPropagation()} 
                className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 transition-all duration-300 h-1 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-900 hover:text-blue-400 transition-colors">
              <Settings size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-slate-900 hover:text-blue-400 transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SecureVideoPlayer;
