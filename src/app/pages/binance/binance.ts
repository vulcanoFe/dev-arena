import { Component } from '@angular/core';
import { Price } from './components/price/price';

@Component({
  selector: 'app-binance',
  imports: [Price],
  templateUrl: './binance.html',
  styleUrl: './binance.scss',
})
export class Binance {

}
