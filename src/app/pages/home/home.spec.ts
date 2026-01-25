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

    // ⭐ IMPORTANTE: Recupera il servizio PRIMA di detectChanges
    binanceService = TestBed.inject(BinanceService) as any;
    router = TestBed.inject(Router) as any;

    // ⭐ Crea lo spy PRIMA di detectChanges con returnValue
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
   */
  it('should search cryptos when query length >= 2', fakeAsync(() => {
    // Configura lo spy per ritornare i dati attesi
    (binanceService.searchCryptos as jasmine.Spy).and.returnValue(of(['BI1', 'BI2']));

    // ⭐ FONDAMENTALE: accedi al signal PRIMA della ricerca
    // Questo forza Angular a sottoscrivere l'Observable
    component.searchResults();

    // Simuliamo l'input dell'utente
    component.onSearch('bi');

    // Avanziamo il debounce
    tick(300);

    // Completiamo gli Observable
    flush();

    // Detecta i cambiamenti
    fixture.detectChanges();

    // Verifichiamo che la ricerca sia stata chiamata con 'bi'
    expect(binanceService.searchCryptos).toHaveBeenCalledWith('bi');

    // Verifichiamo i risultati
    expect(component.searchResults()).toEqual(['BI1', 'BI2']);

    // Verifichiamo che il loader sia disattivato
    expect(component.isSearching()).toBe(false);
  }));

  /**
   * TEST: query troppo corta
   */
  it('should not search when query is too short', fakeAsync(() => {
    component.onSearch('b');
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