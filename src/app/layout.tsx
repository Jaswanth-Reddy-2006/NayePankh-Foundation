import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Heart } from "lucide-react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VolunteerHub | NGO Volunteer Management Platform",
  description: "Register, apply for events, track impact hours, earn verification certificates, and get AI-matched volunteer recommendations at VolunteerHub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          {/* Global Premium Footer */}
          <footer className="border-t border-white/5 bg-secondary/20 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand Column */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
                      VolunteerHub
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connecting passionate individuals with impactful NGO opportunities. Together, we can create positive community change.
                  </p>
                </div>

                {/* Quick Links Column */}
                <div>
                  <h4 className="font-semibold text-sm mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/" className="hover:text-primary transition-colors">
                        Home Landing Page
                      </Link>
                    </li>
                    <li>
                      <Link href="/#impact" className="hover:text-primary transition-colors">
                        Our Impact Statistics
                      </Link>
                    </li>
                    <li>
                      <Link href="/#stories" className="hover:text-primary transition-colors">
                        Success Stories
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* NGO Focus Areas Column */}
                <div>
                  <h4 className="font-semibold text-sm mb-4">Focus Areas</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Education & Literacy</li>
                    <li>Healthcare & Medical Camps</li>
                    <li>Environment & Green Belts</li>
                    <li>Disaster Relief & Foods</li>
                  </ul>
                </div>

                {/* Contact Column */}
                <div>
                  <h4 className="font-semibold text-sm mb-4">Contact Info</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Email: contact@volunteerhub.org</li>
                    <li>Phone: +1 (555) 123-4567</li>
                    <li>Address: 100 Main Street, New York, NY</li>
                  </ul>
                </div>
              </div>

              {/* Copyright Row */}
              <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground space-y-4 md:space-y-0">
                <div>
                  &copy; {new Date().getFullYear()} VolunteerHub. All rights reserved.
                </div>
                <div className="flex space-x-4">
                  <a href="#" className="hover:underline">Privacy Policy</a>
                  <a href="#" className="hover:underline">Terms of Service</a>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
