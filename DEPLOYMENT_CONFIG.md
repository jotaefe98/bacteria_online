# Configuración de Despliegue

## URLs de Configuración

### Servidor

- **Producción**: https://bacteria-online-server.onrender.com/
- **Desarrollo**: http://localhost:3000/

### Cliente

- **Producción**: Tu dominio en Hostinger
- **Desarrollo**: http://localhost:5173/
- **Preview**: http://localhost:4173/

## Archivos de Configuración

### Cliente

- `src/const/const.ts` - URL del servidor
- `dist/.htaccess` - Configuración de Apache para routing
- `package.json` - Scripts de build y desarrollo

### Servidor

- `src/server.ts` - Configuración principal del servidor
- `.env` - Variables de entorno (desarrollo)
- `.env.production` - Variables de entorno (producción)

## Proceso de Despliegue

### 1. Servidor (Render.com)

- Conectado automáticamente con GitHub
- Deploy automático en cada push
- URL: https://bacteria-online-server.onrender.com/

### 2. Cliente (Hostinger)

- Build manual: `npm run build`
- Subir archivos de `dist/` a `public_html`
- Configuración de .htaccess incluida

## Comandos Útiles

### Desarrollo

```bash
# Servidor
npm run dev

# Cliente
npm run dev
```

### Producción

```bash
# Servidor
npm run build
npm start

# Cliente
npm run build
npm run preview
```

### Despliegue

```bash
# Cliente para Hostinger
./build-for-hostinger.bat  # Windows
./build-for-hostinger.sh   # Linux/Mac
```
