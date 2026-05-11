import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';

  onLogin() {
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.auth.setUser(res.token);
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.error = 'Pogrešan email ili lozinka';
      },
    });
  }
}
