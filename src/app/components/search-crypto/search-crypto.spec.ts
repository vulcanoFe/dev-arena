import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchCrypto } from './search-crypto';
import { BinanceService } from '../../services/binance.service';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

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
    binanceService.searchCryptos.and.returnValue(
      of(['BTCUSDT', 'ETHUSDT'])
    );

    fixture.detectChanges();
    tick(); // effect iniziale

    component.onSearch('BT');
    tick(300); // debounce

    expect(binanceService.searchCryptos).toHaveBeenCalledWith('BT');
    expect(component.searchResults()).toEqual(['BTCUSDT', 'ETHUSDT']);
    expect(component.isSearching()).toBeFalse();
    expect(component.searched()).toBeTrue();
  }));

  it('should not search if query length < 2', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.onSearch('B');
    tick(300);

    expect(binanceService.searchCryptos).not.toHaveBeenCalled();
    expect(component.searchResults()).toEqual([]);
  }));

  it('should set isSearching true while searching', fakeAsync(() => {
    const subject = new Subject<string[]>();
    binanceService.searchCryptos.and.returnValue(subject.asObservable());

    fixture.detectChanges();
    tick();

    component.onSearch('ETH');
    tick(300);

    expect(component.isSearching()).toBeTrue();

    subject.next(['ETHUSDT']);
    subject.complete();
    tick();

    expect(component.isSearching()).toBeFalse();
    expect(component.searchResults()).toEqual(['ETHUSDT']);
  }));

  it('should clear search', fakeAsync(() => {
    binanceService.searchCryptos.and.returnValue(of(['BTCUSDT']));

    fixture.detectChanges();
    tick();

    component.onSearch('BTC');
    tick(300);

    expect(component.searchResults().length).toBe(1);

    component.clearSearch();
    tick(300);

    expect(component.searchQuery()).toBe('');
    expect(component.searchResults()).toEqual([]);
  }));

  it('should navigate to detail', () => {
    component.navigateToDetail('BTCUSDT');
    expect(router.navigate).toHaveBeenCalledWith(['/crypto', 'BTCUSDT']);
  });
});
