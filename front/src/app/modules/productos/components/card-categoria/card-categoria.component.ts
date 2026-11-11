import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria } from '../../interfaces/categoria.interface';

@Component({
  selector: 'app-card-categoria',
  imports: [RouterLink],
  templateUrl: './card-categoria.component.html',
  styleUrl: './card-categoria.component.css',
})
export class CardCategoriaComponent {
  categoria = input.required<Categoria>();
}
