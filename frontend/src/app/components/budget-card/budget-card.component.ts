import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-budget-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-card.component.html',
  styleUrl: './budget-card.component.css'
})
export class BudgetCardComponent implements OnChanges {
  @Input() budget: any; 
  @Input() transactions: any[] = [];
  @Input() isGlobal: boolean = false;
  @Input() allCategories: any[] = [];

  @Output() onRefresh = new EventEmitter<void>();

  spent: number = 0;
  percent: number = 0;
  isBudgetModalOpen = false;

  newBudgetData = { amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear(), categoryId: '' };

  constructor(private budgetService: BudgetService) {}

  ngOnChanges() {
    this.calculateProgress();
  }

  calculateProgress() {
    if (!this.budget) return;

    // ako je global tj dash koristi spent
    if (this.isGlobal && this.budget.spent !== undefined) {
      this.spent = this.budget.spent;
    } 
    // ako nije global, racunaj iz niza
    else if (this.transactions && this.transactions.length > 0) {
      if (this.isGlobal) {
        this.spent = this.transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
      } else {
        this.spent = this.transactions
          .filter(t => t.type === 'expense' && t.category?.id === this.budget.category?.id)
          .reduce((sum, t) => sum + Number(t.amount), 0);
      }
    } else {
      this.spent = 0;
    }

    this.percent = this.budget.amount > 0 ? (this.spent / this.budget.amount) * 100 : 0;
  }

  createBudget() {
    if (!this.newBudgetData.categoryId || this.newBudgetData.amount <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }

    this.budgetService.create(this.newBudgetData).subscribe({
      next: () => {
        this.isBudgetModalOpen = false;
        this.onRefresh.emit(); // javlja dash-u za nove podatke

        // reset
        this.newBudgetData = { amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear(), categoryId: '' };
      },
      error: (err) => console.error('Error creating budget', err)
    });
  }

  getColor(): string {
    if (this.percent > 90) return '#ff4757';
    if (this.percent > 70) return '#ffa502';
    return '#2ed573';
  }
  
  openModal() {
    this.isBudgetModalOpen = true;
  }
}