import { Routes } from '@angular/router';
import { RouteData } from '../../models/route-data.model';

export const QUESTION_JOKE_ROUTES: Routes = [
  {
    path: 'question-joke',
    loadComponent: () =>
      import('./question-joke').then(m => m.QuestionJoke),
		data: <RouteData>{
			header: { title: 'Question Joke' },
			footer: { text: 'Developed for fun' }
		}
  },
];