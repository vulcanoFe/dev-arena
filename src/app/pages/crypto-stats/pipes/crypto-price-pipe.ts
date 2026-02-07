import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cryptoPrice',
  standalone: true
})
export class CryptoPricePipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '-';
    
    const price = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(price)) return '-';
    
    // Usa più decimali per crypto con prezzo basso
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    if (price < 10) return price.toFixed(4);
    return price.toFixed(2);
  }
}