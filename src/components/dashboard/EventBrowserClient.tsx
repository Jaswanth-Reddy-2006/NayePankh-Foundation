"use client";

import React from "react";
import { IEvent, IApplication, IUser } from "@/types";
import { calculateEventMatch } from "@/services/aiMatching";
import { handleApplyToEvent, handleWithdrawApplication } from "@/actions/applicationActions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, MapPin, Calendar, Clock, Users, Sparkles, Filter, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EventBrowserClientProps {
  initialEvents: IEvent[];
  initialApplications: IApplication[];
  user: IUser;
  pastCategories: string[];
}

export default function EventBrowserClient({
  initialEvents,
  initialApplications,
  user,
  pastCategories,
}: EventBrowserClientProps) {
  const [events, setEvents] = React.useState<IEvent[]>(initialEvents);
  const [applications, setApplications] = React.useState<IApplication[]>(initialApplications);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedEvent, setSelectedEvent] = React.useState<IEvent | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Filter events based on search and category
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Helper to check application status
  const getApplicationStatus = (eventId: string) => {
    const app = applications.find((a) => a.eventId === eventId);
    return app ? { id: app._id, status: app.status } : null;
  };

  // Handle Apply action
  const onApply = async (eventId: string) => {
    setActionLoading(eventId);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await handleApplyToEvent(user._id, eventId);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Application submitted successfully!");
      // Add to local applications state
      setApplications((prev) => [
        ...prev,
        {
          _id: res.applicationId!,
          volunteerId: user._id,
          eventId,
          status: "pending",
          appliedAt: new Date().toISOString(),
          hoursLogged: 0,
        },
      ]);
    }
    setActionLoading(null);
  };

  // Handle Withdraw action
  const onWithdraw = async (applicationId: string, eventId: string) => {
    setActionLoading(eventId);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await handleWithdrawApplication(applicationId);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg("Application withdrawn successfully.");
      // Remove from local applications state
      setApplications((prev) => prev.filter((app) => app._id !== applicationId));
    }
    setActionLoading(null);
  };

  // Distinct Categories list
  const categories = ["all", ...Array.from(new Set(events.map((e) => e.category.toLowerCase())))];

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 text-muted-foreground my-auto" />
          <input
            type="text"
            placeholder="Search events by title, description or venue..."
            className="flex h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="flex h-10 w-full sm:w-[180px] rounded-full border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary appearance-none capitalize"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-2xl">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-2xl">
          {successMsg}
        </div>
      )}

      {/* Events Listing */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const matchInfo = calculateEventMatch(user, event, pastCategories);
            const appInfo = getApplicationStatus(event._id);

            return (
              <Card key={event._id} className="overflow-hidden flex flex-col relative">
                {/* AI Match Badge */}
                <div className="absolute top-3 right-3 z-10 bg-primary/95 text-primary-foreground font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3 fill-current" />
                  <span>{matchInfo.score}% Match</span>
                </div>

                {event.bannerImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="w-full h-44 object-cover bg-secondary"
                  />
                )}

                <CardHeader className="p-5">
                  <span className="text-[10px] bg-primary/10 text-primary w-fit px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {event.category}
                  </span>
                  <CardTitle className="text-lg font-bold mt-2 line-clamp-1">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center space-x-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{event.venue}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-grow flex flex-col space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="text-xs text-foreground/80 space-y-2 border-t border-b border-white/5 py-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>Vacancy: {event.requiredVolunteers} volunteers needed</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                      className="text-xs"
                    >
                      View Details
                    </Button>

                    {appInfo ? (
                      appInfo.status === "approved" ? (
                        <Button disabled variant="secondary" size="sm" className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center space-x-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approved</span>
                        </Button>
                      ) : appInfo.status === "rejected" ? (
                        <Button disabled variant="secondary" size="sm" className="text-xs bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center space-x-1">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Rejected</span>
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={actionLoading === event._id}
                          onClick={() => onWithdraw(appInfo.id, event._id)}
                          className="text-xs"
                        >
                          {actionLoading === event._id ? "Withdrawing..." : "Withdraw"}
                        </Button>
                      )
                    ) : (
                      <Button
                        size="sm"
                        disabled={actionLoading === event._id}
                        onClick={() => onApply(event._id)}
                        className="text-xs flex items-center justify-center space-x-1"
                      >
                        <span>Apply</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center text-muted-foreground">
          No events found matching your search.
        </Card>
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {selectedEvent.category}
                </span>
                <span className="text-xs text-primary font-bold">
                  {calculateEventMatch(user, selectedEvent, pastCategories).score}% Profile Match
                </span>
              </div>
              <DialogTitle className="text-2xl font-bold mt-2">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground flex items-center space-x-2 mt-1">
                <MapPin className="h-4 w-4" />
                <span>{selectedEvent.venue}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {selectedEvent.bannerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedEvent.bannerImage}
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover rounded-xl bg-secondary"
                />
              )}

              <div className="space-y-2">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Description</h4>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground">Date</h4>
                  <p className="text-sm font-semibold">{formatDate(selectedEvent.date)}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground">Time</h4>
                  <p className="text-sm font-semibold">{selectedEvent.time}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground">Venue</h4>
                  <p className="text-sm font-semibold">{selectedEvent.venue}</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-muted-foreground">Volunteers Required</h4>
                  <p className="text-sm font-semibold">{selectedEvent.requiredVolunteers} positions</p>
                </div>
              </div>

              {selectedEvent.skillsRequired && selectedEvent.skillsRequired.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-secondary border px-3 py-1 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Matching Breakdown */}
              <div className="border border-primary/20 dark:border-primary/10 bg-primary/[0.02] p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-1 text-primary font-bold text-sm">
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span>VolunteerHub AI Match Breakdown</span>
                </div>
                <div className="space-y-1">
                  {calculateEventMatch(user, selectedEvent, pastCategories).reasons.map((reason, idx) => (
                    <div key={idx} className="text-xs flex items-start space-x-1.5 text-foreground/80">
                      <span className="text-primary">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              {(() => {
                const appInfo = getApplicationStatus(selectedEvent._id);
                return appInfo ? (
                  appInfo.status === "approved" ? (
                    <Button disabled variant="secondary" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Approved
                    </Button>
                  ) : appInfo.status === "rejected" ? (
                    <Button disabled variant="secondary" className="bg-destructive/10 text-destructive border border-destructive/20">
                      Rejected
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      disabled={actionLoading === selectedEvent._id}
                      onClick={() => {
                        onWithdraw(appInfo.id, selectedEvent._id);
                        setSelectedEvent(null);
                      }}
                    >
                      Withdraw Application
                    </Button>
                  )
                ) : (
                  <Button
                    disabled={actionLoading === selectedEvent._id}
                    onClick={() => {
                      onApply(selectedEvent._id);
                      setSelectedEvent(null);
                    }}
                  >
                    Apply Now
                  </Button>
                );
              })()}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
