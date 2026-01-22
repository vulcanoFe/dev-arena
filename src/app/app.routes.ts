import { Routes } from '@angular/router';
import { Binance } from './pages/binance/binance';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'crypto/:symbol',
    loadComponent: () => import('./pages/crypto-detail/crypto-detail').then(m => m.CryptoDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];