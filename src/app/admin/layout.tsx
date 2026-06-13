import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LayoutDashboard, Users, Calendar, FolderHeart, FileBarChart, Home, ArrowLeft } from "lucide-react";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Volunteers", href: "/admin/volunteers", icon: Users },
    { name: "Manage Events", href: "/admin/events", icon: Calendar },
    { name: "Applications Panel", href: "/admin/applications", icon: FolderHeart },
    { name: "Reports Center", href: "/admin/reports", icon: FileBarChart },
  ];

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 border-r border-white/5 bg-secondary/10 flex flex-col p-6 space-y-6 flex-shrink-0">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Admin Management
          </h2>
          <nav className="space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary hover:text-primary transition-all duration-200"
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <Home className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main page content area */}
      <main className="flex-grow p-6 md:p-10 relative overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
