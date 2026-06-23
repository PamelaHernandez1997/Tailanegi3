/**
 * LÓGICA DE INTERFAZ E INTERACCIÓN - TAILANEGI
 * Desarrollado con Vanilla JS y Chart.js
 */

// 1. ESTADO GLOBAL DE LA APLICACIÓN
let appState = {
    projectionData: null,          // Datos descargados del backend de Flask
    activeRegionKey: 'Total',      // 'Total' (Nacional) o clave de región
    activeYear: 2018,              // Año seleccionado
    chartInstance: null,           // Instancia del gráfico Chart.js
    selectedRegionKeyMap: 'Northern' // Región seleccionada por defecto en el Mapa
};

// Mapeo de claves de región a nombres para la interfaz
const REGION_NAMES = {
    'Total': 'Tailandia (Total Nacional)',
    'Northern': 'Región Norte',
    'Central': 'Región Centro',
    'Northeastern': 'Región Nordeste (Isan)',
    'Eastern': 'Región Este',
    'Western': 'Región Oeste',
    'Southern': 'Región Sur'
};

// Base de datos narrativa para el storytelling demográfico
const NARRATIVE_DATABASE = {
    'Total': {
        2018: "Año base de la proyección. Tailandia inicia con una población de 71.37M de habitantes. Las dinámicas regionales reflejan una alta concentración de crecimiento en las zonas Central y Este debido al dinamismo económico, contrastando con el inicio del estancamiento demográfico en las regiones del Norte e Isan.",
        2025: "Punto de inflexión. La ralentización demográfica nacional se vuelve muy evidente a medida que más regiones entran en tasas de crecimiento negativas. La población total alcanza 71.7M.",
        2030: "Alerta demográfica nacional. El país entra en una fase de envejecimiento acelerado severo. La contracción del Norte y el Oeste neutraliza el crecimiento urbano del Centro. Población nacional estimada: 72.0M.",
        2035: "Pico histórico y estancamiento. La población nacional alcanza su cúspide histórica cerca de los 72.2M de habitantes. Las defunciones superan a los nacimientos a nivel nacional, la migración laboral es el único factor de compensación.",
        2040: "Horizonte proyectado. Tailandia consolida su transición hacia una demografía envejecida con desequilibrios regionales masivos. La población total se estabiliza con tendencia a la baja en 72.3M de habitantes."
    },
    'Northern': {
        2018: "El Norte inicia con 11.50M de habitantes. La región montañosa destaca por su alta proporción de adultos mayores y una emigración juvenil persistente hacia centros urbanos e industriales.",
        2025: "Decrecimiento visible. Las tasas de fecundidad por debajo del nivel de reemplazo causan una contracción neta rápida. La población cae a 11.22M de habitantes.",
        2030: "Declive demográfico severo. Se registran cierres de escuelas primarias y una escasez de mano de obra joven. Población proyectada: 11.03M (reducción de casi 500k hab. respecto al año base).",
        2035: "Fase de alerta roja. El envejecimiento rural se profundiza. Las políticas públicas locales se enfocan enteramente en subsidios y asilos. La población desciende a 10.84M.",
        2040: "Fin del periodo. La Región Norte concluye la proyección con una pérdida acumulada de más de 850,000 habitantes desde 2018, consolidando un declive demográfico continuo e irreversible."
    },
    'Northeastern': {
        2018: "El Nordeste (Isan) representa el granero poblacional con 21.50M de habitantes. Sin embargo, su tasa de natalidad histórica ha bajado drásticamente.",
        2025: "Transición demográfica. La población activa sigue migrando hacia el Centro e industrias del Este. El crecimiento de habitantes se estanca en torno a los 21.32M.",
        2030: "Inicio del declive crítico. Isan entra formalmente en crecimiento negativo (k = -0.0012). Se activa la señalización de alerta en los tableros estatales. Población: 21.19M.",
        2035: "Envejecimiento masivo del campo. La tasa de dependencia de la vejez se duplica. La población proyectada disminuye a 21.06M.",
        2040: "Horizonte 2040. Isan cierra con 20.94M de habitantes. Se manifiesta un desequilibrio territorial debido a la pérdida neta de más de 550,000 personas en el transcurso de dos décadas."
    },
    'Central': {
        2018: "El Centro (incluyendo la zona metropolitana de Bangkok) inicia con 21.20M de habitantes. La región funciona como el imán principal de migración interna de Tailandia.",
        2025: "Crecimiento constante por urbanización. La absorción de trabajadores de provincias y la inmigración regional mantienen el impulso demográfico positivo. Población: 21.77M.",
        2030: "Eje demográfico del país. Supera al Nordeste en dinamismo económico. Su población llega a 22.19M, concentrando la mayor proporción de jóvenes profesionales.",
        2035: "Crecimiento sostenido. Aunque el crecimiento natural decae, el flujo migratorio compensa el balance. La población alcanza los 22.61M.",
        2040: "Horizonte 2040. El Centro consolida su hegemonía con 23.05M de habitantes (crecimiento neto de +1.85M hab. desde 2018), evidenciando la centralización nacional."
    },
    'Eastern': {
        2018: "La Región Este inicia con 5.60M de habitantes. Su modelo económico basado en manufactura e industria (EEC) atrae flujos constantes de capital humano.",
        2025: "Crecimiento acelerado. Es la región con mayor tasa exponencial de crecimiento relativo (+0.75%). La población sube rápidamente a 5.90M.",
        2030: "Expansión industrial. Se consolidan nuevas ciudades intermedias residenciales alrededor de parques industriales. Población proyectada: 6.13M.",
        2035: "Flujos migratorios masivos. Atrae mano de obra técnica nacional y extranjera. La población sube a 6.36M de habitantes.",
        2040: "Horizonte 2040. El Este concluye con 6.61M de habitantes (un incremento del 18% respecto a 2018), siendo el modelo de crecimiento demográfico industrial más dinámico del país."
    },
    'Western': {
        2018: "El Oeste inicia con 2.37M de habitantes. Caracterizado por áreas naturales y agrícolas, presenta baja densidad poblacional.",
        2025: "Estancamiento rural. Pérdida de mano de obra hacia las regiones Central y Este contiguas. Población desciende a 2.34M.",
        2030: "Declive demográfico silencioso pero severo. Alerta roja activa debido a una tasa de crecimiento negativa constante (k = -0.0022). Población: 2.31M.",
        2035: "Envejecimiento y falta de polos de atracción. La población cae a 2.29M de habitantes. Varios distritos rurales entran en fase crítica de despoblación.",
        2040: "Horizonte 2040. La Región Oeste se reduce a 2.26M de habitantes, confirmando una contracción sostenida por emigración e inactividad demográfica."
    },
    'Southern': {
        2018: "El Sur inicia con 9.20M de habitantes. Cuenta con una estructura demográfica relativamente más joven gracias a tasas de fertilidad más estables.",
        2025: "Desarrollo estable. El turismo internacional y la economía costera sostienen un crecimiento poblacional de 9.36M hab.",
        2030: "Crecimiento sostenido (k = +0.0025). La región se mantiene joven en comparación con el norte del país. Población estimada: 9.48M.",
        2035: "Estabilidad. El crecimiento natural continúa positivo aunque se va desacelerando paulatinamente. La población alcanza los 9.60M.",
        2040: "Horizonte 2040. El Sur finaliza con 9.72M de habitantes. Muestra una transición demográfica más pausada y equilibrada en el contexto tailandés."
    }
};

