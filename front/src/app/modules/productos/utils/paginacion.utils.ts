export const PRODUCTOS_POR_PAGINA = 12;

export function calcularPaginas(cantidadItems: number, itemsPorPagina = PRODUCTOS_POR_PAGINA): number {
  if (itemsPorPagina < 1) throw new RangeError('itemsPorPagina debe ser mayor a cero.');
  return Math.max(1, Math.ceil(Math.max(0, cantidadItems) / itemsPorPagina));
}

export function limitarPagina(pagina: number, paginasTotales: number): number {
  const paginaValida = Number.isFinite(pagina) ? Math.trunc(pagina) : 1;
  return Math.min(Math.max(1, paginaValida), Math.max(1, paginasTotales));
}

export function obtenerElementosDePagina<T>(
  elementos: readonly T[],
  pagina: number,
  itemsPorPagina = PRODUCTOS_POR_PAGINA,
): T[] {
  const paginasTotales = calcularPaginas(elementos.length, itemsPorPagina);
  const paginaSegura = limitarPagina(pagina, paginasTotales);
  const inicio = (paginaSegura - 1) * itemsPorPagina;
  return elementos.slice(inicio, inicio + itemsPorPagina);
}
