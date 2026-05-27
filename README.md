# 🏠 Propify — Guía de instalación y despliegue

## Archivos del proyecto
```
propify-app/
├── .env                  ← Tus credenciales de Supabase
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx            ← App completa (UI + lógica)
    └── supabase.js        ← Conexión a base de datos
```

---

## PASO 1 — Instalar en tu computadora

Necesitas tener Node.js instalado. Descárgalo en: https://nodejs.org (versión LTS)

Luego abre una terminal y ejecuta:
```bash
# Entra a la carpeta del proyecto
cd propify-app

# Instala las dependencias
npm install

# Inicia el servidor local
npm run dev
```

Abre http://localhost:5173 en tu navegador. ¡Ya funciona localmente!

---

## PASO 2 — Subir a GitHub

1. Ve a github.com → "New repository"
2. Nómbralo "propify"
3. Déjalo público → "Create repository"
4. En la terminal ejecuta:

```bash
git init
git add .
git commit -m "Propify MVP inicial"
git remote add origin https://github.com/TU_USUARIO/propify.git
git push -u origin main
```

---

## PASO 3 — Desplegar en Vercel (gratis)

1. Ve a vercel.com → "Add New Project"
2. Importa tu repositorio de GitHub "propify"
3. En "Environment Variables" agrega:
   - `VITE_SUPABASE_URL` = https://pnaiakqdrvbjdtdznfpu.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = sb_publishable_XAAxGFajq0W-YyGcOlYZpQ_UpC_N1MB
4. Click "Deploy"

En 2 minutos tendrás tu URL pública tipo: https://propify.vercel.app

---

## PASO 4 — Habilitar Storage en Supabase (para fotos)

1. En Supabase → Storage → "New bucket"
2. Nombre: `property-images`
3. Marca como "Public bucket"
4. Click "Create bucket"

---

## PASO 5 — Dominio personalizado (opcional)

1. Compra tu dominio en namecheap.com (ej: propify.mx ~$200/año)
2. En Vercel → Settings → Domains → agrega tu dominio
3. Sigue las instrucciones de DNS

---

## Tecnologías usadas
- **React + Vite** — Frontend
- **Supabase** — Base de datos, autenticación, storage
- **Vercel** — Hosting y despliegue

## Soporte
Para dudas o errores, revisa:
- https://supabase.com/docs
- https://vitejs.dev/guide/
- https://vercel.com/docs