// 2. INICIALIZACIÓN DE LA APLICACIÓN
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupTabNavigation();
    setupTimelineSlider();
    setupRegionFilterButtons();
    setupMapInteractions();
    setupSearch();
    setupSolverForm();
    
    // Descargar datos iniciales del backend Flask
    await fetchProjectionData();
    
    // Inicializar vistas
    updateDashboardUI();
    initProjectionChart();
    updateMapUI();
    updateSolverSelectSync();
}

// ==========================================================================
// 3. COMUNICACIÓN CON EL BACKEND (API FETCH)
// ==========================================================================
async function fetchProjectionData() {
    try {
        const response = await fetch('/api/projection');
        if (!response.ok) {
            throw new Error('Error al descargar datos demográficos desde el servidor');
        }
        appState.projectionData = await response.json();
    } catch (error) {
        console.error('Error fetching projection data from Flask:', error);
        alert('No se pudo conectar con el servidor backend de Python (app.py). La aplicación funcionará en modo local con datos de respaldo.');
        loadMockData(); // Carga de respaldo si falla la API
    }
}

// Respaldo local de datos simulados en caso de que no haya conexión con el backend
function loadMockData() {
    const years = Array.from({length: 23}, (_, i) => 2018 + i);
    appState.projectionData = {
        years: years,
        national: {
            name_es: 'Tailandia (Total Nacional)',
            p0: 71376079,
            description: 'Consolidación de las tendencias de las seis regiones principales de Tailandia.',
            k_avg: 0.00078,
            projection: years.map(y => {
                const t = y - 2018;
                return Math.round(71376079 * Math.exp(0.00078 * t));
            })
        },
        regions: {
            'Northern': {
                name_es: 'Región Norte', p0: 11500000, k: -0.0035, description: 'Región montañosa con alto índice de envejecimiento demográfico y migración hacia centros urbanos.', trend: 'Decrecimiento continuo por baja natalidad y emigración.',
                projection: years.map(y => Math.round(11500000 * Math.exp(-0.0035 * (y - 2018))))
            },
            'Northeastern': {
                name_es: 'Región Nordeste (Isan)', p0: 21500000, k: -0.0012, description: 'La región más poblada. Muestra un estancamiento con transición a declive debido al envejecimiento de la población activa.', trend: 'Estancamiento y leve transición a decrecimiento.',
                projection: years.map(y => Math.round(21500000 * Math.exp(-0.0012 * (y - 2018))))
            },
            'Central': {
                name_es: 'Región Centro', p0: 21200000, k: 0.0038, description: 'Corazón financiero e industrial, incluye el área metropolitana de Bangkok. Concentra la mayor tasa de inmigración interna.', trend: 'Crecimiento estable impulsado por urbanización y migración laboral.',
                projection: years.map(y => Math.round(21200000 * Math.exp(0.0038 * (y - 2018))))
            },
            'Eastern': {
                name_es: 'Región Este', p0: 5600000, k: 0.0075, description: 'Eje industrial y tecnológico (Corredor Económico del Este). Atrae mano de obra y crecimiento comercial continuo.', trend: 'Crecimiento dinámico por expansión económica.',
                projection: years.map(y => Math.round(5600000 * Math.exp(0.0075 * (y - 2018))))
            },
            'Western': {
                name_es: 'Región Oeste', p0: 2376079, k: -0.0022, description: 'Región fronteriza y predominantemente forestal y rural. Presenta estancamiento económico y demográfico.', trend: 'Decrecimiento moderado y estancamiento.',
                projection: years.map(y => Math.round(2376079 * Math.exp(-0.0022 * (y - 2018))))
            },
            'Southern': {
                name_es: 'Región Sur', p0: 9200000, k: 0.0025, description: 'Región costera con dinámicas culturales distintas y mayores tasas de fecundidad relativa en comparación con el resto del país.', trend: 'Crecimiento lento pero estable.',
                projection: years.map(y => Math.round(9200000 * Math.exp(0.0025 * (y - 2018))))
            }
        }
    };
}

