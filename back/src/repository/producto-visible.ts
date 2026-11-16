// Un producto se muestra al público solo si él y todo lo que lo agrupa están habilitados.
export const PRODUCTO_VISIBLE = {
    activo: true,
    marca: { activo: true },
    tipoProducto: { activo: true, categoria: { activo: true } },
} as const;