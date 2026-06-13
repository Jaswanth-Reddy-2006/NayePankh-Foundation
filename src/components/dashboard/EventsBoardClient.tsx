"use client";

import React from "react";
import { IEvent } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "@/validations/event";
import {
  handleCreateEvent,
  handleEditEvent,
  handleDeleteEvent,
  handleToggleEventStatus,
} from "@/actions/eventActions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Users, ShieldAlert, Sparkles, X, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EventsBoardClientProps {
  initialEvents: IEvent[];
}

export default function EventsBoardClient({ initialEvents }: EventsBoardClientProps) {
  const [events, setEvents] = React.useState<IEvent[]>(initialEvents);
  const [openModal, setOpenModal] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<IEvent | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [skillInput, setSkillInput] = React.useState("");
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Setup form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      time: "",
      venue: "",
      requiredVolunteers: 1,
      bannerImage: "",
      skillsRequired: [] as string[],
    },
  });

  const watchSkills = watch("skillsRequired") || [];

  // Re-initialize form when editing an event
  React.useEffect(() => {
    if (editingEvent) {
      const dateVal = editingEvent.date
        ? new Date(editingEvent.date).toISOString().split("T")[0]
        : "";

      reset({
        title: editingEvent.title,
        description: editingEvent.description,
        category: editingEvent.category,
        date: dateVal,
        time: editingEvent.time,
        venue: editingEvent.venue,
        requiredVolunteers: editingEvent.requiredVolunteers,
        bannerImage: editingEvent.bannerImage || "",
        skillsRequired: editingEvent.skillsRequired || [],
      });
    } else {
      reset({
        title: "",
        description: "",
        category: "",
        date: "",
        time: "",
        venue: "",
        requiredVolunteers: 1,
        bannerImage: "",
        skillsRequired: [],
      });
    }
  }, [editingEvent, reset]);

  // Add a skill tag
  const addSkill = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const cleanInput = skillInput.trim();
    if (cleanInput && !watchSkills.includes(cleanInput)) {
      setValue("skillsRequired", [...watchSkills, cleanInput]);
      setSkillInput("");
    }
  };

  // Remove a skill tag
  const removeSkill = (idxToRemove: number) => {
    setValue(
      "skillsRequired",
      watchSkills.filter((_, idx) => idx !== idxToRemove)
    );
  };

  const onSubmit = async (data: any) => {
    setError(null);
    setSuccess(null);
    setActionLoading("form");

    let res;
    if (editingEvent) {
      res = await handleEditEvent(editingEvent._id, data);
    } else {
      res = await handleCreateEvent(data);
    }

    setActionLoading(null);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(
        editingEvent ? "Event updated successfully!" : "Event created successfully!"
      );

      // Re-fetch or locally update state
      const updatedEvent = {
        _id: res.eventId!,
        ...data,
        status: editingEvent ? editingEvent.status : "open",
      };

      if (editingEvent) {
        setEvents((prev) =>
          prev.map((e) => (e._id === editingEvent._id ? (updatedEvent as unknown as IEvent) : e))
        );
      } else {
        setEvents((prev) => [updatedEvent as unknown as IEvent, ...prev]);
      }

      setTimeout(() => {
        setOpenModal(false);
        setEditingEvent(null);
        setSuccess(null);
      }, 1500);
    }
  };

  const onDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? All application records will be deleted as well.")) {
      return;
    }
    setActionLoading(eventId);
    const res = await handleDeleteEvent(eventId);
    setActionLoading(null);

    if (res.error) {
      alert(res.error);
    } else {
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    }
  };

  const onToggleStatus = async (eventId: string) => {
    setActionLoading(eventId);
    const res = await handleToggleEventStatus(eventId);
    setActionLoading(null);

    if (res.error) {
      alert(res.error);
    } else {
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: res.status as "open" | "closed" } : e))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingEvent(null); setOpenModal(true); }} className="flex items-center space-x-2 rounded-full">
          <Plus className="h-4 w-4" />
          <span>Publish New Event</span>
        </Button>
      </div>

      {/* Grid listing */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event._id} className="overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative">
                  {event.bannerImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="w-full h-40 object-cover bg-secondary"
                    />
                  )}
                  <div
                    className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${
                      event.status === "open"
                        ? "bg-emerald-500 text-white"
                        : "bg-destructive text-white"
                    }`}
                  >
                    {event.status === "open" ? "Registrations Open" : "Closed"}
                  </div>
                </div>

                <CardHeader className="p-5">
                  <span className="text-[10px] bg-primary/10 text-primary w-fit px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {event.category}
                  </span>
                  <CardTitle className="text-base font-bold mt-2 line-clamp-1">{event.title}</CardTitle>
                  <CardDescription className="text-xs flex items-center space-x-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{event.venue}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="text-xs text-foreground/80 space-y-1.5 border-t pt-3">
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
                      <span>Volunteers needed: {event.requiredVolunteers}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="p-5 border-t flex items-center justify-between space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === event._id}
                  onClick={() => onToggleStatus(event._id)}
                  className="text-xs flex items-center space-x-1"
                >
                  {event.status === "open" ? (
                    <>
                      <ToggleRight className="h-4 w-4 text-emerald-500" />
                      <span>Close Event</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      <span>Open Event</span>
                    </>
                  )}
                </Button>

                <div className="flex space-x-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingEvent(event);
                      setOpenModal(true);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={actionLoading === event._id}
                    onClick={() => onDelete(event._id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center text-muted-foreground">
          No events published yet. Publish your first event using the button above!
        </Card>
      )}

      {/* Create / Edit Dialog */}
      {openModal && (
        <Dialog open={openModal} onOpenChange={(val) => { setOpenModal(val); if(!val) setEditingEvent(null); }}>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary fill-current" />
                <span>{editingEvent ? "Edit NGO Event" : "Publish New NGO Event"}</span>
              </DialogTitle>
              <DialogDescription>
                Provide details about your volunteering opportunity.
              </DialogDescription>
            </DialogHeader>

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-2xl">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Event Title
                  </label>
                  <Input {...register("title")} disabled={actionLoading === "form"} />
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Event Category
                  </label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary"
                    {...register("category")}
                    disabled={actionLoading === "form"}
                  >
                    <option value="">Select Category</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Environment">Environment</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                    <option value="Animal Welfare">Animal Welfare</option>
                  </select>
                  {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
                </div>

                {/* Banner Image URL */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Banner Image URL
                  </label>
                  <Input placeholder="https://example.com/banner.jpg" {...register("bannerImage")} disabled={actionLoading === "form"} />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <Input type="date" {...register("date")} disabled={actionLoading === "form"} />
                  {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Time
                  </label>
                  <Input placeholder="e.g. 10:00 AM - 2:00 PM" {...register("time")} disabled={actionLoading === "form"} />
                  {errors.time && <p className="text-xs text-destructive mt-1">{errors.time.message}</p>}
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Venue / Location
                  </label>
                  <Input placeholder="e.g. Community Center, Plaza A" {...register("venue")} disabled={actionLoading === "form"} />
                  {errors.venue && <p className="text-xs text-destructive mt-1">{errors.venue.message}</p>}
                </div>

                {/* Required Volunteers */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Required Volunteers Count
                  </label>
                  <Input type="number" {...register("requiredVolunteers")} disabled={actionLoading === "form"} />
                  {errors.requiredVolunteers && (
                    <p className="text-xs text-destructive mt-1">{errors.requiredVolunteers.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Provide details about the volunteering tasks, coordinates, and impact goals."
                    {...register("description")}
                    disabled={actionLoading === "form"}
                  />
                  {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                </div>

                {/* Skills Required Tag Input */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Required Skills
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a skill and click Add"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(e);
                        }
                      }}
                      disabled={actionLoading === "form"}
                    />
                    <Button type="button" size="sm" onClick={addSkill} disabled={actionLoading === "form"}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {watchSkills.length > 0 ? (
                      watchSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs bg-secondary border px-3 py-1 rounded-full font-medium flex items-center space-x-1"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No specific skills required (open to all)</span>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading === "form"}>
                  {actionLoading === "form" ? "Publishing..." : editingEvent ? "Save Changes" : "Publish Event"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
