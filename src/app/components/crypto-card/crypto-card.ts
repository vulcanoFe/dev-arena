import { Component, input, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { BinanceService } from '../../services/binance.service';
import { combineLatest, map } from 'rxjs';
import { CryptoPricePipe } from '../../pipes/crypto-price-pipe';
import { CryptoPercentPipe } from '../../pipes/crypto-percent-pipe';
import { CryptoSymbolPipe } from '../../pipes/crypto-symbol-pipe';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule, CryptoPricePipe, CryptoPercentPipe, CryptoSymbolPipe],
  templateUrl: './crypto-card.html'
})
export class CryptoCardComponent implements OnDestroy {
  private binanceService = inject(BinanceService);
  
  symbol = input<string>('');
  
  private priceData = toSignal(
    combineLatest([
      this.binanceService.connect(this.symbol() || 'BTCUSDT'),
      this.binanceService.getTicker(this.symbol() || 'BTCUSDT')
    ]).pipe(
      map(([price, ticker]) => ({ price, ticker }))
    )
  );

  currentPrice = computed(() => this.priceData()?.price);
  ticker = computed(() => this.priceData()?.ticker);
  
  priceChange = computed(() => {
    const t = this.ticker();
    return t ? parseFloat(t.priceChangePercent) : null;
  });

  isPositive = computed(() => (this.priceChange() || 0) > 0);
  isNegative = computed(() => (this.priceChange() || 0) < 0);

  ngOnDestroy(): void {
    this.binanceService.disconnect(this.symbol());
  }
}