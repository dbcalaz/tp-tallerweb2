export class AgregarItemCarritoDto {
  constructor(
    public readonly productoId: number,
    public readonly cantidad: number = 1,
  ) {}
}

export class ActualizarCantidadCarritoDto {
  constructor(public readonly cantidad: number) {}
}

export class CheckoutRequestDto {
  constructor(public readonly direccionEnvio?: string) {}
}

export class CarritoProductoDto {
  id!: number;
  nombre!: string;
  descripcion?: string;
  precio!: number | string;
  imagenUrl!: string | null;
  stock!: number;
  marca?: { id: number; nombre: string };
  tipoProducto?: { id: number; nombre: string };
}

export class CarritoItemResponseDto {
  id!: number;
  carritoId!: number;
  productoId!: number;
  cantidad!: number;
  createdAt!: string;
  producto!: CarritoProductoDto;
}

export class CarritoResponseDto {
  id!: number;
  userId!: number;
  items!: CarritoItemResponseDto[];
}

export class CheckoutResponseDto {
  message!: string;
  compra!: {
    id: number;
    total: number;
    estado: string;
  };
}

