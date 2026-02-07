import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { SearchCrypto } from './search-crypto';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { BinanceService } from '../../services/binance.service';

export class BinanceServiceMock {
  searchCryptos = jasmine.createSpy('searchCryptos').and.returnValue(of([]));
  connect = jasmine.createSpy('connect').and.returnValue(of(0));
  disconnect = jasmine.createSpy('disconnect');
  disconnectAll = jasmine.createSpy('disconnectAll');
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

describe('SearchCrypto', () => {
  let component: SearchCrypto;
  let fixture: ComponentFixture<SearchCrypto>;
  let binanceService: BinanceServiceMock;
  let router: RouterMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCrypto],
      providers: [
        { provide: BinanceService, useClass: BinanceServiceMock },
        { provide: Router, useClass: RouterMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchCrypto);
    component = fixture.componentInstance;
    binanceService = TestBed.inject(BinanceService) as any;
    router = TestBed.inject(Router) as any;
  });

  it('should create', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));


	it('should call searchCryptos after debounce', fakeAsync(() => {
		binanceService.searchCryptos.and.returnValue(of(['BT1', 'BT2']));

		fixture.detectChanges(); // inizializzazione componente (toSignal si iscrive subito)

		// Invece di onSearch + flushEffects, spingiamo direttamente nel Subject
		(component as any).searchSubject.next('BT');

		tick(300); // scatta il debounceTime(300)
		flush();   // drena macrotask/microtask → switchMap→service e tap→aggiornano i signals

		expect(binanceService.searchCryptos).toHaveBeenCalledWith('BT');
		expect(component.searchResults()).toEqual(['BT1', 'BT2']);
		//expect(component.searched()).toBeTrue();
	}));



  it('should not search if query length < 2', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    (component as any).searchSubject.next('B');
    tick(300); // scatta il debounce della query corta
    flush();

    expect(binanceService.searchCryptos).not.toHaveBeenCalled();
    expect(component.searchResults()).toEqual([]);
  }));

	it('should set isSearching true while searching', fakeAsync(() => {
		// 1) mock "lento"
		const response$ = new Subject<string[]>();
		binanceService.searchCryptos.and.returnValue(response$.asObservable());

		fixture.detectChanges(); // crea il componente; toSignal si iscrive già

		// 2) spingi la query nella pipeline (bypassando l'effect)
		(component as any).searchSubject.next('ETH');

		// 3) fai scattare il debounce
		tick(300);
		// Qui switchMap è entrato e ha eseguito isSearching.set(true)
		// ma non essendoci ancora emissioni da response$, restiamo in "ricerca"
		expect(component.isSearching()).toBeTrue();

		// 4) ora arriva la "risposta" del servizio
		response$.next(['ETH']);
		response$.complete();

		// 5) drena i task rimanenti (tap -> isSearching false; toSignal -> aggiorna risultati)
		flush();

		expect(binanceService.searchCryptos).toHaveBeenCalledWith('ETH');
		expect(component.isSearching()).toBeFalse();
		expect(component.searchResults()).toEqual(['ETH']);
	}));


	it('should clear search', fakeAsync(() => {
		binanceService.searchCryptos.and.returnValue(of(['BTCUSDT']));

		fixture.detectChanges();

		// Avvio di una ricerca valida: spingo nel Subject (bypasso l'effect)
		(component as any).searchSubject.next('BTC');

		tick(300); // scatta il debounceTime
		flush();   // drena i task → switchMap→service, tap→aggiorna signals

		expect(binanceService.searchCryptos).toHaveBeenCalledWith('BTC');
		expect(component.searchResults()).toEqual(['BTCUSDT']);

		// Pulizia del campo di ricerca
		component.clearSearch();

		// *** PUNTO CHIAVE ***
		// Spingo '' nel Subject per far passare il ramo "query corta" della pipeline
		(component as any).searchSubject.next('');

		tick(300); // debounce anche per la query vuota
		flush();

		expect(component.searchQuery()).toBe('');
		expect(component.searchResults()).toEqual([]); // ora passa
		expect(component.searched()).toBeFalse();
		// opzionale: la clear non deve fare ulteriori chiamate al servizio
		expect(binanceService.searchCryptos).toHaveBeenCalledTimes(1);
  }));

  it('should navigate to detail', () => {
    component.navigateToDetail('BTCUSDT');
    expect(router.navigate).toHaveBeenCalledWith(['/crypto', 'BTCUSDT']);
  });

});