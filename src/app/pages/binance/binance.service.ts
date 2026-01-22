import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BinanceService {
  private socket!: WebSocket;

  connect(symbol: string): Observable<number> {
    return new Observable<number>(observer => {
      this.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);

      this.socket.onmessage = msg => {
        const data = JSON.parse(msg.data);
        observer.next(+data.p); // prezzo trade
      };

      return () => this.socket.close();
    });
  }
}