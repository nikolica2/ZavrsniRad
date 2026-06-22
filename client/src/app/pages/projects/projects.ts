import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
  protected allProjects = signal<any[]>([]);
  protected selectedProject = signal<any>(null);
  protected appliedProjectIds = signal<number[]>([]);
  protected message = '';
  protected error = '';
  protected success = '';

  protected searchQuery = '';
  protected selectedTechs = signal<string[]>([]);
  protected showFilter = signal(false);

  protected technologies = [
    'Angular',
    'React',
    'Vue',
    'Next.js',
    'TypeScript',
    '.NET',
    'Node.js',
    'Django',
    'Spring Boot',
    'Laravel',
    'Flutter',
    'React Native',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'SQLite',
    'Docker',
    'AWS',
    'Python',
    'Git',
  ];

  protected filteredProjects = computed(() => {
    let result = this.allProjects();

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      );
    }

    if (this.selectedTechs().length > 0) {
      result = result.filter((p) =>
        this.selectedTechs().every((t: string) => p.technologies.includes(t)),
      );
    }

    return result;
  });

  async ngOnInit() {
    try {
      const result = await lastValueFrom(
        this.http.get<any[]>('https://localhost:5001/api/projects'),
      );
      this.allProjects.set(result);

      const applied = await lastValueFrom(
        this.http.get<number[]>('https://localhost:5001/api/projects/my-applications'),
      );
      this.appliedProjectIds.set(applied);
    } catch (error) {
      console.log(error);
    }
  }

  toggleTech(tech: string) {
    this.selectedTechs.update((list) =>
      list.includes(tech) ? list.filter((t) => t !== tech) : [...list, tech],
    );
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedTechs.set([]);
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
