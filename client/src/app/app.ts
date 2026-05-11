import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  protected auth = inject(AuthService);
  protected title = 'Završni rad';
  protected notifications = signal<any[]>([]);
  protected showNotifications = signal(false);
  private pollInterval: any;

  get unreadCount() {
    return this.notifications().filter((n) => !n.isRead).length;
  }

  async ngOnInit() {
    if (this.auth.currentUser()) {
      await this.loadNotifications();
      this.pollInterval = setInterval(() => this.loadNotifications(), 10000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }

  async loadNotifications() {
    try {
      const result = await lastValueFrom(
        this.http.get<any[]>('https://localhost:5001/api/notifications'),
      );
      this.notifications.set(result);
    } catch (error) {
      console.log(error);
    }
  }

  async markAllRead() {
    try {
      await lastValueFrom(this.http.put('https://localhost:5001/api/notifications/read', {}));
      this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.log(error);
    }
  }

  toggleNotifications() {
    this.showNotifications.update((v) => !v);
    if (this.showNotifications() && this.unreadCount > 0) {
      this.markAllRead();
    }
  }
}
