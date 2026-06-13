"use client";

import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, FolderClock, FolderCheck, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

interface AdminOverviewClientProps {
  kpis: {
    totalVolunteers: number;
    activeVolunteers: number;
    totalEvents: number;
    pendingApps: number;
    approvedApps: number;
  };
  registrationData: Array<{ name: string; registrations: number }>;
  participationData: Array<{ title: string; volunteers: number }>;
  statusData: Array<{ name: string; value: number }>;
}

export default function AdminOverviewClient({
  kpis,
  registrationData,
  participationData,
  statusData,
}: AdminOverviewClientProps) {
  const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Emerald, Amber, Red

  return (
    <div className="space-y-8">
      {/* Admin KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Volunteers
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalVolunteers}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Active & pending registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalEvents}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Open and closed NGO campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Applications
            </CardTitle>
            <FolderClock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingApps}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Applications waiting for approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Approved Apps
            </CardTitle>
            <FolderCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.approvedApps}</div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Approved participations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Graphical Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Bar Chart */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold flex items-center space-x-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Monthly Volunteer Registrations</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Tracking signup counts over the calendar year
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-white/5" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(139, 92, 246, 0.05)" }}
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Status Breakdown Pie Chart */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Application Status Trends</CardTitle>
            <CardDescription className="text-xs">Breakdown of volunteer application statuses</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-80 flex flex-col justify-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" fontSize={11} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Participation Column */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Event Participation (Approved Vol.)</CardTitle>
            <CardDescription className="text-xs">Approved applications count per event</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={participationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-white/5" />
                <XAxis dataKey="title" fontSize={10} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="volunteers"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorVol)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="flex flex-col justify-between p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Management Quick Shortcuts</CardTitle>
            <CardDescription className="text-xs">Take actions and administer volunteer systems</CardDescription>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-2 gap-4 flex-grow items-center">
            <Link href="/admin/applications" className="block">
              <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 rounded-2xl">
                <FolderClock className="h-5 w-5" />
                <span className="text-xs font-semibold">Pending Applications</span>
              </Button>
            </Link>

            <Link href="/admin/volunteers" className="block">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1 rounded-2xl border-primary/20 hover:border-primary">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold">Volunteer Directory</span>
              </Button>
            </Link>

            <Link href="/admin/events" className="block">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1 rounded-2xl border-purple-500/20 hover:border-purple-500">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-semibold">Event Board</span>
              </Button>
            </Link>

            <Link href="/admin/reports" className="block">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1 rounded-2xl border-indigo-500/20 hover:border-indigo-500">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <span className="text-xs font-semibold">Reports Center</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
