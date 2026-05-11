import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  error = '';

  onRegister() {
    this.auth.register(this.displayName, this.email, this.password).subscribe({
      next: (res) => {
        this.auth.setUser(res.token);
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.error = err.error || 'Greška pri registraciji';
      },
    });
  }
}
