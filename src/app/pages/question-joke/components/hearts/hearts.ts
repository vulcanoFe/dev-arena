import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-hearts',
  imports: [],
  templateUrl: './hearts.html',
  styleUrl: './hearts.scss',
})
export class Hearts {

	// array cuori con posizioni e delay pre-calcolati
	hearts = signal<{ left: number; delay: number; emoji: string }[]>([]);

	generateHearts() {
		const emojis = ['❤️','💖','💕','💘','💗','💞','💓','💝'];
		const hearts = Array.from({ length: 14 }).map(() => ({
			left: Math.random() * 100,        // %
			delay: Math.random() * 1.5,       // s
			emoji: emojis[Math.floor(Math.random() * emojis.length)]
		}));
		this.hearts.set(hearts);
	}

}
