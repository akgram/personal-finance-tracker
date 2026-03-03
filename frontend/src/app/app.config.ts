import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { categoryReducer } from './/state/category/category.reducer';
import { CategoryEffects } from './state/category/category.effects';

import { budgetReducer } from './state/budget/budget.reducer';
import { BudgetEffects } from './state/budget/budget.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ category: categoryReducer, 
                  budget: budgetReducer 
                }),

    provideEffects([CategoryEffects, BudgetEffects]),
  ]
};