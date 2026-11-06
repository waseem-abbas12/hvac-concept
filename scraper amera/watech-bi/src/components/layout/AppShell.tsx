'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  Search,
  Globe2,
  Users,
  BrainCircuit,
  FileText,
  Target,
  Calculator,
  FileCheck2,
  Users2,
  MailCheck,
  Send,
  Settings,
  Plus,
  ChevronDown,
  Layers,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  Eye,
  PackageCheck,
  Zap,
  Briefcase,
  TrendingUp,
  GitFork,
  Crown,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useProject, AppModuleId } from '@/context/ProjectContext';
import { useTenant } from '@/context/TenantContext';
import { ProjectModal } from '@/components/modals/ProjectModal';

interface NavItem {
  id: AppModuleId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const APP_MODULE_TO_SAAS_KEY: Record<AppModuleId, string> = {
  command_center: 'command-center',
  overview: 'overview',
  market_research: 'market-research',
  market_mapping: 'market-mapping',
  discovery: 'business-discovery',
  website_audit: 'website-audit',
  local_seo: 'local-seo',
  contact_discovery: 'contact-discovery',
  business_intelligence: 'market-research',
  content_discovery: 'content-discovery',
  opportunity_analysis: 'opportunity-analysis',
  lead_scoring: 'lead-scoring',
  email_verification: 'email-verification',
  outreach_strategy: 'outreach-strategy',
  research_reports: 'market-research',
  lead_crm: 'crm-pipeline',
  ai_assistant: 'ai-assistant',
  competitor_monitoring: 'competitor-monitor',
  multi_market: 'multi-market',
  sales_intelligence: 'buyer-signals',
  service_recommendations: 'service-recommendations',
  proposals: 'proposals',
  client_projects: 'client-projects',
  agency_performance: 'agency-performance',
  automation: 'automation-hub',
  settings: 'overview',
};

const NAV_ITEMS: NavItem[] = [
  { id: 'command_center', label: 'CEO Command Center', icon: Crown, badge: 'CEO' },
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'market_research', label: 'Market Research Engine', icon: Compass },
  { id: 'market_mapping', label: 'Market Mapping & Topology', icon: MapPin },
  { id: 'discovery', label: 'Business Discovery', icon: Search },
  { id: 'website_audit', label: 'Website Audit (10-Cat)', icon: Globe2 },
  { id: 'local_seo', label: 'Local SEO & GBP Intel', icon: MapPin, badge: 'P05' },
  { id: 'contact_discovery', label: 'Contact & Decision-Makers', icon: Users, badge: 'P09' },
  { id: 'email_verification', label: 'Email Discovery & Verify', icon: MailCheck, badge: 'P10' },
  { id: 'outreach_strategy', label: 'Outreach Strategy & Intel', icon: Send, badge: 'P11' },
  { id: 'business_intelligence', label: 'Business Intelligence', icon: BrainCircuit },
  { id: 'content_discovery', label: 'Content & Competitor Intel', icon: FileText, badge: 'P06' },
  { id: 'opportunity_analysis', label: 'Opportunity Analysis', icon: Target, badge: 'P07' },
  { id: 'lead_scoring', label: 'Lead Scoring (100-Pt)', icon: Calculator, badge: 'P08' },
  { id: 'research_reports', label: 'Research Reports & Dossier', icon: FileCheck2 },
  { id: 'lead_crm', label: 'Lead CRM & Sequences', icon: Users2 },
  { id: 'ai_assistant', label: 'AI Business Research Analyst', icon: Sparkles, badge: 'P14' },
  { id: 'competitor_monitoring', label: 'Competitor Surveillance', icon: Eye, badge: 'P15' },
  { id: 'multi_market', label: 'Multi-Market Intelligence', icon: Globe2, badge: 'P16' },
  { id: 'sales_intelligence', label: 'Sales Priority & Signals', icon: Zap, badge: 'P17' },
  { id: 'service_recommendations', label: 'Service & Package Engine', icon: PackageCheck, badge: 'P18' },
  { id: 'proposals', label: 'Proposals, Quotes & Pricing', icon: FileCheck2, badge: 'P19' },
  { id: 'client_projects', label: 'Client Onboarding & Projects', icon: Briefcase, badge: 'P20' },
  { id: 'agency_performance', label: 'Agency Performance & Revenue', icon: TrendingUp, badge: 'P21' },
  { id: 'automation', label: 'Workflow Automation Hub', icon: GitFork, badge: 'P23' },
  { id: 'settings', label: 'Settings & Integrations', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    projects,
    activeProject,
    activeModule,
    setActiveModule,
    setActiveProject,
    isLoading,
  } = useProject();

