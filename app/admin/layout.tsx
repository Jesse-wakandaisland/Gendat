import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, UserCircle, Palette } from 'lucide-react'; // Example icons
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle'; // Assuming you have a theme toggle
import { CartButton } from '@/components/cart-button';

// Example Logo component (replace with your actual logo)
const Logo = () => (
  <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
    <Palette /> {/* Replace with your actual logo icon/image */}
    <span>AlgoPress DB</span>
  </Link>
);

// Example UserMenu (replace with actual user logic if any)
const UserMenu = () => (
    <Button variant="ghost" size="icon" className="rounded-full">
        <UserCircle size={22} />
        <span className="sr-only">User Menu</span>
    </Button>
);


export default function AdminLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/products", label: "Products", icon: <ShoppingBag size={18} /> },
    // { href: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-muted/40">
        <Sidebar navItems={navItems} collapsible="icon" variant="sidebar" side="left">
          <SidebarHeader className="border-b">
            <Logo />
          </SidebarHeader>
          {/* Sidebar.tsx handles navItems within its own SidebarContent */}
          <SidebarFooter className="mt-auto border-t p-2">
            <div className="flex items-center justify-between">
                <ThemeToggle />
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/">
                        <LogOut size={16} className="mr-1.5" /> Exit Admin
                    </Link>
                </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1"> {/* sm:pl-14 for collapsed sidebar */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
               <SidebarTrigger className="sm:hidden" />
               <div className="flex-1">
                 {/* Breadcrumbs or page title could go here */}
               </div>
               <div className="flex items-center gap-2">
                <CartButton />
                <UserMenu />
               </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0 "> {/* Removed redundant p-6 from here */}
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
