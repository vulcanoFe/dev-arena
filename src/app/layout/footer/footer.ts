
import { Component, computed, inject } from '@angular/core';
import { RouteDataService } from '../../services/route-data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html'
})
export class Footer {
  year = new Date().getFullYear();

	// route data
	private routeData = inject(RouteDataService);
	footerData = computed(()=>
		this.routeData.routeData()?.footer ?? null
	);
}
