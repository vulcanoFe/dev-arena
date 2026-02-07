import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BinanceService } from '../../services/binance.service';

@Component({
  selector: 'app-search-crypto',
  imports: [],
  templateUrl: './search-crypto.html',
  styleUrl: './search-crypto.scss',
})
export class SearchCrypto {

  // Dependency Injection
  private binanceService = inject(BinanceService);
  private router = inject(Router);

  // Signal che contiene il testo di ricerca digitato dall’utente
  searchQuery = signal('');
  // Signal che indica se una ricerca è in corso
  isSearching = signal(false);
	// Signal che indica quando la ricerca è stata effettuata
	searched = signal(false);
  
  // Subject RxJS che emette i valori della ricerca. Serve per applicare debounce e operatori RxJS
  private searchSubject = new Subject<string>();
  
  // Signal che rappresenta i risultati della ricerca
  // È derivato da un Observable RxJS
  searchResults = toSignal(
    this.searchSubject.pipe(
      // Attende 300ms dopo l’ultimo input (anti-spam API)
      debounceTime(300),
      // Evita ricerche duplicate con lo stesso testo
      distinctUntilChanged(),
      // Cambia la chiamata API quando cambia la query
      switchMap(query => {
        // Se la query è vuota o troppo corta
        if (!query || query.length < 2) {
          this.isSearching.set(false); // stop loader
          this.searched.set(false); // azzera searched
          return of([]); // nessuna chiamata API
        }
        // Indica che la ricerca è in corso
				this.searched.set(false); // azzera searched
        this.isSearching.set(true);
        // Chiama il servizio Binance
        return this.binanceService.searchCryptos(query);
      }),
			tap(() => {
				this.isSearching.set(false);
				if(this.searchQuery().length>=2) this.searched.set(true);
			})
    ),

    // Valore iniziale del signal
    { initialValue: [] as string[] }
  );

  constructor() {
    // Effect reattivo:
    // viene rieseguito ogni volta che searchQuery cambia
    effect(() => {
      const query = this.searchQuery();

      // Invia il valore al Subject RxJS
      this.searchSubject.next(query);

      // Se la query è vuota, fermiamo il loader
      if (!query) {
        this.isSearching.set(false);
      }
    });
  }

  // Metodo chiamato quando l’utente scrive nell’input
  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  // Naviga alla pagina di dettaglio di una crypto
  navigateToDetail(symbol: string): void {
    this.router.navigate(['/crypto-stats', symbol]);
  }

  // Pulisce il campo di ricerca
  clearSearch(): void {
    this.searchQuery.set('');
  }

}
