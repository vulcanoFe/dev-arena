import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { BinanceServiceMock } from '../../components/search-crypto/search-crypto.spec';
import { BinanceService } from '../../services/binance.service';


describe('HomeComponent', () => {

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [{ provide: BinanceService, useClass: BinanceServiceMock }]
    })
		.compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});