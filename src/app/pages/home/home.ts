import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchCrypto } from '../../components/search-crypto/search-crypto';
import { PopularCryptos } from '../../components/popular-cryptos/popular-cryptos';

@Component({
  selector: 'app-home', // Tag HTML del componente
  standalone: true,     // Non usa NgModule
  imports: [CommonModule, FormsModule, PopularCryptos, SearchCrypto], // Dipendenze del template
  templateUrl: './home.html' // Template HTML
})
export class HomeComponent {}
