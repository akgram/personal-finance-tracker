import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {

  allTransactionsList: any[] = [];
  allCategoriesList: any[] = [];
  
  editingTransactionData: any = null;
  transactionToDeleteId: number | null = null;
  
  isCreateModalOpen: boolean = false;
  newTransactionData: any = { amount: 0, description: '', type: 'expense', categoryId: null };

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.fetchTransactionsData();
    this.fetchCategoriesData();
  }

  fetchTransactionsData() {
    this.transactionService.getTransactions().subscribe({
      next: (res) => this.allTransactionsList = res,
      error: (err) => console.error(err)
    });
  }

  fetchCategoriesData() {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.allCategoriesList = res,
      error: (err) => console.error(err)
    });
  }

  createTransaction() {
    this.transactionService.create(this.newTransactionData).subscribe({
      next: () => {
        this.fetchTransactionsData();
        this.isCreateModalOpen = false;
        this.newTransactionData = { amount: 0, description: '', type: 'expense', categoryId: null };
      },
      error: (err) => console.error(err)
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
    this.transactionService.update(this.editingTransactionData.id, this.editingTransactionData).subscribe({
      next: () => {
        this.fetchTransactionsData();
        this.editingTransactionData = null;
      },
      error: (err) => console.error(err)
    });
  }

  openDeleteModal(id: number) {
    this.transactionToDeleteId = id;
  }

  deleteTransaction() {
    if (this.transactionToDeleteId) {
      this.transactionService.delete(this.transactionToDeleteId).subscribe({
        next: () => {
          this.fetchTransactionsData();
          this.transactionToDeleteId = null;
        },
        error: (err) => console.error(err)
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}