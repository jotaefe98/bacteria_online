# 🎵 Sistema de Sonidos - Bacteria Online

## ✅ **Implementado:**

### 10 Sonidos Específicos:

- `game_start.mp3` - Inicio de partida
- `your_turn.mp3` - Tu turno
- `timer.mp3` - Timer 15 segundos
- `bacteria_applied.mp3` - Bacteria aplicada
- `medicine_applied.mp3` - Medicina aplicada
- `organ_inmuniced.mp3` - Órgano inmunizado
- `organ_die.mp3` - Órgano destruido
- `treatment_card.mp3` - Carta de tratamiento
- `victory.mp3` - Victoria
- `defeat.mp3` - Derrota

## 🎯 **Características:**

### ✅ Optimizado para iPhone:

- `playsinline="true"` - No aparece reproductor de notificaciones
- Elementos audio invisibles en DOM para iOS
- Inicialización tras interacción del usuario

### ✅ Sonidos Cortos Optimizados:

- Nuevo elemento Audio por cada reproducción
- Sin pool complejo (perfecto para sonidos cortos)
- Limpieza automática de memoria

### ✅ Control Granular:

- Volumen específico por sonido
- Volumen maestro del usuario
- Sonidos forzados (victory/defeat siempre suenan)

### ✅ Configuración Persistente:

- LocalStorage para preferencias
- Activar/desactivar sonidos
- Control de volumen 0-100%

## 🎮 **Uso en el Juego:**

```typescript
import { useSounds } from "../context/SoundContext";

const { playSound, initializeAudio } = useSounds();

// Sonidos normales (respetan configuración del usuario)
playSound("bacteria_applied");
playSound("your_turn");

// Sonidos forzados (siempre suenan, incluso si está desactivado)
playSound("victory", true);
playSound("defeat", true);

// Inicializar (necesario para iOS)
initializeAudio(); // Llamar tras primera interacción
```

## 📱 **Estado iPhone:**

- ✅ **Sin reproductor de notificaciones**
- ✅ **Sonidos instantáneos**
- ✅ **Memoria optimizada**
- ✅ **Funciona sin configuración adicional**

---

**Próximo paso:** Integrar llamadas a `playSound()` en los eventos específicos del juego.
