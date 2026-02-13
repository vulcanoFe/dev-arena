import { Component, signal } from '@angular/core';
import { FakeCaptcha } from './components/fake-captcha/fake-captcha';

@Component({
  selector: 'app-question-joke',
  imports: [FakeCaptcha],
  templateUrl: './question-joke.html',
  styleUrl: './question-joke.scss',
})
export class QuestionJoke {

  captcha = signal(false);
  noScale = signal(1);
  yesScale = signal(1);

  captchaVerified(verified:boolean):void {
    this.captcha.set(verified);
  }

  onNoClick() {
    this.noScale.update(v => v * 0.5);
    this.yesScale.update(v => v * 2);

    // opzionale: quando diventa troppo piccolo, sparisce
    if (this.noScale() < 0.15) {
      this.noScale.set(0);
    }
  }

	showPopup = signal(false);
	showHearts = signal(false);

	// array cuori con posizioni e delay pre-calcolati
	hearts = signal<{ left: number; delay: number; emoji: string }[]>([]);

	onYesClick() {
		this.showPopup.set(true);
	}

	closePopup() {
		this.showPopup.set(false);

		this.generateHearts();
		this.showHearts.set(true);

		setTimeout(() => {
			this.showHearts.set(false);
		}, 4000);
	}

	private generateHearts() {
		const emojis = ['❤️','💖','💕','💘','💗','💞','💓','💝'];

		const hearts = Array.from({ length: 14 }).map(() => ({
			left: Math.random() * 100,        // %
			delay: Math.random() * 1.5,       // s
			emoji: emojis[Math.floor(Math.random() * emojis.length)]
		}));

		this.hearts.set(hearts);
	}
}