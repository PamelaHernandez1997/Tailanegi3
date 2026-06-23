import os
import math
from flask import Flask, jsonify, request

# Determinar el directorio base del script para servir los archivos estáticos de forma robusta
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')

# Configuración regional de Tailandia con base en 2018 (t = 0)
# La suma de las poblaciones base (p0) es exactamente 71,376,079 habitantes
REGIONS = {
    'Northern': {
        'name_es': 'Región Norte',
        'p0': 11500000,
        'k': -0.0035,
        'description': 'Región montañosa con alto índice de envejecimiento demográfico y migración hacia centros urbanos.',
        'trend': 'Decrecimiento continuo por baja natalidad y emigración.'
    },
    'Northeastern': {
        'name_es': 'Región Nordeste (Isan)',
        'p0': 21500000,
        'k': -0.0012,
        'description': 'La región más poblada. Muestra un estancamiento con transición a declive debido al envejecimiento de la población activa.',
        'trend': 'Estancamiento y leve transición a decrecimiento.'
    },
    'Central': {
        'name_es': 'Región Centro',
        'p0': 21200000,
        'k': 0.0038,
        'description': 'Corazón financiero e industrial, incluye el área metropolitana de Bangkok. Concentra la mayor tasa de inmigración interna.',
        'trend': 'Crecimiento estable impulsado por urbanización y migración laboral.'
    },
    'Eastern': {
        'name_es': 'Región Este',
        'p0': 5600000,
        'k': 0.0075,
        'description': 'Eje industrial y tecnológico (Corredor Económico del Este). Atrae mano de obra y crecimiento comercial continuo.',
        'trend': 'Crecimiento dinámico por expansión económica.'
    },
    'Western': {
        'name_es': 'Región Oeste',
        'p0': 2376079,
        'k': -0.0022,
        'description': 'Región fronteriza y predominantemente forestal y rural. Presenta estancamiento económico y demográfico.',
        'trend': 'Decrecimiento moderado y estancamiento.'
    },
    'Southern': {
        'name_es': 'Región Sur',
        'p0': 9200000,
        'k': 0.0025,
        'description': 'Región costera con dinámicas culturales distintas y mayores tasas de fecundidad relativa en comparación con el resto del país.',
        'trend': 'Crecimiento lento pero estable.'
    }
}

@app.route('/')
def index():
    """Sirve la interfaz de usuario principal index.html."""
    return app.send_static_file('index.html')

@app.route('/api/projection', methods=['GET'])
def get_projection():
    """Genera las proyecciones anuales de 2018 a 2040."""
    years = list(range(2018, 2041))
    response_data = {
        'years': years,
        'regions': {},
        'national': {
            'name_es': 'Tailandia (Total Nacional)',
            'p0': 71376079,
            'description': 'Consolidación de las tendencias de las seis regiones principales de Tailandia.',
            'projection': [],
            'k_avg': 0.00078  # Promedio ponderado indicativo
        }
    }

    # Inicializar vector nacional con ceros
    national_projection = [0.0] * len(years)

    # Calcular proyecciones regionales
    for key, data in REGIONS.items():
        proj = []
        for i, year in enumerate(years):
            t = year - 2018
            # Ecuación Malthusiana: P(t) = P0 * e^(k * t)
            p_t = data['p0'] * math.exp(data['k'] * t)
            proj.append(round(p_t))
            national_projection[i] += p_t

        response_data['regions'][key] = {
            'name_es': data['name_es'],
            'p0': data['p0'],
            'k': data['k'],
            'description': data['description'],
            'trend': data['trend'],
            'projection': proj
        }

    # Redondear proyección nacional
    response_data['national']['projection'] = [round(val) for val in national_projection]

    return jsonify(response_data)

