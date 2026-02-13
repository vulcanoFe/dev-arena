import { Component, output } from '@angular/core';

@Component({
  selector: 'app-ok-popup',
  imports: [],
  templateUrl: './ok-popup.html',
  styleUrl: './ok-popup.scss',
})
export class OkPopup {

	closePopup = output<void>();

	onClosePopup():void {
		this.closePopup.emit();
	}

}
