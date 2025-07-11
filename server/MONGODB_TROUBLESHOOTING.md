# Instrucciones para MongoDB Atlas

## Verificación de la conexión de MongoDB Atlas

### 1. Verificar variables de entorno en Render

Asegúrate de que en Render.com tienes configurada la variable:

```
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/bacteria_online?retryWrites=true&w=majority
```

### 2. Verificar IP whitelist en MongoDB Atlas

1. Ve a tu cluster en MongoDB Atlas
2. Ve a "Network Access"
3. Asegúrate de que tienes `0.0.0.0/0` en la whitelist (para permitir cualquier IP)

### 3. Verificar usuario de base de datos

1. Ve a "Database Access" en MongoDB Atlas
2. Asegúrate de que el usuario tiene permisos de lectura/escritura
3. Verifica que la contraseña sea correcta

### 4. Opciones de conexión recomendadas

```typescript
const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 75000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  retryWrites: true,
  ssl: true,
};
```

### 5. Solución de problemas comunes

#### Error SSL: tlsv1 alert internal error

- Asegúrate de que la URL de conexión incluye `ssl=true`
- Verifica que el certificado SSL no esté expirado
- Intenta usar `ssl: true` en lugar de `tls: true`

#### Error de autenticación

- Verifica que el usuario/contraseña sean correctos
- Asegúrate de que el usuario tiene permisos en la base de datos
- Verifica que el nombre de la base de datos sea correcto

#### Error de conexión timeout

- Aumenta el `serverSelectionTimeoutMS` a 30000 o más
- Verifica que la whitelist de IP incluya `0.0.0.0/0`
- Revisa que el cluster esté activo y no en pausa

### 6. Configuración actual del servidor

El servidor está configurado para:

- ✅ Funcionar sin MongoDB si la conexión falla
- ✅ Intentar reconectar automáticamente cada 30 segundos
- ✅ Mostrar el estado de la conexión en `/health`
- ✅ Guardar analytics solo si MongoDB está conectado

### 7. Verificar conexión localmente

```bash
# Probar conexión con MongoDB URI
node -e "
const { MongoClient } = require('mongodb');
const uri = 'TU_MONGODB_URI_AQUI';
const client = new MongoClient(uri, { ssl: true });
client.connect().then(() => {
  console.log('✅ Conexión exitosa');
  client.close();
}).catch(err => {
  console.error('❌ Error:', err.message);
});
"
```
