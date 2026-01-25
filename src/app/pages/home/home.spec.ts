import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { HomeComponent } from './home';
import { BinanceService } from '../../services/binance.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

/**
 * MOCK del BinanceService
 * Simula il comportamento del servizio reale
 */
class MockBinanceService {

  // Lista di crypto popolari fake
  popularCryptos = ['BTC', 'ETH', 'BNB'];

  /**
   * Simula la chiamata API di ricerca
   * Ritorna un Observable (come il servizio reale)
   */
  searchCryptos(query: string) {
    return of([
      `${query.toUpperCase()}1`,
      `${query.toUpperCase()}2`
    ]);
  }
}

/**
 * MOCK del Router
 * Serve per verificare che navigate venga chiamato
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
  template: '' // template vuoto
})
class CryptoCardStubComponent {
  @Input() symbol!: string;
}


describe('HomeComponent', () => {

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let binanceService: MockBinanceService;
  let binanceServiceSpy: jasmine.SpyObj<MockBinanceService>;
  let router: MockRouter;

	beforeEach(async () => {

    const spy = jasmine.createSpyObj('BinanceService', ['searchCryptos'], { popularCryptos: ['BTC', 'ETH'] });

		await TestBed.configureTestingModule({
			imports: [HomeComponent],
			providers: [
				{ provide: BinanceService, useClass: MockBinanceService },
				{ provide: Router, useClass: MockRouter }
			]
		})
		.overrideComponent(HomeComponent, {
			remove: {
				imports: [CryptoCardComponent] // 🔥 RIMOSSO
			},
			add: {
				imports: [CryptoCardStubComponent] // ✅ SOLO STUB
			}
		})
		.compileComponents();


    // Creiamo l’istanza del componente
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // Recuperiamo i servizi mock
    binanceService = TestBed.inject(BinanceService) as any;
    router = TestBed.inject(Router) as any;

    // Trigger iniziale di Angular
    fixture.detectChanges();
  });

  /**
   * TEST BASE
   * Verifica che il componente venga creato
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * TEST: stato iniziale
   */
  it('should have initial state', () => {
    expect(component.searchQuery()).toBe('');
    expect(component.isSearching()).toBeFalse();
    expect(component.showPopular()).toBeTrue();
    expect(component.searchResults()).toEqual([]);
  });

  /**
   * TEST: onSearch()
   * Deve aggiornare il signal searchQuery
   */
  it('should update searchQuery when onSearch is called', () => {
    component.onSearch('btc');
    expect(component.searchQuery()).toBe('btc');
  });

  /**
   * TEST: clearSearch()
   * Deve svuotare la query
   */
  it('should clear searchQuery when clearSearch is called', () => {
    component.searchQuery.set('eth');
    component.clearSearch();
    expect(component.searchQuery()).toBe('');
  });

  /**
   * TEST: showPopular computed
   */
  it('should hide popular cryptos when query length >= 2', () => {
    component.searchQuery.set('bt');
    expect(component.showPopular()).toBeFalse();
  });

  it('should show popular cryptos when query is too short', () => {
    component.searchQuery.set('b');
    expect(component.showPopular()).toBeTrue();
  });

it('should search cryptos when query length >= 2', fakeAsync(() => {
    // Lo spy restituisce un Observable immediato
    binanceService.searchCryptos.and.returnValue(of(['BTC1', 'BTC2']));

    // Avvio la ricerca
    component.onSearch('btc');

    // Avanza il tempo per superare debounceTime(300ms)
    tick(300);
    fixture.detectChanges();

    // Il servizio deve essere chiamato
    expect(binanceService.searchCryptos).toHaveBeenCalledWith('btc');

    // Loader deve essere attivo subito dopo onSearch
    expect(component.isSearching()).toBeTrue();

    // Completa tutte le subscription
    flush();
    fixture.detectChanges();

    // Loader deve spegnersi
    expect(component.isSearching()).toBeFalse();

    // Risultati della ricerca
    expect(component.searchResults()).toEqual(['BTC1', 'BTC2']);
  }));

  /**
   * TEST: query troppo corta
   * Non deve chiamare il servizio
   */
  it('should not search when query is too short', fakeAsync(() => {

    spyOn(binanceService, 'searchCryptos');

    component.onSearch('b');
    tick(300);
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
