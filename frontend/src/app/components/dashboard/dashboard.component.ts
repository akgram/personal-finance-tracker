import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { BudgetService } from '../../services/budget.service';
import { FormsModule } from '@angular/forms';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  allTransactionsList: any[] = [];
  allCategoriesList: any[] = [];
  allBudgetsList: any[] = [];
  financialStats: any = { totalBalance: 0, income: 0, expense: 0 };
  
  editingTransactionData: any = null;
  transactionToDeleteId: number | null = null;
  newTransactionData: any = { amount: 0, description: '', type: 'expense', categoryId: null };
  newCategoryData: any = { name: '', icon: '' };
  newBudgetData: any = { amount: 0, month: 1, year: 2024, categoryId: null };

  isCreateModalOpen: boolean = false;
  isCategoryModalOpen: boolean = false;
  isBudgetModalOpen: boolean = false;

  ngOnInit() {
    this.loadAllDashboardData();
  }

  loadAllDashboardData() {
    this.fetchTransactionsData();
    this.fetchStatsData();
    this.fetchCategoriesData();
    this.fetchBudgetsData();
  }

  fetchStatsData() {
    this.transactionService.getStats().subscribe({
      next: (res) => {
        this.financialStats = res;

        this.initChart(); // graf
      },
      error: (err) => console.error('Greška pri statsima', err)
    });
  }

  initChart() {
    if (!this.chartCanvas || (this.financialStats.income === 0 && this.financialStats.expense === 0)) return;
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
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
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#fff' }
          }
        }
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openCreateForm() { this.isCreateModalOpen = true; }
  openCategoryForm() { this.isCategoryModalOpen = true; }
  openBudgetForm() { this.isBudgetModalOpen = true; }

  createTransaction() {
    this.transactionService.create(this.newTransactionData).subscribe({
      next: () => {
        this.loadAllDashboardData();
        this.isCreateModalOpen = false;
        this.newTransactionData = { amount: 0, description: '', type: 'expense', categoryId: null };
      },
      error: (err) => console.error(err)
    });
  }

  prepareEditData(item: any) {
    this.editingTransactionData = { ...item };
    if (item.category) this.editingTransactionData.categoryId = item.category.id;
  }

  updateTransaction() {
    if (!this.editingTransactionData) return;
    this.transactionService.update(this.editingTransactionData.id, this.editingTransactionData).subscribe({
      next: () => {
        this.loadAllDashboardData();
        this.editingTransactionData = null;
      },
      error: (err) => console.error(err)
    });
  }

  fetchTransactionsData() {
    this.transactionService.getTransactions().subscribe({
      next: (res) => this.allTransactionsList = res,
      error: (err) => console.error(err)
    });
  }

  openDeleteModal(id: number) { this.transactionToDeleteId = id; }

  deleteTransaction() {
    if (this.transactionToDeleteId) {
      this.transactionService.delete(this.transactionToDeleteId).subscribe({
        next: () => {
          this.loadAllDashboardData();
          this.transactionToDeleteId = null;
        },
        error: (err) => console.error(err)
      });
    }
  }

  createCategory() {
    this.categoryService.create(this.newCategoryData).subscribe({
      next: () => {
        this.loadAllDashboardData();
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

  createBudget() {
    this.budgetService.create(this.newBudgetData).subscribe({
      next: () => {
        this.loadAllDashboardData();
        this.isBudgetModalOpen = false;
        this.newBudgetData = { amount: 0, month: 1, year: 2024, categoryId: null };
      },
      error: (err) => console.error(err)
    });
  }

  fetchBudgetsData() {
    this.budgetService.getBudgets().subscribe({
      next: (res) => this.allBudgetsList = res,
      error: (err) => console.error(err)
    });
  }
}