// ==========================================================================
// 4. LÓGICA DE NAVEGACIÓN POR PESTAÑAS
// ==========================================================================
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active-content'));

            tab.classList.add('active');
            
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-content');

            // Redibujar gráfico si se vuelve a la pestaña del Dashboard
            if (targetId === 'tab-dashboard' && appState.chartInstance) {
                setTimeout(() => {
                    appState.chartInstance.resize();
                    appState.chartInstance.update();
                }, 50);
            }
        });
    });
}

function switchTab(tabId) {
    const tabButton = document.querySelector(`.nav-tab[data-target="${tabId}"]`);
    if (tabButton) {
        tabButton.click();
    }
}

// ==========================================================================
// 5. CONTROL DESLIZANTE DE TIEMPO (TIMELINE SLIDER)
// ==========================================================================
function setupTimelineSlider() {
    const slider = document.getElementById('timeline-slider');
    const sliderLabel = document.getElementById('slider-year-value');
    const yearLabels = document.querySelectorAll('.selected-year-label');

    slider.addEventListener('input', (e) => {
        appState.activeYear = parseInt(e.target.value);
        
        sliderLabel.textContent = appState.activeYear;
        yearLabels.forEach(lbl => lbl.textContent = appState.activeYear);
        
        updateDashboardUI();
        updateChartHighlight();
    });
}

