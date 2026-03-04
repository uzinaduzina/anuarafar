import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { JournalDataProvider } from "./data/JournalDataProvider";
import { AuthProvider } from "./contexts/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/public/Home";
import ArchivePage from "./pages/public/ArchivePage";
import IssueDetail from "./pages/public/IssueDetail";
import ArticleView from "./pages/public/ArticleView";
import About from "./pages/public/About";
import EditorialBoard from "./pages/public/EditorialBoard";
import SubmitPage from "./pages/public/SubmitPage";
import Login from "./pages/Login";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardIssues from "./pages/dashboard/DashboardIssues";
import DashboardSubmissions from "./pages/dashboard/DashboardSubmissions";
import DashboardPlaceholder from "./pages/dashboard/DashboardPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <JournalDataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/archive/:slug" element={<IssueDetail />} />
              <Route path="/article/:id" element={<ArticleView />} />
              <Route path="/about" element={<About />} />
              <Route path="/editorial-board" element={<EditorialBoard />} />
              <Route path="/submit" element={<SubmitPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="issues" element={<DashboardIssues />} />
              <Route path="submissions" element={<DashboardSubmissions />} />
              <Route path="ingest" element={<DashboardPlaceholder title="Ingest PDF" description="Modul de ingest PDF cu segmentare AI" />} />
              <Route path="users" element={<DashboardPlaceholder title="Utilizatori" description="Gestionare utilizatori și roluri" />} />
              <Route path="settings" element={<DashboardPlaceholder title="Setări" description="Configurare jurnal și platformă" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </JournalDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
