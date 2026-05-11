import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-projects',
  imports: [DatePipe, FormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  private http = inject(HttpClient);
  protected auth = inject(AuthService);
  protected projects = signal<any[]>([]);
  protected selectedProject = signal<any>(null);
  protected appliedProjectIds = signal<number[]>([]);
  protected message = '';
  protected error = '';
  protected success = '';

  async ngOnInit() {
    try {
      const result = await lastValueFrom(
        this.http.get<any[]>('https://localhost:5001/api/projects'),
      );
      this.projects.set(result);

      const applied = await lastValueFrom(
        this.http.get<number[]>('https://localhost:5001/api/projects/my-applications'),
      );
      this.appliedProjectIds.set(applied);
    } catch (error) {
      console.log(error);
    }
  }

  openApply(project: any) {
    this.selectedProject.set(project);
    this.message = '';
    this.error = '';
    this.success = '';
  }

  async apply() {
    try {
      await lastValueFrom(
        this.http.post(`https://localhost:5001/api/projects/${this.selectedProject().id}/apply`, {
          message: this.message,
        }),
      );
      this.appliedProjectIds.update((ids) => [...ids, this.selectedProject().id]);
      this.success = 'Uspješno si se prijavio na projekt!';
      this.message = '';
    } catch (err: any) {
      this.error = err.error || 'Greška pri prijavi';
    }
  }
}
