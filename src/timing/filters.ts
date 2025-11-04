// filters.ts
// Filtros para limpiar ruido en la señal GPS o tiempos
export function smooth(values: number[], window = 3) {
  if (values.length < window) return values;
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}