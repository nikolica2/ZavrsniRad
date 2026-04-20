import { HttpClient } from '@angular/common/http';
import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SlicePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, SlicePipe, UpperCasePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private http = inject(HttpClient);
  protected title = 'Završni rad';
  protected members = signal<any>([]);

  async ngOnInit() {
    this.members.set(await this.getMembers());
  }

  async getMembers() {
    try {
      return lastValueFrom(this.http.get('https://localhost:5001/api/members'));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  getInitials(name: string): string {
    return name.slice(0, 2).toUpperCase();
  }
}
