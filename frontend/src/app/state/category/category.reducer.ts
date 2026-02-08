import { createReducer, on } from '@ngrx/store';
import * as CategoryActions from './category.actions';

export interface CategoryState {
  categories: any[];
  transactions: any[];
  loading: boolean;
  error: any;
}

// pocetne vrednosti
export const initialState: CategoryState = {
  categories: [],
  transactions: [],
  loading: false,
  error: null
};


export const categoryReducer = createReducer(
    initialState,
    //load
  on(CategoryActions.loadCategories, (state) => ({ 
    ...state, 
    loading: true })),

    //success load
  on(CategoryActions.loadCategoriesSuccess, (state, { categories, transactions }) => ({
    ...state,
    categories: categories,
    transactions: transactions,
    loading: false,
    error: null
  })),

  // greska
  on(CategoryActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error
  })),

  // optimistic UI, pravimo listu onih koji se ne brisu
  on(CategoryActions.deleteCategory, (state, { id }) => ({
    ...state,
    categories: state.categories.filter(cat => cat.id !== id)
  }))
);