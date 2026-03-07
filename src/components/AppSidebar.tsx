import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Globe,
  LogOut,
  ClipboardCheck,
  FileUp,
  Mail,
  BarChart3,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/data/authUsers';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import logo from '@/assets/logo_iafar.png';
import PwaInstallButton from '@/components/PwaInstallButton';

const roleNavigation = {
  admin: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Statistici', url: '/dashboard/stats', icon: BarChart3 },
    { title: 'Numere', url: '/dashboard/issues', icon: BookOpen },
    { title: 'Articole trimise', url: '/dashboard/submissions', icon: FileText },
    { title: 'Evaluări articole', url: '/dashboard/reviewer', icon: ClipboardCheck },
    { title: 'Zona autor', url: '/dashboard/author', icon: FileUp },
    { title: 'Utilizatori', url: '/dashboard/users', icon: Users },
    { title: 'Template-uri email', url: '/dashboard/email-templates', icon: Mail },
  ],
  editor: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Numere', url: '/dashboard/issues', icon: BookOpen },
    { title: 'Articole trimise', url: '/dashboard/submissions', icon: FileText },
  ],
  reviewer: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Evaluări articole', url: '/dashboard/reviewer', icon: ClipboardCheck },
  ],
  author: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Manuscrisele mele', url: '/dashboard/author', icon: FileUp },
  ],
} as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const items = user ? roleNavigation[user.role] : [];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="IAFAR" className="h-8 w-8 rounded-sm flex-shrink-0" />
          {!collapsed && (
            <div>
              <div className="font-serif text-sm font-bold text-sidebar-foreground leading-tight">
                Anuarul AAF
              </div>
              <div className="text-[0.6rem] uppercase tracking-[0.1em] text-sidebar-foreground/60">
                Panou {user ? ROLE_LABELS[user.role].toLowerCase() : 'editorial'}
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Functionalitati</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && user && (
          <div className="mb-2 rounded-md border border-sidebar-border/40 px-2 py-2 text-[0.68rem] text-sidebar-foreground/70">
            <div className="font-semibold text-sidebar-foreground">{user.name}</div>
            <div>{user.email}</div>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button onClick={() => navigate('/')} className="hover:bg-sidebar-accent/50 w-full">
                <Globe className="mr-2 h-4 w-4" />
                {!collapsed && <span>Site public</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <PwaInstallButton
              variant="ghost"
              className="w-full justify-start gap-2 px-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              label="Instalează aplicația"
              installedLabel="Aplicație instalată"
              showLabel={!collapsed}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button onClick={() => { logout(); navigate('/login'); }} className="hover:bg-sidebar-accent/50 w-full">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Deconectare</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <div className="mt-2 text-[0.65rem] text-sidebar-foreground/50 px-2">
            ISSN 1220-3661
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
