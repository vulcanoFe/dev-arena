import { Routes } from '@angular/router';
import { Binance } from './pages/binance/binance';

export const routes: Routes = [
    {path: 'binance', component: Binance},
    {path: '', redirectTo: 'binance', pathMatch: 'full'}
];
