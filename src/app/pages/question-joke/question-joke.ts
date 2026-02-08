import { Component, ElementRef, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-question-joke',
  imports: [],
  templateUrl: './question-joke.html',
  styleUrl: './question-joke.scss',
})
export class QuestionJoke {


  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
  @ViewChild('noBtn', { static: true }) noBtn!: ElementRef<HTMLButtonElement>;

  noTransform = signal('translate(0px, 0px)');

  private lastMove = 0;

  onApproach(event: MouseEvent | TouchEvent) {
    const now = Date.now();
    if (now - this.lastMove < 120) return;
    this.lastMove = now;

    const containerRect = this.container.nativeElement.getBoundingClientRect();
    const btnRect = this.noBtn.nativeElement.getBoundingClientRect();

    const maxX = containerRect.width - btnRect.width;
    const maxY = 120; // limite verticale

    let x = this.random(-maxX / 2, maxX / 2);
    let y = this.random(-maxY, maxY);

    // bound safety (mai fuori container)
    x = Math.max(-maxX / 2, Math.min(x, maxX / 2));
    y = Math.max(-maxY, Math.min(y, maxY));

    this.noTransform.set(`translate(${x}px, ${y}px)`);
  }

  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
