import { Routes } from '@angular/router';

export const chatRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/agent-selection/agent-selection.component').then(
        (m) => m.AgentSelectionComponent,
      ),
    pathMatch: 'full',
  },
  {
    path: 'conversations',
    loadComponent: () =>
      import('./pages/conversations/conversations.component').then((m) => m.ConversationsComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'conversation/:id',
    loadComponent: () =>
      import('./pages/conversation/conversation.component').then((m) => m.ConversationComponent),
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
