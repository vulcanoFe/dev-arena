import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'cryptoSymbol',
  standalone: true
})
export class CryptoSymbolPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // Converte BTCUSDT -> BTC/USDT
    return value.replace('USDT', '/USDT')
               .replace('USDC', '/USDC')
               .replace('BUSD', '/BUSD');
  }
}