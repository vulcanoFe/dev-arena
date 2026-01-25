// Import delle API principali di Angular per:
// - Component: definire un componente
// - signal: stato reattivo (nuovo sistema Angular)
// - computed: valori derivati dai signal
// - inject: dependency injection senza constructor params
// - effect: side-effect reattivi
import { Component, signal, computed, inject, effect } from '@angular/core';

// Modulo con direttive comuni (*ngIf, *ngFor ecc.)
import { CommonModule } from '@angular/common';

// Modulo per gestire input e form
import { FormsModule } from '@angular/forms';

// Router per navigare tra le pagine
import { Router } from '@angular/router';

// RxJS: Subject per emettere eventi + operatori per la ricerca
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

// Utility Angular per convertire Observable → Signal
import { toSignal } from '@angular/core/rxjs-interop';

// Servizio custom per comunicare con Binance
import { BinanceService } from '../../services/binance.service';

// Componente UI per visualizzare una crypto
import { CryptoCardComponent } from '../../components/crypto-card/crypto-card';

@Component({
  selector: 'app-home', // Tag HTML del componente
  standalone: true,     // Non usa NgModule
  imports: [CommonModule, FormsModule, CryptoCardComponent], // Dipendenze del template
  templateUrl: './home.html' // Template HTML
})
export class HomeComponent {

  // Iniezione del servizio Binance
  private binanceService = inject(BinanceService);

  // Iniezione del Router
  private router = inject(Router);

  // Signal che contiene il testo di ricerca digitato dall’utente
  searchQuery = signal('');

  // Signal che indica se una ricerca è in corso
  isSearching = signal(false);
  
  // Subject RxJS che emette i valori della ricerca
  // Serve per applicare debounce e operatori RxJS
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
          return of([]); // nessuna chiamata API
        }

        // Indica che la ricerca è in corso
        this.isSearching.set(true);

        // Chiama il servizio Binance
        return this.binanceService.searchCryptos(query);
      })
    ),

    // Valore iniziale del signal
    { initialValue: [] as string[] }
  );

  // Computed signal:
  // true se devo mostrare le crypto popolari
  showPopular = computed(() => 
    !this.searchQuery() || this.searchQuery().length < 2
  );

  // Lista di crypto popolari fornita dal servizio
  popularCryptos = this.binanceService.popularCryptos;

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
    this.router.navigate(['/crypto', symbol]);
  }

  // Pulisce il campo di ricerca
  clearSearch(): void {
    this.searchQuery.set('');
  }
}
