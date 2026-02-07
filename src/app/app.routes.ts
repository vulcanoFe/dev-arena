import { Routes } from '@angular/router';
import { CRYPTO_STATS_ROUTES } from './pages/crypto-stats/crypto-stats.routes';
import { QUESTION_JOKE_ROUTES } from './pages/question-joke/question-joke.routes';

export const routes: Routes = [
  ...CRYPTO_STATS_ROUTES,   // 👈 feature crypto stats
	...QUESTION_JOKE_ROUTES,  // 👈 feature question joke

  // default
  {
    path: '',
    redirectTo: 'question-joke',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'question-joke'
  }
];