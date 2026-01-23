
import { Injectable, effect, signal } from '@angular/core';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme'; // valori salvati: 'light' | 'dark' | 'system'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  // tema scelto dall’utente (o 'system')
  theme = signal<Theme>(this.readInitialTheme());

  // stato effettivo applicato (light/dark) tenendo conto di 'system'
  applied = signal<'light' | 'dark'>(this.computeApplied(this.theme()));

  constructor() {
    // Applica subito all’avvio
    this.apply(this.applied());

    // Reagisci ai cambi tema dell’utente
    effect(() => {
      const current = this.theme();
      localStorage.setItem(STORAGE_KEY, current);
      const applied = this.computeApplied(current);
      this.applied.set(applied);
      this.apply(applied);
    });

    // Ascolta cambi sistema (se l’utente ha scelto 'system')
    this.prefersDarkQuery.addEventListener('change', () => {
      if (this.theme() === 'system') {
        const applied = this.computeApplied('system');
        this.applied.set(applied);
        this.apply(applied);
      }
    });
  }

  toggle() {
    const next = this.applied() === 'dark' ? 'light' : 'dark';
    // se eri su system e toggli, passi a una scelta esplicita
    this.theme.set(next);
  }

  setTheme(t: Theme) {
    this.theme.set(t);
  }

  private readInitialTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved ?? 'system';
  }

  private computeApplied(t: Theme): 'light' | 'dark' {
    if (t === 'dark') return 'dark';
    if (t === 'light') return 'light';
    return this.prefersDarkQuery.matches ? 'dark' : 'light';
  }

  private apply(applied: 'light' | 'dark') {
    const root = document.documentElement; // <html>
    root.classList.toggle('dark', applied === 'dark');
  }
}
