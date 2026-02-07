
import { Component, computed, inject, signal } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { Sidenav } from '../sidenav/sidenav';
import { RouteDataService } from '../../services/route-data.service';

@Component({
  selector: 'app-header',
  standalone: true,
	imports: [Sidenav],
  templateUrl: './header.html'
})
export class Header {

	// route data
	private routeData = inject(RouteDataService);
	headerData = computed(()=>
		this.routeData.routeData()?.header ?? null
	);

	// tema
  private theme = inject(ThemeService);
  isDark = computed(() => this.theme.applied() === 'dark');
  toggle() { this.theme.toggle(); }

	// sidenav
	isOpen = signal<boolean>(false);
	toggleSidenav = ():void => {
		this.isOpen.update(v => !v);
	}
}