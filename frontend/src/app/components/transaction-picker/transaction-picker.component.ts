import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-picker.component.html',
  styleUrl: './transaction-picker.component.css'
})
export class TransactionPickerComponent {
  @Input() transactions: any[] = [];
  @Input() categoryName: string = '';
  
  @Output() onCancel = new EventEmitter<void>();
  @Output() onAssign = new EventEmitter<number[]>();

  selectedIds: number[] = [];

  toggleSelection(id: number) {
    const idx = this.selectedIds.indexOf(id);
    if (idx > -1) {
      this.selectedIds.splice(idx, 1);
    } else {
      this.selectedIds.push(id);
    }
  }
}