// ==========================================================================
// 6. FILTRO RÁPIDO DE REGIONES (DASHBOARD)
// ==========================================================================
function setupRegionFilterButtons() {
    const buttons = document.querySelectorAll('.region-filter-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            appState.activeRegionKey = btn.getAttribute('data-region');
            
            updateDashboardUI();
            updateProjectionChart();
            updateSolverSelectSync();
        });
    });
}

function updateSolverSelectSync() {
    const select = document.getElementById('solver-region');
    if (select) {
        select.value = appState.activeRegionKey;
    }
}

// ==========================================================================
// 7. ACTUALIZACIÓN DEL DASHBOARD E INDICADORES (ALERTA ROJA EN DECRECIMIENTO)
// ==========================================================================
function updateDashboardUI() {
    if (!appState.projectionData) return;

    const yearIdx = appState.activeYear - 2018;
    let name = '';
    let pop = 0;
    let k = 0;
    let desc = '';
    let isDeclining = false;

    if (appState.activeRegionKey === 'Total') {
        const nat = appState.projectionData.national;
        name = nat.name_es;
        pop = nat.projection[yearIdx];
        k = nat.k_avg;
        desc = nat.description;
        isDeclining = false; // Nacional sigue con saldo positivo leve
    } else {
        const reg = appState.projectionData.regions[appState.activeRegionKey];
        name = reg.name_es;
        pop = reg.projection[yearIdx];
        k = reg.k;
        desc = reg.description;
        isDeclining = k < 0; // Alerta si la tasa de crecimiento es negativa
    }

    // Actualizar Textos e Indicadores
    document.getElementById('val-region-name').textContent = name;
    document.getElementById('val-region-desc').textContent = desc;
    document.getElementById('val-population-number').textContent = pop.toLocaleString('es-ES');
    
    const kPercent = (k * 100).toFixed(3);
    document.getElementById('val-k-rate').textContent = (k >= 0 ? '+' : '') + kPercent + '%';

    // Distintivo visual del badge de tendencia
    const trendBadge = document.getElementById('val-pop-trend-badge');
    if (appState.activeYear === 2018) {
        trendBadge.textContent = 'Año Base (2018)';
        trendBadge.className = 'trend-badge';
    } else {
        if (k < 0) {
            trendBadge.textContent = 'Decreciente';
            trendBadge.className = 'trend-badge decline';
        } else {
            trendBadge.textContent = 'Creciente';
            trendBadge.className = 'trend-badge grow';
        }
    }

    // Alertas Rojas en caso de Decrecimiento Demográfico
    const statusText = document.getElementById('val-status-text');
    const statusDesc = document.getElementById('val-status-desc');
    const alertBanner = document.getElementById('critical-alert-banner');
    
    const cardRegion = document.getElementById('card-region');
    const cardPop = document.getElementById('card-population');
    const cardStatus = document.getElementById('card-alert-status');

    if (isDeclining) {
        // Fondo rojo brillante e indicadores críticos
        cardRegion.classList.add('alert-critical');
        cardPop.classList.add('alert-critical');
        cardStatus.classList.add('alert-critical');
        
        statusText.textContent = 'Declive Crítico';
        statusText.style.color = 'var(--alert-red-dark)';
        statusDesc.textContent = 'Pérdida demográfica activa debido a tasa de natalidad baja.';
        
        alertBanner.classList.remove('hidden');
    } else {
        // Estado normal institucional
        cardRegion.classList.remove('alert-critical');
        cardPop.classList.remove('alert-critical');
        cardStatus.classList.remove('alert-critical');
        
        statusText.textContent = k > 0.005 ? 'Crecimiento Activo' : 'Crecimiento Estable';
        statusText.style.color = '';
        statusDesc.textContent = 'Comportamiento demográfico controlado en el periodo.';
        
        alertBanner.classList.add('hidden');
    }

    updateNarrativeUI(appState.activeRegionKey, appState.activeYear);
}

