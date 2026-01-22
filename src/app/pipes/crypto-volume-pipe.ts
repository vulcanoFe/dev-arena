import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'cryptoVolume',
  standalone: true
})
export class CryptoVolumePipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '-';
    
    const volume = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(volume)) return '-';
    
    // Formatta in K, M, B
    if (volume >= 1_000_000_000) {
      return (volume / 1_000_000_000).toFixed(2) + 'B';
    }
    if (volume >= 1_000_000) {
      return (volume / 1_000_000).toFixed(2) + 'M';
    }
    if (volume >= 1_000) {
      return (volume / 1_000).toFixed(2) + 'K';
    }
    
    return volume.toFixed(0);
  }
}