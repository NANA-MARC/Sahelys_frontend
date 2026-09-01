import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'agents',
    pathMatch: 'full',
  },
  {
    path: 'agents',
    loadComponent: () =>
      import('./agents/agents-list/agents-list.component').then((m) => m.AgentsListComponent),
  },
  {
    path: 'agents/create',
    canActivate: [roleGuard],
    data: { role: 'administrateur' },
    loadComponent: () =>
      import('./agents/agent-create/agent-create.component').then((m) => m.AgentCreateComponent),
  },
  {
    path: 'agent/:id',
    loadComponent: () =>
      import('./agents/agent-detail/agent-detail.component').then((m) => m.AgentDetailComponent),
  },
  {
    path: 'supervision',
    canActivate: [roleGuard],
    data: { role: 'administrateur' },
    loadComponent: () =>
      import('./supervision/supervision.component').then((m) => m.SupervisionComponent),
  },
  {
    path: '**',
    redirectTo: 'agents',
  },
];
