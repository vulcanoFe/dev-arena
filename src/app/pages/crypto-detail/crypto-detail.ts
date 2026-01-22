import { Component, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BinanceService } from '../../services/binance.service';
import { combineLatest, map, switchMap, of } from 'rxjs';
import { CryptoPricePipe } from '../../pipes/crypto-price-pipe';
import { CryptoPercentPipe } from '../../pipes/crypto-percent-pipe';
import { CryptoSymbolPipe } from '../../pipes/crypto-symbol-pipe';
import { CryptoVolumePipe } from '../../pipes/crypto-volume-pipe';

interface PriceHistory {
  price: number;
  timestamp: number;
}

@Component({
  selector: 'app-crypto-detail',
  standalone: true,
  imports: [CommonModule, CryptoPricePipe, CryptoPercentPipe, CryptoSymbolPipe, CryptoVolumePipe],
  templateUrl: './crypto-detail.html'
})
export class CryptoDetailComponent implements OnDestroy {
  private binanceService = inject(BinanceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  symbol = toSignal(
    this.route.paramMap.pipe(map(params => params.get('symbol') || ''))
  );

  priceHistory = signal<PriceHistory[]>([]);
  lastUpdate = signal(new Date().toLocaleTimeString('it-IT'));
  private updateInterval?: ReturnType<typeof setInterval>;

  private cryptoData = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('symbol')),
      switchMap(symbol => {
        if (!symbol) return of(null);
        return combineLatest([
          this.binanceService.connect(symbol),
          this.binanceService.getTicker(symbol)
        ]).pipe(
          map(([price, ticker]) => ({ price, ticker, symbol }))
        );
      })
    ),
    { initialValue: null }
  );

  currentPrice = computed(() => this.cryptoData()?.price);
  ticker = computed(() => this.cryptoData()?.ticker);

  priceChange = computed(() => {
    const t = this.ticker();
    if (!t) return null;
    return parseFloat(t.priceChangePercent);
  });

  isPositive = computed(() => (this.priceChange() || 0) > 0);
  isNegative = computed(() => (this.priceChange() || 0) < 0);

  volume24h = computed(() => {
    const t = this.ticker();
    return t ? parseFloat(t.volume) : null;
  });

  highPrice = computed(() => {
    const t = this.ticker();
    return t ? parseFloat(t.highPrice) : null;
  });

  lowPrice = computed(() => {
    const t = this.ticker();
    return t ? parseFloat(t.lowPrice) : null;
  });

  priceRange = computed(() => {
    const high = this.highPrice();
    const low = this.lowPrice();
    const current = this.currentPrice();
    
    if (!high || !low || !current) return 0;
    
    return ((current - low) / (high - low)) * 100;
  });

  constructor() {
    this.updateInterval = setInterval(() => {
      this.lastUpdate.set(new Date().toLocaleTimeString('it-IT'));
    }, 1000);

    effect(() => {
      const price = this.currentPrice();
      if (price && price > 0) {
        const history = this.priceHistory();
        const lastPrice = history.length > 0 ? history[history.length - 1].price : null;
        
        if (lastPrice !== price) {
          const newEntry: PriceHistory = {
            price,
            timestamp: Date.now()
          };
          
          const updated = [...history, newEntry].slice(-50);
          this.priceHistory.set(updated);
        }
      }
    });
  }

  getChartPoints(): string {
    const history = this.priceHistory();
    if (history.length < 2) return '';

    const prices = history.map(h => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    return history
      .map((point, index) => {
        const x = (index / (history.length - 1)) * 500;
        const y = 100 - ((point.price - minPrice) / range) * 80 - 10;
        return `${x},${y}`;
      })
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    const sym = this.symbol();
    if (sym) {
      this.binanceService.disconnect(sym);
    }
  }
}