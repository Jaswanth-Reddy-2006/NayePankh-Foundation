"use client";

import React from "react";
import { IUser } from "@/types";
import { handleManageVolunteerStatus } from "@/actions/authActions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, User, CheckCircle2, XCircle, Trash2, Mail, Calendar, Compass, ShieldCheck, GraduationCap, MapPin, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface VolunteerDirectoryClientProps {
  initialVolunteers: IUser[];
}

export default function VolunteerDirectoryClient({
  initialVolunteers,
}: VolunteerDirectoryClientProps) {
  const [volunteers, setVolunteers] = React.useState<IUser[]>(initialVolunteers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedVolunteer, setSelectedVolunteer] = React.useState<IUser | null>(null);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filter Logic
  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || vol.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const onUpdateStatus = async (volunteerId: string, action: "approved" | "rejected" | "remove") => {
    setLoadingId(volunteerId);
    setMsg(null);

    const res = await handleManageVolunteerStatus(volunteerId, action);

    if (res.error) {
      setMsg({ type: "error", text: res.error });
    } else {
      setMsg({ type: "success", text: res.message || "Volunteer status updated successfully" });
      
      // Update local state
      if (action === "remove") {
        setVolunteers((prev) => prev.filter((v) => v._id !== volunteerId));
      } else {
        setVolunteers((prev) =>
          prev.map((v) => (v._id === volunteerId ? { ...v, status: action } : v))
        );
      }
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 text-muted-foreground my-auto" />
          <input
            type="text"
            placeholder="Search volunteers by name or email..."
            className="flex h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="flex h-10 w-full sm:w-[180px] rounded-full border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary appearance-none capitalize"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Messages */}
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

      {/* Volunteers Table Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {filteredVolunteers.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Volunteer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Logged Hours</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVolunteers.map((vol) => (
                  <tr key={vol._id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                        {vol.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={vol.profileImage}
                            alt={vol.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          vol.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-semibold">{vol.name}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{vol.email}</td>
                    <td className="p-4">
                      {vol.status === "approved" && (
                        <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold space-x-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approved</span>
                        </span>
                      )}
                      {vol.status === "pending" && (
                        <span className="inline-flex items-center text-xs text-yellow-600 dark:text-yellow-400 font-semibold space-x-1 animate-pulse">
                          <Compass className="h-3.5 w-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                      {vol.status === "rejected" && (
                        <span className="inline-flex items-center text-xs text-destructive font-semibold space-x-1">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{vol.volunteerHours || 0} hrs</td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVolunteer(vol)}
                        className="text-xs"
                      >
                        Profile
                      </Button>

                      {vol.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            disabled={loadingId === vol._id}
                            onClick={() => onUpdateStatus(vol._id, "approved")}
                            className="text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={loadingId === vol._id}
                            onClick={() => onUpdateStatus(vol._id, "rejected")}
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {vol.status === "rejected" && (
                        <Button
                          size="sm"
                          disabled={loadingId === vol._id}
                          onClick={() => onUpdateStatus(vol._id, "approved")}
                          className="text-xs"
                        >
                          Approve
                        </Button>
                      )}

                      {vol.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loadingId === vol._id}
                          onClick={() => onUpdateStatus(vol._id, "rejected")}
                          className="text-xs text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10"
                        >
                          Suspend
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingId === vol._id}
                        onClick={() => onUpdateStatus(vol._id, "remove")}
                        className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 inline-flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No volunteers registered in this directory yet.
            </div>
          )}
        </div>
      </Card>

      {/* Volunteer Profile Inspector Dialog */}
      {selectedVolunteer && (
        <Dialog open={!!selectedVolunteer} onOpenChange={() => setSelectedVolunteer(null)}>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl">
            <DialogHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shadow">
                  {selectedVolunteer.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedVolunteer.profileImage}
                      alt={selectedVolunteer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedVolunteer.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">{selectedVolunteer.name}</DialogTitle>
                  <DialogDescription className="text-xs">{selectedVolunteer.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground flex items-center space-x-1.5 mb-0.5">
                    <Phone className="h-3 w-3" />
                    <span>Phone</span>
                  </h4>
                  <p className="text-sm font-semibold">{selectedVolunteer.phone || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground flex items-center space-x-1.5 mb-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>DOB</span>
                  </h4>
                  <p className="text-sm font-semibold">{selectedVolunteer.dob || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground flex items-center space-x-1.5 mb-0.5">
                    <GraduationCap className="h-3 w-3" />
                    <span>Education</span>
                  </h4>
                  <p className="text-sm font-semibold">{selectedVolunteer.education || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground flex items-center space-x-1.5 mb-0.5">
                    <MapPin className="h-3 w-3" />
                    <span>Address</span>
                  </h4>
                  <p className="text-sm font-semibold">{selectedVolunteer.address || "Not provided"}</p>
                </div>
              </div>

              {/* Skills tags */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Skills</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 ? (
                    selectedVolunteer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Interests tags */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2 flex items-center space-x-1.5">
                  <Compass className="h-4 w-4 text-primary" />
                  <span>Interests</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVolunteer.interests && selectedVolunteer.interests.length > 0 ? (
                    selectedVolunteer.interests.map((interest) => (
                      <span
                        key={interest}
                        className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No interests listed</span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedVolunteer(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
