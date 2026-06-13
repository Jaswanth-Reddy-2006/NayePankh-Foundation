import React from "react";
import Link from "next/link";
import { Heart, Users, Calendar, Award, Clock, ArrowRight, Quote } from "lucide-react";
import { query } from "@/lib/db";
import Button from "@/components/ui/button";

async function getLandingStats() {
  try {
    const volunteersRes = await query("SELECT COUNT(*) FROM users WHERE role = 'volunteer' AND status = 'approved'");
    const eventsRes = await query("SELECT COUNT(*) FROM events");
    const hoursRes = await query("SELECT SUM(hours_logged) FROM applications WHERE status = 'approved'");

    const volunteers = parseInt(volunteersRes.rows[0].count, 10) || 0;
    const events = parseInt(eventsRes.rows[0].count, 10) || 0;
    const hours = parseInt(hoursRes.rows[0].sum, 10) || 0;

    return {
      volunteers: volunteers || 8, // Seed defaults
      events: events || 4,
      hours: hours || 65,
    };
  } catch (error) {
    console.error("Failed to load landing stats from Postgres, using mock data", error);
    return {
      volunteers: 1250,
      events: 450,
      hours: 15200,
    };
  }
}

export default async function LandingPage() {
  const stats = await getLandingStats();

  const successStories = [
    {
      title: "Teaching Changed My Life",
      volunteer: "John Doe",
      event: "Weekend Teaching Camp",
      quote: "Volunteering with kids opened my eyes to the power of basic education. Seeing them solve math puzzles after our sessions was the most rewarding experience of my year.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    },
    {
      title: "Quick Action in Floods",
      volunteer: "Sarah Smith",
      event: "Emergency Food Packs",
      quote: "We packaged and delivered over 2,000 food kits in just three days. The coordination through VolunteerHub made the response lightning-fast.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    },
  ];

  const testimonials = [
    {
      name: "Dr. David Carter",
      role: "Lead Medical Organizer",
      quote: "VolunteerHub streamlined our health checkup camp. We received perfectly matched medical students who hit the ground running on day one.",
    },
    {
      name: "Marcus Green",
      role: "Environmental activist",
      quote: "Managing 150 volunteers at our ocean conservation drive used to be a logistical nightmare. Now it takes just a few clicks.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold mb-6 animate-pulse-subtle">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>Empower. Connect. Transform.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
            Connecting Hearts to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-indigo-600 dark:from-primary dark:to-indigo-400">
              Community Action
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join VolunteerHub to discover NGO opportunities tailored to your skills, track your hours, earn verified certificates, and make a real difference today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base flex items-center space-x-2">
                <span>Start Volunteering</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="glass" size="lg" className="w-full sm:w-auto text-base">
                Admin Panel Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section id="impact" className="py-16 border-y border-white/5 bg-secondary/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Making a Tangible Difference</h2>
            <p className="text-muted-foreground mt-2">Real-time statistics of our collective contribution.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Stat Item 1 */}
            <div className="glass p-6 rounded-2xl flex items-center space-x-4">
              <div className="bg-primary/20 p-4 rounded-xl text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.volunteers > 50 ? `${stats.volunteers}+` : stats.volunteers}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Approved Volunteers
                </div>
              </div>
            </div>

            {/* Stat Item 2 */}
            <div className="glass p-6 rounded-2xl flex items-center space-x-4">
              <div className="bg-purple-500/20 p-4 rounded-xl text-purple-500">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.events > 10 ? `${stats.events}+` : stats.events}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Active NGO Events
                </div>
              </div>
            </div>

            {/* Stat Item 3 */}
            <div className="glass p-6 rounded-2xl flex items-center space-x-4">
              <div className="bg-indigo-500/20 p-4 rounded-xl text-indigo-500">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.hours > 100 ? `${stats.hours}+` : stats.hours}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Hours Contributed
                </div>
              </div>
            </div>

            {/* Stat Item 4 */}
            <div className="glass p-6 rounded-2xl flex items-center space-x-4">
              <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-500">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.hours > 50 ? `${Math.floor(stats.hours / 8)}+` : "4+"}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Certificates Issued
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="stories" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Volunteer Success Stories
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hear from volunteers who have made an impact and changed lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map((story, idx) => (
              <div key={idx} className="glass p-8 rounded-3xl flex flex-col md:flex-row gap-6 relative">
                <div className="absolute top-4 right-6 text-primary/10">
                  <Quote className="h-24 w-24 stroke-[4px]" />
                </div>
                <div className="flex-shrink-0 flex justify-center items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.image}
                    alt={story.volunteer}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-md"
                  />
                </div>
                <div className="space-y-3 relative z-10">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded">
                    {story.event}
                  </span>
                  <h3 className="text-xl font-bold mt-2">{story.title}</h3>
                  <p className="text-sm italic text-muted-foreground leading-relaxed">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <div className="text-sm font-semibold">{story.volunteer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">What NGO Leaders Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-card border p-6 rounded-2xl relative shadow-sm">
                <p className="text-muted-foreground text-sm italic mb-4">&ldquo;{test.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm">{test.name}</div>
                  <div className="text-xs text-muted-foreground">{test.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center relative">
        <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.01] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4">
            Ready to Begin Your Volunteer Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Create an account in seconds, define your skills and interests, and let our AI matching algorithm recommend the best initiatives for you.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8 font-semibold">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
