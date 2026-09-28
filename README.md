# CabalPuej frontend

Aplicación Vue 3 + Quasar conectada a la API comercial-contable.

## Estructura

- `src/boot`: configuración global de Axios.
- `src/layouts`: estructura visual y navegación dinámica.
- `src/pages`: pantallas por módulo.
- `src/router`: rutas y protección por permisos.
- `src/services`: sesión y acceso centralizado a la API.
- `src/css`: identidad visual y variables globales.

## Configuración local

```bash
copy .env.example .env
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:9000`.

## Calidad

```bash
npm run lint
npx prettier --check "src/**/*.{js,vue,scss}"
npm run build
```
