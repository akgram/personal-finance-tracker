import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onLogin() {
    if (!this.credentials.email || !this.credentials.password) {
      alert('Please enter email and password.');
      return;
    }

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        console.log('Login seccessfully!', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login erroe:', err);
        alert('Incorect data!');
      }
    });
  }
}