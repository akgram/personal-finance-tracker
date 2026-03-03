import { createAction, props } from '@ngrx/store';

export const loadBudgets = createAction('[Budget] Load Budgets');
export const loadBudgetsSuccess = createAction('[Budget] Load Budgets Success', props<{ budgets: any[] }>());
export const loadBudgetsFailure = createAction('[Budget] Load Budgets Failure', props<{ error: any }>());

export const deleteBudget = createAction('[Budget] Delete Budget', props<{ id: number }>());
export const deleteBudgetSuccess = createAction('[Budget] Delete Budget Success', props<{ id: number }>());
export const deleteBudgetFailure = createAction('[Budget] Delete Budget Failure', props<{ error: any }>());

export const addBudget = createAction('[Budget] Add Budget', props<{ budget: any }>());