"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Sun, Moon, Heart, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Avoid hydration mismatch by waiting until mounted on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="glass-nav sticky top-0 z-40 border-b border-white/10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground transition-transform duration-300 group-hover:scale-110">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
              VolunteerHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/#impact" className="text-sm font-medium hover:text-primary transition-colors">
              Impact
            </Link>
            <Link href="/#stories" className="text-sm font-medium hover:text-primary transition-colors">
              Stories
            </Link>
            {session && (
              <Link
                href={session.user.role === "admin" ? "/admin" : "/dashboard"}
                className="text-sm font-medium text-primary flex items-center space-x-1 hover:underline"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full w-9 h-9"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-purple-600" />}
              </Button>
            )}

            {session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-white/5">
                  <div className="bg-primary/20 p-1 rounded-full text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold max-w-[120px] truncate">
                    {session.user.name}
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary uppercase font-bold px-1.5 py-0.5 rounded">
                    {session.user.role}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center space-x-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-purple-600" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/5 py-4 px-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium"
          >
            Home
          </Link>
          <Link
            href="/#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium"
          >
            Impact
          </Link>
          <Link
            href="/#stories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium"
          >
            Stories
          </Link>

          {session ? (
            <>
              <Link
                href={session.user.role === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md bg-primary/10 text-primary text-sm font-semibold flex items-center space-x-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>My Dashboard ({session.user.role})</span>
              </Link>
              <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  Logged in as {session.user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center space-x-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
export default Navbar;
