import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-question',
  imports: [],
  templateUrl: './question.html',
  styleUrl: './question.scss',
})
export class Question {

	noScale = signal(1);
	yesScale = signal(1);
	yesClick = output<void>();

	onNoClick() {
		this.noScale.update(v => v * 0.5);
		this.yesScale.update(v => v * 2);

		// opzionale: quando diventa troppo piccolo, sparisce
		if (this.noScale() < 0.15) {
			this.noScale.set(0);
		}
	}

	onYesClick() {
		this.yesClick.emit();
	}

}
