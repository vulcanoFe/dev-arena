import { Component, input, signal, computed, inject, OnDestroy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BinanceService } from '../../services/binance.service';
import { Subscription, combineLatest } from 'rxjs';
import { CryptoPricePipe } from '../../pipes/crypto-price-pipe';
import { CryptoPercentPipe } from '../../pipes/crypto-percent-pipe';
import { CryptoSymbolPipe } from '../../pipes/crypto-symbol-pipe';

interface PriceData {
  price: number | null;
  ticker: any;
}

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule, CryptoPricePipe, CryptoPercentPipe, CryptoSymbolPipe],
  templateUrl: './crypto-card.html'
})
export class CryptoCardComponent implements OnDestroy {
  private binanceService = inject(BinanceService);
  
  // Input signal (Angular 17+ way)
  symbol = input.required<string>();
  
  private priceData = signal<PriceData | null>(null);
  hasError = signal<boolean>(false); // PUBLIC per il template
  private subscription?: Subscription;
  private currentSymbol = '';

  currentPrice = computed(() => this.priceData()?.price);
  ticker = computed(() => this.priceData()?.ticker);
  showCard = computed(() => !this.hasError() && this.symbol().length > 0);
  
  priceChange = computed(() => {
    const t = this.ticker();
    return t ? parseFloat(t.priceChangePercent) : null;
  });

  isPositive = computed(() => (this.priceChange() || 0) > 0);
  isNegative = computed(() => (this.priceChange() || 0) < 0);

  constructor() {
    effect(() => {
      const sym = this.symbol();
      
      // Evita di ricreare la subscription per lo stesso simbolo
      if (sym === this.currentSymbol) {
        return;
      }

      // Usa untracked per evitare loop infiniti quando aggiorniamo i signal
      untracked(() => {
        if (!sym) {
          this.hasError.set(true);
          return;
        }

        // Pulisci la subscription precedente
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        if (this.currentSymbol) {
          this.binanceService.disconnect(this.currentSymbol);
        }

        // Aggiorna il simbolo corrente
        this.currentSymbol = sym;

        // Reset errore
        this.hasError.set(false);

        // Crea nuova subscription
        this.subscription = combineLatest([
          this.binanceService.connect(sym),
          this.binanceService.getTicker(sym)
        ]).subscribe({
          next: ([price, ticker]) => {
            this.priceData.set({ price, ticker });
          },
          error: (err) => {
            console.error(`Errore per ${sym}:`, err);
            this.hasError.set(true);
          }
        });
      });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.currentSymbol) {
      this.binanceService.disconnect(this.currentSymbol);
    }
  }
}