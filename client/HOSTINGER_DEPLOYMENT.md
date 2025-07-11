# Guía de Despliegue en Hostinger

## Pasos para subir el cliente a Hostinger

### 1. Preparación de archivos

Los archivos que necesitas subir están en la carpeta `dist/`:

- `index.html` - Archivo principal
- `assets/` - Carpeta con CSS y JavaScript
- `bacteria.svg` - Icono de la aplicación

### 2. Configuración en Hostinger

1. **Accede a tu panel de control de Hostinger**
2. **Ve a la sección "Archivos" o "File Manager"**
3. **Navega a la carpeta `public_html`** (o la carpeta raíz de tu dominio)
4. **Sube todos los archivos de la carpeta `dist/`**:
   - Sube `index.html`
   - Sube la carpeta `assets/` completa
   - Sube `bacteria.svg`

### 3. Estructura final en Hostinger

```
public_html/
├── index.html
├── bacteria.svg
└── assets/
    ├── index-JfuwrjVX.css
    └── index-BNDO52dN.js
```

### 4. URLs y configuración

- **Servidor backend**: `https://bacteria-online-server.onrender.com/`
- **Cliente**: Tu dominio de Hostinger (ej: `https://tudominio.com`)

### 5. Verificación

1. Accede a tu dominio
2. Verifica que la aplicación cargue correctamente
3. Prueba que la conexión con el servidor funcione

### 6. Archivos importantes

- **URL del servidor**: Configurada en `src/const/const.ts`
- **Build de producción**: Carpeta `dist/`

### 7. Actualización de la aplicación

Para actualizar la aplicación:

1. Realiza cambios en el código fuente
2. Ejecuta `npm run build`
3. Sube los nuevos archivos de `dist/` a Hostinger

## Notas importantes

- La aplicación es una SPA (Single Page Application) con React
- Usa Vite como bundler
- Se conecta al servidor Socket.IO desplegado en Render
- No requiere configuración de servidor adicional en Hostinger
