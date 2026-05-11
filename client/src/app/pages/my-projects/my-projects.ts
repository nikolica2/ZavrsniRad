import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-projects',
  imports: [FormsModule, DatePipe],
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.css',
})
export class MyProjects implements OnInit {
  private http = inject(HttpClient);
  protected auth = inject(AuthService);
  protected router = inject(Router);
  protected projects = signal<any[]>([]);
  protected showModal = signal(false);
  protected selectedProject = signal<any>(null);
  protected applications = signal<any[]>([]);
  protected approvedIds = signal<number[]>([]);
  protected memberIds = signal<string[]>([]);

  protected title = '';
  protected description = '';
  protected technologies: string[] = [];
  protected techInput = '';
  protected error = '';

  async ngOnInit() {
    try {
      const result = await lastValueFrom(
        this.http.get<any[]>('https://localhost:5001/api/projects/my-chats'),
      );
      console.log('my-chats', result);
      this.projects.set(result);
    } catch (error) {
      console.log('greška', error);
    }
  }

  async openProject(project: any) {
    this.selectedProject.set(project);
    this.approvedIds.set([]);
    this.applications.set([]);
    this.memberIds.set([]);

    if (this.isOwner(project)) {
      try {
        const [applications, members] = await Promise.all([
          lastValueFrom(
            this.http.get<any[]>(`https://localhost:5001/api/projects/${project.id}/applications`),
          ),
          lastValueFrom(
            this.http.get<any[]>(`https://localhost:5001/api/projects/${project.id}/members`),
          ),
        ]);
        this.applications.set(applications);
        this.memberIds.set(members.map((m: any) => m.userId));
      } catch (error) {
        console.log(error);
      }
    }
  }
  isOwner(project: any): boolean {
    return project.createdById === this.auth.currentUser()?.id;
  }

  async approveApplication(projectId: number, applicationId: number) {
    try {
      await lastValueFrom(
        this.http.post(
          `https://localhost:5001/api/projects/${projectId}/applications/${applicationId}/approve`,
          {},
        ),
      );
      this.approvedIds.update((ids) => [...ids, applicationId]);
    } catch (error) {
      console.log(error);
    }
  }

  addTech() {
    const t = this.techInput.trim();
    if (t && !this.technologies.includes(t)) {
      this.technologies = [...this.technologies, t];
    }
    this.techInput = '';
  }

  removeTech(tech: string) {
    this.technologies = this.technologies.filter((t) => t !== tech);
  }

  async createProject() {
    if (!this.title.trim() || !this.description.trim()) {
      this.error = 'Naslov i opis su obavezni';
      return;
    }
    try {
      const project = await lastValueFrom(
        this.http.post<any>('https://localhost:5001/api/projects', {
          title: this.title,
          description: this.description,
          technologies: this.technologies,
        }),
      );
      this.projects.update((list) => [project, ...list]);
      this.showModal.set(false);
      this.title = '';
      this.description = '';
      this.technologies = [];
      this.error = '';
    } catch (error) {
      this.error = 'Greška pri kreiranju projekta';
    }
  }

  async deleteProject(id: number) {
    try {
      await lastValueFrom(this.http.delete(`https://localhost:5001/api/projects/${id}`));
      this.projects.update((list) => list.filter((p) => p.id !== id));
      if (this.selectedProject()?.id === id) this.selectedProject.set(null);
    } catch (error) {
      console.log(error);
    }
  }
}
