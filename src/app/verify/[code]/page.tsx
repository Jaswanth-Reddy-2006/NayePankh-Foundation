import React from "react";
import Link from "next/link";
import { query } from "@/lib/db";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { code } = await params;

  // Find certificate and populate details using SQL JOINs
  const certRes = await query(
    `SELECT c.*,
            u.name as volunteer_name,
            u.email as volunteer_email,
            e.title as event_title,
            e.category as event_category,
            e.date as event_date,
            e.venue as event_venue
     FROM certificates c
     JOIN users u ON c.volunteer_id = u.id
     JOIN events e ON c.event_id = e.id
     WHERE c.verification_code = $1`,
    [code]
  );

  const isValid = (certRes.rowCount ?? 0) > 0;
  const certificate = isValid ? certRes.rows[0] : null;

  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Dynamic gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full space-y-8 relative z-10">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6 group w-fit mx-auto">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <Heart className="h-4 w-4 fill-current" />
          </div>
          <span className="font-bold text-lg text-foreground">VolunteerHub</span>
        </Link>

        {isValid && certificate ? (
          <Card className="glass border-emerald-500/20 dark:border-emerald-500/10 shadow-lg shadow-emerald-500/5 rounded-3xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-500/20">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Credential Verified
              </span>
              <CardTitle className="text-2xl font-extrabold tracking-tight mt-4">
                Valid Accomplishment Certificate
              </CardTitle>
              <CardDescription className="text-xs">
                Issued by NayePankh Foundation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 border-t border-white/5 text-sm">
              <div className="bg-secondary/40 p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Volunteer Name</span>
                  <span className="font-bold text-foreground">{certificate.volunteer_name}</span>
                </div>
                
                <div className="flex justify-between items-start py-1 border-b border-white/5">
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider mt-0.5">NGO Event</span>
                  <span className="font-bold text-foreground text-right max-w-[240px]">{certificate.event_title}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Category</span>
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                    {certificate.event_category}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Completion Date</span>
                  <span className="font-semibold text-foreground">{formatDate(certificate.event_date)}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Verification Code</span>
                  <code className="font-mono bg-background px-2 py-0.5 rounded font-bold text-foreground">
                    {certificate.verification_code}
                  </code>
                </div>
              </div>

              <div className="text-xs text-muted-foreground italic text-center px-4 leading-relaxed">
                This credential was automatically generated and locked upon administrator approval of volunteer participation on VolunteerHub.
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-white/5 pt-6">
              <Link href="/">
                <Button className="w-full sm:w-auto">Go to Homepage</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card className="glass border-destructive/20 shadow-lg shadow-destructive/5 rounded-3xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4 border border-destructive/20">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <span className="text-xs font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Invalid Code
              </span>
              <CardTitle className="text-2xl font-extrabold tracking-tight mt-4">
                Verification Failed
              </CardTitle>
              <CardDescription className="text-xs">
                No certificate matches this verification code
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6 text-sm text-muted-foreground">
              The verification code <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-semibold font-mono">{code}</code> is invalid, has been revoked, or does not exist in our registry. Please check the code and try again.
            </CardContent>
            <CardFooter className="flex justify-center border-t border-white/5 pt-6">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
