import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BinanceService } from '../../services/binance.service';
import { CryptoCardComponent } from '../../components/crypto-card/crypto-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CryptoCardComponent],
  templateUrl: './home.html'
})
export class HomeComponent {
  private binanceService = inject(BinanceService);
  private router = inject(Router);

  searchQuery = signal('');
  isSearching = signal(false);
  
  private searchSubject = new Subject<string>();
  
  searchResults = toSignal(
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.isSearching.set(false);
          return [];
        }
        this.isSearching.set(true);
        return this.binanceService.searchCryptos(query);
      })
    ),
    { initialValue: [] as string[] }
  );

  showPopular = computed(() => 
    !this.searchQuery() || this.searchQuery().length < 2
  );

  popularCryptos = this.binanceService.popularCryptos;

  constructor() {
    effect(() => {
      const query = this.searchQuery();
      this.searchSubject.next(query);
      if (!query) {
        this.isSearching.set(false);
      }
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  navigateToDetail(symbol: string): void {
    this.router.navigate(['/crypto', symbol]);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }
}