import { NgClass } from '@angular/common';
import { Component, output, signal } from '@angular/core';

interface CaptchaImage {
  id: number;
  url: string;
  isCorrect: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-fake-captcha',
  imports: [NgClass],
  templateUrl: './fake-captcha.html',
  styleUrl: './fake-captcha.scss',
})
export class FakeCaptcha {

	verified = output<boolean>();
  error = signal(false);

  images: CaptchaImage[] = [
    { id: 1, url: 'barcellona.jpg', isCorrect: true, selected: false },
    { id: 2, url: 'venezia.jpg', isCorrect: false, selected: false },
    { id: 3, url: 'madeira.jpg', isCorrect: true, selected: false },
    { id: 4, url: 'parigi.jpg', isCorrect: false, selected: false },
    { id: 5, url: 'new-york.jpg', isCorrect: false, selected: false },
    { id: 6, url: 'amsterdam.jpg', isCorrect: false, selected: false },
		{ id: 7, url: 'muragliacinese.jpg', isCorrect: false, selected: false },
    { id: 8, url: 'machupicchu.jpg', isCorrect: false, selected: false },
    { id: 9, url: 'parga.jpg', isCorrect: true, selected: false },
  ];

  toggle(img: CaptchaImage) {
    img.selected = !img.selected;
    this.error.set(false);
  }

  submit() {
    const correct = this.images.filter(i => i.isCorrect).map(i => i.id).sort();
    const selected = this.images.filter(i => i.selected).map(i => i.id).sort();

    const isValid = JSON.stringify(correct) === JSON.stringify(selected);

    if (isValid) {
      this.verified.emit(true);
    } else {
      this.error.set(true);
    }
  }
}