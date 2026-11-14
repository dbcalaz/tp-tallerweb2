import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { DetalleProductoComponent } from './detalle-producto.component';
import { ProductosService } from '../../../../api/services/productos/productos.service';
import { CarritoService } from '../../../../api/services/carrito/carrito.service';

describe('DetalleProductoComponent', () => {
  let component: DetalleProductoComponent;
  let fixture: ComponentFixture<DetalleProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleProductoComponent],
      providers: [
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: ProductosService, useValue: { getProductoPorId: () => of({ id: 1, nombre: 'Test', precio: 120, stock: 3 }) } },
        { provide: CarritoService, useValue: { items: () => [], agregarProducto: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleProductoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
