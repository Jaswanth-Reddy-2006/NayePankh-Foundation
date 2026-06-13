"use client";

import React from "react";
import { IApplication, IUser, IEvent } from "@/types";
import { handleUpdateApplicationStatus } from "@/actions/applicationActions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FolderClock, CheckCircle2, XCircle, Clock, Calendar, Sparkles, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ApplicationsPanelClientProps {
  initialApplications: IApplication[];
}

export default function ApplicationsPanelClient({
  initialApplications,
}: ApplicationsPanelClientProps) {
  const [applications, setApplications] = React.useState<IApplication[]>(initialApplications);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("pending"); // Default to pending so admin sees actionables first!
  const [hoursInputs, setHoursInputs] = React.useState<Record<string, number>>({});
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filter
  const filteredApps = applications.filter((app) => {
    const vol = app.volunteerId as unknown as IUser;
    const event = app.eventId as unknown as IEvent;
    
    if (!vol || !event) return false;

    const matchesSearch =
      vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const onUpdateStatus = async (applicationId: string, status: "approved" | "rejected") => {
    setLoadingId(applicationId);
    setMsg(null);

    const hours = hoursInputs[applicationId] || 4; // default to 4 hours if empty

    const res = await handleUpdateApplicationStatus(applicationId, status, hours);

    if (res.error) {
      setMsg({ type: "error", text: res.error });
    } else {
      setMsg({ type: "success", text: res.message || "Application updated successfully" });
      
      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? { ...app, status, hoursLogged: status === "approved" ? hours : 0 }
            : app
        )
      );
    }
    setLoadingId(null);
  };

  const handleHoursChange = (applicationId: string, value: number) => {
    setHoursInputs((prev) => ({ ...prev, [applicationId]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 text-muted-foreground my-auto" />
          <input
            type="text"
            placeholder="Search by volunteer name or event title..."
            className="flex h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="flex h-10 w-full sm:w-[180px] rounded-full border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary appearance-none capitalize"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Message Alerts */}
      {msg && (
        <div
          className={`px-4 py-3 rounded-2xl border text-sm ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Applications Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {filteredApps.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Volunteer</th>
                  <th className="p-4">Event Opportunity</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Award Hours</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredApps.map((app) => {
                  const vol = app.volunteerId as unknown as IUser;
                  const event = app.eventId as unknown as IEvent;

                  if (!vol || !event) return null;

                  return (
                    <tr key={app._id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-semibold">{vol.name}</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold block">{event.title}</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider w-fit block">
                            {event.category}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(app.appliedAt)}</td>
                      <td className="p-4">
                        {app.status === "approved" && (
                          <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold space-x-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approved</span>
                          </span>
                        )}
                        {app.status === "pending" && (
                          <span className="inline-flex items-center text-xs text-yellow-600 dark:text-yellow-400 font-semibold space-x-1 animate-pulse">
                            <FolderClock className="h-3.5 w-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                        {app.status === "rejected" && (
                          <span className="inline-flex items-center text-xs text-destructive font-semibold space-x-1">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {app.status === "pending" ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <input
                              type="number"
                              min="1"
                              className="w-16 h-8 text-xs border rounded-md px-2 bg-transparent focus:ring-1 focus:ring-ring focus:outline-none focus:border-primary font-semibold"
                              value={hoursInputs[app._id] !== undefined ? hoursInputs[app._id] : 4}
                              onChange={(e) =>
                                handleHoursChange(app._id, parseInt(e.target.value, 10) || 0)
                              }
                            />
                            <span className="text-xs text-muted-foreground font-semibold">hrs</span>
                          </div>
                        ) : app.status === "approved" ? (
                          <span className="font-semibold text-foreground flex items-center space-x-1.5">
                            <Clock className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{app.hoursLogged} hrs logged</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              disabled={loadingId === app._id}
                              onClick={() => onUpdateStatus(app._id, "approved")}
                              className="text-xs flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={loadingId === app._id}
                              onClick={() => onUpdateStatus(app._id, "rejected")}
                              className="text-xs flex items-center space-x-1"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </Button>
                          </>
                        )}
                        {app.status === "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingId === app._id}
                            onClick={() => onUpdateStatus(app._id, "rejected")}
                            className="text-xs text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10"
                          >
                            Revoke Approval
                          </Button>
                        )}
                        {app.status === "rejected" && (
                          <Button
                            size="sm"
                            disabled={loadingId === app._id}
                            onClick={() => onUpdateStatus(app._id, "approved")}
                            className="text-xs"
                          >
                            Approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No applications found matching filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
