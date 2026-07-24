# Recomendaciones de Dependencias para {lscr}

> Análisis realizado el 24 de julio de 2026
> Estado actual del proyecto: Next.js 16 + React 19 + Tailwind CSS v4

## Resumen Ejecutivo

El proyecto ya está en un stack moderno (Next.js 16, React 19, Tailwind CSS v4), pero hay inconsistencias importantes entre `package.json`, `bun.lock` y la documentación. Algunas dependencias están desactualizadas, otras son redundantes y hay mejoras de rendimiento y mantenimiento que se pueden aplicar.

### Estado actual vs. recomendado

| Paquete | Actual en `package.json` | Instalado (bun.lock) | Última versión disponible | Recomendación |
|---|---|---|---|---|
| `next` | 16.1.5 | 15.2.0 | 16.2.11 | Actualizar a `16.2.11` |
| `react` | ^19.2.4 | 18.3.1 | 19.2.8 | Actualizar a `19.2.8` |
| `react-dom` | ^19.2.4 | 18.3.1 | 19.2.8 | Actualizar a `19.2.8` |
| `tailwindcss` | ^4.1.18 | 3.0.x (lock antiguo) | 4.3.3 | Actualizar a `4.3.3` |
| `@tailwindcss/postcss` | ^4.1.18 | - | 4.3.3 | Actualizar a `4.3.3` |
| `axios` | ^1.13.2 | 1.8.4 | 1.18.1 | Actualizar a `1.18.1` |
| `cheerio` | ^1.1.2 | 1.0.0 | 1.2.0 | Actualizar a `1.2.0` |
| `lucide-react` | ^0.562.0 | 0.475.0 | 1.26.0 | Actualizar a `1.26.0` |
| `react-hook-form` | ^7.70.0 | 7.45.0 | 7.82.0 | Eliminar o actualizar |
| `react-icons` | ^5.5.0 | - | 5.7.0 | Eliminar |
| `tailwind-merge` | ^3.4.0 | 3.0.2 | 3.6.0 | Actualizar a `3.6.0` |
| `class-variance-authority` | ^0.7.1 | 0.7.1 | 0.7.1 | Mantener |
| `clsx` | ^2.1.1 | 2.1.1 | 2.1.1 | Mantener |
| `@radix-ui/react-label` | ^2.1.8 | 1.0.0 | 2.1.13 | Actualizar a `2.1.13` |
| `@radix-ui/react-toast` | ^1.2.15 | 1.0.0 | 1.2.21 | Actualizar a `1.2.21` |
| `tailwindcss-animate` | ^1.0.7 | 1.0.7 | 1.0.7 | Reevaluar |
| `@types/node` | ^24.10.4 | - | 26.1.1 | Actualizar a `26.1.1` |
| `@types/react` | ^19.2.7 | - | 19.2.17 | Actualizar a `19.2.17` |
| `@types/react-dom` | ^19.2.3 | - | 19.2.3 | Mantener |
| `postcss` | ^8.5.6 | - | 8.5.22 | Actualizar a `8.5.22` |
| `typescript` | ^5.9.3 | - | 7.0.2 | Evaluar cuidadosamente |

---

## Problemas Importantes Detectados

### 1. Inconsistencia crítica: `package.json` vs `bun.lock`

El `bun.lock` aún refleja versiones antiguas (Next.js 15.2.0, React 18.3.1, Tailwind CSS 3) mientras que `package.json` apunta a versiones nuevas. Esto indica que el lockfile no se regeneró correctamente después de las actualizaciones.

**Recomendación:**
```bash
rm -rf node_modules bun.lock package-lock.json
bun install
# o
npm install
```

### 2. Tailwind CSS v4 con archivo `tailwind.config.ts.bak`

El proyecto ya usa Tailwind v4 (`globals.css` con `@import "tailwindcss"` y `@theme`), pero aún existe un `tailwind.config.ts.bak` que podría confundir. Además, `INSTRUCTIONS.md` dice incorrectamente que se mantiene en v3.

**Recomendación:**
- Eliminar `tailwind.config.ts.bak`
- Actualizar `INSTRUCTIONS.md` para reflejar Tailwind v4
- Asegurar que `@tailwindcss/postcss` y `tailwindcss` tengan versiones alineadas
- Revisar si `tailwindcss-animate` es compatible con v4 (su `peerDependencies` indica `>=3.0.0`, no ha sido actualizado para v4)

### 3. Dependencias no utilizadas

#### `react-icons` (^5.5.0)
No se usa en ningún archivo del proyecto. Todo el proyecto usa `lucide-react`.

**Recomendación:** Eliminar.

#### `react-hook-form` (^7.70.0)
El formulario principal en `src/app/page.tsx` es un formulario controlado manualmente con `useState`. No se usa `react-hook-form` en ningún archivo revisado.

**Recomendación:**
- Si no se va a usar, eliminar.
- Si se pretende usar en el futuro, eliminar hasta que se implemente realmente.

### 4. Posible mejora: reemplazar Axios por `fetch` nativo

