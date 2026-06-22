import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-chats',
  imports: [],
  templateUrl: './my-chats.html',
  styleUrl: './my-chats.css',
})
export class MyChats implements OnInit {
  private http = inject(HttpClient);
  protected router = inject(Router);
  protected auth = inject(AuthService);
  protected chats = signal<any[]>([]);

  async ngOnInit() {
    try {
      const result = await lastValueFrom(
        this.http.get<any[]>('https://localhost:5001/api/projects/my-chats'),
      );
      this.chats.set(result);
    } catch (error) {
      console.log(error);
    }
  }
}
