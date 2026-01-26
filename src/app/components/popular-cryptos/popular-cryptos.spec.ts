import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularCryptos } from './popular-cryptos';

describe('PopularCryptos', () => {
  let component: PopularCryptos;
  let fixture: ComponentFixture<PopularCryptos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularCryptos]
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
