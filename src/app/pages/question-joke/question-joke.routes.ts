import { Routes } from '@angular/router';

export const QUESTION_JOKE_ROUTES: Routes = [
  {
    path: 'question-joke',
    loadComponent: () =>
      import('./question-joke')
        .then(m => m.QuestionJoke)
  },
];