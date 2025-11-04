# RacingApp

Aplicación (TypeScript/TSX) para timing y HUD de sesiones de carrera. La estructura actual incluye módulos de timing, filtros, geolocalización y UI.

## Estructura
- `src/timing/` — motor de timing y filtros
- `src/geo/` — utilidades de geolocalización
- `src/ui/` — tema y estilos UI
- `src/store/`, `src/db/`, `src/types.ts` — estado, persistencia y tipos
- `app/session-hud.tsx` — HUD de sesión (TSX)

## Requisitos (ajusta según tu setup)
- Node.js 18+ recomendado
- Gestor de paquetes (npm, pnpm o yarn)

> Nota: Este repo aún no define scripts ni dependencias. Integra tu `package.json`/build según corresponda.

## Cómo publicar en GitHub

### Opción A: Usando GitHub CLI (recomendado)
1. Autentícate: `gh auth login`
2. Crear y subir el repo en un paso:
   - Público: `gh repo create RacingApp --source=. --public --push`
   - Privado: `gh repo create RacingApp --source=. --private --push`

### Opción B: Manual con remoto
1. Crea el repo vacío en GitHub (sin README).
2. Añade el remoto y empuja:
   ```bash
   git remote add origin git@github.com:<TU_USUARIO>/RacingApp.git
   git push -u origin main
   ```

## Licencia
Sin licencia definida. Si deseas, añade un archivo `LICENSE` (MIT, Apache-2.0, etc.).

## Assets (Expo)
- Icono (`app.config.ts > icon`): `./assets/icon.png`
  - Recomendado: 1024×1024 px, PNG, sin esquinas redondeadas.
  - Para iOS App Store: evita transparencia (sin canal alpha).

- Splash (`app.config.ts > splash`): `./assets/splash.png`
  - Configurado con `resizeMode: "contain"` y fondo `#000000`.
  - Recomendado: imagen cuadrada grande (p. ej. 2000×2000 px) con amplio margen (60–70% área segura central).

- Adaptive Icon Android (`app.config.ts > android.adaptiveIcon`)
  - `foregroundImage`: `./assets/adaptive-icon.png`
    - Recomendado: 432×432 px (monocapa con transparencia) o contenido equivalente centrado.
  - `monochromeImage`: `./assets/adaptive-icon-mono.png`
    - Recomendado: 432×432 px, monocromo (blanco sobre transparente) para Android 13+.
  - `backgroundColor`: `#000000`.

Sustituye los placeholders en `assets/` por tus imágenes finales y reconstruye:
- APK (preview): `npm run eas:preview`
- AAB (production): `npm run eas:prod`
