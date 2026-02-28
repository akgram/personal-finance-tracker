import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { BudgetService } from '../../services/budget.service';
import { FormsModule } from '@angular/forms';
import { BudgetCardComponent } from '../budget-card/budget-card.component';
import { zip, map, take } from 'rxjs';
import { Chart, registerables } from 'chart.js';

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

  constructor(
    private authService: AuthService, 
    public router: Router,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private budgetService: BudgetService
  ) {}

  allCategoriesList: any[] = [];
  financialStats: any = { totalBalance: 0, income: 0, expense: 0 };
  globalBudgetData: any = { amount: 0 };
  
  newTransactionData: any = { amount: 0, description: '', type: 'expense', categoryId: null };
  newCategoryData: any = { name: '', icon: '' };

  isCreateModalOpen: boolean = false;
  isCategoryModalOpen: boolean = false;

  userEmail: string = '';

  ngOnInit() {

    const currentUser = this.authService.getUserEmail(); 
    if (currentUser) {
      this.userEmail = currentUser;
    }

    this.loadDashboardOverview();
  }

  loadDashboardOverview() {
    this.fetchStatsData();
    this.fetchCategoriesData();
  }

  fetchStatsData() {
    zip(
      this.transactionService.getStats(),
      this.budgetService.getBudgets(),
      this.transactionService.getTransactions()
    ).pipe(
      take(1),
      map(([stats, budgets, transactions]) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // ukupan budzet za tekuci mesec
        const totalPlanned = budgets
          .filter(b => b.month === (currentMonth + 1) && b.year === currentYear)
          .reduce((sum, b) => sum + Number(b.amount), 0);

        // potrosnja iz transakcija za tekuci mesec
        const monthlySpent = transactions
          .filter(t => {
            const tDate = new Date(t.createdAt);
            return t.type === 'expense' && 
                  tDate.getMonth() === currentMonth && 
                  tDate.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const remainingBudget = totalPlanned - monthlySpent;

        const currentBudgets = budgets.
          filter(b => b.month === (currentMonth + 1) && b.year === currentYear);

        
        const budgetIds = currentBudgets.map(b => b.id);


        return { stats, totalPlanned, monthlySpent, remainingBudget, transactions, budgetIds };
      })
    ).subscribe(({ stats, totalPlanned, monthlySpent, remainingBudget, transactions, budgetIds }) => {
      this.financialStats = stats;
      
      this.globalBudgetData = {
        ids: budgetIds,
        amount: totalPlanned, 
        spent: monthlySpent, 
        remaining: remainingBudget 
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
    if (this.chart) this.chart.destroy();

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

  createTransaction() {
    this.transactionService.create(this.newTransactionData).subscribe({
      next: () => {
        this.fetchStatsData();
        this.isCreateModalOpen = false;
        this.newTransactionData = { amount: 0, description: '', type: 'expense', categoryId: null };
      },
      error: (err) => console.error(err)
    });
  }

  createCategory() {
    this.categoryService.create(this.newCategoryData).subscribe({
      next: () => {
        this.fetchCategoriesData();
        this.isCategoryModalOpen = false;
        this.newCategoryData = { name: '', icon: '' };
      },
      error: (err) => console.error(err)
    });
  }

  fetchCategoriesData() {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.allCategoriesList = res,
      error: (err) => console.error(err)
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openCreateForm() { this.isCreateModalOpen = true; }
  openCategoryForm() { this.isCategoryModalOpen = true; }
}