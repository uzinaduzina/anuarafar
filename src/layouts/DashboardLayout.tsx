import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/data/authUsers';

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="min-w-0 flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card/95 backdrop-blur px-3 sm:px-4 gap-4">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold">
              Panou {user ? ROLE_LABELS[user.role] : 'Editorial'}
            </div>
          </header>
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto w-full max-w-[1280px] p-3 sm:p-6 md:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
