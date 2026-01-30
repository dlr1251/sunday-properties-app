export type ModuleId =
  | 'authentication'
  | 'properties'
  | 'negotiations'
  | 'visits'
  | 'legal'
  | 'admin'
  | 'users'
  | 'notifications'
  | 'testing'
  | 'devops';

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled';

export type TaskType =
  | 'feature'
  | 'bug'
  | 'refactor'
  | 'test'
  | 'docs'
  | 'devops';

export interface DevTask {
  id: string;
  title: string;
  description: string;
  module: ModuleId;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  tags: string[];
  relatedFiles: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  assignee?: string;
}

export interface ProjectModule {
  id: ModuleId;
  name: string;
  description: string;
  progress: number;
  color?: string;
}

export type PromptCategory = 'feature' | 'bugfix' | 'refactor' | 'test' | 'docs';

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  template: string;
  variables: string[];
}
