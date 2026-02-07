import { inject, Injectable, signal } from '@angular/core';
import { RouteData } from '../models/route-data.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteDataService {
  
	private _routeData = signal<RouteData | null>(null);
	readonly routeData = this._routeData.asReadonly();

	private router = inject(Router);
	private route = inject(ActivatedRoute);

	constructor() {
		this.router.events
			.pipe(filter(e => e instanceof NavigationEnd))
			.subscribe(() => {
				let route = this.route.root;

				while(route.firstChild) {
					route = route.firstChild;
				}

				this._routeData.set(route.snapshot.data as RouteData);
			})
	}
}
