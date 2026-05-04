# Reporte de Análisis de Demanda

**Fecha**: {{FECHA}}
**Dataset**: {{NOMBRE_ARCHIVO}}
**Periodo Analizado**: {{FECHA_INICIO}} a {{FECHA_FIN}}

---

## 1. Resumen Ejecutivo
> *Conclusión principal en 2-3 líneas para la toma de decisiones. ¿La demanda sube, baja o es estable?*

## 2. Análisis Descriptivo

### Características de la Serie
- **Tendencia**: [Ascendente / Descendente / Estable]
- **Estacionalidad Detectada**: [Diaria / Semanal / Anual / No clara]
- **Ruido/Volatilidad**: [Alta / Media / Baja] (CV: {{COEFICIENTE_VARIACION}}%)

### Anomalías Detectadas
- *Listar fechas con outliers significativos y posibles causas (si se conocen).*

## 3. Metodología de Pronóstico
**Modelo Seleccionado**: {{MODELO_USADO}} (ej: Holt-Winters Aditivo)
**Justificación**: *Por qué se eligió este modelo sobre otros.*

## 4. Resultados del Forecast (Proyección)

| Periodo | Pronóstico | Límite Inferior (95%) | Límite Superior (95%) |
|---------|------------|-----------------------|-----------------------|
| {{MES_1}} | {{VALOR}} | {{VALOR_MIN}} | {{VALOR_MAX}} |
| ... | ... | ... | ... |

## 5. Validación y Métricas de Error
*Evaluado en conjunto de prueba (últimos {{N}} periodos)*

- **MAPE (Error %)**: {{MAPE}}%
- **RMSE (Error Absoluto)**: {{RMSE}} units
- **Interpretación**: *El modelo tiene una precisión del {{PRECISION}}%...*

---

## 6. Recomendaciones
1. ...
2. ...
