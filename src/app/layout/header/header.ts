
import { Component, computed, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.html'
})
export class Header {
  private theme = inject(ThemeService);
  isDark = computed(() => this.theme.applied() === 'dark');
  toggle() { this.theme.toggle(); }
}