import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularCryptos } from './popular-cryptos';
import { BinanceService } from '../../services/binance.service';
import { BinanceServiceMock } from '../search-crypto/search-crypto.spec';

describe('PopularCryptos', () => {
  let component: PopularCryptos;
  let fixture: ComponentFixture<PopularCryptos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularCryptos],
			providers: [{ provide: BinanceService, useClass: BinanceServiceMock }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularCryptos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