  const {
    currentTenant,
    currentBranding,
    userTenants,
    isSuperAdmin,
    switchTenant,
    isModuleEnabled,
  } = useTenant();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const visibleNavItems = NAV_ITEMS.filter(item => {
    const saasKey = APP_MODULE_TO_SAAS_KEY[item.id];
    if (!saasKey) return true;
    return isModuleEnabled(saasKey);
  });

  const brandPrimaryColor = currentBranding?.primaryColor || '#2563eb';
  const brandName = currentBranding?.companyName || 'WATECH';
  const brandInitial = brandName.charAt(0).toUpperCase() || 'W';

  return (
    <div className="min-h-screen flex flex-col bg-[#070b16] text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-[#0b1329]/95 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Dynamic White-Label Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-md text-sm shrink-0"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              {brandInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white uppercase">{brandName}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase">
                  {currentTenant?.planId.replace('plan-', '') || 'OS'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block truncate max-w-[220px]">
                {currentTenant?.name || 'GROWTH RESEARCH & PROVENANCE ENGINE'}
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-border hidden md:block" />

          {/* Multi-Tenant Organization Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-50 border border-border text-xs text-slate-200 hover:bg-surface-100 hover:border-slate-700 transition-all text-left"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="truncate max-w-[130px] sm:max-w-[170px]">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Tenant Org</span>
                <span className="font-medium truncate block">
                  {currentTenant ? currentTenant.name : 'Select Tenant'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
            </button>

            {isTenantDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-surface-100 border border-border rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Tenant Workspaces ({userTenants.length})</span>
                  <Link
                    href="/onboarding"
                    onClick={() => setIsTenantDropdownOpen(false)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium capitalize text-xs"
                  >
                    <Plus className="w-3 h-3" /> White-Label
                  </Link>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {userTenants.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenant(t.id);
                        setIsTenantDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-200 transition-colors ${
                        currentTenant?.id === t.id ? 'bg-blue-500/10 text-blue-300 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-medium">{t.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{t.slug} • {t.status}</div>
                      </div>
                      {t.isPlatformSuperAdminTenant && (
                        <span className="text-[9px] font-mono px-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          HQ
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {isSuperAdmin && (
                  <div className="border-t border-border mt-1 pt-1 px-2">
                    <Link
                      href="/platform-admin"
                      onClick={() => setIsTenantDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Platform Super-Admin Console</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-border hidden md:block" />

          {/* Active Project Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-50 border border-border text-xs text-slate-200 hover:bg-surface-100 hover:border-slate-700 transition-all text-left max-w-[200px] sm:max-w-[280px]"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Active Project</span>
                <span className="font-medium truncate block">
                  {activeProject ? activeProject.name : 'Select or Create Project'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-80 bg-surface-100 border border-border rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Available Projects ({projects.length})</span>
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsProjectModalOpen(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium capitalize"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProject(p);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-surface-200 transition-colors ${
                        activeProject?.id === p.id ? 'bg-blue-500/10 text-blue-300 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {p.cityArea}, {p.stateRegion || p.country} • {p.industryNiche}
                        </div>
                      </div>
                      {p.isDemo && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase shrink-0">
                          DEMO
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Link
              href="/platform-admin"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500/20 text-[11px] font-medium transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Admin</span>
            </Link>
          )}

          <Link
            href="/onboarding"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-50 border border-border text-slate-300 hover:text-white text-[11px] font-medium transition"
          >
            <span>+ White-Label SaaS</span>
          </Link>

          {activeProject?.isDemo && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>DEMO DATASET ACTIVE</span>
            </div>
          )}

          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 border-r border-border bg-[#090f20] shrink-0 hidden lg:flex flex-col justify-between py-4">
          <div className="px-3 space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
              Research & Execution Modules
            </div>
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] font-mono px-1 py-0.2 rounded bg-surface-100 text-slate-400 border border-border">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Metadata */}
          <div className="px-4 py-3 mx-3 rounded-lg bg-surface-50 border border-border text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-mono text-[10px]">Data Storage</span>
              <span className="text-emerald-400 font-mono text-[10px]">IndexedDB Local</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {currentBranding?.footerText || 'Powered by Watech Autonomous Agency Architecture'}
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur flex">
            <div className="w-72 bg-[#090f20] h-full p-4 border-r border-border overflow-y-auto flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                  <span className="text-xs font-semibold text-white">Research Modules</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {visibleNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-left ${
                        isActive
                          ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#070b16] p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