@app.route('/api/solve', methods=['GET'])
def solve_population():
    """
    Resuelve la ecuación Malthusiana para encontrar en qué año se alcanzará una población objetivo.
    Regiones específicas: t = ln(P / P0) / k
    Nacional: Método numérico de bisección
    """
    region_key = request.args.get('region', 'Total')
    try:
        target = float(request.args.get('target', 0))
    except ValueError:
        return jsonify({'error': 'La población ingresada no es válida. Ingrese un valor numérico.'}), 400

    if target <= 0:
        return jsonify({'error': 'La población objetivo debe ser mayor a cero.'}), 400

    # 1. Caso para la población Nacional (Total)
    if region_key == 'Total':
        p0_total = 71376079
        # Evaluar si es menor a p0 nacional
        if target < p0_total:
            return jsonify({
                'success': False,
                'error': f'La población nacional objetivo ({target:,.0f} hab.) es menor a la población base de 2018 ({p0_total:,.0f} hab.). Debido a la tendencia neta de crecimiento, esta cifra pertenece al pasado.'
            }), 200

        # Método de Bisección para hallar t tal que sum(p0_i * e^(k_i * t)) = target
        low_t = 0.0
        high_t = 200.0  # Límite de 200 años en el futuro (hasta 2218)
        
        # Comprobar límite superior
        f_high = sum(r['p0'] * math.exp(r['k'] * high_t) for r in REGIONS.values())
        if f_high < target:
            return jsonify({
                'success': False,
                'error': f'La población nacional objetivo es extremadamente alta ({target:,.0f} hab.) y no se alcanzará en el horizonte de 200 años (máximo proyectado: {f_high:,.0f} hab. para el año {2018 + int(high_t)}).'
            }), 200

        # Iteración de bisección
        for _ in range(100):
            mid_t = (low_t + high_t) / 2.0
            val = sum(r['p0'] * math.exp(r['k'] * mid_t) for r in REGIONS.values())
            if abs(val - target) < 1.0:
                break
            if val < target:
                low_t = mid_t
            else:
                high_t = mid_t

        solved_t = (low_t + high_t) / 2.0
        solved_year = 2018 + solved_t
        solved_year_round = round(solved_year, 1)

        steps = [
            "1. Ecuación combinada nacional: P_total(t) = Σ [ P0_i * e^(k_i * t) ]",
            f"2. Se establece la población objetivo P_total(t) = {target:,.0f}",
            "3. Al no existir solución analítica directa para suma de exponenciales con diferentes tasas, se aplica el método numérico de bisección.",
            f"4. Se obtiene t ≈ {solved_t:.4f} años desde el 2018.",
            f"5. Año resultante = 2018 + {solved_t:.2f} = {solved_year_round}"
        ]

        return jsonify({
            'success': True,
            'region_name': 'Tailandia (Total Nacional)',
            'target': target,
            'solved_year': solved_year_round,
            'solved_t': round(solved_t, 4),
            'steps': steps
        })

    # 2. Caso para una región específica
    if region_key not in REGIONS:
        return jsonify({'error': 'Región no válida.'}), 400

    reg = REGIONS[region_key]
    p0 = reg['p0']
    k = reg['k']
    region_name = reg['name_es']

    # Analizar viabilidad matemática
    if k < 0:
        if target > p0:
            return jsonify({
                'success': False,
                'error': f'La {region_name} tiene una tasa de crecimiento negativa (k = {k}). Por ende, su población decrece y nunca alcanzará una cifra superior a la inicial de {p0:,.0f} hab.'
            }), 200
    elif k > 0:
        if target < p0:
            return jsonify({
                'success': False,
                'error': f'La {region_name} tiene una tasa de crecimiento positiva (k = {k}). Por ende, su población crece y no volverá a descender por debajo de la cifra inicial de {p0:,.0f} hab. en el futuro.'
            }), 200
    else:
        # k == 0 (caso teórico)
        return jsonify({
            'success': False,
            'error': f'La {region_name} tiene una tasa de crecimiento cero (k = 0). Su población se mantiene constante en {p0:,.0f} hab.'
        }), 200

    # Despeje de la fórmula analítica: t = ln(P / P0) / k
    try:
        ratio = target / p0
        solved_t = math.log(ratio) / k
        solved_year = 2018 + solved_t
        solved_year_round = round(solved_year, 1)

        steps = [
            f"1. Ecuación Malthusiana: P(t) = P0 * e^(k * t)",
            f"2. Sustituir valores conocidos: {target:,.0f} = {p0:,.0f} * e^({k} * t)",
            f"3. Despejar exponente: e^({k} * t) = {target:,.0f} / {p0:,.0f} = {ratio:.6f}",
            f"4. Aplicar logaritmo natural: {k} * t = ln({ratio:.6f}) = {math.log(ratio):.6f}",
            f"5. Despejar t: t = {math.log(ratio):.6f} / {k} = {solved_t:.4f} años",
            f"6. Calcular año: 2018 + {solved_t:.2f} = {solved_year_round}"
        ]

        return jsonify({
            'success': True,
            'region_name': region_name,
            'target': target,
            'solved_year': solved_year_round,
            'solved_t': round(solved_t, 4),
            'steps': steps,
            'p0': p0,
            'k': k
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error en el cálculo: {str(e)}'}), 500

if __name__ == '__main__':
    # Iniciar servidor Flask localmente en el puerto 5000
    app.run(debug=True, host='127.0.0.1', port=5000)
