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
    { id: 1, url: 'https://picsum.photos/id/1025/200', isCorrect: true,  selected: false }, // cane
    { id: 2, url: 'https://picsum.photos/id/1062/200', isCorrect: true, selected: false },
    { id: 3, url: 'https://picsum.photos/id/237/200',  isCorrect: true,  selected: false }, // cane
    { id: 4, url: 'https://picsum.photos/id/1040/200', isCorrect: false, selected: false },
    { id: 5, url: 'https://picsum.photos/id/1084/200', isCorrect: false, selected: false },
    { id: 6, url: 'https://picsum.photos/id/1024/200', isCorrect: false,  selected: false }, // cane
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
