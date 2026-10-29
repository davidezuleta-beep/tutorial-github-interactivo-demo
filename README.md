# GitHub en 3 acciones · Simulador Biniac

Réplica en HTML de la interfaz de GitHub con un tutorial guiado dentro, para personas principiantes:

1. Crear un repositorio privado.
2. Subir manualmente los archivos de un proyecto.
3. Encontrar el botón **Code** y copiar la URL del repositorio.

Tiene dos modos: **demo automática** (un cursor hace los pasos) y **práctica** (solo avanza con el clic correcto y da pistas si se hace clic en otro lugar).
Sitio estático: sin backend, sin cuentas, sin base de datos y sin conexión a GitHub. Todo es simulado.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `pasos.js` | **Guion del tutorial**: vista, estado, botón objetivo, textos y pistas de cada paso. |
| `index.html` | Marco de la demo y, al final, la **réplica de GitHub**: un `<template id="vista-…">` por pantalla. |
| `github.css` | Estilos de la réplica (modo oscuro de GitHub). |
| `styles.css` | Estilos del marco del tutorial (identidad Biniac: blanco, #1FF0F0, #38E0A7, #1F1F26, Prompt). |
| `app.js` | Motor: muestra vistas, resalta el objetivo, coloca el globo, pistas, demo automática. No hace falta tocarlo. |
| `iconos.js` | Íconos Primer Octicons (licencia MIT, ver `licencias/`). |
| `fonts/` | Tipografía Prompt servida localmente (SIL Open Font License). |

## Pantallas disponibles

| Vista | Pantalla de GitHub | Estados |
|---|---|---|
| `inicio` | Dashboard | `menu-crear` (menú **+** abierto) |
| `nuevo` | Create a new repository | `con-nombre`, `menu-vis`, `privado` |
| `vacio` | Repositorio recién creado (Quick setup) | — |
| `subir` | Upload files | `archivos` (archivos cargados) |
| `repo` | Repositorio con archivos | `menu-code` (menú **Code** abierto) |
| `archivo` | Vista del archivo README.md | — |

## Modificar un paso

Cada paso es un bloque dentro de `pasos: [ … ]` en `pasos.js`:

```js
{
  modulo: "copiar",                 // crear | subir | copiar
  vista: "repo",
  estado: "menu-code",
  objetivo: "#gh-copy",             // id del elemento que hay que pulsar
  instruccion: "Copia la URL con el botón de copiar.",
  pista: "Es el ícono de dos cuadritos junto a la URL.",
  globo: "abajo"                    // opcional: abajo | arriba | izquierda | derecha
}
```

- El orden del archivo es el orden del tutorial. Copia un bloque para añadir un paso o bórralo para quitarlo.
- Para saber el `objetivo` de un elemento, abre el sitio con `?editar=1` al final de la URL y pasa el cursor por encima: el panel muestra su `#id`. Si el elemento no tiene id, añade `id="…"` en `index.html`.
- `escribir`, `rellenar` y `copiar` simulan escribir en un campo, mostrarlo relleno o copiar un texto.

## Actualizar la réplica cuando GitHub cambie

Edita el `<template id="vista-…">` correspondiente en `index.html` (textos, botones, orden) y, si hace falta, sus estilos en `github.css`.
Mantén los `id` que usa `pasos.js` o actualízalos allí.

## Publicación

Edita siempre la rama `main`. La acción `.github/workflows/publicar.yml` copia `main` en la rama `gh-pages`, que es la que publica GitHub Pages. Cada cambio aparece en el sitio en uno o dos minutos.

Simulador educativo de Biniac. No es GitHub ni está afiliado a GitHub, Inc.
