import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  List,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Database,
  Code,
  Zap,
  Shield,
  Sparkles,
  DollarSign,
  Target,
  Calendar,
  Mail
} from 'lucide-react';

export const ImplementationReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('executive-summary');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'executive-summary', icon: TrendingUp, key: 'sections.executive' },
    { id: 'detailed-analysis', icon: FileText, key: 'sections.analysis' },
    { id: 'missing-features', icon: XCircle, key: 'sections.missing' },
    { id: 'architecture-quality', icon: Code, key: 'sections.architecture' },
    { id: 'implementation-metrics', icon: TrendingUp, key: 'sections.metrics' },
    { id: 'next-steps', icon: CheckCircle, key: 'sections.nextSteps' },
    { id: 'conclusion', icon: CheckCircle, key: 'sections.conclusion' },
    { id: 'seed-funding', icon: DollarSign, key: 'sections.seedFunding' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950/50 mt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-72' : 'w-20'
          } transition-all duration-300 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                {sidebarOpen && (
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {t('pages.implementationReview.navTitle')}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 shrink-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <nav className="p-3 space-y-1">
              {navItems.map(({ id, icon: Icon, key }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                    activeSection === id
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="truncate">{t(`pages.implementationReview.${key}`)}</span>
                      {activeSection === id && <ChevronRight className="h-4 w-4 ml-auto shrink-0" />}
                    </>
                  )}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {t('pages.implementationReview.title')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('pages.implementationReview.subtitle')} · {t('pages.implementationReview.lastUpdated')}: Enero 2026
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-medium">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  {t('pages.implementationReview.coverage')} {t('pages.implementationReview.complete')}
                </Badge>
                <Badge variant="outline" className="gap-1.5 px-3 py-1 font-medium">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t('pages.implementationReview.overallStatus')}
                </Badge>
              </div>
            </div>
          </header>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
              {/* Executive Summary */}
              <section id="executive-summary" className="scroll-mt-24">
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      {t('pages.implementationReview.sections.executive')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
                      {t('pages.implementationReview.executive.status')}
                    </p>
                    <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                      <li className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            {t('pages.implementationReview.executive.coverageLabel')}:{' '}
                          </strong>
                          {t('pages.implementationReview.executive.coverageValue')}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            {t('pages.implementationReview.executive.qualityLabel')}:{' '}
                          </strong>
                          {t('pages.implementationReview.executive.qualityValue')}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            {t('pages.implementationReview.executive.dbLabel')}:{' '}
                          </strong>
                          {t('pages.implementationReview.executive.dbValue')}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">
                            {t('pages.implementationReview.executive.uxLabel')}:{' '}
                          </strong>
                          {t('pages.implementationReview.executive.uxValue')}
                        </span>
                      </li>
                    </ul>
                    <Separator className="my-5" />
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                      {t('pages.implementationReview.executive.metricsTitle')}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { key: 'components', icon: Code },
                        { key: 'tables', icon: Database },
                        { key: 'functions', icon: FileText },
                        { key: 'hooks', icon: Zap }
                      ].map(({ key, icon: Icon }) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2"
                        >
                          <Icon className="h-4 w-4 text-slate-500 shrink-0" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {t(`pages.implementationReview.executive.${key}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Detailed Analysis */}
              <section id="detailed-analysis" className="scroll-mt-24">
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {t('pages.implementationReview.sections.analysis')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { key: 'auth', score: '5/5', status: 'completed', icon: Shield },
                      { key: 'properties', score: '4.5/5', status: 'completed', icon: Database },
                      { key: 'negotiation', score: '5/5', status: 'completed', icon: Zap },
                      { key: 'dashboards', score: '5/5', status: 'completed', icon: TrendingUp }
                    ].map(({ key, score, status, icon: Icon }) => (
                      <div
                        key={key}
                        className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                              {t(`pages.implementationReview.categories.${key}`)}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {score}
                            </Badge>
                            {status === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>

              {/* Missing Features */}
              <section id="missing-features" className="scroll-mt-24">
                <Card className="overflow-hidden border-amber-200 dark:border-amber-900/50 shadow-sm">
                  <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20">
                    <CardTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                      <XCircle className="h-5 w-5" />
                      {t('pages.implementationReview.sections.missing')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                          {t('pages.implementationReview.missing.title')}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          {t('pages.implementationReview.missing.subtitle')}
                        </p>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <li className="flex gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            Disponibilidad horaria de propiedades
                          </li>
                          <li className="flex gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            Exportación de datos y reportes
                          </li>
                          <li className="flex gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            Backup automático
                          </li>
                        </ul>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('pages.implementationReview.missing.mediumTitle')}
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <li>· Valoración automática con IA</li>
                          <li>· Modo oscuro</li>
                          <li>· Integración WhatsApp</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Architecture & Quality */}
              <section id="architecture-quality" className="scroll-mt-24">
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-violet-600" />
                      {t('pages.implementationReview.sections.architecture')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-4">
                        <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-3">
                          {t('pages.implementationReview.architecture.strengths')}
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <li>· Separación de concerns, hooks reutilizables</li>
                          <li>· Base de datos robusta con RLS</li>
                          <li>· TypeScript consistente</li>
                          <li>· Shadcn/ui como base sólida</li>
                        </ul>
                      </div>
                      <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-4">
                        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3">
                          {t('pages.implementationReview.architecture.improvements')}
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <li>· Test coverage (E2E)</li>
                          <li>· Documentación de código</li>
                          <li>· Lazy loading, code splitting</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Implementation Metrics */}
              <section id="implementation-metrics" className="scroll-mt-24">
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      {t('pages.implementationReview.sections.metrics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'Autenticación', value: 80 },
                        { label: 'Propiedades', value: 70 },
                        { label: 'Negociación', value: 100 },
                        { label: 'Dashboards', value: 100 },
                        { label: 'UI/UX', value: 80 }
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-400">{label}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {value}%
                            </span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Next Steps */}
              <section id="next-steps" className="scroll-mt-24">
                <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      {t('pages.implementationReview.sections.nextSteps')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        {
                          phase: t('pages.implementationReview.phases.phase1'),
                          title: t('pages.implementationReview.phases.perfection'),
                          items: ['Funcionalidades críticas', 'Test coverage', 'Optimización']
                        },
                        {
                          phase: t('pages.implementationReview.phases.phase2'),
                          title: t('pages.implementationReview.phases.newFeatures'),
                          items: ['Valoración IA', 'Integración bancos', 'Modo oscuro']
                        },
                        {
                          phase: t('pages.implementationReview.phases.phase3'),
                          title: t('pages.implementationReview.phases.scale'),
                          items: ['Lazy loading', 'CDN', 'Monitoring']
                        }
                      ].map(({ phase, title, items }) => (
                        <div
                          key={phase}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                        >
                          <Badge variant="outline" className="mb-2">{phase}</Badge>
                          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                            {title}
                          </h4>
                          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            {items.map((item) => (
                              <li key={item}>· {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Conclusion */}
              <section id="conclusion" className="scroll-mt-24">
                <Card className="overflow-hidden border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                      <CheckCircle className="h-5 w-5" />
                      {t('pages.implementationReview.sections.conclusion')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {t('pages.implementationReview.conclusion.paragraph')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-emerald-600 hover:bg-emerald-700">
                        {t('pages.implementationReview.conclusion.badge')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Seed Funding Section - NEW */}
              <section id="seed-funding" className="scroll-mt-24">
                <Card className="overflow-hidden border-violet-200 dark:border-violet-900/50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border-b border-violet-100 dark:border-violet-900/50">
                    <CardTitle className="flex items-center gap-3 text-violet-800 dark:text-violet-200">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      {t('pages.implementationReview.sections.seedFunding')}
                    </CardTitle>
                    <p className="text-sm text-violet-600/80 dark:text-violet-400/80 mt-1">
                      {t('pages.implementationReview.seedFunding.subtitle')}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                      {[
                        { key: 'preSeed', icon: Target },
                        { key: 'seedRound', icon: DollarSign },
                        { key: 'seriesA', icon: Calendar }
                      ].map(({ key, icon: Icon }) => (
                        <div
                          key={key}
                          className="rounded-xl border-2 border-violet-200 dark:border-violet-800/50 bg-white dark:bg-slate-900/50 p-5 hover:border-violet-400 dark:hover:border-violet-600 transition-colors"
                        >
                          <Icon className="h-8 w-8 text-violet-500 mb-3" />
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                            {t(`pages.implementationReview.seedFunding.${key}.title`)}
                          </h4>
                          <p className="text-lg font-bold text-violet-600 dark:text-violet-400 mb-2">
                            {t(`pages.implementationReview.seedFunding.${key}.amount`)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t(`pages.implementationReview.seedFunding.${key}.desc`)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-6" />
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50">
                      <div>
                        <p className="font-medium text-violet-800 dark:text-violet-200">
                          {t('pages.implementationReview.seedFunding.contact')}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                          {t('pages.implementationReview.seedFunding.contactSubtitle')}
                        </p>
                      </div>
                      <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                        <Mail className="h-4 w-4" />
                        {t('pages.implementationReview.seedFunding.contactCta')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Footer CTA */}
              <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                    <Database className="h-6 w-6 text-blue-600" />
                    <Code className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {t('pages.implementationReview.footer.title')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto">
                    {t('pages.implementationReview.footer.subtitle')}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      {t('pages.implementationReview.footer.viewDocs')}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Database className="h-4 w-4" />
                      {t('pages.implementationReview.footer.viewSchema')}
                    </Button>
                    <Button size="sm" className="gap-2">
                      <Zap className="h-4 w-4" />
                      {t('pages.implementationReview.footer.startTesting')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};
