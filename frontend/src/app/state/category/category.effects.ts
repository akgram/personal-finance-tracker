import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CategoryService } from '../../services/category.service';
import { TransactionService } from '../../services/transaction.service';
import { BudgetService } from '../../services/budget.service';

import * as CategoryActions from './category.actions';
import { map, mergeMap, catchError, of, forkJoin } from 'rxjs';

@Injectable()
export class CategoryEffects {
  private actions$ = inject(Actions);
  private categoryService = inject(CategoryService);
  private transactionService = inject(TransactionService);
  private budgetService = inject(BudgetService);

  // load/read
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.loadCategories),
      mergeMap(() => 
        forkJoin({
          categories: this.categoryService.getCategories(),
          transactions: this.transactionService.getTransactions(),
          budgets: this.budgetService.getBudgets()
        }).pipe(
          map(({ categories, transactions, budgets }) => 
            CategoryActions.loadCategoriesSuccess({ categories, transactions, budgets })
          ),
          catchError(() => of({ type: '[Category] Load Error' }))
        )
      )
    )
  );

  // create
  createCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.createCategory),
      mergeMap(({ data }) =>
        this.categoryService.create(data).pipe(
          map(() => CategoryActions.loadCategories()),
          catchError(() => of({ type: '[Category] Create Error' }))
        )
      )
    )
  );

  // update
  updateCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.updateCategory),
      mergeMap(({ id, data }) =>
        this.categoryService.update(id, data).pipe(
          map(() => CategoryActions.loadCategories()),
          catchError(() => of({ type: '[Category] Update Error' }))
        )
      )
    )
  );

  // delete
  deleteCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.deleteCategory),
      mergeMap(({ id }) =>
        this.categoryService.delete(id).pipe(
          map(() => CategoryActions.loadCategories()),
          catchError(() => of({ type: '[Category] Delete Error' }))
        )
      )
    )
  );

  // povezivanje transaction i category
  assignTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.assignTransactions),
      mergeMap(({ ids, catId }) =>
        this.transactionService.assignToCategory(ids, catId).pipe(
          map(() => CategoryActions.loadCategories()),
          catchError(() => of({ type: '[Category] Assign Error' }))
        )
      )
    )
  );
}