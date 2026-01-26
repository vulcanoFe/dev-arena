import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { HomeComponent } from './home';
import { BinanceService } from '../../services/binance.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

/**
 * MOCK del BinanceService
 */
class MockBinanceService {
  popularCryptos = ['BTC', 'ETH', 'BNB'];

  searchCryptos(query: string) {
    return of([
      `${query.toUpperCase()}1`,
      `${query.toUpperCase()}2`
    ]);
  }
}

/**
 * MOCK del Router
 */
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

/**
 * Stub CryptoCard
 */
import { Component, Input } from '@angular/core';
import { CryptoCardComponent } from '../../components/crypto-card/crypto-card';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  template: ''
})
class CryptoCardStubComponent {
  @Input() symbol!: string;
}

describe('HomeComponent', () => {

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let binanceService: MockBinanceService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: BinanceService, useClass: MockBinanceService },
        { provide: Router, useClass: MockRouter }
      ]
    })
      .overrideComponent(HomeComponent, {
        remove: {
          imports: [CryptoCardComponent]
        },
        add: {
          imports: [CryptoCardStubComponent]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // ⭐ Recupera il servizio PRIMA di detectChanges
    binanceService = TestBed.inject(BinanceService) as any;
    router = TestBed.inject(Router) as any;

    // ⭐ Crea lo spy PRIMA di detectChanges
    spyOn(binanceService, 'searchCryptos').and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.searchQuery()).toBe('');
    expect(component.isSearching()).toBeFalse();
    expect(component.showPopular()).toBeTrue();
    expect(component.searchResults()).toEqual([]);
  });

  it('should update searchQuery when onSearch is called', () => {
    component.onSearch('btc');
    expect(component.searchQuery()).toBe('btc');
  });

  it('should clear searchQuery when clearSearch is called', () => {
    component.searchQuery.set('eth');
    component.clearSearch();
    expect(component.searchQuery()).toBe('');
  });

  it('should hide popular cryptos when query length >= 2', () => {
    component.searchQuery.set('bt');
    expect(component.showPopular()).toBeFalse();
  });

  it('should show popular cryptos when query is too short', () => {
    component.searchQuery.set('b');
    expect(component.showPopular()).toBeTrue();
  });

  /**
   * ⭐ TEST PRINCIPALE: ricerca con query >= 2 caratteri
   * 
   * IL PROBLEMA ERA:
   * - toSignal non crea la sottoscrizione all'Observable se nessuno legge il signal
   * - Leggere searchResults() DOPO onSearch() non attiva la sottoscrizione
   * - Bisogna leggere il signal PRIMA di trigger la ricerca
   */
  it('should search cryptos when query length >= 2', fakeAsync(() => {
    // Configura lo spy per ritornare i dati attesi
    (binanceService.searchCryptos as jasmine.Spy).and.returnValue(of(['BI1', 'BI2']));

    // ⭐ FONDAMENTALE: Accedi a searchResults() PRIMA di onSearch()
    // Questo forza toSignal a sottoscriversi all'Observable
    // Senza questa riga, l'Observable non è mai attivo!
    const initialResults = component.searchResults();
    console.log('Initial results:', initialResults);

    // Simuliamo l'input dell'utente
    component.onSearch('bi');

    // Avanziamo il debounce (300ms)
    tick(300);

    // Completiamo gli Observable pendenti
    flush();

    // Detecta i cambiamenti nel template
    fixture.detectChanges();

    // ⭐ Verifichiamo che la ricerca sia stata chiamata con 'bi'
    expect(binanceService.searchCryptos).toHaveBeenCalledWith('bi');

    // ⭐ Verifichiamo i risultati - leggiamo di nuovo il signal
    expect(component.searchResults()).toEqual(['BI1', 'BI2']);

    // Verifichiamo che il loader sia disattivato
    expect(component.isSearching()).toBe(false);
  }));

  /**
   * TEST: query troppo corta
   */
  it('should not search when query is too short', fakeAsync(() => {
    // Accedi al signal PRIMA
    component.searchResults();

    component.onSearch('b');
    tick(300);
    flush();
    fixture.detectChanges();

    expect(binanceService.searchCryptos).not.toHaveBeenCalled();
    expect(component.searchResults()).toEqual([]);
  }));

  /**
   * TEST: navigateToDetail()
   */
  it('should navigate to crypto detail', () => {
    component.navigateToDetail('BTC');
    expect(router.navigate).toHaveBeenCalledWith(['/crypto', 'BTC']);
  });

});