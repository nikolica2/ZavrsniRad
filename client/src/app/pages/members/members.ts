import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-members',
  imports: [FormsModule],
  templateUrl: './members.html',
})
export class Members implements OnInit {
  private http = inject(HttpClient);
  protected members = signal<any[]>([]);
  protected selectedMember = signal<any>(null);
  protected editDisplayName = '';
  protected editEmail = '';
  protected editError = '';

  async ngOnInit() {
    try {
      const result = await lastValueFrom(
        this.http.get<any[]>('https://localhost:5001/api/members'),
      );
      this.members.set(result);
    } catch (error) {
      console.log(error);
    }
  }

  getInitials(name: string): string {
    return name.slice(0, 2).toUpperCase();
  }

  editMember(member: any) {
    this.selectedMember.set(member);
    this.editDisplayName = member.displayName;
    this.editEmail = member.email;
    this.editError = '';
  }

  async saveEdit() {
    try {
      const updated = await lastValueFrom(
        this.http.put<any>(`https://localhost:5001/api/members/${this.selectedMember().id}`, {
          displayName: this.editDisplayName,
          email: this.editEmail,
        }),
      );
      this.members.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
      this.selectedMember.set(null);
    } catch (error) {
      this.editError = 'Greška pri spremanju';
    }
  }

  async removeMember(id: string) {
    try {
      await lastValueFrom(this.http.delete(`https://localhost:5001/api/members/${id}`));
      this.members.set(this.members().filter((m: any) => m.id !== id));
    } catch (error) {
      console.log(error);
    }
  }
}
