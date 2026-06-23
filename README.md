# Tailanegi - Instituto Demográfico y Estadístico de Tailandia

Este es un proyecto web interactivo e institucional que presenta las proyecciones de población de Tailandia para el período 2018 - 2040 basándose en el modelo de crecimiento exponencial de Malthus.

El sistema cuenta con un backend desarrollado en Python (Flask) y un frontend estructurado con Vanilla HTML/CSS/JS, complementado con gráficos dinámicos en Chart.js y mapas SVG.

## Características Principales

1. **Cabecera y Navegación Institucional:**
   - Barra superior azul marino texturizada con el nombre de la institución.
   - Buscador inteligente integrado en píldora con soporte para autocompletado y redirección de consultas (años, regiones, volúmenes de población).
   - Menú horizontal interactivo para navegar entre pestañas: Dashboard de Proyección, Mapa Regional y Modelo Matemático.

2. **Mapa Regional SVG e Interactivo:**
   - Mapa interactivo de Tailandia con sus 6 regiones demarcadas (Northern, Central, Northeastern, Eastern, Western, Southern) y nombres visibles en pantalla.
   - Animaciones fluidas al pasar el cursor y hacer clic.
   - **Alertas en Rojo Brillante:** Modulación dinámica para destacar en rojo los indicadores demográficos y las áreas en el mapa de regiones que experimentan decrecimiento demográfico continuo (tales como la región Norte, Oeste e Isan/Nordeste).

3. **Pizarra Analítica de Ecuaciones (Sin LaTeX):**
   - Panel de pizarra que simula tiza sobre un pizarrón verde, utilizando tipografías manuscritas (`Caveat` y `Architects Daughter`).
   - Fórmulas de derivación exponencial representadas mediante HTML5 y CSS puro, sin dependencias de MathJax o KaTeX.
   - Despeje de tiempo interactivo para encontrar en qué año se alcanzará una población determinada.

4. **Gráficos e Hitos de Storytelling:**
   - Visualización de curvas de crecimiento con Chart.js.
   - El dashboard sincroniza un relato narrativo demográfico dinámico a medida que el usuario avanza los años en la línea de tiempo (2018 - 2040).

---

## Estructura de Archivos del Repositorio

Todas las rutas son relativas y la estructura de archivos es la siguiente:
```text
Tailanegi/
├── app.py              # Backend en Python (Flask) y API del solver/proyección
├── index.html          # Interfaz de usuario (pestañas, mapa, pizarra)
├── style.css           # Estilos visuales institucionales, pizarra y alertas
├── app.js              # Lógica de interactividad, Chart.js y buscador
├── deploy.py           # Script de despliegue de archivos hacia Poblacion4
├── README.md           # Este archivo de documentación
└── .gitignore          # Archivo de exclusiones de Git para Python/Frontend
```

---

## Requisitos de Instalación y Ejecución

### 1. Entorno de Python
El backend requiere Python 3.x. Instala las dependencias necesarias (Flask):

```bash
pip install flask
```

### 2. Ejecutar el Servidor de Desarrollo
Para poner en marcha la aplicación localmente, navega a la carpeta del proyecto y ejecuta:

```bash
python app.py
```

El servidor se iniciará en [http://127.0.0.1:5000](http://127.0.0.1:5000). Abre este enlace en cualquier navegador web para visualizar el sitio interactivo.

---

## Script de Despliegue y Automatización

Para mover o desplegar los archivos finales para su uso dentro de la carpeta local `c:\Users\lalis\Documents\jimmy\Poblacion4`, ejecuta el script de automatización incluido en la carpeta raíz del repositorio:

```bash
python deploy.py
```

Este script detectará la presencia de los archivos fuente (`app.py`, `index.html`, `style.css`, `app.js`, etc.), creará la carpeta `Poblacion4` si no existe y copiará de forma limpia todos los entregables.
