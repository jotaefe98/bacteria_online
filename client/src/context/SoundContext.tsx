import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useGameSounds } from "../hooks/useGameSounds";
import type { SoundType } from "../hooks/useGameSounds";

interface SoundContextType {
  playSound: (soundType: SoundType, volumeMultiplier?: number) => Promise<void>;
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  toggleSounds: () => void;
  masterVolume: number;
  setMasterVolume: (volume: number) => void;
  initializeAudio: () => void;
  isInitialized: boolean;
  isIOS: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const soundUtils = useGameSounds();

  return (
    <SoundContext.Provider value={soundUtils}>{children}</SoundContext.Provider>
  );
};

export const useSounds = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSounds must be used within a SoundProvider");
  }
  return context;
};
