import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { QARI_OPTIONS } from "../data/islamicData";

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null); // { surahNumber, surahName, ayahNumber, audioUrl }
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [continuousPlay, setContinuousPlay] = useState(true);
  const [reciter, setReciter] = useState(() => localStorage.getItem("nqp_reciter") || "ar.alafasy");
  const [onTrackEndCallback, setOnTrackEndCallback] = useState(null);

  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onTrackEndCallback) {
        onTrackEndCallback();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [onTrackEndCallback]);

  // Volume synchronization
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Save reciter
  useEffect(() => {
    localStorage.setItem("nqp_reciter", reciter);
  }, [reciter]);

  const playAyah = (track, onEnded) => {
    if (!track || !track.audioUrl) return;

    if (currentTrack?.audioUrl === track.audioUrl && isPlaying) {
      audioRef.current.pause();
      return;
    }

    setCurrentTrack(track);
    if (onEnded) setOnTrackEndCallback(() => onEnded);

    audioRef.current.src = track.audioUrl;
    audioRef.current.play().catch((err) => {
      console.warn("Audio playback interrupted or blocked:", err);
    });
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const seek = (time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const stop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        continuousPlay,
        setContinuousPlay,
        reciter,
        setReciter,
        playAyah,
        togglePlay,
        seek,
        stop,
        qariOptions: QARI_OPTIONS
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
