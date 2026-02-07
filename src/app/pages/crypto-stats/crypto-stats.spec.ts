import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CryptoStatsComponent } from './crypto-stats';
import { BinanceService } from './services/binance.service';
import { BinanceServiceMock } from './components/search-crypto/search-crypto.spec';


describe('CryptoStatsComponent', () => {

  let component: CryptoStatsComponent;
  let fixture: ComponentFixture<CryptoStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoStatsComponent],
      providers: [{ provide: BinanceService, useClass: BinanceServiceMock }]
    })
		.compileComponents();

    fixture = TestBed.createComponent(CryptoStatsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});