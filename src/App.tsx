import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import CloudflareWebAnalytics from '@/components/CloudflareWebAnalytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JournalDataProvider } from './data/JournalDataProvider';
import { SubmissionDataProvider } from './data/SubmissionDataProvider';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth, RequireRole } from './components/auth/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/public/Home';
import ArchivePage from './pages/public/ArchivePage';
import SearchPage from './pages/public/SearchPage';
import IssueDetail from './pages/public/IssueDetail';
import ArticleView from './pages/public/ArticleView';
import About from './pages/public/About';
import DoajPolicy from './pages/public/DoajPolicy';
import EditorialBoard from './pages/public/EditorialBoard';
import ScientificBoard from './pages/public/ScientificBoard';
import TehnoredactarePage from './pages/public/TehnoredactarePage';
import SubmitPage from './pages/public/SubmitPage';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardIssues from './pages/dashboard/DashboardIssues';
import DashboardSubmissions from './pages/dashboard/DashboardSubmissions';
import DashboardReviewer from './pages/dashboard/DashboardReviewer';
import DashboardAuthor from './pages/dashboard/DashboardAuthor';
import DashboardUsers from './pages/dashboard/DashboardUsers';
import DashboardEmailTemplates from './pages/dashboard/DashboardEmailTemplates';
import DashboardStats from './pages/dashboard/DashboardStats';
import DashboardPlaceholder from './pages/dashboard/DashboardPlaceholder';
import NotFound from './pages/NotFound';
import { PwaProvider } from './contexts/PwaContext';

const queryClient = new QueryClient();
const routerBasename = import.meta.env.BASE_URL === '/'
  ? '/'
  : import.meta.env.BASE_URL.replace(/\/$/, '');

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PwaProvider>
          <JournalDataProvider>
            <SubmissionDataProvider>
              <Toaster />
              <Sonner />
              <CloudflareWebAnalytics />
              <BrowserRouter basename={routerBasename}>
                <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/archive" element={<ArchivePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/archive/:slug" element={<IssueDetail />} />
                  <Route path="/article/:id" element={<ArticleView />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/politici" element={<DoajPolicy />} />
                  <Route path="/doaj" element={<DoajPolicy />} />
                  <Route path="/scientific-board" element={<ScientificBoard />} />
                  <Route path="/editorial-board" element={<EditorialBoard />} />
                  <Route path="/tehnoredactare" element={<TehnoredactarePage />} />
                  <Route path="/submit" element={<SubmitPage />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                <Route
                  path="/dashboard"
                  element={(
                    <RequireAuth>
                      <DashboardLayout />
                    </RequireAuth>
                  )}
                >
                  <Route index element={<DashboardHome />} />

                  <Route
                    path="stats"
                    element={(
                      <RequireRole roles={['admin']}>
                        <DashboardStats />
                      </RequireRole>
                    )}
                  />

                  <Route
                    path="issues"
                    element={(
                      <RequireRole roles={['admin', 'editor']}>
                        <DashboardIssues />
                      </RequireRole>
                    )}
                  />

                  <Route
                    path="submissions"
                    element={(
                      <RequireRole roles={['admin', 'editor']}>
                        <DashboardSubmissions />
                      </RequireRole>
                    )}
                  />

                  <Route
                    path="reviewer"
                    element={(
                      <RequireRole roles={['reviewer']}>
                        <DashboardReviewer />
                      </RequireRole>
                    )}
                  />

                  <Route
                    path="author"
                    element={(
                      <RequireRole roles={['author']}>
                        <DashboardAuthor />
                      </RequireRole>
                    )}
                  />

                  <Route
                    path="users"
                    element={(
                      <RequireRole roles={['admin']}>
                        <DashboardUsers />
                      </RequireRole>
                    )}
                  />

                  <Route
                    path="email-templates"
                    element={(
                      <RequireRole roles={['admin']}>
                        <DashboardEmailTemplates />
                      </RequireRole>
                    )}
                  />

                  <Route
                    path="settings"
                    element={(
                      <RequireRole roles={['admin']}>
                        <DashboardPlaceholder title="Setari" description="Configurare jurnal si platforma" />
                      </RequireRole>
                    )}
                  />
                </Route>

                <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SubmissionDataProvider>
          </JournalDataProvider>
        </PwaProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
