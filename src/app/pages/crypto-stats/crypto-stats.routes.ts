import { Routes } from '@angular/router';
import { RouteData } from '../../models/route-data.model';

export const CRYPTO_STATS_PATHS = {
	HOME: 'crypto-stats',
	DETAIL: 'crypto-stats/:symbol'
}

export const CRYPTO_STATS_ROUTES: Routes = [
  {
    path: CRYPTO_STATS_PATHS.HOME,
    loadComponent: () =>
      import('./crypto-stats').then(m => m.CryptoStatsComponent),
			data: <RouteData>{
				header: { title: 'Crypto Detail' },
				sidenav: { text: 'Crypto Detail' },
				footer: { text: 'Source of data -> Binance' }
			}
  },
  {
    path: CRYPTO_STATS_PATHS.DETAIL,
    loadComponent: () =>
      import('./crypto-detail/crypto-detail').then(m => m.CryptoDetailComponent),
			data: <RouteData>{
				header: { title: 'Crypto Detail' },
				footer: { text: 'Source of data -> Binance' }
			}
  }
];