function updateNarrativeUI(regionKey, year) {
    const textElement = document.getElementById('val-narrative-text');
    const yearBadge = document.getElementById('narrative-year-badge');
    
    yearBadge.textContent = year;

    // Buscar el hito más cercano anterior para realizar la narrativa
    const regionNarratives = NARRATIVE_DATABASE[regionKey] || NARRATIVE_DATABASE['Total'];
    const narrativeYears = Object.keys(regionNarratives).map(Number).sort((a,b) => a - b);
    
    let matchedYear = narrativeYears[0];
    for (let ny of narrativeYears) {
        if (year >= ny) {
            matchedYear = ny;
        }
    }
    
    textElement.textContent = regionNarratives[matchedYear];
}

// ==========================================================================
// 8. GRÁFICA DE STORYTELLING CON CHART.JS
// ==========================================================================
function initProjectionChart() {
    if (!appState.projectionData) return;

    const ctx = document.getElementById('projectionChart').getContext('2d');
    const years = appState.projectionData.years;
    
    const activeProj = appState.projectionData.national.projection;
    const activeDataInMillions = activeProj.map(val => val / 1000000);

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(0, 86, 179, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 86, 179, 0.00)');

    const datasets = [
        {
            label: 'Población Proyectada (Millones)',
            data: activeDataInMillions,
            borderColor: '#0056B3',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.25,
            pointRadius: 4,
            pointBackgroundColor: '#0056B3',
            pointBorderColor: '#FFFFFF',
            pointHoverRadius: 7
        },
        {
            label: 'Año Seleccionado',
            data: years.map(y => y === appState.activeYear ? activeDataInMillions[y - 2018] : null),
            borderColor: '#FF3E3E',
            backgroundColor: '#FF3E3E',
            pointRadius: 8,
            pointHoverRadius: 10,
            pointBackgroundColor: '#FF3E3E',
            pointBorderColor: '#FFFFFF',
            showLine: false
        }
    ];

    appState.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 1) return ' Año Seleccionado';
                            const valMillions = context.raw;
                            const realVal = Math.round(valMillions * 1000000);
                            return ` Población: ${realVal.toLocaleString('es-ES')} hab.`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Habitantes (Millones)',
                        font: { size: 11, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                }
            }
        }
    });
}

function updateProjectionChart() {
    if (!appState.chartInstance || !appState.projectionData) return;

    let proj = [];
    let isDeclining = false;
    let titleText = '';

    if (appState.activeRegionKey === 'Total') {
        proj = appState.projectionData.national.projection;
        titleText = 'Curva de Proyección Malthusiana: Nacional (Total)';
        isDeclining = false;
    } else {
        const reg = appState.projectionData.regions[appState.activeRegionKey];
        proj = reg.projection;
        titleText = `Curva de Proyección Malthusiana: ${reg.name_es}`;
        isDeclining = reg.k < 0;
    }

    const dataInMillions = proj.map(val => val / 1000000);
    document.getElementById('chart-main-title').textContent = titleText;

    const primaryColor = isDeclining ? '#EF4444' : '#0056B3';
    const ctx = document.getElementById('projectionChart').getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    if (isDeclining) {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.00)');
    } else {
        gradient.addColorStop(0, 'rgba(0, 86, 179, 0.25)');
        gradient.addColorStop(1, 'rgba(0, 86, 179, 0.00)');
    }

    appState.chartInstance.data.datasets[0].data = dataInMillions;
    appState.chartInstance.data.datasets[0].borderColor = primaryColor;
    appState.chartInstance.data.datasets[0].backgroundColor = gradient;
    appState.chartInstance.data.datasets[0].pointBackgroundColor = primaryColor;

    updateChartHighlight();
}

function updateChartHighlight() {
    if (!appState.chartInstance) return;

    const years = appState.projectionData.years;
    const mainDataset = appState.chartInstance.data.datasets[0].data;

    const highlightData = years.map(y => y === appState.activeYear ? mainDataset[y - 2018] : null);
    
    appState.chartInstance.data.datasets[1].data = highlightData;
    appState.chartInstance.update('none'); // Sin animación para evitar lag en sliders
}

