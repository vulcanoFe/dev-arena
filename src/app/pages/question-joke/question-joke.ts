import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { FakeCaptcha } from './components/fake-captcha/fake-captcha';

@Component({
  selector: 'app-question-joke',
  imports: [FakeCaptcha],
  templateUrl: './question-joke.html',
  styleUrl: './question-joke.scss',
})
export class QuestionJoke {

  // signal ViewChild
  container = viewChild<ElementRef<HTMLDivElement>>('container');
  noBtn = viewChild<ElementRef<HTMLButtonElement>>('noBtn');

  noTransform = signal('translate(0px, 0px)');
	captcha = signal(false);

  private lastMove = 0;

	onApproach(event: MouseEvent | TouchEvent) {
    const containerEl = this.container()?.nativeElement;
    const noBtnEl = this.noBtn()?.nativeElement;

    if (!containerEl || !noBtnEl) return; // sicurezza

    const now = Date.now();
    if (now - this.lastMove < 120) return;
    this.lastMove = now;

    const containerRect = containerEl.getBoundingClientRect();
    const btnRect = noBtnEl.getBoundingClientRect();

    const maxX = containerRect.width - btnRect.width;
    const maxY = 120;

    let x = this.random(-maxX / 2, maxX / 2);
    let y = this.random(-maxY, maxY);

    x = Math.max(-maxX / 2, Math.min(x, maxX / 2));
    y = Math.max(-maxY, Math.min(y, maxY));

    this.noTransform.set(`translate(${x}px, ${y}px)`);
  }

  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

	captchaVerified(verified:boolean):void {
		this.captcha.set(verified);
	}

}
