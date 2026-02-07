import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  imports: [],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {

	isOpen = input.required<boolean>();
	toggle = output<void>();

	onToggle():void {
		this.toggle.emit();
	}

}
