import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import * as CategoryActions from '../../state/category/category.actions';
import { TransactionPickerComponent } from '../transaction-picker/transaction-picker.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionPickerComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {

  private store = inject(Store);
  public router = inject(Router);


  groupedData$ = this.store.select((state: any) => state.category).pipe(
    map(({ categories, transactions }) => categories.map((cat: any) => {
      const catTransactions = transactions.filter((t: any) => t.category?.id === cat.id);
      const total = catTransactions.reduce((sum: number, t: any) => 
        t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount), 0);
      return { ...cat, transactions: catTransactions, total };
    }))
  );

  allTransactions$ = this.store.select((state: any) => state.category.transactions);

  selectedCategory: any = null;
  categoryForm = { name: '', icon: '' };
  isCreateModalOpen = false;
  isTransactionPickerOpen = false;
  targetCategory: any = null;
  categoryToEdit: any = null;
  categoryToDeleteId: any = null;

  ngOnInit() {
    this.store.dispatch(CategoryActions.loadCategories());
  }

  openCreateModal() {
    this.selectedCategory = null;
    this.categoryToEdit = null;
    this.categoryForm = { name: '', icon: '' };
    this.isCreateModalOpen = true;
  }

  openEditModal(cat: any, event: Event) {
    event.stopPropagation(); // samo klik na edit, bez otvaranja kartice
    this.categoryToEdit = { ...cat };
    this.categoryForm = { name: cat.name, icon: cat.icon };
    this.isCreateModalOpen = true;
  }

  saveCategory() {
    if (!this.categoryForm.name) 
      return;
    const action = this.categoryToEdit 
      ? CategoryActions.updateCategory({ id: this.categoryToEdit.id, data: this.categoryForm })
      : CategoryActions.createCategory({ data: this.categoryForm });
    
    this.store.dispatch(action);
    this.isCreateModalOpen = false;
  }

  deleteCategory(id?: number, event?: Event) {

    if (event) {
      event.stopPropagation();
      this.categoryToDeleteId = id;
      return;
    }

    if (this.categoryToDeleteId) {
      this.store.dispatch(CategoryActions.deleteCategory({ id: this.categoryToDeleteId }));
      this.categoryToDeleteId = null;
    }

  }

  selectCategory(cat: any) {
    this.selectedCategory = (this.selectedCategory?.id === cat.id) ? null : cat;
  }

  openTransactionPicker(cat: any, event: Event) {
    event.stopPropagation();
    this.targetCategory = cat;
    this.isTransactionPickerOpen = true;
  }

  onTransactionsSelected(ids: number[]) {
    if (this.targetCategory) {
      this.store.dispatch(CategoryActions.assignTransactions({ 
        ids, 
        catId: this.targetCategory.id 
      }));
      this.isTransactionPickerOpen = false;
    }
  }
}