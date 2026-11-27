# Nexo Digital · Inscripciones a cursos de IA

Aplicación web para una academia virtual: catálogo de cursos, inscripción en línea y panel privado para gestionar a los inscriptos.

Trabajo Práctico Final · Diplomatura en Inteligencia Artificial (UTN) · Propuesta 1: proyecto desarrollado con Claude Code.

## Qué hace
- **Sitio público**: cuatro cursos de IA con lugares libres en tiempo real.
- **Inscripción**: formulario validado que guarda en la base de datos.
- **Panel de administración** (`/admin`): resumen, ocupación por curso, búsqueda y filtros, estado de cada inscripción, eliminación y exportación a Excel.

## Tecnologías (Clase 12)
| Parte | Tecnología |
|---|---|
| Pantallas | React + Vite + TypeScript |
| Base de datos, usuarios y seguridad | Supabase (PostgreSQL, Auth, RLS) |
| Código e historial | GitHub |
| Publicación | Netlify |

## Estructura
```
docs/                 Etapas de la Clase 12: alcance, requisitos, datos, seguridad, pruebas, proceso
supabase/migrations/  SQL para crear tablas, funciones, políticas y la administradora
src/data/cursos.ts    Catálogo de cursos (se edita acá)
src/lib/datos.ts      Capa de datos: Supabase o modo demostración
src/pages/            Inicio, Inscripción y Panel
tests/                Pruebas automáticas
```

## Modo demostración
Sin las variables de Supabase, la aplicación funciona con datos ficticios guardados en el navegador y lo avisa con una franja arriba. Es el prototipo de la Etapa 5.

## Usarla en la computadora
Requiere Node.js 20 o superior.
```
npm install
npm run dev      # abre la aplicación en http://localhost:5173
npm test         # ejecuta las 33 pruebas
npm run build    # genera la versión para publicar en dist/
```

## Puesta en línea

### 1. Supabase
1. Crear una cuenta en https://supabase.com y un proyecto nuevo (plan Free). Guardar la contraseña de la base en un lugar seguro: no se usa en la aplicación.
2. **SQL Editor** → pegar completo `supabase/migrations/0001_inscripciones.sql` → **Run**.
3. **Authentication → Users → Add user**: crear la cuenta de la administradora con correo y contraseña.
4. **SQL Editor** → pegar `supabase/migrations/0002_administradora.sql`, reemplazar el correo de ejemplo por el del paso 3 → **Run**.
5. Copiar dos valores:
   - URL del proyecto (botón **Connect**), con formato `https://xxxxxxxx.supabase.co`.
   - **Settings → API Keys → Publishable key** (empieza con `sb_publishable_`).

No copiar nunca la *Secret key*.

### 2. GitHub
Crear un repositorio vacío y subir esta carpeta. No se suben `node_modules`, `dist` ni `.env` (ya están en `.gitignore`).

### 3. Netlify
1. **Add new project → Import an existing project → GitHub** y elegir el repositorio.
2. El comando de construcción (`npm run build`) y la carpeta (`dist`) se leen de `netlify.toml`.
3. En **Environment variables** agregar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Publicar. Cada cambio que se suba a GitHub se publica solo.

Los nombres de menús y botones de Supabase y Netlify pueden variar: son los vigentes en noviembre de 2026.

### 4. Comprobar
Seguir la lista de control de `docs/05-pruebas.md`. Si la franja "Modo demostración" sigue apareciendo en el sitio publicado, las variables no están cargadas o falta volver a publicar.

## Antes de presentar
El plan gratuito de Supabase pausa los proyectos con poca actividad durante una semana. Entrar al panel uno o dos días antes; si el proyecto está pausado, se reactiva desde el tablero de Supabase con **Resume project**.

## Cambiar los cursos
Editar `src/data/cursos.ts`. Duración, inicio, horario y cupo son valores de ejemplo. No cambiar el `slug` de un curso que ya tiene inscriptos.

## Créditos
Fotografía de portada: Jens Peter Olesen, en Unsplash. Datos de contacto de la academia: ficticios.
