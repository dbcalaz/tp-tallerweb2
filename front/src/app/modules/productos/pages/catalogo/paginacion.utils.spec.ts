import { describe, expect, it } from 'vitest';
import { calcularPaginas, limitarPagina, obtenerElementosDePagina } from '../../utils/paginacion.utils';

describe('paginación del catálogo', () => {
  it('siempre muestra al menos una página, incluso sin productos', () => {
    expect(calcularPaginas(0)).toBe(1);
    expect(calcularPaginas(-3)).toBe(1);
  });

  it('calcula los límites de página de 12 productos', () => {
    expect(calcularPaginas(12)).toBe(1);
    expect(calcularPaginas(13)).toBe(2);
    expect(calcularPaginas(24)).toBe(2);
    expect(calcularPaginas(25)).toBe(3);
  });

  it('devuelve los elementos correctos en la primera y última página', () => {
    const productos = Array.from({ length: 13 }, (_, i) => `producto-${i + 1}`);
    expect(obtenerElementosDePagina(productos, 1)).toHaveLength(12);
    expect(obtenerElementosDePagina(productos, 1)[0]).toBe('producto-1');
    expect(obtenerElementosDePagina(productos, 2)).toEqual(['producto-13']);
  });

  it('limita la página solicitada a los límites disponibles', () => {
    expect(limitarPagina(0, 3)).toBe(1);
    expect(limitarPagina(99, 3)).toBe(3);
    expect(limitarPagina(Number.NaN, 3)).toBe(1);
  });

  it('rechaza un tamaño de página inválido', () => {
    expect(() => calcularPaginas(10, 0)).toThrow(RangeError);
  });
});