// ==========================================================================
// 9. LÓGICA DEL MAPA SVG INTERACTIVO
// ==========================================================================
function setupMapInteractions() {
    const paths = document.querySelectorAll('.map-region-path');
    
    paths.forEach(path => {
        const regionKey = path.getAttribute('data-region');

        path.addEventListener('mouseenter', () => {
            updateMapSidebar(regionKey);
        });

        path.addEventListener('mouseleave', () => {
            updateMapSidebar(appState.selectedRegionKeyMap);
        });

        path.addEventListener('click', () => {
            selectRegionOnMap(regionKey);
            
            // Sincronizar región activa global
            appState.activeRegionKey = regionKey;
            
            const dashboardButtons = document.querySelectorAll('.region-filter-btn');
            dashboardButtons.forEach(b => {
                b.classList.remove('active');
                if (b.getAttribute('data-region') === regionKey) {
                    b.classList.add('active');
                }
            });

            updateDashboardUI();
            updateProjectionChart();
            updateSolverSelectSync();
        });
    });
}

function updateMapUI() {
    if (!appState.projectionData) return;

    const paths = document.querySelectorAll('.map-region-path');
    paths.forEach(path => {
        const regionKey = path.getAttribute('data-region');
        const reg = appState.projectionData.regions[regionKey];
        
        // Destacar visualmente regiones con declive
        if (reg && reg.k < 0) {
            path.classList.add('declining');
        } else {
            path.classList.remove('declining');
        }

        if (regionKey === appState.selectedRegionKeyMap) {
            path.classList.add('active');
        } else {
            path.classList.remove('active');
        }
    });

    updateMapSidebar(appState.selectedRegionKeyMap);
}

function selectRegionOnMap(regionKey) {
    appState.selectedRegionKeyMap = regionKey;
    
    const paths = document.querySelectorAll('.map-region-path');
    paths.forEach(path => {
        const key = path.getAttribute('data-region');
        if (key === regionKey) {
            path.classList.add('active');
        } else {
            path.classList.remove('active');
        }
    });

    updateMapSidebar(regionKey);
}

function updateMapSidebar(regionKey) {
    if (!appState.projectionData) return;

    if (regionKey === 'Total') regionKey = 'Northern'; // Mapa no posee estado nacional

    const reg = appState.projectionData.regions[regionKey];
    if (!reg) return;

    document.getElementById('map-region-title').textContent = reg.name_es;
    document.getElementById('map-region-subtitle').textContent = regionKey + ' Region';
    document.getElementById('map-val-p0').textContent = reg.p0.toLocaleString('es-ES') + ' hab.';
    
    const p40 = reg.projection[reg.projection.length - 1];
    document.getElementById('map-val-p40').textContent = p40.toLocaleString('es-ES') + ' hab.';
    
    const kPercent = (reg.k * 100).toFixed(2);
    const kElement = document.getElementById('map-val-k');
    kElement.textContent = (reg.k >= 0 ? '+' : '') + kPercent + '%';

    const diff = p40 - reg.p0;
    const diffElement = document.getElementById('map-val-diff');
    diffElement.textContent = (diff >= 0 ? '+' : '') + diff.toLocaleString('es-ES') + ' hab.';

    document.getElementById('map-region-desc-text').textContent = reg.description;
    document.getElementById('map-region-trend-text').textContent = reg.trend;

    const alertBanner = document.getElementById('map-critical-alert');
    const sidebarContainer = document.getElementById('map-details-panel');

    // Cambiar dinámicamente colores de alerta en decrecimiento
    if (reg.k < 0) {
        kElement.className = 'stat-value text-negative';
        diffElement.className = 'stat-value text-negative';
        alertBanner.classList.remove('hidden');
        sidebarContainer.classList.add('alert-critical');
    } else {
        kElement.className = 'stat-value';
        diffElement.className = 'stat-value';
        alertBanner.classList.add('hidden');
        sidebarContainer.classList.remove('alert-critical');
    }
}

// ==========================================================================
// 10. SOLVER INTERACTIVO (FORMULARIO MALTHUS)
// ==========================================================================
function setupSolverForm() {
    const form = document.getElementById('solver-form');
    const btn = document.getElementById('btn-solve');
    const spinner = btn.querySelector('.btn-spinner');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const regionKey = document.getElementById('solver-region').value;
        const targetVal = document.getElementById('solver-target-pop').value;

        spinner.classList.remove('hidden');
        btn.disabled = true;

        try {
            const response = await fetch(`/api/solve?region=${regionKey}&target=${targetVal}`);
            const data = await response.json();
            
            displaySolverResult(data);
        } catch (error) {
            console.error('Error solving population with Flask:', error);
            alert('Ocurrió un error al conectar con el solver del backend de Flask. Resolviendo en modo local...');
            solveLocalBackup(regionKey, parseFloat(targetVal));
        } finally {
            spinner.classList.add('hidden');
            btn.disabled = false;
        }
    });
}

