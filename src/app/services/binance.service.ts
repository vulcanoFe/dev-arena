import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface CryptoTicker {
  symbol: string;
  price: string;
  priceChangePercent: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
}

export interface CryptoPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class BinanceService {
  private http = inject(HttpClient);
  private sockets = new Map<string, WebSocket>();
  private priceSubjects = new Map<string, BehaviorSubject<number>>();

  readonly popularCryptos = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];

  connect(symbol: string): Observable<number> {
    const normalizedSymbol = symbol.toLowerCase();
    
    if (this.priceSubjects.has(normalizedSymbol)) {
      return this.priceSubjects.get(normalizedSymbol)!.asObservable();
    }

    const subject = new BehaviorSubject<number>(0);
    this.priceSubjects.set(normalizedSymbol, subject);

    const socket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${normalizedSymbol}@trade`
    );

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      subject.next(parseFloat(data.p));
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for ${symbol}:`, error);
    };

    this.sockets.set(normalizedSymbol, socket);

    return subject.asObservable();
  }

  disconnect(symbol: string): void {
    const normalizedSymbol = symbol.toLowerCase();
    
    const socket = this.sockets.get(normalizedSymbol);
    if (socket) {
      socket.close();
      this.sockets.delete(normalizedSymbol);
    }

    const subject = this.priceSubjects.get(normalizedSymbol);
    if (subject) {
      subject.complete();
      this.priceSubjects.delete(normalizedSymbol);
    }
  }

  getTicker(symbol: string): Observable<CryptoTicker> {
    return this.http.get<CryptoTicker>(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`
    );
  }

  searchCryptos(query: string): Observable<string[]> {
    return this.http.get<any>('https://api.binance.com/api/v3/exchangeInfo')
      .pipe(
        map(data => data.symbols
          .filter((s: any) => 
            s.symbol.includes(query.toUpperCase()) && 
            s.quoteAsset === 'USDT' &&
            s.status === 'TRADING'
          )
          .map((s: any) => s.symbol)
          .slice(0, 10)
        )
      );
  }

  disconnectAll(): void {
    this.sockets.forEach((socket) => socket.close());
    this.priceSubjects.forEach((subject) => subject.complete());
    this.sockets.clear();
    this.priceSubjects.clear();
  }
}