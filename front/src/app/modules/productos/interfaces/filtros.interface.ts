export interface OpcionFiltro {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface CategoriaFiltro extends OpcionFiltro {
  tipos: OpcionFiltro[];
}
