# Sistema de Notificaciones del Juego

## Descripción

Sistema completo de notificaciones implementado usando `react-hot-toast` que proporciona feedback visual útil y no intrusivo al usuario.

## Notificaciones Implementadas

### 🎯 Acciones de Juego

- **Carta jugada**: Confirma que una carta se jugó exitosamente (QUITAR ESTA NOTIFICACION)
- **Carta descartada**: Notifica cuando se descarta una carta(QUITAR ESTA NOTIFICACION)
- **Cartas robadas**: Informa cuántas cartas se robaron del deck(QUITAR ESTA NOTIFICACION)

### 🦠 Ataques a Órganos (de otros jugadores)

- **Órgano infectado**: Cuando otro jugador infecta tu órgano (NO LE SALE AL JUGADOR QUE HA SIDO INFECTADO)
- **Órgano destruido**: Cuando otro jugador destruye tu órgano (NO LE SALE AL JUGADOR QUE HA SIDO DESTRUIDO)
- **Vacuna destruida**: Cuando un bacteria destruye la vacuna de tu órgano (NO LE SALE AL JUGADOR QUE HA SIDO DESTRUIDO)

### 💊 Tratamientos Beneficiosos

- **Órgano curado**: Cuando otro jugador cura tu órgano infectado (NO LE SALE AL JUGADOR QUE HA SIDO CURADO)
- **Órgano inmunizado**: Cuando tu órgano se vuelve inmune

### 🃏 Tratamientos Especiales

- **Órgano robado**: Cuando otro jugador roba uno de tus órganos
- **Error médico**: Cuando alguien usa "Error Médico" contra ti
- **Contagio**: Cuando se activa el contagio y afecta múltiples jugadores

### ⚠️ Errores y Acciones Bloqueadas

- **Acción inválida**: Cuando intentas hacer algo que no está permitido (ESTA BIEN, PERO ME SALE PRIMERO QUE HE PODIDO JUGARLA SATISFACTORIAMENTE)
- **No puedes jugar carta**: Cuando no es tu turno o fase incorrecta
- **Órgano protegido**: Cuando un ataque falla por inmunidad

### 🏆 Estados del Juego

- **Tu turno**: Te avisa cuando comienza tu turno
- **Victoria**: Celebra cuando ganas
- **Derrota**: Informa quién ganó cuando pierdes
- **Deck reconstruido**: Avisa cuando se mezclan las cartas descartadas

### 📊 Estado del Deck

- **Deck bajo**: Avisa cuando quedan pocas cartas (pendiente implementar)

## Características Técnicas

### Configuración Global

- **Posición**: Top-center para mejor visibilidad en móviles
- **Duración**: 3.5 segundos (4.5s para errores)
- **Estilo**: Tema oscuro con bordes de colores según tipo
- **Responsive**: Se adapta a pantallas pequeñas

### Tipos de Notificación

- 🟢 **Success**: Acciones exitosas (verde)
- 🔴 **Error**: Errores y fallos (rojo)
- 🟡 **Warning**: Advertencias importantes (amarillo)
- 🔵 **Info**: Información general (azul)

### Sistema de Eventos Socket

- El servidor emite eventos específicos para cada tipo de acción
- El cliente escucha estos eventos y dispara la notificación apropiada
- Solo se notifican acciones que realmente afectan al jugador

## Principios de Diseño

### ✅ Notificaciones Útiles

- Solo eventos que aportan valor al jugador
- Información clara y concisa
- Iconos representativos para reconocimiento rápido

### ❌ Lo que NO se notifica

- Acciones de otros jugadores que no te afectan
- Información redundante visible en la UI
- Eventos triviales o demasiado frecuentes

### 🎨 Experiencia de Usuario

- No intrusivas: no bloquean la jugabilidad
- Agrupación automática para evitar spam
- Duración apropiada para lectura sin molestar

## Archivos Modificados

### Cliente

- `hooks/useGameNotifications.ts`: Hook principal de notificaciones
- `hooks/game/useGame.ts`: Integración con eventos de juego
- `App.tsx`: Configuración global del Toaster

### Servidor

- `events/registerGameEvents.ts`: Emisión de eventos específicos
- `functions/gameLogic.ts`: Información adicional en efectos de cartas

## Uso

El sistema funciona automáticamente una vez implementado. Las notificaciones se disparan basándose en:

1. **Eventos del servidor**: Acciones de otros jugadores que te afectan
2. **Acciones locales**: Tus propias acciones y errores
3. **Cambios de estado**: Turnos, victoria, etc.

## Ejemplo de Notificación

```typescript
// Cuando alguien infecta tu órgano rojo
gameNotifications.organInfected("red", "PlayerName");
// Muestra: "🦠 Your red organ was infected by PlayerName!"
```
