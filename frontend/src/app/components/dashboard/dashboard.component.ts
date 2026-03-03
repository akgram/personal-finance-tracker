import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { BudgetService } from '../../services/budget.service';
import { FormsModule } from '@angular/forms';
import { BudgetCardComponent } from '../budget-card/budget-card.component';
import { combineLatest, map } from 'rxjs';
import { Chart, registerables } from 'chart.js';

import { Store } from '@ngrx/store';
import * as BudgetActions from '../../state/budget/budget.actions';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BudgetCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  @ViewChild('myChart') chartCanvas!: ElementRef;
  chart: any;

  private store = inject(Store);

  constructor(
    private authService: AuthService, 
    public router: Router,
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {}

  allCategoriesList: any[] = [];
  financialStats: any = { totalBalance: 0, income: 0, expense: 0 };
  globalBudgetData: any = { amount: 0, spent: 0, remaining: 0, ids: [] };
  
  newTransactionData: any = { amount: 0, description: '', type: 'expense', categoryId: null };
  newCategoryData: any = { name: '', icon: '' };

  isCreateModalOpen: boolean = false;
  isCategoryModalOpen: boolean = false;

  userEmail: string = '';

  budgets$ = this.store.select((state: any) => state.budget.budgets);

  ngOnInit() {
    const currentUser = this.authService.getUserEmail();

    if (currentUser) {
      this.userEmail = currentUser;
    }

    this.store.dispatch(BudgetActions.loadBudgets());
    this.fetchCategoriesData();

    combineLatest([
      this.budgets$,
      this.transactionService.getStats(),
      this.transactionService.getTransactions()
    ]).pipe(
      map(([budgets, stats, transactions]) => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const currentBudgets = budgets.filter((b: any) => 
          Number(b.month) === currentMonth && Number(b.year) === currentYear
        );

        const totalPlanned = currentBudgets.reduce((sum: number, b: any) => sum + Number(b.amount), 0);

        const monthlySpent = transactions
          .filter(t => {
            const tDate = new Date(t.date || t.createdAt);
            return t.type === 'expense' && 
                   (tDate.getMonth() + 1) === currentMonth && 
                   tDate.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const budgetIds = currentBudgets.map((b: any) => b.id);

        return { stats, totalPlanned, monthlySpent, budgetIds };
      })
    ).subscribe(({ stats, totalPlanned, monthlySpent, budgetIds }) => {
      this.financialStats = stats;
      
      this.globalBudgetData = {
        ids: budgetIds,
        amount: totalPlanned, 
        spent: monthlySpent, 
        remaining: totalPlanned - monthlySpent 
      };

      this.initChart();
    });
  }

  initChart() {
    if (!this.chartCanvas) return;
    if (this.financialStats.income === 0 && this.financialStats.expense === 0) {
       if (this.chart) this.chart.destroy();
       return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (this.chart) 
      this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [Number(this.financialStats.income), Number(this.financialStats.expense)],
          backgroundColor: ['#2ecc71', '#e74c3c'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { bottom: 20 }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#fff', padding: 20 }
          }
        }
      }
    });
  }

  fetchCategoriesData() {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.allCategoriesList = res,
      error: (err) => console.error(err)
    });
  }

  fetchStatsData() {
    this.store.dispatch(BudgetActions.loadBudgets());
  }

  onDeleteBudget(id: number) {
    this.store.dispatch(BudgetActions.deleteBudget({ id }));
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}