import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { UsuariosService } from '../../../../api/services/usuarios/usuarios.service';
import { RestablecerContrasenaComponent } from './restablecer-contrasena.component';

describe('RestablecerContrasenaComponent', () => {
  let fixture: ComponentFixture<RestablecerContrasenaComponent>;
  const api = { restablecerPassword: vi.fn() };

  async function render(token: string) {
    await TestBed.configureTestingModule({
      imports: [RestablecerContrasenaComponent],
      providers: [
        provideRouter([]), provideHttpClient(),
        { provide: UsuariosService, useValue: api },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(token ? { token } : {}) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RestablecerContrasenaComponent);
    fixture.detectChanges();
  }

  beforeEach(() => api.restablecerPassword.mockReset());

  it('informa que el enlace es inválido si falta el token', async () => {
    await render('');
    (fixture.componentInstance as any).submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('no incluye un código');
    expect(api.restablecerPassword).not.toHaveBeenCalled();
  });

  it('rechaza contraseñas débiles o distintas sin llamar al backend', async () => {
    await render('token-de-prueba');
    const component = fixture.componentInstance as any;
    component.form.controls.password.setValue('debil');
    component.form.controls.confirmation.setValue('diferente');
    component.submit();
    fixture.detectChanges();
    expect(api.restablecerPassword).not.toHaveBeenCalled();
  });

  it('envía token y contraseña válidos y muestra confirmación', async () => {
    api.restablecerPassword.mockReturnValue(of({ message: 'Contraseña actualizada.' }));
    await render('token-de-prueba');
    const component = fixture.componentInstance as any;
    component.form.controls.password.setValue('NuevaClave9!');
    component.form.controls.confirmation.setValue('NuevaClave9!');
    component.submit();
    fixture.detectChanges();
    expect(api.restablecerPassword).toHaveBeenCalledWith('token-de-prueba', 'NuevaClave9!');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Contraseña actualizada');
  });
});
