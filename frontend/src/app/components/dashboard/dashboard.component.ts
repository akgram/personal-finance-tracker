import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { BudgetService } from '../../services/budget.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

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

  openCreateForm() {
    this.isCreateModalOpen = true;
  }

  openCategoryForm() { 
    this.isCategoryModalOpen = true; 
  }

  openBudgetForm() { 
    this.isBudgetModalOpen = true; 
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.loadAllDashboardData();
  }

  loadAllDashboardData() {
    this.fetchTransactionsData();
    this.fetchStatsData();
    this.fetchCategoriesData();
    this.fetchBudgetsData();
  }

  // TRANSACTION
  createTransaction() {
    this.transactionService.create(this.newTransactionData).subscribe({
      next: (savedTransaction) => {
        console.log('Uspesno create', savedTransaction);
        this.loadAllDashboardData();
        this.isCreateModalOpen = false;
        this.newTransactionData = { amount: 0, description: '', type: 'expense', categoryId: null };
      },
      error: (err) => console.error('Error create transaction.', err)
    });
  }

  prepareEditData(item: any) {
    this.editingTransactionData = { ...item };
    if (item.category) {
      this.editingTransactionData.categoryId = item.category.id;
    }
  }

  updateTransaction() {
    if (!this.editingTransactionData) return;
    const id = this.editingTransactionData.id;
    this.transactionService.update(id, this.editingTransactionData).subscribe({
      next: (updatedRes) => {
        this.loadAllDashboardData();
        this.editingTransactionData = null;
      },
      error: (err) => console.error('Error update transaction.', err)
    });
  }

  fetchTransactionsData() {
    this.transactionService.getTransactions().subscribe({
      next: (res) => this.allTransactionsList = res,
      error: (err) => console.error('Error load transaction list.', err)
    });
  }

  fetchStatsData() {
    this.transactionService.getStats().subscribe({
      next: (res) => this.financialStats = res,
      error: (err) => console.error('Error load transaction stats.', err)
    });
  }

  openDeleteModal(id: number) {
    this.transactionToDeleteId = id;
  }

  deleteTransaction() {
    if (this.transactionToDeleteId) {
      this.transactionService.delete(this.transactionToDeleteId).subscribe({
        next: () => {
          this.loadAllDashboardData();
          this.transactionToDeleteId = null;
        },
        error: (err) => console.error('Error delete transaction.', err)
      });
    }
  }

  // CATEGORY
  createCategory() {
    this.categoryService.create(this.newCategoryData).subscribe({
      next: () => {
        this.loadAllDashboardData();
        this.isCategoryModalOpen = false;
        this.newCategoryData = { name: '', icon: '' };
      },
      error: (err) => console.error('Error create category.', err)
    });
  }

  fetchCategoriesData() {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.allCategoriesList = res,
      error: (err) => console.error('Error load categories.', err)
    });
  }

  // BUDGET
  createBudget() {
    this.budgetService.create(this.newBudgetData).subscribe({
      next: () => {
        this.loadAllDashboardData();
        this.isBudgetModalOpen = false;
        this.newBudgetData = { amount: 0, month: 1, year: 2024, categoryId: null };
      },
      error: (err) => console.error('Error create budget.', err)
    });
  }

  fetchBudgetsData() {
    this.budgetService.getBudgets().subscribe({
      next: (res) => this.allBudgetsList = res,
      error: (err) => console.error('Error load budgets.', err)
    });
  }

}