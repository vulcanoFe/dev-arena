import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CryptoCardComponent } from './crypto-card';
import { BinanceService } from '../../services/binance.service';
import { Subject } from 'rxjs';

/**
 * MOCK del BinanceService
 * 
 * Usiamo Subject per avere controllo totale
 * sulle emissioni nei test.
 */
class MockBinanceService {

  private price$ = new Subject<number>();
  private ticker$ = new Subject<any>();

  /**
   * Simula la connessione websocket / stream prezzi
   */
  connect(symbol: string) {
    return this.price$.asObservable();
  }

  /**
   * Simula la chiamata ticker
   */
  getTicker(symbol: string) {
    return this.ticker$.asObservable();
  }

  /**
   * Simula la disconnessione
   */
  disconnect(symbol: string) {
    // noop (serve solo per evitare errori)
  }

  // ====== METODI HELPER PER I TEST ======

  emitPrice(price: number) {
    this.price$.next(price);
  }

  emitTicker(ticker: any) {
    this.ticker$.next(ticker);
  }
}

describe('CryptoCardComponent', () => {

  let fixture: ComponentFixture<CryptoCardComponent>;
  let component: CryptoCardComponent;
  let binanceService: MockBinanceService;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [CryptoCardComponent],
      providers: [
        { provide: BinanceService, useClass: MockBinanceService }
      ]
    }).compileComponents();

    // Crea il componente
    fixture = TestBed.createComponent(CryptoCardComponent);
    component = fixture.componentInstance;

    // Recupera il servizio mock
    binanceService = TestBed.inject(BinanceService) as unknown as MockBinanceService;
  });

  /**
   * TEST 1
   * Il componente viene creato correttamente
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * TEST 2
   * Se il symbol è vuoto → errore e card nascosta
   */
	it('should set error when symbol becomes empty after being valid', () => {

		// 1️⃣ symbol valido
		fixture.componentRef.setInput('symbol', 'BTCUSDT');
		fixture.detectChanges();

		// 2️⃣ symbol vuoto
		fixture.componentRef.setInput('symbol', '');
		fixture.detectChanges();

		expect(component.hasError()).toBeTrue();
		expect(component.showCard()).toBeFalse();
	});


  /**
   * TEST 3
   * Quando arriva un symbol valido:
   * - deve connettersi
   * - deve richiedere il ticker
   */
  it('should connect to Binance when symbol is set', () => {

    spyOn(binanceService, 'connect').and.callThrough();
    spyOn(binanceService, 'getTicker').and.callThrough();

    fixture.componentRef.setInput('symbol', 'BTCUSDT');
    fixture.detectChanges();

    expect(binanceService.connect).toHaveBeenCalledWith('BTCUSDT');
    expect(binanceService.getTicker).toHaveBeenCalledWith('BTCUSDT');
  });

  /**
   * TEST 4
   * Quando Binance emette dati:
   * - price
   * - ticker
   * i computed devono aggiornarsi
   */
  it('should update price and ticker when data arrives', () => {

    fixture.componentRef.setInput('symbol', 'BTCUSDT');
    fixture.detectChanges();

    // Simuliamo emissioni dal servizio
    binanceService.emitPrice(42000);
    binanceService.emitTicker({ priceChangePercent: '5.25' });

    expect(component.currentPrice()).toBe(42000);
    expect(component.priceChange()).toBe(5.25);
    expect(component.isPositive()).toBeTrue();
    expect(component.isNegative()).toBeFalse();
    expect(component.showCard()).toBeTrue();
  });

  /**
   * TEST 5
   * Caso di variazione negativa
   */
  it('should detect negative price change', () => {

    fixture.componentRef.setInput('symbol', 'ETHUSDT');
    fixture.detectChanges();

    binanceService.emitPrice(2500);
    binanceService.emitTicker({ priceChangePercent: '-3.1' });

    expect(component.priceChange()).toBe(-3.1);
    expect(component.isNegative()).toBeTrue();
    expect(component.isPositive()).toBeFalse();
  });

  /**
   * TEST 6
   * Cleanup corretto:
   * - unsubscribe
   * - disconnect dal servizio
   */
  it('should disconnect on destroy', () => {

    spyOn(binanceService, 'disconnect');

    fixture.componentRef.setInput('symbol', 'BTCUSDT');
    fixture.detectChanges();

    // Distrugge il componente → chiama ngOnDestroy
    fixture.destroy();

    expect(binanceService.disconnect).toHaveBeenCalledWith('BTCUSDT');
  });

});
