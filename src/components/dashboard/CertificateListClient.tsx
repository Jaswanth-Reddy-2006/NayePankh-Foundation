"use client";

import React from "react";
import { ICertificate, IEvent } from "@/types";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, CheckCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

interface CertificateListClientProps {
  certificates: ICertificate[];
  volunteerName: string;
}

export default function CertificateListClient({
  certificates,
  volunteerName,
}: CertificateListClientProps) {
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const downloadPDF = async (cert: ICertificate) => {
    const event = cert.eventId as unknown as IEvent;
    if (!event) return;

    setDownloading(cert._id);

    // Get QR Code canvas data URL
    const qrCanvas = document.getElementById(`qr-${cert._id}`) as HTMLCanvasElement;
    const qrDataUrl = qrCanvas ? qrCanvas.toDataURL("image/png") : "";

    // 1. Create jsPDF instance (Landscape letter format is standard for certificates)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [842, 595], // A4 Landscape size
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // 2. Draw Borders
    doc.setDrawColor(124, 58, 237); // Violet-600
    doc.setLineWidth(10);
    doc.rect(15, 15, width - 30, height - 30); // Outer border

    doc.setDrawColor(229, 231, 235); // Light Gray
    doc.setLineWidth(2);
    doc.rect(23, 23, width - 46, height - 46); // Inner thin border

    // Decorative corners
    doc.setFillColor(124, 58, 237);
    doc.triangle(15, 15, 45, 15, 15, 45); // Top Left
    doc.triangle(width - 15, 15, width - 45, 15, width - 15, 45); // Top Right
    doc.triangle(15, height - 15, 45, height - 15, 15, height - 45); // Bottom Left
    doc.triangle(width - 15, height - 15, width - 45, height - 15, width - 15, height - 45); // Bottom Right

    // 3. Certificate Title Headers
    doc.setTextColor(17, 24, 39); // Gray 900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("NAYEPANKH FOUNDATION", width / 2, 70, { align: "center" });

    doc.setTextColor(124, 58, 237); // Violet-600
    doc.setFontSize(32);
    doc.text("CERTIFICATE OF APPRECIATION", width / 2, 120, { align: "center" });

    doc.setTextColor(75, 85, 99); // Gray 600
    doc.setFont("helvetica", "italic");
    doc.setFontSize(16);
    doc.text("This certificate is proudly presented to", width / 2, 170, { align: "center" });

    // Volunteer Name (Bold, Underlined)
    doc.setTextColor(17, 24, 39); // Gray 900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text(volunteerName.toUpperCase(), width / 2, 215, { align: "center" });

    // Underline
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(1.5);
    doc.line(width / 2 - 120, 222, width / 2 + 120, 222);

    // Body text
    doc.setTextColor(75, 85, 99); // Gray 600
    doc.setFont("helvetica", "normal");
    doc.setFontSize(15);
    doc.text(
      `in recognition of their dedicated service and outstanding contribution as a volunteer in the event`,
      width / 2,
      270,
      { align: "center" }
    );

    doc.setTextColor(17, 24, 39); // Gray 900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`"${event.title}"`, width / 2, 310, { align: "center" });

    doc.setTextColor(75, 85, 99); // Gray 600
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`held on ${formatDate(event.date)} at ${event.venue}`, width / 2, 345, {
      align: "center",
    });

    // 4. Verification QR Code
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", width / 2 - 40, 390, 80, 80);
      
      doc.setTextColor(107, 114, 128); // Gray 500
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Verification Code: ${cert.verificationCode}`, width / 2, 485, { align: "center" });
      doc.text("Scan QR to verify authenticity", width / 2, 497, { align: "center" });
    }

    // 5. Signatures
    // Left Signature
    doc.setDrawColor(156, 163, 175); // Gray 400
    doc.setLineWidth(1);
    doc.line(80, 470, 220, 470);
    doc.setTextColor(75, 85, 99); // Gray 600
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Prashant Shukla", 150, 485, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("President, NayePankh Foundation", 150, 497, { align: "center" });

    // Right Signature
    doc.line(width - 220, 470, width - 80, 470);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("NGO Coordinator", width - 150, 485, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Volunteer Operations Lead", width - 150, 497, { align: "center" });

    // 6. Save PDF
    doc.save(`Certificate_${event.title.replace(/\s+/g, "_")}.pdf`);
    setDownloading(null);
  };

  return (
    <div className="space-y-6">
      {/* Hidden QR Code Canvas generation */}
      <div className="hidden">
        {certificates.map((cert) => {
          // Verification link
          const verifyUrl = `${window.location.origin}/verify/${cert.verificationCode}`;
          return (
            <QRCodeCanvas
              key={cert._id}
              id={`qr-${cert._id}`}
              value={verifyUrl}
              size={128}
              level="H"
            />
          );
        })}
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const event = cert.eventId as unknown as IEvent;
            if (!event) return null;
            return (
              <Card key={cert._id} className="overflow-hidden flex flex-col hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-primary/10 text-primary w-fit px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {event.category}
                    </span>
                    <CardTitle className="text-lg font-bold mt-2">{event.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Issued on {formatDate(cert.issueDate)}
                    </CardDescription>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Award className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span>Verification Code:</span>
                      <code className="font-mono bg-background px-1.5 py-0.5 rounded text-foreground font-semibold">
                        {cert.verificationCode}
                      </code>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span>Issuer:</span>
                      <span className="font-semibold text-foreground">NayePankh Foundation</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-1/2 flex items-center justify-center space-x-1.5"
                      onClick={() => window.open(`/verify/${cert.verificationCode}`, "_blank")}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verify Online</span>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </Button>
                    <Button
                      size="sm"
                      className="w-1/2 flex items-center justify-center space-x-1.5"
                      disabled={downloading === cert._id}
                      onClick={() => downloadPDF(cert)}
                    >
                      <Download className="h-4 w-4" />
                      <span>{downloading === cert._id ? "Downloading..." : "Download PDF"}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center text-muted-foreground">
          You haven&apos;t earned any certificates yet. Complete an event and get approved by administrators to generate your certificate!
        </Card>
      )}
    </div>
  );
}
