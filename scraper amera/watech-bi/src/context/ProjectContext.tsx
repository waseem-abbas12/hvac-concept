'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ResearchProject } from '@/types';
import { repository } from '@/lib/db/repository';
import { seedDemoData } from '@/lib/db/seed';

export type AppModuleId =
  | 'command_center'
  | 'overview'
  | 'market_research'
  | 'market_mapping'
  | 'discovery'
  | 'website_audit'
  | 'local_seo'
  | 'contact_discovery'
  | 'business_intelligence'
  | 'content_discovery'
  | 'opportunity_analysis'
  | 'lead_scoring'
  | 'email_verification'
  | 'outreach_strategy'
  | 'research_reports'
  | 'lead_crm'
  | 'ai_assistant'
  | 'competitor_monitoring'
  | 'multi_market'
  | 'sales_intelligence'
  | 'service_recommendations'
  | 'proposals'
  | 'client_projects'
  | 'agency_performance'
  | 'automation'
  | 'settings';

interface ProjectContextType {
  projects: ResearchProject[];
  activeProject: ResearchProject | null;
  activeModule: AppModuleId;
  isLoading: boolean;
  setActiveModule: (mod: AppModuleId) => void;
  setActiveProject: (proj: ResearchProject | null) => void;
  refreshProjects: () => Promise<void>;
  createProject: (proj: ResearchProject) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  resetToDemoData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({
  children,
  initialModule = 'overview',
}: {
  children: React.ReactNode;
  initialModule?: AppModuleId;
}) {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [activeModule, setActiveModule] = useState<AppModuleId>(initialModule);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = async () => {
    try {
      setIsLoading(true);
      const allProjects = await repository.getProjects();
      if (allProjects.length === 0) {
        await seedDemoData();
        const seeded = await repository.getProjects();
        setProjects(seeded);
        if (seeded.length > 0 && !activeProject) {
          setActiveProject(seeded[0]);
        }
      } else {
        setProjects(allProjects);
        if (!activeProject && allProjects.length > 0) {
          setActiveProject(allProjects[0]);
        } else if (activeProject) {
          const found = allProjects.find(p => p.id === activeProject.id);
          setActiveProject(found || allProjects[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load projects from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const createProject = async (proj: ResearchProject) => {
    await repository.saveProject(proj);
    await refreshProjects();
    setActiveProject(proj);
  };

  const deleteProject = async (id: string) => {
    await repository.deleteProject(id);
    await refreshProjects();
    if (activeProject?.id === id) {
      setActiveProject(null);
    }
  };

  const resetToDemoData = async () => {
    setIsLoading(true);
    await repository.clearAll();
    await seedDemoData();
    await refreshProjects();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeModule,
        isLoading,
        setActiveModule,
        setActiveProject,
        refreshProjects,
        createProject,
        deleteProject,
        resetToDemoData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
