"use client";

import React from "react";
import { IUser, IEvent, IApplication } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Download, Calendar, Users, Clock, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";
import jsPDF from "jspdf";

interface ReportsCenterClientProps {
  volunteers: IUser[];
  events: IEvent[];
  applications: IApplication[];
}

export default function ReportsCenterClient({
  volunteers,
  events,
  applications,
}: ReportsCenterClientProps) {
  const [activeTab, setActiveTab] = React.useState("volunteers");

  // Helper to convert array of objects to CSV download
  const exportToCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export Volunteer Report
  const onExportVolunteers = (type: "pdf" | "excel") => {
    const headers = ["Name", "Email", "Status", "Volunteer Hours", "Joined Date"];
    const rows = volunteers.map((v) => [
      v.name,
      v.email,
      v.status,
      `${v.volunteerHours || 0} hrs`,
      formatDate(v.createdAt),
    ]);

    if (type === "excel") {
      exportToCSV("Volunteer_Report", headers, rows);
    } else {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("Volunteer Registration Report", 14, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);
      
      let y = 37;
      // Headers
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Name", 16, y + 6);
      doc.text("Email", 65, y + 6);
      doc.text("Status", 120, y + 6);
      doc.text("Hours", 150, y + 6);
      doc.text("Joined", 170, y + 6);
      
      // Rows
      doc.setFont("helvetica", "normal");
      rows.forEach((row) => {
        y += 9;
        doc.text(row[0].slice(0, 22), 16, y + 6);
        doc.text(row[1].slice(0, 26), 65, y + 6);
        doc.text(row[2].toUpperCase(), 120, y + 6);
        doc.text(row[3], 150, y + 6);
        doc.text(row[4], 170, y + 6);
      });

      doc.save("Volunteer_Report.pdf");
    }
  };

  // 2. Export Events Report
  const onExportEvents = (type: "pdf" | "excel") => {
    const headers = ["Title", "Category", "Venue", "Date", "Required Volunteers", "Status"];
    const rows = events.map((e) => [
      e.title,
      e.category,
      e.venue,
      formatDate(e.date),
      e.requiredVolunteers.toString(),
      e.status,
    ]);

    if (type === "excel") {
      exportToCSV("Event_Report", headers, rows);
    } else {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFont("helvetica", "bold");
      doc.text("NGO Events Report", 14, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);

      let y = 37;
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, 268, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Event Title", 16, y + 6);
      doc.text("Category", 95, y + 6);
      doc.text("Venue", 135, y + 6);
      doc.text("Date", 195, y + 6);
      doc.text("Required", 235, y + 6);
      doc.text("Status", 255, y + 6);

      doc.setFont("helvetica", "normal");
      rows.forEach((row) => {
        y += 9;
        doc.text(row[0].slice(0, 36), 16, y + 6);
        doc.text(row[1], 95, y + 6);
        doc.text(row[2].slice(0, 26), 135, y + 6);
        doc.text(row[3], 195, y + 6);
        doc.text(row[4], 235, y + 6);
        doc.text(row[5].toUpperCase(), 255, y + 6);
      });

      doc.save("Events_Report.pdf");
    }
  };

  // 3. Export Participation Report
  const onExportParticipation = (type: "pdf" | "excel") => {
    const headers = ["Volunteer", "Event Title", "Category", "Applied Date", "Status"];
    const rows = applications.map((app) => {
      const vol = app.volunteerId as unknown as IUser;
      const event = app.eventId as unknown as IEvent;
      return [
        vol?.name || "Deleted User",
        event?.title || "Deleted Event",
        event?.category || "-",
        formatDate(app.appliedAt),
        app.status,
      ];
    });

    if (type === "excel") {
      exportToCSV("Participation_Report", headers, rows);
    } else {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFont("helvetica", "bold");
      doc.text("Event Participation Report", 14, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);

      let y = 37;
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, 268, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Volunteer Name", 16, y + 6);
      doc.text("Event Title", 70, y + 6);
      doc.text("Category", 170, y + 6);
      doc.text("Applied Date", 210, y + 6);
      doc.text("Status", 245, y + 6);

      doc.setFont("helvetica", "normal");
      rows.forEach((row) => {
        y += 9;
        doc.text(row[0].slice(0, 24), 16, y + 6);
        doc.text(row[1].slice(0, 44), 70, y + 6);
        doc.text(row[2], 170, y + 6);
        doc.text(row[3], 210, y + 6);
        doc.text(row[4].toUpperCase(), 245, y + 6);
      });

      doc.save("Participation_Report.pdf");
    }
  };

  // 4. Export Hours Logged Report
  const onExportHours = (type: "pdf" | "excel") => {
    const approvedOnly = applications.filter((a) => a.status === "approved");
    const headers = ["Volunteer", "Event Title", "Event Date", "Hours Logged"];
    const rows = approvedOnly.map((app) => {
      const vol = app.volunteerId as unknown as IUser;
      const event = app.eventId as unknown as IEvent;
      return [
        vol?.name || "Deleted User",
        event?.title || "Deleted Event",
        formatDate(event?.date),
        `${app.hoursLogged} hrs`,
      ];
    });

    if (type === "excel") {
      exportToCSV("Volunteer_Hours_Report", headers, rows);
    } else {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("Volunteer Contribution Hours Report", 14, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);

      let y = 37;
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, 182, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Volunteer Name", 16, y + 6);
      doc.text("Event Title", 70, y + 6);
      doc.text("Event Date", 140, y + 6);
      doc.text("Hours Logged", 170, y + 6);

      doc.setFont("helvetica", "normal");
      rows.forEach((row) => {
        y += 9;
        doc.text(row[0].slice(0, 24), 16, y + 6);
        doc.text(row[1].slice(0, 32), 70, y + 6);
        doc.text(row[2], 140, y + 6);
        doc.text(row[3], 170, y + 6);
      });

      doc.save("Volunteer_Hours_Report.pdf");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-secondary/20 p-2 rounded-2xl border border-white/5">
          <TabsList className="bg-transparent border-none">
            <TabsTrigger value="volunteers" className="rounded-xl flex items-center space-x-1.5">
              <Users className="h-4 w-4" />
              <span>Volunteers</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl flex items-center space-x-1.5">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="participation" className="rounded-xl flex items-center space-x-1.5">
              <Award className="h-4 w-4" />
              <span>Participation</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="rounded-xl flex items-center space-x-1.5">
              <Clock className="h-4 w-4" />
              <span>Hours Logged</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2 px-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center space-x-1 border-primary/20 hover:border-primary"
              onClick={() => {
                if (activeTab === "volunteers") onExportVolunteers("pdf");
                if (activeTab === "events") onExportEvents("pdf");
                if (activeTab === "participation") onExportParticipation("pdf");
                if (activeTab === "hours") onExportHours("pdf");
              }}
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Export PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center space-x-1 border-emerald-500/20 hover:border-emerald-500"
              onClick={() => {
                if (activeTab === "volunteers") onExportVolunteers("excel");
                if (activeTab === "events") onExportEvents("excel");
                if (activeTab === "participation") onExportParticipation("excel");
                if (activeTab === "hours") onExportHours("excel");
              }}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>Export Excel</span>
            </Button>
          </div>
        </div>

        {/* 1. Volunteers Tab Content */}
        <TabsContent value="volunteers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Directory Report Preview</CardTitle>
              <CardDescription>Metrics on registered volunteers and total logged contribution hours.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 border-t">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Hours Logged</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {volunteers.map((v) => (
                    <tr key={v._id} className="hover:bg-secondary/10">
                      <td className="p-4 font-semibold">{v.name}</td>
                      <td className="p-4 text-muted-foreground">{v.email}</td>
                      <td className="p-4 capitalize font-semibold text-primary">{v.status}</td>
                      <td className="p-4 font-semibold">{v.volunteerHours || 0} hrs</td>
                      <td className="p-4">{formatDate(v.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Events Tab Content */}
        <TabsContent value="events" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Campaigns Report Preview</CardTitle>
              <CardDescription>Overview of published events, category focuses, and volunteer requirements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto border-t">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="p-4">Event Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Venue</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Required Vols</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {events.map((e) => (
                    <tr key={e._id} className="hover:bg-secondary/10">
                      <td className="p-4 font-semibold">{e.title}</td>
                      <td className="p-4">{e.category}</td>
                      <td className="p-4 text-muted-foreground">{e.venue}</td>
                      <td className="p-4">{formatDate(e.date)}</td>
                      <td className="p-4 font-semibold">{e.requiredVolunteers}</td>
                      <td className="p-4 font-semibold capitalize text-primary">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Participation Tab Content */}
        <TabsContent value="participation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Participation Log Preview</CardTitle>
              <CardDescription>List of applications and their status tracking.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto border-t">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="p-4">Volunteer</th>
                    <th className="p-4">Event Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {applications.map((app) => {
                    const vol = app.volunteerId as unknown as IUser;
                    const event = app.eventId as unknown as IEvent;
                    return (
                      <tr key={app._id} className="hover:bg-secondary/10">
                        <td className="p-4 font-semibold">{vol?.name || "Deleted User"}</td>
                        <td className="p-4 font-semibold">{event?.title || "Deleted Event"}</td>
                        <td className="p-4">{event?.category || "-"}</td>
                        <td className="p-4 text-muted-foreground">{formatDate(app.appliedAt)}</td>
                        <td className="p-4 capitalize font-semibold text-primary">{app.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Hours Tab Content */}
        <TabsContent value="hours" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logged Contribution Hours Preview</CardTitle>
              <CardDescription>Contribution logs of approved volunteer participations.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto border-t">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="p-4">Volunteer</th>
                    <th className="p-4">Event Title</th>
                    <th className="p-4">Event Date</th>
                    <th className="p-4">Hours Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {applications
                    .filter((app) => app.status === "approved")
                    .map((app) => {
                      const vol = app.volunteerId as unknown as IUser;
                      const event = app.eventId as unknown as IEvent;
                      return (
                        <tr key={app._id} className="hover:bg-secondary/10">
                          <td className="p-4 font-semibold">{vol?.name || "Deleted User"}</td>
                          <td className="p-4 font-semibold">{event?.title || "Deleted Event"}</td>
                          <td className="p-4 text-muted-foreground">{formatDate(event?.date)}</td>
                          <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                            {app.hoursLogged} hrs
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
