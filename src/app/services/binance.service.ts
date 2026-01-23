import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, map, shareReplay, catchError, of, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * Interfaccia per i dati del ticker di una criptovaluta
 * Rappresenta le statistiche delle ultime 24 ore
 */
export interface CryptoTicker {
  symbol: string;              // Simbolo della crypto (es. BTCUSDT)
  price: string;               // Prezzo corrente
  priceChangePercent: string;  // Variazione percentuale 24h
  volume: string;              // Volume scambiato 24h
  highPrice: string;           // Prezzo massimo 24h
  lowPrice: string;            // Prezzo minimo 24h
}

/**
 * Interfaccia per il prezzo in tempo reale
 */
export interface CryptoPrice {
  symbol: string;    // Simbolo della crypto
  price: number;     // Prezzo corrente
  timestamp: number; // Timestamp dell'aggiornamento
}

/**
 * Servizio per interagire con le API di Binance
 * Gestisce connessioni WebSocket per prezzi real-time e chiamate REST per dati storici
 */
@Injectable({ providedIn: 'root' })
export class BinanceService {
  private http = inject(HttpClient);
  
  // Map che tiene traccia di tutte le connessioni WebSocket attive
  // Chiave: simbolo normalizzato (lowercase), Valore: istanza WebSocket
  private sockets = new Map<string, WebSocket>();
  
  // Map che contiene i BehaviorSubject per ogni simbolo
  // I BehaviorSubject emettono il prezzo corrente e permettono a più componenti di ascoltare lo stesso stream
  private priceSubjects = new Map<string, BehaviorSubject<number>>();
  
  // Cache per le chiamate HTTP ai ticker
  // Evita chiamate duplicate simultanee allo stesso endpoint
  private tickerCache = new Map<string, Observable<CryptoTicker>>();
  
  // Tiene traccia del numero di tentativi di riconnessione per ogni simbolo
  private reconnectAttempts = new Map<string, number>();
  
  // Numero massimo di tentativi di riconnessione prima di arrendersi
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  
  // Tempo di attesa (in ms) tra un tentativo di riconnessione e l'altro
  private readonly RECONNECT_DELAY = 3000;

