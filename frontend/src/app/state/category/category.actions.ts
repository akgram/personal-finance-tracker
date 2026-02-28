import { createAction, props } from '@ngrx/store';

export const loadCategories = createAction('[Category] Load All');
export const loadCategoriesSuccess = createAction('[Category] Load Success', props<{ categories: any[], transactions: any[], budgets: any[] }>());
export const loadCategoriesFailure = createAction('[Category] Load Failure', props<{ error: any }>());
export const deleteCategory = createAction('[Category] Delete', props<{ id: number }>());

// dodela transakcije kategoriji
export const assignTransactions = createAction('[Category] Assign Transactions', props<{ ids: number[], catId: number }>());

export const createCategory = createAction('[Category] Create', props<{ data: any }>());
export const updateCategory = createAction('[Category] Update', props<{ id: number, data: any }>());