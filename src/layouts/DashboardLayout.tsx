import { Outlet } from 'react-router-dom';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card/95 backdrop-blur px-4 gap-4">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground font-semibold">
              Panou editorial
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-[1100px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
