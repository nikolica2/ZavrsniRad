import { Routes } from '@angular/router';

import { Projects } from './pages/projects/projects';
import { MyProjects } from './pages/my-projects/my-projects';
import { Profile } from './pages/profile/profile';
import { ProjectDetail } from './pages/project-detail/project-detail';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { Members } from './pages/members/members';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { Chat } from './pages/chat/chat';
import { MyChats } from './pages/my-chats/my-chats';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'projects', component: Projects, canActivate: [authGuard] },
  { path: 'my-projects', component: MyProjects, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'members', component: Members, canActivate: [authGuard, adminGuard] },
  { path: 'chat/:id', component: Chat, canActivate: [authGuard] },
  { path: 'my-chats', component: MyChats, canActivate: [authGuard] },
];