  // Lista delle crypto più popolari mostrate nella home
  readonly popularCryptos = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];

  /**
   * Crea una connessione WebSocket per ricevere aggiornamenti di prezzo in tempo reale
   * Se esiste già una connessione per quel simbolo, riutilizza quella esistente
   * 
   * @param symbol - Simbolo della crypto (es. BTCUSDT)
   * @returns Observable che emette il prezzo ogni volta che cambia
   */
  connect(symbol: string): Observable<number> {
    // Normalizza il simbolo in lowercase per consistenza
    const normalizedSymbol = symbol.toLowerCase();
    
    // Se esiste già una connessione attiva, riutilizza il BehaviorSubject esistente
    // Questo evita di creare connessioni duplicate per lo stesso simbolo
    if (this.priceSubjects.has(normalizedSymbol)) {
      return this.priceSubjects.get(normalizedSymbol)!.asObservable();
    }

    // Crea un nuovo BehaviorSubject che inizia con valore 0
    // BehaviorSubject mantiene l'ultimo valore emesso e lo invia immediatamente ai nuovi subscriber
    const subject = new BehaviorSubject<number>(0);
    this.priceSubjects.set(normalizedSymbol, subject);
    
    // Inizializza il contatore dei tentativi di riconnessione
    this.reconnectAttempts.set(normalizedSymbol, 0);

    // Crea effettivamente la connessione WebSocket
    this.createWebSocket(normalizedSymbol, subject);

    // Ritorna l'Observable che i componenti possono sottoscrivere
    return subject.asObservable();
  }

  /**
   * Crea e configura una connessione WebSocket
   * Gestisce eventi di apertura, messaggi, errori e chiusura
   * Implementa logica di riconnessione automatica
   * 
   * @param normalizedSymbol - Simbolo normalizzato (lowercase)
   * @param subject - BehaviorSubject dove emettere i nuovi prezzi
   */
  private createWebSocket(normalizedSymbol: string, subject: BehaviorSubject<number>): void {
    // Chiudi eventuali socket precedenti ancora aperti
    // Questo previene memory leak e connessioni duplicate
    const existingSocket = this.sockets.get(normalizedSymbol);
    if (existingSocket && existingSocket.readyState !== WebSocket.CLOSED) {
      existingSocket.close();
    }

    // Crea nuova connessione WebSocket al server Binance
    // Il formato dell'URL è: wss://stream.binance.com:9443/ws/{symbol}@trade
    // @trade indica che vogliamo ricevere aggiornamenti ad ogni trade eseguito
    const socket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${normalizedSymbol}@trade`
    );

    /**
     * Evento: WebSocket aperto con successo
     * Viene chiamato quando la connessione è stabilita
     */
    socket.onopen = () => {
      console.log(`WebSocket connected for ${normalizedSymbol}`);
      // Reset del contatore di riconnessione dopo una connessione riuscita
      this.reconnectAttempts.set(normalizedSymbol, 0);
    };

    /**
     * Evento: Messaggio ricevuto dal WebSocket
     * Viene chiamato ogni volta che arriva un nuovo trade
     */
    socket.onmessage = (msg) => {
      try {
        // Parse del JSON ricevuto
        const data = JSON.parse(msg.data);
        // Estrai il prezzo (campo 'p' nella risposta di Binance)
        const price = parseFloat(data.p);
        
        // Valida che il prezzo sia un numero valido e positivo
        // Questo previene di emettere valori corrotti o invalidi
        if (!isNaN(price) && price > 0) {
          // Emetti il nuovo prezzo a tutti i subscriber
          subject.next(price);
        }
      } catch (error) {
        // Log dell'errore ma continua a ricevere messaggi
        console.error(`Error parsing WebSocket message for ${normalizedSymbol}:`, error);
      }
    };

    /**
     * Evento: Errore WebSocket
     * Viene chiamato quando si verifica un errore di rete o di connessione
     */
    socket.onerror = (error) => {
      console.error(`WebSocket error for ${normalizedSymbol}:`, error);
    };

    /**
     * Evento: WebSocket chiuso
     * Viene chiamato quando la connessione si chiude (intenzionalmente o per errore)
     * Implementa la logica di riconnessione automatica
     */
    socket.onclose = (event) => {
      console.log(`WebSocket closed for ${normalizedSymbol}`, event.code, event.reason);
      
      // Recupera il numero di tentativi già effettuati
      const attempts = this.reconnectAttempts.get(normalizedSymbol) || 0;
      
      // Tenta di riconnettersi solo se:
      // 1. Non abbiamo superato il limite di tentativi
      // 2. Il subject è ancora presente (significa che qualcuno è ancora interessato ai dati)
      if (attempts < this.MAX_RECONNECT_ATTEMPTS && this.priceSubjects.has(normalizedSymbol)) {
        console.log(`Attempting to reconnect ${normalizedSymbol} (attempt ${attempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`);
        
        // Incrementa il contatore dei tentativi
        this.reconnectAttempts.set(normalizedSymbol, attempts + 1);
        
        // Aspetta RECONNECT_DELAY millisecondi prima di riconnettersi
        // Questo evita di bombardare il server con tentativi di connessione
        timer(this.RECONNECT_DELAY).subscribe(() => {
          // Verifica ancora una volta che ci sia interesse prima di riconnettere
          if (this.priceSubjects.has(normalizedSymbol)) {
            this.createWebSocket(normalizedSymbol, subject);
          }
        });
      } else if (attempts >= this.MAX_RECONNECT_ATTEMPTS) {
        // Se abbiamo esaurito i tentativi, notifica l'errore ai subscriber
        console.error(`Max reconnection attempts reached for ${normalizedSymbol}`);
        subject.error(new Error('WebSocket connection failed after multiple attempts'));
      }
    };

    // Salva il socket nella Map per poterlo gestire in seguito
    this.sockets.set(normalizedSymbol, socket);
  }

  /**
   * Disconnette e pulisce tutte le risorse relative a un simbolo specifico
   * Deve essere chiamato quando un componente non ha più bisogno dei dati
   * 
   * @param symbol - Simbolo della crypto da disconnettere
   */
  disconnect(symbol: string): void {
    const normalizedSymbol = symbol.toLowerCase();
    
    // Rimuovi dai tentativi di riconnessione
    // Questo previene che il servizio tenti di riconnettersi a qualcosa che non ci serve più
    this.reconnectAttempts.delete(normalizedSymbol);
    
    // Recupera e chiudi il WebSocket se esiste
    const socket = this.sockets.get(normalizedSymbol);
    if (socket) {
      // Chiudi solo se il socket è in uno stato che lo permette
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        // 1000 = codice di chiusura normale (tutto ok)
        socket.close(1000, 'Client disconnect');
      }
      // Rimuovi dalla Map
      this.sockets.delete(normalizedSymbol);
    }

    // Completa il BehaviorSubject per notificare tutti i subscriber
    // e poi rimuovilo dalla Map
    const subject = this.priceSubjects.get(normalizedSymbol);
    if (subject) {
      subject.complete(); // Segnala la fine dello stream
      this.priceSubjects.delete(normalizedSymbol);
    }
  }

  /**
   * Recupera i dati statistici delle ultime 24 ore per un simbolo
   * Usa cache e shareReplay per ottimizzare le chiamate HTTP
   * 
   * @param symbol - Simbolo della crypto
   * @returns Observable con i dati del ticker
   */
  getTicker(symbol: string): Observable<CryptoTicker> {
    const normalizedSymbol = symbol.toUpperCase();
    
    // Se la richiesta è già in cache e ancora valida, riutilizza quella
    // Questo previene chiamate HTTP duplicate quando più componenti chiedono lo stesso dato
    if (this.tickerCache.has(normalizedSymbol)) {
      return this.tickerCache.get(normalizedSymbol)!;
    }

    // Crea la chiamata HTTP all'API REST di Binance
    const ticker$ = this.http.get<CryptoTicker>(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${normalizedSymbol}`
    ).pipe(
      // Gestisce eventuali errori HTTP (404, 500, timeout, etc.)
      catchError(error => {
        console.error(`Error fetching ticker for ${normalizedSymbol}:`, error);
        // Rimuovi dalla cache in caso di errore così il prossimo tentativo riproverà
        this.tickerCache.delete(normalizedSymbol);
        // Rilancia l'errore ai subscriber
        throw error;
      }),
      // shareReplay condivide il risultato tra tutti i subscriber
      // e lo "ripete" ai nuovi subscriber che arrivano dopo
      shareReplay({
        bufferSize: 1,        // Mantieni solo l'ultimo valore
        refCount: true,       // Pulisci automaticamente quando non ci sono più subscriber
        windowTime: 5000      // La cache è valida per 5 secondi
      })
    );

    // Aggiungi alla cache
    this.tickerCache.set(normalizedSymbol, ticker$);

    // Pulisci automaticamente la cache dopo 5 secondi
    // Questo previene che la cache cresca indefinitamente
    timer(5000).subscribe(() => {
      this.tickerCache.delete(normalizedSymbol);
    });

    return ticker$;
  }

  /**
   * Cerca crypto che corrispondono a una query
   * Recupera tutti i simboli disponibili e filtra quelli rilevanti
   * 
   * @param query - Stringa di ricerca (es. "BTC")
   * @returns Observable con array di simboli che matchano
   */
  searchCryptos(query: string): Observable<string[]> {
    // Se la query è vuota, ritorna subito array vuoto
    // Questo evita chiamate API inutili
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    // Chiama l'endpoint exchangeInfo che ritorna info su tutti i simboli disponibili
    return this.http.get<any>('https://api.binance.com/api/v3/exchangeInfo')
      .pipe(
        // Trasforma la risposta filtrando solo i simboli rilevanti
        map(data => {
          // Validazione: verifica che la risposta contenga i dati attesi
          if (!data || !data.symbols) {
            return [];
          }
          
          return data.symbols
            // Filtra solo i simboli che:
            .filter((s: any) => 
              s.symbol.includes(query.toUpperCase()) &&  // Contengono la query
              s.quoteAsset === 'USDT' &&                 // Sono quotati in USDT
              s.status === 'TRADING'                     // Sono attivi per il trading
            )
            // Estrai solo il campo symbol
            .map((s: any) => s.symbol)
            // Limita a 10 risultati per non sovraccaricare l'UI
            .slice(0, 10);
        }),
        // Gestisci errori di rete o parsing
        catchError(error => {
          console.error('Error searching cryptos:', error);
          // In caso di errore, ritorna array vuoto invece di far fallire l'Observable
          return of([]);
        })
      );
  }

  /**
   * Disconnette tutte le connessioni WebSocket attive
   * Utile quando l'applicazione si chiude o quando si fa logout
   * Dovrebbe essere chiamato nel ngOnDestroy del componente root
   */
  disconnectAll(): void {
    console.log('Disconnecting all WebSocket connections');
    
    // Pulisci tutti i tentativi di riconnessione in corso
    this.reconnectAttempts.clear();
    
    // Chiudi tutti i WebSocket
    this.sockets.forEach((socket, symbol) => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, 'Service shutdown');
      }
    });
    
    // Completa tutti i BehaviorSubject per notificare i subscriber
    this.priceSubjects.forEach((subject) => {
      subject.complete();
    });
    
    // Pulisci tutte le Map
    this.sockets.clear();
    this.priceSubjects.clear();
    this.tickerCache.clear();
  }

  /**
   * Metodo diagnostico per verificare lo stato di tutte le connessioni
   * Utile per debugging e monitoring
   * 
   * @returns Map con simbolo -> stato connessione
   */
  getConnectionStatus(): Map<string, string> {
    const status = new Map<string, string>();
    // Array con i nomi leggibili degli stati WebSocket
    const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    
    this.sockets.forEach((socket, symbol) => {
      // readyState è un numero da 0 a 3, mappiamolo a una stringa leggibile
      status.set(symbol, states[socket.readyState] || 'UNKNOWN');
    });
    
    return status;
  }
}