function displaySolverResult(data) {
    const resultBox = document.getElementById('solver-result-box');
    const successView = document.getElementById('solver-success-view');
    const errorView = document.getElementById('solver-error-view');

    resultBox.classList.remove('hidden');

    if (data.success) {
        successView.classList.remove('hidden');
        errorView.classList.add('hidden');

        document.getElementById('solver-res-year').textContent = data.solved_year;
        document.getElementById('solver-res-region').textContent = data.region_name;
        document.getElementById('solver-res-t').textContent = data.solved_t + ' años';

        const stepsList = document.getElementById('solver-steps-list');
        stepsList.innerHTML = '';
        
        data.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });
    } else {
        successView.classList.add('hidden');
        errorView.classList.remove('hidden');

        document.getElementById('solver-err-title').textContent = "Población Inalcanzable";
        document.getElementById('solver-err-message').textContent = data.error || 'No se puede resolver para esta población.';
    }

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Backup local del solver si la llamada al backend falla
function solveLocalBackup(regionKey, target) {
    const data = { success: false, steps: [] };
    
    if (regionKey === 'Total') {
        const p0 = 71376079;
        if (target < p0) {
            data.error = `La población nacional objetivo es menor al año base (71.3M hab.). Cifra perteneciente al pasado.`;
        } else {
            // Método de bisección local rápido
            const regions = appState.projectionData.regions;
            let low = 0.0, high = 200.0;
            let solved_t = 0;
            
            for (let i = 0; i < 60; i++) {
                let mid = (low + high) / 2;
                let val = 0;
                for (let r in regions) {
                    val += regions[r].p0 * Math.exp(regions[r].k * mid);
                }
                if (val < target) low = mid;
                else high = mid;
            }
            solved_t = (low + high) / 2;
            const solved_year = (2018 + solved_t).toFixed(1);
            
            data.success = true;
            data.region_name = 'Tailandia (Total Nacional)';
            data.solved_year = solved_year;
            data.solved_t = solved_t.toFixed(4);
            data.steps = [
                "1. Ecuación combinada: P(t) = Σ P0_i * e^(k_i * t)",
                "2. Cálculo por bisección numérica local completado.",
                `3. t ≈ ${solved_t.toFixed(4)} años.`,
                `4. Año aproximado: ${solved_year}`
            ];
        }
    } else {
        const reg = appState.projectionData.regions[regionKey];
        const p0 = reg.p0;
        const k = reg.k;
        
        if (k < 0 && target > p0) {
            data.error = `La región decrece (k = ${k}) y nunca superará la población base de ${p0.toLocaleString('es-ES')} hab.`;
        } else if (k > 0 && target < p0) {
            data.error = `La región crece (k = ${k}) y no volverá a descender de ${p0.toLocaleString('es-ES')} hab.`;
        } else {
            const ratio = target / p0;
            const solved_t = Math.log(ratio) / k;
            const solved_year = (2018 + solved_t).toFixed(1);
            
            data.success = true;
            data.region_name = reg.name_es;
            data.solved_year = solved_year;
            data.solved_t = solved_t.toFixed(4);
            data.steps = [
                `1. Ecuación: P(t) = P0 * e^(k * t)`,
                `2. Despeje: t = ln(P / P0) / k`,
                `3. Proporción = ${ratio.toFixed(4)}`,
                `4. t ≈ ${solved_t.toFixed(4)} años`,
                `5. Año resultante = 2018 + ${solved_t.toFixed(2)} = ${solved_year}`
            ];
        }
    }
    
    displaySolverResult(data);
}

