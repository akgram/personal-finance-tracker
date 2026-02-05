import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category',
  imports: [CommonModule, FormsModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {
  
  groupedData: any[] = [];
  selectedCategory: any = null;

  categoryForm = { name: '', icon: '' };
  editingCategory: any = null;
  isCreateModalOpen = false;

  constructor(public router: Router,
    private transactionService: TransactionService,
    private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // comb operator
    forkJoin({
      categories: this.categoryService.getCategories(),
      transactions: this.transactionService.getTransactions()
    }).subscribe({
      next: (result) => {
        const { categories, transactions } = result;

        // map, reduce, filter
        this.groupedData = categories.map(cat => {
          const catTransactions = transactions.filter(t => t.category?.id === cat.id);
          
          const total = catTransactions.reduce((sum: number, t: any) => {
            return t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount); 
          }, 0);

          return {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            transactions: catTransactions,
            total: total
          };
        });
      },
      error: (err) => console.error(err)
    });
  }

  openCreateModal() {
    this.editingCategory = null;
    this.isCreateModalOpen = true;
    this.categoryForm = { name: '', icon: '' };
  }

  openEditModal(cat: any, event: Event) {
    event.stopPropagation();
    this.isCreateModalOpen = false;
    this.editingCategory = { ...cat };
    this.categoryForm = { 
      name: cat.name, 
      icon: cat.icon 
    };
  }

  createCategory() {
    if (this.categoryForm.name) {
      this.categoryService.create(this.categoryForm).subscribe({
        next: () => {
          this.isCreateModalOpen = false;
          this.categoryForm = { name: '', icon: '' };
          this.loadData();
        },
        error: (err) => console.error(err)
      });
    }
  }

  updateCategory() {
    if (this.editingCategory && this.categoryForm.name) {
      this.categoryService.update(this.editingCategory.id, this.categoryForm).subscribe({
        next: () => {
          this.editingCategory = null;
          this.categoryForm = { name: '', icon: '' };
          this.loadData();
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteCategory(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure?')) {
      this.categoryService.delete(id).subscribe({
        next: () => {
          if (this.selectedCategory?.id === id) this.selectedCategory = null;
          this.loadData();
        },
        error: (err) => console.error(err)
      });
    }
  }

  selectCategory(cat: any) {
    this.selectedCategory = (this.selectedCategory?.id === cat.id) ? null : cat;
  }

  allTransactions: any[] = [];
  selectedTransactionIds: number[] = [];
  isTransactionPickerOpen = false;
  targetCategory: any = null;

  openTransactionPicker(cat: any, event: Event) {
    event.stopPropagation();
    this.editingCategory = null;
    this.targetCategory = cat;
    this.isTransactionPickerOpen = true;
    this.selectedTransactionIds = [];
    
    this.transactionService.getTransactions().subscribe(trans => {
      this.allTransactions = trans;
    });
  }

  toggleTransactionSelection(id: number) {
    const index = this.selectedTransactionIds.indexOf(id);
    if (index > -1) {
      this.selectedTransactionIds.splice(index, 1);
    } else {
      this.selectedTransactionIds.push(id);
    }
  }

  assignTransactions() {
    if (this.targetCategory && this.selectedTransactionIds.length > 0) {
      this.transactionService.assignToCategory(this.selectedTransactionIds, this.targetCategory.id).subscribe({
        next: () => {
          this.isTransactionPickerOpen = false;
          this.loadData();
        },
        error: (err) => console.error(err)
      });
    }
  }
}