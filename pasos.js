/*
  ============================================================
  GUION DEL SIMULADOR  ·  Edita este archivo para cambiar pasos
  ============================================================

  La interfaz de GitHub está recreada en index.html (bloques <template id="vista-…">).
  Cada paso indica:

    vista       -> qué pantalla mostrar: inicio | nuevo | vacio | subir | repo | archivo
    estado      -> (opcional) variantes de esa pantalla, separadas por espacios:
                     menu-crear   menú del botón + abierto           (inicio)
                     con-nombre   nombre del repositorio escrito     (nuevo)
                     menu-vis     menú de visibilidad abierto        (nuevo)
                     privado      visibilidad cambiada a Private     (nuevo)
                     archivos     archivos cargados                  (subir)
                     menu-code    menú del botón Code abierto        (repo)
    objetivo    -> selector CSS del elemento que hay que pulsar (por ejemplo "#gh-create").
                   Abre el sitio con ?editar=1 y pasa el cursor sobre un elemento para ver su selector.
    instruccion -> texto del globo. Usa **negrita** para nombres de botones.
    pista       -> lo que aparece si la persona hace clic en otro lugar.

  Opcionales:
    escribir    -> texto que se teclea en el objetivo al acertar (campos de texto).
    rellenar    -> { "#selector": "valor" } para campos que ya deben verse rellenos.
    copiar      -> texto que se copia al portapapeles al acertar.
    globo       -> posición preferida del globo: "abajo", "arriba", "izquierda" o "derecha".
*/

window.TUTORIAL = {
  titulo: "GitHub en 3 acciones",
  subtitulo: "Practica en una réplica de la interfaz de GitHub. Mira la demo automática o hazlo tú mismo, clic a clic. No necesitas cuenta: nada de lo que hagas aquí cambia GitHub.",

  modulos: [
    { id: "crear",  nombre: "Crear un repositorio privado" },
    { id: "subir",  nombre: "Subir los archivos del proyecto" },
    { id: "copiar", nombre: "Copiar la URL del repositorio" }
  ],

  pasos: [
    // ---------- 1. Crear un repositorio privado ----------
    {
      modulo: "crear",
      vista: "inicio",
      objetivo: "#gh-plus",
      instruccion: "Estás en tu página de inicio de GitHub. Haz clic en **+** para crear algo nuevo.",
      pista: "Está arriba a la derecha, junto al ícono de Copilot."
    },
    {
      modulo: "crear",
      vista: "inicio",
      estado: "menu-crear",
      objetivo: "#gh-new-repo",
      instruccion: "Elige **New repository**.",
      pista: "Es la segunda opción del menú que se abrió."
    },
    {
      modulo: "crear",
      vista: "nuevo",
      objetivo: "#gh-name",
      instruccion: "Haz clic en **Repository name** para escribir el nombre de tu proyecto.",
      pista: "Es el campo vacío a la derecha de Owner.",
      escribir: "mi-proyecto"
    },
    {
      modulo: "crear",
      vista: "nuevo",
      estado: "con-nombre",
      rellenar: { "#gh-name": "mi-proyecto" },
      objetivo: "#gh-vis",
      instruccion: "Baja hasta **Choose visibility** y abre el selector que dice **Public**.",
      pista: "Está en la sección Configuration, a la derecha.",
      globo: "izquierda"
    },
    {
      modulo: "crear",
      vista: "nuevo",
      estado: "con-nombre menu-vis",
      rellenar: { "#gh-name": "mi-proyecto" },
      objetivo: "#gh-opt-private",
      instruccion: "Elige **Private**: solo tú y quienes invites podrán verlo.",
      pista: "Es la segunda opción del menú que se abrió.",
      globo: "izquierda"
    },
    {
      modulo: "crear",
      vista: "nuevo",
      estado: "con-nombre privado",
      rellenar: { "#gh-name": "mi-proyecto" },
      objetivo: "#gh-create",
      instruccion: "Ya es privado. Pulsa **Create repository**.",
      pista: "Es el botón verde al final del formulario.",
      globo: "izquierda"
    },

    // ---------- 2. Subir archivos ----------
    {
      modulo: "subir",
      vista: "vacio",
      objetivo: "#gh-link-upload",
      instruccion: "Tu repositorio está creado y vacío. Haz clic en **uploading an existing file**.",
      pista: "Es el enlace azul dentro del recuadro Quick setup."
    },
    {
      modulo: "subir",
      vista: "subir",
      objetivo: "#gh-choose",
      instruccion: "Arrastra aquí los archivos de tu proyecto o haz clic en **choose your files**.",
      pista: "Es el enlace azul en el centro del recuadro."
    },
    {
      modulo: "subir",
      vista: "subir",
      estado: "archivos",
      objetivo: "#gh-commit",
      instruccion: "Tus archivos están cargados. Pulsa **Commit changes** para guardarlos en el repositorio.",
      pista: "Es el botón verde debajo del recuadro Commit changes.",
      globo: "derecha"
    },
    {
      modulo: "subir",
      vista: "repo",
      objetivo: "#gh-file-readme",
      instruccion: "¡Listo! Tus archivos ya están en el repositorio. Abre **README.md** para ver uno.",
      pista: "Está en la lista de archivos.",
      globo: "derecha"
    },
    {
      modulo: "subir",
      vista: "archivo",
      objetivo: "#gh-crumb-repo",
      instruccion: "Así se ve un archivo en GitHub. Vuelve al repositorio con el enlace **mi-proyecto**.",
      pista: "Es el enlace azul de la ruta, arriba del archivo."
    },

    // ---------- 3. Copiar la URL ----------
    {
      modulo: "copiar",
      vista: "repo",
      objetivo: "#gh-code-btn",
      instruccion: "Para obtener la dirección del repositorio, pulsa el botón verde **Code**.",
      pista: "Está a la derecha, encima de la lista de archivos."
    },
    {
      modulo: "copiar",
      vista: "repo",
      estado: "menu-code",
      objetivo: "#gh-copy",
      instruccion: "Copia la URL con el botón de copiar.",
      pista: "Es el ícono de dos cuadritos junto a https://github.com/…",
      copiar: "https://github.com/Biniac/mi-proyecto.git",
      globo: "abajo"
    }
  ],

  final: {
    titulo: "¡Lo lograste!",
    texto: "Ya sabes crear un repositorio privado, subir los archivos de tu proyecto y copiar su URL. En tu cuenta, la URL tendrá tu usuario y el nombre de tu repositorio."
  }
};
