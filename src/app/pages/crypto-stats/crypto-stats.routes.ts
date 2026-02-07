import { Routes } from '@angular/router';

export const CRYPTO_STATS_ROUTES: Routes = [
  {
    path: 'crypto-stats',
    loadComponent: () =>
      import('./crypto-stats')
        .then(m => m.CryptoStatsComponent)
  },
  {
    path: 'crypto-stats/:symbol',
    loadComponent: () =>
      import('./crypto-detail/crypto-detail')
        .then(m => m.CryptoDetailComponent)
  }
];