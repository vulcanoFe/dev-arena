import { Component, inject, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BinanceService } from '../../../../services/binance.service';

@Component({
  selector: 'app-price',
  imports: [],
  templateUrl: './price.html',
  styleUrl: './price.scss',
})
export class Price implements OnDestroy {
  price?: number;
  private destroy$ = new Subject<void>();

  private binanceService = inject(BinanceService);

  ngOnInit() {
    this.binanceService.connect('btcusdt')
      .pipe(takeUntil(this.destroy$))
      .subscribe(p => this.price = p);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}