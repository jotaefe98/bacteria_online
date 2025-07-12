import { useState, useCallback, useRef } from 'react';

// Tipos de sonidos específicos del juego
export type SoundType = 
  | 'game_start'
  | 'your_turn'
  | 'timer'
  | 'bacteria_applied'
  | 'medicine_applied'
  | 'organ_inmuniced'
  | 'organ_die'
  | 'treatment_card'
  | 'victory'
  | 'defeat';

// Detectar iPhone/iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const useGameSounds = () => {
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(() => {
    if (typeof localStorage === 'undefined') return true;
    const saved = localStorage.getItem('bacteria-sounds-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [masterVolume, setMasterVolume] = useState<number>(() => {
    if (typeof localStorage === 'undefined') return 0.5;
    const saved = localStorage.getItem('bacteria-master-volume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Función para crear y reproducir un sonido
  const playSound = useCallback(async (soundType: SoundType) => {
    // Si sonidos desactivados, NO reproducir NADA
    if (!soundsEnabled) return;
    if (masterVolume === 0) return;

    try {
      // INTERRUMPIR sonido anterior si existe
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        
        // Limpiar del DOM si es iOS
        if (isIOS() && currentAudioRef.current.parentNode) {
          currentAudioRef.current.parentNode.removeChild(currentAudioRef.current);
        }
      }

      // Crear nuevo elemento audio
      const audio = new Audio(`/sounds/${soundType}.mp3`);
      currentAudioRef.current = audio;
      
      // Configuración optimizada para iPhone
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'none';
      
      // MISMO VOLUMEN para todos los sonidos
      audio.volume = masterVolume;

      // Para iOS, necesitamos configuración especial
      if (isIOS()) {
        audio.style.position = 'absolute';
        audio.style.left = '-9999px';
        audio.style.opacity = '0';
        document.body.appendChild(audio);
        
        // Remover del DOM después de reproducir
        audio.addEventListener('ended', () => {
          if (audio.parentNode) {
            audio.parentNode.removeChild(audio);
          }
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
        });
      }

      // Limpiar referencia cuando termine
      audio.addEventListener('ended', () => {
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
        }
      });

      // Reproducir
      await audio.play();
      
      console.log(`🔊 Played sound: ${soundType}`);
      
    } catch (error) {
      console.warn(`❌ Failed to play sound: ${soundType}`, error);
    }
  }, [soundsEnabled, masterVolume]);

  // Inicializar audio (necesario para iOS)
  const initializeAudio = useCallback(() => {
    if (isInitialized) return;
    
    // En iOS, necesitamos una interacción del usuario
    if (isIOS()) {
      // Crear un audio silencioso para "desbloquear" el audio en iOS
      const dummyAudio = new Audio();
      dummyAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjuJz/LNeyMFKXTD8NyOOwsVXrDo7b5iGAg7k9n1unIiBC13yO/eeyQFK3nG7tmJOQcNZ7Tm6KdUEgxOq+H1vGEcBj2R2O/DfCUFKXHA79uMOQgMZrPl7b5jGgg2jNnzwXklBjFzwu7eaLJCBJGgLqKDNlDZWAG5dAOa4T2k8QqQkG2K7C4uo8QAgn8EHGwvCdAnFGKyKA==';
      dummyAudio.volume = 0;
      dummyAudio.play().catch(() => {});
    }
    
    setIsInitialized(true);
    console.log('🎵 Audio system initialized');
  }, [isInitialized]);

  // Función para alternar sonidos (para el botón de nota musical)
  const toggleSounds = useCallback(() => {
    const newState = !soundsEnabled;
    setSoundsEnabled(newState);
    
    // Detener sonido actual si se desactivan
    if (!newState && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bacteria-sounds-enabled', JSON.stringify(newState));
    }
  }, [soundsEnabled]);

  // Guardar configuración en localStorage
  const updateMasterVolume = useCallback((volume: number) => {
    setMasterVolume(volume);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bacteria-master-volume', volume.toString());
    }
  }, []);

  return {
    playSound,
    soundsEnabled,
    setSoundsEnabled,
    toggleSounds, // Nueva función para el botón
    masterVolume,
    setMasterVolume: updateMasterVolume,
    initializeAudio,
    isInitialized,
    isIOS: isIOS(),
  };
};
