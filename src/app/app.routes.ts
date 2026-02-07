import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'crypto-stats',
    loadComponent: () => import('./pages/crypto-stats/crypto-stats').then(m => m.CryptoStatsComponent)
  },
	{
		path: 'crypto-stats/:symbol',
		loadComponent: () => import('./pages/crypto-stats/crypto-detail/crypto-detail').then(m => m.CryptoDetailComponent)
	},
  {
    path: '',
    redirectTo: 'crypto-stats',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'crypto-stats'
  }
];