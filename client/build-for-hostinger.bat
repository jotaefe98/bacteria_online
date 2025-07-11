@echo off
REM Script para preparar y construir la aplicación para Hostinger

echo 🔧 Preparando aplicación para Hostinger...

REM Limpiar build anterior
if exist "dist" (
    echo 🗑️  Limpiando build anterior...
    rmdir /s /q "dist"
)

REM Construir la aplicación
echo 🏗️  Construyendo aplicación...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build exitoso!
    
    echo 📦 Archivos listos para subir a Hostinger:
    echo    📁 dist/index.html
    echo    📁 dist/assets/
    echo    📁 dist/bacteria.svg
    echo    📁 dist/.htaccess
    echo.
    echo 🌐 Sube todos los archivos de la carpeta 'dist/' a la carpeta 'public_html' en Hostinger
    echo 🔗 URL del servidor: https://bacteria-online-server.onrender.com/
    echo.
    echo ✨ ¡Listo para desplegar!
) else (
    echo ❌ Error en el build
    exit /b 1
)

pause
