"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Disc3, Volume2, VolumeX, SkipBack, SkipForward, Play, Pause, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateSettingsAction } from "@/actions/settings";

interface Track {
  url: string;
  title: string;
  artist: string;
  coverArt: string;
}

const TRACKS: Track[] = [
  {
    url: "/audio/track01.mp3",
    title: "Closer (with Paul Blanco, Mahalia)",
    artist: "RM",
    coverArt: "https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/7/6/5/c/765cb65e0ca05b0eab40ce6341f80a1e.jpg",
  },
  {
    url: "/audio/track02.mp3",
    title: "To Be Alone With You",
    artist: "Sufjan Stevens",
    coverArt: "https://i.ytimg.com/vi/N3zu9NucyBg/maxresdefault.jpg",
  },
  {
    url: "/audio/track03.mp3",
    title: "same moon, different city",
    artist: "kanegi",
    coverArt: "https://i.ytimg.com/vi/UWj_ZzPmSoQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBjPGEHsGYNfEj0bY13kw5GJBwOrg",
  }
];

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function GlobalMusicPlayer({ initialEnabled }: { initialEnabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [isUserMuted, setIsUserMuted] = useState(!initialEnabled);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.2);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [, startTransition] = useTransition();

  // Initialization
  useEffect(() => {
    setCurrentTrackIndex(Math.floor(Math.random() * TRACKS.length));
    const savedVol = localStorage.getItem("date-music-volume");
    if (savedVol) setVolume(parseFloat(savedVol));
  }, []);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // First interaction listener to allow autoplay
  useEffect(() => {
    if (hasInteracted) return;
    const onInteract = () => {
      setHasInteracted(true);
      document.removeEventListener("click", onInteract);
      document.removeEventListener("keydown", onInteract);
      document.removeEventListener("touchstart", onInteract);
    };
    document.addEventListener("click", onInteract);
    document.addEventListener("keydown", onInteract);
    document.addEventListener("touchstart", onInteract);
    return () => {
      document.removeEventListener("click", onInteract);
      document.removeEventListener("keydown", onInteract);
      document.removeEventListener("touchstart", onInteract);
    };
  }, [hasInteracted]);

  // Master Play/Pause Controller
  useEffect(() => {
    if (!audioRef.current) return;
    if (!isUserMuted && hasInteracted) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if (e.name !== "AbortError" && e.name !== "NotAllowedError") {
            console.error("Audio play error:", e);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isUserMuted, hasInteracted, currentTrackIndex]);

  // Sync initialEnabled from DB if it changes externally
  useEffect(() => {
    setIsUserMuted(!initialEnabled);
  }, [initialEnabled]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextMuted = !isUserMuted;
    setIsUserMuted(nextMuted);
    setHasInteracted(true);
    
    startTransition(async () => {
      await updateSettingsAction({ musicEnabled: !nextMuted });
    });
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    localStorage.setItem("date-music-volume", val.toString());
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const val = parseFloat(e.target.value);
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const track = TRACKS[currentTrackIndex];

  return (
    <>
      <audio
        ref={audioRef}
        src={track.url}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      <div className="fixed bottom-6 left-6 z-50 flex items-end gap-3 group">
        
        {/* Expanded Mini Player */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 bg-background/95 backdrop-blur-md shadow-soft-2xl border border-border/50 rounded-2xl overflow-hidden transition-all duration-500 origin-bottom-left flex flex-col",
            isExpanded ? "w-72 sm:w-80 opacity-100 scale-100" : "w-14 h-14 opacity-0 scale-50 pointer-events-none"
          )}
        >
          {/* Close button */}
          <button 
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors z-10"
            aria-label="Thu gọn"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex p-5 pb-3 gap-4 items-center">
            {/* Cover Art (Spinning Vinyl Style) */}
            <div className={cn("relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-border/50 shadow-sm transition-transform duration-1000", isPlaying ? "animate-[spin_6s_linear_infinite]" : "")}>
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                 <div className="w-3 h-3 bg-background/90 rounded-full border border-border shadow-inner"></div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={track.coverArt} alt={track.title} className="object-cover w-full h-full" />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 pr-6">
              <h4 className="font-display text-[15px] truncate text-foreground leading-tight">{track.title}</h4>
              <p className="text-xs text-muted-foreground truncate mt-1">{track.artist}</p>
            </div>
          </div>

          {/* Progress Bar & Controls */}
          <div className="px-5 pb-5 flex flex-col gap-4">
            {/* Progress */}
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 h-1.5 bg-muted/80 rounded-full overflow-hidden relative group/seek cursor-pointer">
                <input 
                   type="range"
                   min={0}
                   max={duration || 100}
                   value={currentTime}
                   onChange={handleSeek}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="h-full bg-primary/80 transition-all duration-200" 
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 group/volume relative">
                 <VolumeX className="h-4 w-4 text-muted-foreground cursor-pointer" />
                 <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1.5 accent-[#c9822d] bg-muted rounded-full cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-[#c9822d] [&::-webkit-slider-thumb]:rounded-full"
                    title="Âm lượng"
                 />
               </div>
               
               <div className="flex items-center gap-4">
                 <button onClick={handlePrev} className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label="Bài trước">
                   <SkipBack className="h-4 w-4 fill-current" />
                 </button>
                 <button onClick={togglePlay} className="h-10 w-10 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-105" aria-label={isPlaying ? "Dừng" : "Phát"}>
                   {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                 </button>
                 <button onClick={handleNext} className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label="Bài tiếp">
                   <SkipForward className="h-4 w-4 fill-current" />
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Floating Button (Vinyl) */}
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-background shadow-soft-xl border border-border/50 transition-all focus:outline-none z-10 hover:scale-105",
            isPlaying ? "text-[#c9822d] border-[#c9822d]/30" : "text-muted-foreground opacity-80 hover:opacity-100",
            isExpanded ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
          )}
          aria-label="Mở trình phát nhạc"
        >
          <Disc3 className={cn("h-8 w-8", isPlaying && "animate-[spin_4s_linear_infinite]")} strokeWidth={1.5} />
        </button>
      </div>
    </>
  );
}
