import React from 'react';
import { Link } from '@/i18n/routing'; // Ensure this matches your Phase 2 routing setup
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Settings, 
  Menu, 
  Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div className="px-4 py-6">
        <h2 className="mb-6 px-2 text-xl font-bold tracking-tight">
          Lead-Flow-AI.app
        </h2>
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:bg-muted/80">
            <MessageSquare className="h-4 w-4" />
            Inbox
          </Link>
          <Link href="/dashboard/leads" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-primary">
            <Users className="h-4 w-4" />
            Leads
          </Link>
          <Link href="/dashboard/follow-ups" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-primary">
            <Calendar className="h-4 w-4" />
            Follow-ups
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-primary">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </div>

      <div className="p-4">
        <Card className="border-border bg-muted/40 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-4 w-4 text-yellow-500" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription>
              Unlock multi-lingual AI & follow-up sequences.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="mb-3 mt-2 text-2xl font-bold">$99<span className="text-sm font-normal text-muted-foreground"> / 3 months</span></div>
            <Button className="w-full" size="sm">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:hidden">
          <Sheet>
            {/* @ts-expect-error - React 19/Radix UI type mismatch for asChild */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="font-semibold">Lead-Flow-AI.app</div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
