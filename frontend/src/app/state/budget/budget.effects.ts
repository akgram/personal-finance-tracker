import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BudgetService } from '../../services/budget.service';
import * as BudgetActions from './budget.actions';
import { mergeMap, map, catchError, of } from 'rxjs';

import { inject } from '@angular/core';

@Injectable()
export class BudgetEffects {

    private actions$ = inject(Actions);
    private budgetService = inject(BudgetService);

    loadBudgets$ = createEffect(() => this.actions$.pipe(
        ofType(BudgetActions.loadBudgets),
        mergeMap(() => this.budgetService.getBudgets().pipe(
            map(budgets => BudgetActions.loadBudgetsSuccess({ budgets })),
            
            catchError(error => of(BudgetActions.loadBudgetsFailure({ error })))
        ))
    ));

    addBudget$ = createEffect(() => this.actions$.pipe(
        ofType(BudgetActions.addBudget),
        mergeMap(({ budget }) => this.budgetService.create(budget).pipe(
            // Čim servis uspešno kreira budžet, mi kažemo: "Hej, učitaj ponovo sve!"
            map(() => BudgetActions.loadBudgets()), 
            catchError(error => {
                console.error('Fail add:', error);
                return of(BudgetActions.loadBudgetsFailure({ error }));
            })
        ))
    ));

    deleteBudget$ = createEffect(() => this.actions$.pipe(
        ofType(BudgetActions.deleteBudget),
        mergeMap(({ id }) => this.budgetService.delete(id).pipe(
            map(() => BudgetActions.loadBudgets()), 
            catchError(error => {
                console.error('Fail delete:', error);
                return of(BudgetActions.deleteBudgetFailure({ error }));
            })
        ))
    ));
}