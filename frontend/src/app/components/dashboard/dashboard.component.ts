import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { FormsModule } from '@angular/forms';
import { BudgetCardComponent } from '../budget-card/budget-card.component';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
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

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  isCurrentPeriod: boolean = true;

  private filterSubject = new BehaviorSubject({ 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear() 
  });

  isCurrentPeriodCheck() {
    const now = new Date();
    this.isCurrentPeriod = Number(this.selectedMonth) === (now.getMonth() + 1) && Number(this.selectedYear) === now.getFullYear();
  }

  onFilterChange() {

    this.isCurrentPeriodCheck();

    this.filterSubject.next({ 
      month: Number(this.selectedMonth), 
      year: Number(this.selectedYear) 
    });
  }

  fetchStatsData() {
    this.store.dispatch(BudgetActions.loadBudgets());
    this.onFilterChange();
  }

  resetToCurrentMonth() {
    const now = new Date();
    this.selectedMonth = now.getMonth() + 1;
    this.selectedYear = now.getFullYear();
    this.isCurrentPeriodCheck();
    this.fetchStatsData();
  }

  ngOnInit() {
    const currentUser = this.authService.getUserEmail();
    if (currentUser) {
      this.userEmail = currentUser;
    }

    this.store.dispatch(BudgetActions.loadBudgets());
    this.fetchCategoriesData();

    combineLatest([
      this.filterSubject,
      this.budgets$,
      this.transactionService.getTransactions()
    ]).pipe(
      map(([filters, budgets, transactions]) => {
        const filteredBudgets = budgets.filter((b: any) => 
          Number(b.month) === filters.month && Number(b.year) === filters.year
        );

        const filteredTrans = transactions.filter(t => {
          const tDate = new Date(t.date || t.createdAt);
          return (tDate.getMonth() + 1) === filters.month && 
                  tDate.getFullYear() === filters.year;
        });

        const income = filteredTrans
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = filteredTrans
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalPlanned = filteredBudgets.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
        const budgetIds = filteredBudgets.map((b: any) => b.id);

        return { 
          stats: { totalBalance: income - expense, income, expense }, 
          totalPlanned, 
          monthlySpent: expense, 
          budgetIds 
        };
      })
    ).subscribe(({ stats, totalPlanned, monthlySpent, budgetIds }) => {
      this.financialStats = stats;
      this.globalBudgetData = {
        ids: budgetIds,
        amount: totalPlanned, 
        spent: monthlySpent, 
        remaining: totalPlanned - monthlySpent 
      };

      setTimeout(() => this.initChart(), 0);
    });
  }

  initChart() {
    if (!this.chartCanvas) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (this.chart) this.chart.destroy();

    if (this.financialStats.income === 0 && this.financialStats.expense === 0) return;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [Number(this.financialStats.income), Number(this.financialStats.expense)],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', padding: 20, font: { size: 12 } }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
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

  onDeleteBudget(id: number) {
    this.store.dispatch(BudgetActions.deleteBudget({ id }));
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openAddBudgetModal() {
    this.isCreateModalOpen = true;
  }
}