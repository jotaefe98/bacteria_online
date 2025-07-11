# Configuración de MongoDB Atlas (GRATIS)

## Paso 1: Crear cuenta en MongoDB Atlas

1. Ve a https://www.mongodb.com/atlas
2. Haz clic en "Try Free"
3. Crea una cuenta con tu email
4. Selecciona "Shared" (gratis)
5. Elige la región más cercana a tu servidor

## Paso 2: Configurar el cluster

1. Espera a que se cree el cluster (2-3 minutos)
2. Haz clic en "Connect"
3. Selecciona "Connect your application"
4. Copia la cadena de conexión

## Paso 3: Configurar acceso

1. Ve a "Database Access"
2. Crea un usuario con permisos de lectura/escritura
3. Ve a "Network Access"
4. Agrega "0.0.0.0/0" para permitir conexiones desde cualquier IP

## Paso 4: Configurar en tu proyecto

1. Crea un archivo `.env` en la carpeta `server`:

```env
MONGODB_URI=mongodb+srv://tuusuario:tupassword@cluster0.xxxxx.mongodb.net/bacteria_online?retryWrites=true&w=majority
NODE_ENV=development
PORT=3000
```

2. Reemplaza `tuusuario`, `tupassword` y la URL con tus datos reales

## Paso 5: Instalar dotenv (si no lo tienes)

```bash
cd server
npm install dotenv
```

## Paso 6: Configurar dotenv en tu server.ts

Agrega al inicio de tu archivo `server.ts`:

```typescript
import dotenv from "dotenv";
dotenv.config();
```

## Recursos Gratuitos de MongoDB Atlas:

- ✅ 512MB de almacenamiento
- ✅ Clusters compartidos
- ✅ Conexiones ilimitadas
- ✅ Backups automáticos
- ✅ Monitoreo básico

## Estructura de tu base de datos:

```
bacteria_online/
  └── games/
      ├── game_001
      ├── game_002
      └── ...
```

## Comandos útiles para ver tus datos:

```bash
# Generar reporte de estadísticas
node -e "
const { generateAnalyticsReport } = require('./dist/utils/analyticsDashboard');
generateAnalyticsReport();
"

# Ver estadísticas de un jugador específico
node -e "
const { generatePlayerReport } = require('./dist/utils/analyticsDashboard');
generatePlayerReport('NombreDelJugador');
"
```

## Monitoreo:

- Puedes ver tus datos en tiempo real en el dashboard de MongoDB Atlas
- Las estadísticas se guardan automáticamente al finalizar cada partida
- Los datos persisten incluso si reinicias el servidor

## Escalabilidad:

- Cuando superes el límite gratuito, puedes upgradar fácilmente
- Los datos se mantienen al cambiar de plan
- Puedes agregar más funcionalidades como índices y agregaciones avanzadas

¡Tu sistema de analíticas ya está listo para funcionar de forma persistente y gratuita!