// ==========================================================================
// 11. BUSCADOR GLOBAL INTELIGENTE
// ==========================================================================
function setupSearch() {
    const input = document.getElementById('global-search');
    const clearBtn = document.getElementById('search-clear-btn');
    const banner = document.getElementById('search-alert-banner');
    const bannerText = banner.querySelector('.search-banner-text');
    const bannerClose = document.getElementById('close-search-banner-btn');

    input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.add('hidden');
        input.focus();
    });

    bannerClose.addEventListener('click', () => {
        banner.classList.add('hidden');
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(input.value.trim());
        }
    });
}

function performSearch(query) {
    if (query === '') return;

    const banner = document.getElementById('search-alert-banner');
    const bannerText = banner.querySelector('.search-banner-text');
    const qLower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // A. PATRÓN DE AÑO (Ej. "2030" o "2024")
    const yearMatch = qLower.match(/^(20[1-2][0-9]|2040)$/);
    if (yearMatch) {
        const searchedYear = parseInt(yearMatch[0]);
        appState.activeYear = searchedYear;
        
        const slider = document.getElementById('timeline-slider');
        if (slider) {
            slider.value = searchedYear;
            slider.dispatchEvent(new Event('input'));
        }

        bannerText.textContent = `📅 Año ${searchedYear} seleccionado en la proyección temporal.`;
        banner.classList.remove('hidden');
        
        switchTab('tab-dashboard');
        return;
    }

    // B. PATRÓN DE NOMBRES DE REGIONES
    const regionsMap = {
        'norte': 'Northern', 'northern': 'Northern', 'north': 'Northern',
        'centro': 'Central', 'central': 'Central', 'middle': 'Central', 'bangkok': 'Central',
        'nordeste': 'Northeastern', 'northeastern': 'Northeastern', 'isan': 'Northeastern', 'ne': 'Northeastern',
        'este': 'Eastern', 'eastern': 'Eastern', 'east': 'Eastern',
        'oeste': 'Western', 'western': 'Western', 'west': 'Western',
        'sur': 'Southern', 'southern': 'Southern', 'south': 'Southern',
        'nacional': 'Total', 'tailandia': 'Total', 'total': 'Total', 'todo': 'Total'
    };

    let matchedRegion = null;
    for (let word in regionsMap) {
        if (qLower.includes(word)) {
            matchedRegion = regionsMap[word];
            break;
        }
    }

    if (matchedRegion) {
        appState.activeRegionKey = matchedRegion;
        
        const dashboardButtons = document.querySelectorAll('.region-filter-btn');
        dashboardButtons.forEach(b => {
            b.classList.remove('active');
            if (b.getAttribute('data-region') === matchedRegion) {
                b.classList.add('active');
            }
        });

        if (matchedRegion !== 'Total') {
            selectRegionOnMap(matchedRegion);
        }

        updateDashboardUI();
        updateProjectionChart();
        updateSolverSelectSync();

        bannerText.textContent = `📍 Región identificada: "${REGION_NAMES[matchedRegion]}". Aplicada en filtros.`;
        banner.classList.remove('hidden');
        
        switchTab('tab-dashboard');
        return;
    }

    // C. PATRÓN DE POBLACIÓN (Ej: "72M" o "72000000" o "10.5M")
    let popValue = 0;
    const mMatch = qLower.match(/^([\d.]+)\s*m$/);
    const millionsMatch = qLower.match(/^([\d.]+)\s*millones$/);
    const rawNumberMatch = qLower.match(/^\d+$/);

    if (mMatch) {
        popValue = parseFloat(mMatch[1]) * 1000000;
    } else if (millionsMatch) {
        popValue = parseFloat(millionsMatch[1]) * 1000000;
    } else if (rawNumberMatch) {
        const val = parseInt(rawNumberMatch[0]);
        if (val >= 100000) {
            popValue = val;
        }
    }

    if (popValue > 0) {
        document.getElementById('solver-target-pop').value = Math.round(popValue);
        updateSolverSelectSync();

        bannerText.textContent = `🧮 Población identificada: "${popValue.toLocaleString('es-ES')} hab.". Redirigido al solver de Malthus.`;
        banner.classList.remove('hidden');

        switchTab('tab-model');

        const form = document.getElementById('solver-form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
        return;
    }

    // Sin coincidencias
    bannerText.textContent = `🔍 No se encontraron coincidencias para "${query}". Intenta con "2030", "Norte", o "73M".`;
    banner.classList.remove('hidden');
}
