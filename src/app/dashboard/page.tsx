import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { calculateEventMatch } from "@/services/aiMatching";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileCheck, Award, Sparkles, MapPin, BadgeHelp, CheckCircle2, Hourglass } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function VolunteerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userIdNum = parseInt(session.user.id, 10);

  // 1. Fetch User Data
  const userRes = await query("SELECT * FROM users WHERE id = $1", [userIdNum]);
  if ((userRes.rowCount ?? 0) === 0) return <div>User profile not found.</div>;
  const dbUser = userRes.rows[0];

  // Map to matching IUser type
  const user = {
    _id: dbUser.id.toString(),
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.status,
    phone: dbUser.phone,
    dob: dbUser.dob,
    gender: dbUser.gender,
    address: dbUser.address,
    education: dbUser.education,
    skills: dbUser.skills || [],
    interests: dbUser.interests || [],
    profileImage: dbUser.profile_image,
    volunteerHours: dbUser.volunteer_hours,
  };

  // 2. Fetch User Applications with Joined Event Details
  const appRes = await query(
    `SELECT a.*,
            e.title as event_title,
            e.category as event_category,
            e.date as event_date,
            e.time as event_time,
            e.venue as event_venue,
            e.description as event_description,
            e.banner_image as event_banner_image
     FROM applications a
     JOIN events e ON a.event_id = e.id
     WHERE a.volunteer_id = $1
     ORDER BY a.applied_at DESC`,
    [userIdNum]
  );

  const applications = appRes.rows.map((row) => ({
    _id: row.id.toString(),
    volunteerId: row.volunteer_id.toString(),
    eventId: {
      _id: row.event_id.toString(),
      title: row.event_title,
      category: row.event_category,
      date: row.event_date.toISOString(),
      time: row.event_time,
      venue: row.event_venue,
      description: row.event_description,
      bannerImage: row.event_banner_image,
    },
    status: row.status,
    appliedAt: row.applied_at.toISOString(),
    hoursLogged: row.hours_logged,
  }));

  // 3. Fetch User Certificates count
  const certCountRes = await query("SELECT COUNT(*) FROM certificates WHERE volunteer_id = $1", [userIdNum]);
  const certificateCount = parseInt(certCountRes.rows[0].count, 10);

  // 4. Calculate Stats
  const totalApplied = applications.length;
  const approvedApps = applications.filter((app) => app.status === "approved");
  const totalApproved = approvedApps.length;

  const pastCategories = approvedApps
    .map((app) => (app.eventId as any)?.category)
    .filter(Boolean);

  // 5. Fetch Open Events for AI Matching
  const openEventsRes = await query("SELECT * FROM events WHERE status = 'open'");
  const openEvents = openEventsRes.rows.map((event) => ({
    _id: event.id.toString(),
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date.toISOString(),
    time: event.time,
    venue: event.venue,
    requiredVolunteers: event.required_volunteers,
    bannerImage: event.banner_image,
    status: event.status,
    skillsRequired: event.skills_required || [],
  }));

  // Run AI Event Matcher
  const matchedEvents = openEvents
    .map((event) => {
      const match = calculateEventMatch(user as any, event as any, pastCategories);
      return {
        event,
        matchScore: match.score,
        matchReasons: match.reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3); // Top 3 recommendations

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hello, {user.name} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your VolunteerHub overview. Thank you for your contribution!
          </p>
        </div>
        <Link href="/dashboard/events">
          <Button className="flex items-center space-x-2">
            <span>Explore New Events</span>
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.volunteerHours || 0} hrs</div>
            <p className="text-[10px] text-muted-foreground mt-1">Logged from completed events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Applied Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplied}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Submissions for review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Approved
            </CardTitle>
            <FileCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApproved}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Confirmed participations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Certificates
            </CardTitle>
            <Award className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificateCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Earned credentials</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Volunteer Matching Recommendations */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-5 w-5 text-yellow-500 fill-current" />
          <h2 className="text-xl font-bold tracking-tight">AI Event Matching Recommendations</h2>
        </div>

        {matchedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matchedEvents.map(({ event, matchScore, matchReasons }) => (
              <Card key={event._id} className="overflow-hidden flex flex-col relative border-primary/20 dark:border-primary/10">
                <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground font-extrabold text-xs px-2 py-1 rounded-full shadow-md">
                  {matchScore}% Match
                </div>
                {event.bannerImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="w-full h-36 object-cover bg-secondary"
                  />
                )}
                <CardHeader className="p-4">
                  <div className="text-[10px] bg-primary/15 text-primary w-fit px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {event.category}
                  </div>
                  <CardTitle className="text-base font-bold line-clamp-1 mt-2">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center space-x-1 mt-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.venue}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow flex flex-col space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  
                  {/* Match Reasons */}
                  <div className="bg-secondary/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Why it matches:</span>
                    {matchReasons.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="text-[10px] text-foreground/80 flex items-start space-x-1">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2 mt-auto">
                    <Link href={`/dashboard/events`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View & Apply
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            Configure your skills and interests in your Profile to receive AI matched event recommendations!
          </Card>
        )}
      </div>

      {/* Applied Events Tracking */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">My Application Status</h2>
        
        {applications.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Event Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Event Date</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Hours Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {applications.map((app) => {
                    const event = app.eventId;
                    return (
                      <tr key={app._id} className="hover:bg-secondary/10 transition-colors">
                        <td className="p-4 font-semibold">{event.title}</td>
                        <td className="p-4">
                          <span className="text-xs bg-secondary px-2.5 py-0.5 rounded-full font-medium">
                            {event.category}
                          </span>
                        </td>
                        <td className="p-4">{formatDate(event.date)}</td>
                        <td className="p-4">{formatDate(app.appliedAt)}</td>
                        <td className="p-4">
                          {app.status === "approved" && (
                            <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold space-x-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approved</span>
                            </span>
                          )}
                          {app.status === "pending" && (
                            <span className="inline-flex items-center text-xs text-yellow-600 dark:text-yellow-400 font-semibold space-x-1 animate-pulse">
                              <Hourglass className="h-3.5 w-3.5" />
                              <span>Pending</span>
                            </span>
                          )}
                          {app.status === "rejected" && (
                            <span className="inline-flex items-center text-xs text-destructive font-semibold space-x-1">
                              <BadgeHelp className="h-3.5 w-3.5" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-semibold">
                          {app.status === "approved" ? `${app.hoursLogged} hrs` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            You haven&apos;t applied for any events yet. Head over to{" "}
            <Link href="/dashboard/events" className="text-primary hover:underline">
              Browse Events
            </Link>{" "}
            to apply!
          </Card>
        )}
      </div>
    </div>
  );
}
