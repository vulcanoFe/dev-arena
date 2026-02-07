import { Component, inject, input, output } from '@angular/core';
import { SidenavService } from '../../services/sidenav.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  imports: [],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {

	private routeData = inject(SidenavService);
	private router = inject(Router)

	menuItems = this.routeData.sidenavItems; // 👈 signal computed

	isOpen = input.required<boolean>();
	toggle = output<void>();

	onToggle():void {
		this.toggle.emit();
	}

  navigate(path: string) {
		this.onToggle();
    this.router.navigateByUrl(path);
  }

}
