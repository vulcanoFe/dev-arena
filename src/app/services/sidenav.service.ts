// routes.store.ts
import { Injectable, signal, computed } from '@angular/core';
import { Route } from '@angular/router';
import { routes } from '../app.routes';
import { SidenavItem } from '../models/sidenav-item.model';
import { RouteData } from '../models/route-data.model';

@Injectable({ providedIn: 'root' })
export class RoutesStore {

  private _routes = signal<Route[]>(routes);

  readonly sidenavItems = computed<SidenavItem[]>(() => {
    return this._routes()
      .flatMap(r => this.extractRoute(r))
      .filter(r => (r.data as RouteData)?.sidenav)
      .map(r => ({
        text: (r.data as RouteData).sidenav!.text!,
        path: '/' + r.path!
      }));
  });

  // 👇 gestione nested routes futura
  private extractRoute(route: Route): Route[] {
    let acc: Route[] = [route];
    if (route.children) {
      route.children.forEach(c => {
        acc.push(...this.extractRoute(c)));
      });
    }
    return acc;
  }
}
