import { createReducer, on } from '@ngrx/store';
import * as BudgetActions from './budget.actions';

export interface BudgetState {
    budgets: any[];
    loading: boolean;
    error: any;
}

export const initialState: BudgetState = {
    budgets: [],
    loading: false,
    error: null
};

export const budgetReducer = createReducer(
    initialState,

    on(BudgetActions.loadBudgets, (state) => ({
    ...state,
    loading: true
    })),

    on(BudgetActions.loadBudgetsSuccess, (state, { budgets }) => ({
    ...state,
    budgets: budgets,
    loading: false,
    error: null
    })),

    on(BudgetActions.loadBudgetsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error
    })),

    on(BudgetActions.deleteBudgetFailure, (state, { error }) => ({
    ...state,
    error: error
    }))
);