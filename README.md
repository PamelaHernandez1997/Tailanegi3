# Tailanegi - Instituto Demográfico y Estadístico de Tailandia

Este es un proyecto web interactivo e institucional que presenta las proyecciones de población de Tailandia para el período 2018 - 2040 basándose en el modelo de crecimiento exponencial de Malthus. 

La aplicación es **100% estática (frontend-only)**, desarrollada con HTML, CSS y JavaScript nativos, sin dependencias de base de datos ni servidores activos de backend (sin Node.js, Python Flask o PHP). Es completamente compatible con **GitHub Pages** y se puede ejecutar localmente de forma directa.

---

## Características Principales

1. **Cabecera y Navegación Institucional:**
   - Barra superior azul marino texturizada con el nombre de la institución.
   - Buscador inteligente integrado en píldora con soporte para autocompletado y redirección de consultas (años, regiones, volúmenes de población como "72M").
   - Menú de pestañas con línea azul inferior activa para navegar entre: Dashboard de Proyección, Mapa Regional y Modelo Matemático.

2. **Mapa Regional SVG e Interactivo:**
   - Mapa interactivo de Tailandia con sus 6 regiones demarcadas (Northern, Central, Northeastern, Eastern, Western, Southern) cargado dinámicamente desde un archivo SVG local.
   - Animaciones fluidas al pasar el cursor (hover) y hacer clic.
   - **Alertas Rojas de Decrecimiento:** Destaca automáticamente en color rojo los indicadores demográficos y las áreas en el mapa de aquellas regiones que experimentan decrecimiento continuo (Norte, Nordeste y Oeste).

3. **Pizarra Analítica de Ecuaciones (Sin LaTeX):**
   - Panel de pizarra que simula tiza sobre un pizarrón verde, utilizando tipografías manuscritas (`Caveat` y `Architects Daughter`).
   - Fórmulas de derivación exponencial representadas mediante HTML5 y CSS puro, sin usar MathJax o KaTeX.

4. **Gráficos e Hitos de Storytelling:**
   - Visualización de curvas de crecimiento con Chart.js cargado vía CDN pública.
   - El dashboard sincroniza un relato narrativo demográfico dinámico a medida que el usuario avanza los años en la línea de tiempo (2018 - 2040).

5. **Herramientas de Cálculo Avanzado (100% Client-Side):**
   - **Calculadora de Población Futura:** Permite calcular de forma exacta la población de cualquier región para cualquier año (por ejemplo, 2045 o 2050), mostrando la sustitución matemática detallada.
   - **Solver de Despeje de Tiempo:** Determina el año aproximado en que se alcanzará una población objetivo utilizando el despeje analítico en regiones (ecuación logarítmica) y un algoritmo de bisección numérica en tiempo real para el total nacional.

---

## Estructura de Archivos del Proyecto

El repositorio está estructurado con rutas relativas para asegurar la portabilidad y compatibilidad de despliegue:
```text
Tailanegi/
├── index.html                  # Interfaz de usuario (pestañas, formulario, pizarra)
├── style.css                   # Hoja de estilos institucionales, alertas y pizarra
├── app.js                      # Lógica de cálculo, Chart.js, mapa y buscadores
├── README.md                   # Este archivo de documentación
└── assets/
    └── thailand-regions.svg    # Mapa vectorial simplificado de Tailandia
```

---

## Requisitos de Ejecución Local

### Método A: Doble clic en `index.html` (Ideal para pruebas rápidas)
Puedes ejecutar la aplicación simplemente abriendo el archivo `index.html` en tu navegador web.
> [!NOTE]
> Al utilizar el protocolo `file://`, los navegadores modernos restringen las solicitudes `fetch` locales (CORS). La aplicación lo detectará de forma automática y utilizará de forma transparente un **fallback del mapa SVG inline** precargado en el HTML, manteniendo toda la interactividad del mapa.

### Método B: Servidor local de archivos estáticos (Recomendado)
Para una experiencia idéntica a producción y validación de la carga dinámica de archivos de assets:

**1. Usando Python:**
Navega a la carpeta del proyecto en tu terminal y ejecuta:
```bash
python -m http.server 8000
```
Abre en tu navegador la dirección [http://localhost:8000](http://localhost:8000).

**2. Usando extensiones de VS Code:**
Haz clic derecho en `index.html` y selecciona **Open with Live Server**.

---

## Publicación en GitHub Pages

Para publicar este proyecto institucional en GitHub Pages de forma gratuita:

1. Crea un repositorio público en GitHub (por ejemplo, con el nombre `tailanegi`).
2. Sube la carpeta del proyecto a la rama principal (usualmente `main` o `master`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit of static frontend Tailanegi"
   git remote add origin https://github.com/TU_USUARIO/tailanegi.git
   git branch -M main
   git push -u origin main
   ```
3. En la página de tu repositorio de GitHub, ve a **Settings** (Configuración) > **Pages**.
4. En la sección **Build and deployment**, selecciona **Deploy from a branch** en "Source".
5. Selecciona la rama `main` y la carpeta raíz `/ (root)`, y haz clic en **Save** (Guardar).
6. Tras unos instantes, tu sitio web institucional interactivo estará publicado y disponible públicamente en la URL proporcionada por GitHub (ej. `https://TU_USUARIO.github.io/tailanegi/`).

---

## Personalización de Datos Demográficos

Toda la base de datos de proyecciones y el modelo se configura en [app.js](file:///c:/Users/lalis/Documents/jimmy/Tailanegi/app.js). Si deseas modificar la población inicial ($P_0$) o la tasa de crecimiento exponencial ($k$) de alguna región, edita la constante `REGIONS_CONFIG` al inicio del archivo:

```javascript
const REGIONS_CONFIG = {
    'Northern': {
        name_es: 'Región Norte',
        p0: 11500000,   // Población base al año 2018
        k: -0.0035,     // Tasa exponencial del modelo de Malthus
        description: '...',
        trend: '...'
    },
    ...
}
```
La aplicación recalculará automáticamente todas las curvas del dashboard, las alertas rojas en el mapa interactivo y el comportamiento del solver.

---

## Solución de Problemas Frecuentes

- **El mapa se muestra gris o no reacciona al pasar el cursor:** Asegúrate de que las clases CSS de las regiones coincidan con las registradas en `style.css` y que `app.js` se cargue correctamente al final del archivo HTML. Si estás abriendo el archivo localmente como `file://`, asegúrate de que no haya errores de sintaxis JS en la consola.
- **La población nacional proyectada difiere del gráfico anterior:** La población nacional se calcula sumando las poblaciones proyectadas de cada una de las 6 regiones de Tailandia año con año para mayor precisión demográfica ($P_{total}(t) = \sum P_i(t)$), y no mediante una aproximación estática global.
- **El gráfico de Chart.js no aparece:** Comprueba tu conexión a Internet, ya que la librería Chart.js se carga mediante un CDN público. Si necesitas que funcione 100% offline sin red, puedes descargar el archivo `chart.js` desde CDN y guardarlo localmente.
