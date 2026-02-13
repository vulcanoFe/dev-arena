import { Component, input } from '@angular/core';

@Component({
  selector: 'app-final-yes',
  imports: [],
  templateUrl: './final-yes.html',
  styleUrl: './final-yes.scss',
})
export class FinalYes {
  src = input<string>('esitoSi.png'); // immagine input opzionale con default
  alt = input<string>('Miriam e Federico'); // alt input opzionale con default
}
