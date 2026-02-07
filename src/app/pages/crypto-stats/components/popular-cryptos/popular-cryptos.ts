import { Component, inject } from '@angular/core';
import { CryptoCardComponent } from '../crypto-card/crypto-card';
import { Router } from '@angular/router';
import { BinanceService } from '../../services/binance.service';

@Component({
  selector: 'app-popular-cryptos',
  imports: [CryptoCardComponent],
  templateUrl: './popular-cryptos.html',
  styleUrl: './popular-cryptos.scss',
})
export class PopularCryptos {

	 // Iniezione del servizio Binance
  private binanceService = inject(BinanceService);
	private router = inject(Router);
  
  popularCryptos = this.binanceService.popularCryptos;

	// Naviga alla pagina di dettaglio di una crypto
	navigateToDetail(symbol: string): void {
		this.router.navigate(['/crypto-stats', symbol]);
	}
	
}
