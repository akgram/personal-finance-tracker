import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true
})
export class RegisterComponent {
  user = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}


  onRegister() {
    this.authService.register(this.user).subscribe({
      next: () => {
        alert('Registration successfully!');
        this.router.navigate(['/login']);
      },
      error: (err) => alert('Error: ' + err.error.message)
    });
  }


}
