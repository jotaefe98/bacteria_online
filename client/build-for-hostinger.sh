#!/bin/bash

# Script para preparar y construir la aplicación para Hostinger

echo "🔧 Preparando aplicación para Hostinger..."

# Limpiar build anterior
if [ -d "dist" ]; then
    echo "🗑️  Limpiando build anterior..."
    rm -rf dist
fi

# Construir la aplicación
echo "🏗️  Construyendo aplicación..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso!"
    
    # Crear archivo .htaccess si no existe
    if [ ! -f "dist/.htaccess" ]; then
        echo "📝 Creando archivo .htaccess..."
        cp .htaccess dist/.htaccess 2>/dev/null || echo "⚠️  Archivo .htaccess no encontrado en raíz"
    fi
    
    echo "📦 Archivos listos para subir a Hostinger:"
    echo "   📁 dist/index.html"
    echo "   📁 dist/assets/"
    echo "   📁 dist/bacteria.svg"
    echo "   📁 dist/.htaccess"
    echo ""
    echo "🌐 Sube todos los archivos de la carpeta 'dist/' a la carpeta 'public_html' en Hostinger"
    echo "🔗 URL del servidor: https://bacteria-online-server.onrender.com/"
    echo ""
    echo "✨ ¡Listo para desplegar!"
else
    echo "❌ Error en el build"
    exit 1
fi
