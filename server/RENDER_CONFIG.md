# Render.com Deployment Configuration

## Build Command:

npm install && npm run build

## Start Command:

npm run start

## Environment Variables (configurar en Render dashboard):

MONGODB_URI=mongodb+srv://***REMOVED***@bacteria-online-cluster.aiprd2r.mongodb.net/bacteria_online?retryWrites=true&w=majority&appName=bacteria-online-cluster
NODE_ENV=production

## Root Directory:

server

## Auto-Deploy:

Yes (conectado a GitHub)

## Plan:

Free (suficiente para tu juego)

## Health Check URL:

/ (o /health si lo creas)

## Notes:

- El puerto se asigna automáticamente por Render
- MongoDB Atlas está configurado para permitir todas las IPs
- Las analíticas se guardan automáticamente en MongoDB
