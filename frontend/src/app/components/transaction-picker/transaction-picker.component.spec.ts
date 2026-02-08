import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPickerComponent } from './transaction-picker.component';

describe('TransactionPickerComponent', () => {
  let component: TransactionPickerComponent;
  let fixture: ComponentFixture<TransactionPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
