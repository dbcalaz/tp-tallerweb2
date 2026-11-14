import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { UsuariosService } from '../../../../api/services/usuarios/usuarios.service';
import { RecuperarContrasenaComponent } from './recuperar-contrasena.component';

describe('RecuperarContrasenaComponent', () => {
  let fixture: ComponentFixture<RecuperarContrasenaComponent>;
  let api: { solicitarRecuperacion: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { solicitarRecuperacion: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [RecuperarContrasenaComponent],
      providers: [provideRouter([]), provideHttpClient(), { provide: UsuariosService, useValue: api }],
    }).compileComponents();
    fixture = TestBed.createComponent(RecuperarContrasenaComponent);
    fixture.detectChanges();
  });

  it('valida email requerido y formato antes de llamar a la API', () => {
    const component = fixture.componentInstance as any;
    component.form.controls.email.setValue('invalido');
    component.form.controls.email.markAsTouched();
    component.submit();
    fixture.detectChanges();
    expect(api.solicitarRecuperacion).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('formato válido');
  });

  it('muestra estado de carga y el mensaje de éxito', () => {
    const response = new Subject<{ message: string }>();
    api.solicitarRecuperacion.mockReturnValue(response);
    const component = fixture.componentInstance as any;
    component.form.controls.email.setValue('toti@example.com');
    component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Enviando instrucciones');
    response.next({ message: 'Si la cuenta existe, enviamos instrucciones.' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('enviamos instrucciones');
  });

  it('muestra un error y vuelve a habilitar el formulario', () => {
    api.solicitarRecuperacion.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, error: { message: 'Error de prueba' } })));
    const component = fixture.componentInstance as any;
    component.form.controls.email.setValue('toti@example.com');
    component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Error de prueba');
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false);
  });
});
