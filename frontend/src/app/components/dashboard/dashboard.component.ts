import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private authService: AuthService, private router: Router,
    private transactionService: TransactionService) {}

  allTransactionsList: any[] = [];

  financialStats: any = { totalBalance: 0, income: 0, expense: 0 };
  editingTransactionData: any = null;
  transactionToDeleteId: number | null = null;

  newTransactionData: any = {
    amount: 0,
    description: '',
    type: 'expense',
    categoryId: null
  };

  isCreateModalOpen: boolean = false;
  openCreateForm() {
    this.isCreateModalOpen = true;
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
  }

  createTransaction() {
    this.transactionService.create(this.newTransactionData).subscribe({
      next: (savedTransaction) => {
        console.log('Uspesno create', savedTransaction);
        this.loadAllDashboardData();
        this.isCreateModalOpen = false;
        this.newTransactionData = { amount: 0, description: '', type: 'expense', categoryId: null };
      },
      error: (err) => {
        console.error('Error create transaction.', err);
      }
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
        console.log('Uspeno edit.', updatedRes);
        this.loadAllDashboardData();
        this.editingTransactionData = null;
      },
      error: (err) => {
        console.error('Error update transaction.', err);
      }
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

}
