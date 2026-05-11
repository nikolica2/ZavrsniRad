import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthService);

  protected messages = signal<any[]>([]);
  protected project = signal<any>(null);
  protected messageInput = '';
  private projectId = 0;
  private pollInterval: any;

  async ngOnInit() {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));

    try {
      const projects = await lastValueFrom(
        this.http.get<any[]>('https://localhost:5001/api/projects'),
      );
      this.project.set(projects.find((p) => p.id === this.projectId));
    } catch (error) {
      console.log(error);
    }

    await this.loadMessages();
    this.pollInterval = setInterval(() => this.loadMessages(), 3000);
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }

  async loadMessages() {
    try {
      const result = await lastValueFrom(
        this.http.get<any[]>(`https://localhost:5001/api/projects/${this.projectId}/messages`),
      );
      this.messages.set(result);
    } catch (error) {
      console.log(error);
    }
  }

  async sendMessage() {
    if (!this.messageInput.trim()) return;
    try {
      await lastValueFrom(
        this.http.post(`https://localhost:5001/api/projects/${this.projectId}/messages`, {
          message: this.messageInput,
        }),
      );
      this.messageInput = '';
      await this.loadMessages();
    } catch (error) {
      console.log(error);
    }
  }
}
