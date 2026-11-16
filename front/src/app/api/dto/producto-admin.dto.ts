import { ProductoRestDto } from './producto.dto';

export class ProductoAdminRestDto extends ProductoRestDto {
  activo!: boolean;
}

export class PaginaProductosAdminRestDto {
  items!: ProductoAdminRestDto[];
  total!: number;
  pagina!: number;
  limite!: number;
  totalPaginas!: number;
}
