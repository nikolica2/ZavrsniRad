import { Routes } from '@angular/router';

import { Projects } from './pages/projects/projects';
import { MyProjects } from './pages/my-projects/my-projects';
import { Profile } from './pages/profile/profile';
import { ProjectDetail } from './pages/project-detail/project-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: 'projects', component: Projects },
  { path: 'my-projects', component: MyProjects },
  { path: 'profile', component: Profile },
  { path: 'project/:id', component: ProjectDetail },
];
