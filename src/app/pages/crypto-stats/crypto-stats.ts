import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PopularCryptos } from './components/popular-cryptos/popular-cryptos';
import { SearchCrypto } from './components/search-crypto/search-crypto';

@Component({
  selector: 'app-home', // Tag HTML del componente
  standalone: true,     // Non usa NgModule
  imports: [CommonModule, FormsModule, PopularCryptos, SearchCrypto], // Dipendenze del template
  templateUrl: './crypto-stats.html' // Template HTML
})
export class CryptoStatsComponent {}
