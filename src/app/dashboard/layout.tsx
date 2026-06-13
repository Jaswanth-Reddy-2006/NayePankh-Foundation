import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LayoutDashboard, Calendar, Award, User, Home, ArrowLeft } from "lucide-react";

export default async function VolunteerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "volunteer") {
    redirect("/admin");
  }

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Browse Events", href: "/dashboard/events", icon: Calendar },
    { name: "My Certificates", href: "/dashboard/certificates", icon: Award },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 border-r border-white/5 bg-secondary/10 flex flex-col p-6 space-y-6 flex-shrink-0">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Volunteer Menu
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
        {/* Verification Status Warning if pending */}
        {session.user.status === "pending" && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm px-4 py-3 rounded-2xl mb-8 flex justify-between items-center">
            <div>
              <span className="font-bold">Account Pending Approval:</span> Your volunteer registration is under review by the NGO. You can browse and apply for events, but your hours won&apos;t be finalized until you are approved.
            </div>
          </div>
        )}
        {session.user.status === "rejected" && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-2xl mb-8">
            <span className="font-bold">Account Rejected:</span> Your registration was rejected by the NGO administrators. You will not be able to participate in any volunteer events.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
