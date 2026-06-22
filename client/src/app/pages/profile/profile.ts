import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private http = inject(HttpClient);
  protected auth = inject(AuthService);
  protected router = inject(Router);

  protected displayName = '';
  protected email = '';
  protected profileImage: string | null = null;
  protected error = '';
  protected success = '';
  protected editing = signal(false);
  protected loading = signal(true);
  protected showChats = signal(false);
  protected chats = signal<any[]>([]);

  async ngOnInit() {
    try {
      const user = await lastValueFrom(
        this.http.get<any>(`https://localhost:5001/api/members/${this.auth.currentUser()?.id}`),
      );
      this.displayName = user.displayName;
      this.email = user.email;
      this.profileImage = user.profileImage;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading.set(false);
    }
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async loadChats() {
    try {
      const result = await lastValueFrom(
        this.http.get<any[]>('https://localhost:5001/api/projects/my-chats'),
      );
      this.chats.set(result);
      this.showChats.set(true);
    } catch (error) {
      console.log(error);
    }
  }

  async saveProfile() {
    try {
      await lastValueFrom(
        this.http.put(`https://localhost:5001/api/members/${this.auth.currentUser()?.id}`, {
          displayName: this.displayName,
          email: this.email,
          profileImage: this.profileImage,
        }),
      );
      this.success = 'Podaci uspješno spremljeni';
      this.error = '';
      this.editing.set(false);
    } catch (error) {
      this.error = 'Greška pri spremanju';
      this.success = '';
    }
  }
}
