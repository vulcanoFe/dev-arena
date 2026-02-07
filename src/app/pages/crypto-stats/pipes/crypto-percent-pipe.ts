import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'cryptoPercent',
  standalone: true
})
export class CryptoPercentPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showSign: boolean = true): string {
    if (value === null || value === undefined) return '-';
    
    const percent = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(percent)) return '-';
    
    const formatted = percent.toFixed(2);
    
    if (showSign && percent > 0) {
      return '+' + formatted + '%';
    }
    
    return formatted + '%';
  }
}