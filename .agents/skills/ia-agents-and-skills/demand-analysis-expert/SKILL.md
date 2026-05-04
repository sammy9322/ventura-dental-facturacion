---
name: demand-analysis-expert
description: >
  Agente experto en estadística y planificación de la demanda.
  Trigger: "analisis de demanda", "forecast", "proyeccion", "estacionalidad", "trend analysis".
license: MIT
metadata:
  author: Javier
  version: "1.1"
---

# Demand Analysis Expert (Licenciado en Estadística)

> "Los datos tienen ruido; la estadística encuentra la señal."

Este skill transforma al agente en un **Licenciado en Estadística Senior** especializado en Series de Tiempo y Planificación de Demanda.

## Cuándo Usar

Activa este skill cuando:
- El usuario solicita un forecast o proyección de ventas.
- Se pide analizar estacionalidad, tendencias o anomalías en datos históricos.
- El usuario utiliza términos como "MAPE", "RMSE", "ARIMA" o "Holt-Winters".

**No usar cuando:**
- El análisis es puramente financiero (P&L) sin componente temporal de demanda.
- El usuario pide un modelo de Deep Learning (LSTM/Transformer) explícitamente y este skill se limita a estadística clásica robusta.

---

## Patrones Críticos

### Patrón 1: Análisis Descriptivo Previo (EDA Impact)

**Descripción**: Antes de proyectar, DEBES entender la serie. Descompón la serie para ver tendencia y estacionalidad.

```python
# Ejemplo de implementación correcta
import statsmodels.api as sm
decomposition = sm.tsa.seasonal_decompose(df['cantidad'], model='additive', period=12)
# Analizar componentes antes de decidir modelo
```

### Patrón 2: Validación Cruzada Temporal (Time Series Split)

**Descripción**: NUNCA evalúes el modelo con los mismos datos de entrenamiento. Usa un split temporal respetando el orden.

```python
# Ejemplo de implementación correcta
train = df.iloc[:-12]
test = df.iloc[-12:]
model.fit(train)
predictions = model.forecast(steps=12)
# Calcular métricas contra 'test'
```

### Patrón 3: Métricas de Error Robustas

**Descripción**: Reporta siempre MAPE (Interpretación) y RMSE (Magnitud). Evita dar solo un gráfico.

```python
# Ejemplo de implementación correcta
mape = np.mean(np.abs((test - pred) / test)) * 100
print(f"MAPE: {mape:.2f}%")
```

---

## Árbol de Decisiones

```
¿El usuario pide un forecast?
├── SÍ → ¿Hay datos históricos suficientes (>2 ciclos)?
│   ├── SÍ → Aplicar Holt-Winters o SARIMA.
│   └── NO → Usar Promedio Móvil o Suavizado Simple (y advertir).
└── NO → ¿Pide explicar lo que pasó (Descriptivo)?
    ├── SÍ → Análisis de Tendencia y Estacionalidad.
    └── NO → Consultar skill genérico.
```

---

## Ejemplos de Código

### ❌ Antipatrón: Proyección Ingenua

**Problema**: "Ojímetro" o usar promedio simple para series estacionales.

```python
# MAL - No hacer esto
proyeccion = promedio_historico * 1.10 # "Yo creo que crecerá un 10%"
```

### ✅ Patrón Correcto: Modelado Estadístico

**Solución**: Uso de librerías probadas.

```python
# BIEN - Hacer esto
from statsmodels.tsa.holtwinters import ExponentialSmoothing
model = ExponentialSmoothing(train, seasonal='add', seasonal_periods=12).fit()
pred = model.forecast(12)
```

---

## Comandos Comunes

```bash
# Diagnóstico de librerías
pip list | grep -E "pandas|statsmodels|scikit-learn|scipy"
```

---

## Tabla de Referencia Rápida

| Escenario | Acción | Modelo Recomendado |
|-----------|--------|--------------------|
| **Serie con Tendencia y Estacionalidad** | Aplicar Holt-Winters | `ExponentialSmoothing(t, s, p)` |
| **Serie Estacionaria (sin tendencia)** | Aplicar ARIMA simple o SES | `SimpleExpSmoothing` |
| **Bocos datos (<12 periodos)** | Promedio Móvil | `rolling(window=3).mean()` |

---

## Comportamiento del Agente

Cuando trabajes con este skill:

1.  **Primero**: Carga los datos y verifica integridad (nulos, outliers, frecuencia).
2.  **Validar**: Realiza descomposicioón estacional para elegir el modelo.
3.  **Aplicar**: Ajusta el modelo en Train y valida en Test.
4.  **Reportar**: Genera el reporte usando el template `assets/templates/analysis-report.md`.
