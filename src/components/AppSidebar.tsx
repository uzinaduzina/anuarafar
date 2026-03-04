import {
  LayoutDashboard,
  BookOpen,
  Upload,
  FileText,
  Users,
  Settings,
  Globe,
  LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
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

const editorItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Numere', url: '/dashboard/issues', icon: BookOpen },
  { title: 'Ingest PDF', url: '/dashboard/ingest', icon: Upload },
  { title: 'Submisii', url: '/dashboard/submissions', icon: FileText },
];

const adminItems = [
  { title: 'Utilizatori', url: '/dashboard/users', icon: Users },
  { title: 'Setări', url: '/dashboard/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

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
                Panou editorial
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Editorial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {editorItems.map(item => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Administrare</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
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
            <SidebarMenuButton asChild>
              <button onClick={() => navigate('/login')} className="hover:bg-sidebar-accent/50 w-full">
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