Next.js 16 y Node.js 20+ tienen `fetch` nativo estable y bien soportado. Usar `axios` añade una dependencia extra cuando el proyecto solo hace un `GET` simple con headers.

**Recomendación:** Considerar reemplazar `axios` por `fetch` nativo en `src/app/api/proxy/route.ts` y `src/app/proxy/page.tsx`.

**Ventajas:**
- Menos dependencias
- Bundle más pequeño
- Menos superficie de ataque
- No requiere actualizaciones de librería externa

**Ejemplo de reemplazo en `route.ts`:**
```typescript
const response = await fetch(url, {
  headers: useGooglebot ? googlebotHeaders : genericHeaders,
  signal: AbortSignal.timeout(10000),
});
const html = await response.text();
```

### 5. Posible mejora: reemplazar `cheerio` por un parser más moderno

`cheerio` es la opción estándar y funciona bien, pero ahora existen alternativas más rápidas y ligeras como `linkedom` o `happy-dom`. Para un proxy simple, `linkedom` puede ser suficiente y mucho más ligero.

**Recomendación opcional:** Evaluar `linkedom` como reemplazo de `cheerio` si el rendimiento del parsing HTML es crítico.

---

## Recomendaciones Prioritarias

### Alta prioridad (hacer ya)

1. **Regenerar lockfiles** para sincronizar `package.json` con las dependencias instaladas.
2. **Actualizar Next.js, React, Tailwind CSS** a las últimas versiones estables.
3. **Eliminar dependencias no usadas**: `react-icons` y `react-hook-form`.
4. **Eliminar `tailwind.config.ts.bak`**.
5. **Corregir `INSTRUCTIONS.md`** sobre la versión de Tailwind.

### Media prioridad (mejoras de calidad)

6. **Reemplazar `axios` por `fetch` nativo** para reducir dependencias.
7. **Actualizar `@radix-ui/react-label`, `@radix-ui/react-toast`, `lucide-react`, `tailwind-merge`, `postcss`, `@types/node`, `@types/react`**.
8. **Evaluar compatibilidad de `tailwindcss-animate` con Tailwind v4**. Si no es compatible, buscar alternativa o definir las animaciones manualmente en el tema.

### Baja prioridad (evaluar a futuro)

9. **TypeScript 7.0.2**: Es una versión reciente. Verificar compatibilidad con Next.js 16.2.11 antes de actualizar.
10. **Evaluar `linkedom` o `happy-dom`** como alternativa a `cheerio`.

---

## package.json Recomendado

```json
{
  "name": "lscr",
  "version": "1.0.6",
  "private": true,
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@radix-ui/react-label": "^2.1.13",
    "@radix-ui/react-toast": "^1.2.21",
    "cheerio": "^1.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.26.0",
    "next": "16.2.11",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "tailwind-merge": "^3.6.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^26.1.1",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "postcss": "^8.5.22",
    "tailwindcss": "^4.3.3",
    "typescript": "^5.9.3"
  }
}
```

> Nota: `axios` y `react-hook-form` se han eliminado en esta versión recomendada. Si decides mantener `axios`, añadirlo con `^1.18.1`. Si decides mantener `react-hook-form`, añadirlo con `^7.82.0`.

---

## Comandos Sugeridos para Aplicar Cambios

```bash
# 1. Eliminar dependencias no usadas
npm uninstall react-icons react-hook-form axios

# 2. Actualizar dependencias principales
npm install next@16.2.11 react@19.2.8 react-dom@19.2.8
npm install cheerio@^1.2.0 lucide-react@^1.26.0 tailwind-merge@^3.6.0
npm install -D @radix-ui/react-label@^2.1.13 @radix-ui/react-toast@^1.2.21
npm install -D tailwindcss@^4.3.3 @tailwindcss/postcss@^4.3.3 postcss@^8.5.22
npm install -D @types/node@^26.1.1 @types/react@^19.2.17 typescript@^5.9.3

# 3. Limpiar e instalar desde cero
rm -rf node_modules bun.lock package-lock.json
npm install

# 4. Verificar build
npm run build
```

---

## Consideraciones de Seguridad

- Mantener `next`, `react`, `cheerio` y `axios` actualizados reduce riesgos conocidos.
- Si se mantiene `axios`, la versión 1.18.1 corrige varios problemas de seguridad de versiones anteriores.
- Eliminar dependencias no usadas reduce la superficie de ataque.

---

## Conclusión

El proyecto está en buen camino con Next.js 16 y React 19, pero necesita una limpieza de dependencias y una sincronización correcta de los lockfiles. Las acciones más importantes son:

1. Sincronizar `package.json` con `bun.lock`/`package-lock.json`.
2. Eliminar `react-icons`, `react-hook-form` y considerar eliminar `axios`.
3. Actualizar a las últimas versiones estables.
4. Limpiar archivos de configuración obsoletos (`tailwind.config.ts.bak`).
5. Actualizar la documentación para reflejar el stack actual.
