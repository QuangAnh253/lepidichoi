"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Disc3, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateSettingsAction } from "@/actions/settings";

const TRACKS = [
  "/audio/track01.mp3",
  "/audio/track02.mp3",
  "/audio/track03.mp3",
];

export function GlobalMusicPlayer({ initialEnabled }: { initialEnabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // State for true audio playback status (used only for UI animations)
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Intent state
  const [isUserMuted, setIsUserMuted] = useState(!initialEnabled);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.2);
  
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
          // Ignore AbortError caused by rapid play/pause or src changes
          if (e.name !== "AbortError") {
            console.error("Audio play error:", e);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isUserMuted, hasInteracted, currentTrackIndex]);

  // Sync initialEnabled from DB if it changes externally (e.g. from another tab/device)
  useEffect(() => {
    setIsUserMuted(!initialEnabled);
  }, [initialEnabled]);

  const togglePlay = () => {
    const nextMuted = !isUserMuted;
    setIsUserMuted(nextMuted);
    setHasInteracted(true); // Treat clicking the toggle as an interaction
    
    startTransition(async () => {
      await updateSettingsAction({ musicEnabled: !nextMuted });
    });
  };

  const handleEnded = () => {
    let nextTrack = Math.floor(Math.random() * TRACKS.length);
    if (TRACKS.length > 1) {
      while (nextTrack === currentTrackIndex) {
        nextTrack = Math.floor(Math.random() * TRACKS.length);
      }
    }
    setCurrentTrackIndex(nextTrack);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    localStorage.setItem("date-music-volume", val.toString());
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={TRACKS[currentTrackIndex]}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 group">
        <button
          onClick={togglePlay}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-soft-xl border border-border/50 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isPlaying ? "text-[#c9822d] border-[#c9822d]/30" : "text-muted-foreground opacity-60 hover:opacity-100"
          )}
          aria-label={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
        >
          <Disc3 className={cn("h-8 w-8", isPlaying && "animate-[spin_4s_linear_infinite]")} strokeWidth={1.5} />
        </button>

        <div className="hidden group-hover:flex items-center gap-2 rounded-full bg-background shadow-soft-xl border border-border/50 px-3 py-2.5 animate-in slide-in-from-left-4 fade-in duration-200">
          <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-[#c9822d] cursor-pointer"
            title="Âm lượng"
          />
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </>
  );
}
