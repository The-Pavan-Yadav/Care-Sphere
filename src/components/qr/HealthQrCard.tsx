import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Download,
  Printer,
  RefreshCw,
  ShieldCheck,
  Lock,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Eye,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { useStore, Patient, PatientQrToken } from "../../lib/Store";

interface HealthQrCardProps {
  patient: Patient;
  onOpenVerification?: (token: PatientQrToken) => void;
}

export default function HealthQrCard({ patient, onOpenVerification }: HealthQrCardProps) {
  const { patientQrTokens, getOrCreateQrToken, regenerateQrToken, logAction } = useStore();
  const [currentToken, setCurrentToken] = useState<PatientQrToken | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch or initialize QR token for this patient
  useEffect(() => {
    let mounted = true;
    const fetchToken = async () => {
      setLoading(true);
      try {
        const token = await getOrCreateQrToken(patient);
        if (mounted) {
          setCurrentToken(token);
        }
      } catch (err) {
        console.error("Error loading QR token:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchToken();
    return () => {
      mounted = false;
    };
  }, [patient.aadhaar, patientQrTokens]);

  // Generate QR Code data URL whenever token changes
  useEffect(() => {
    if (!currentToken) return;

    // Secure payload: Direct verification URL pointing to the app's verification endpoint
    // We encode ONLY the verification link with the secure token, NOT patient's sensitive medical records
    const verifyUrl = `${window.location.origin}/verify-patient?token=${encodeURIComponent(currentToken.tokenId)}`;

    QRCode.toDataURL(verifyUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: "#0f172a", // Dark navy/slate
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate QR code:", err);
      });
  }, [currentToken]);

  const handleCopyHealthId = () => {
    navigator.clipboard.writeText(patient.aadhaar);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyToken = () => {
    if (!currentToken) return;
    navigator.clipboard.writeText(currentToken.tokenId);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `CareSphere-HealthQR-${patient.name.replace(/\s+/g, "_")}-${patient.aadhaar}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction("QR_DOWNLOADED", "Patient", `Downloaded Health QR for ${patient.aadhaar}`);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !currentToken) return;

    const formattedDate = new Date(currentToken.updatedAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CareSphere Digital Health QR - ${patient.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #0f172a;
              text-align: center;
              background: #f8fafc;
            }
            .card {
              max-width: 420px;
              margin: 0 auto;
              background: #ffffff;
              border: 2px solid #0f2b5c;
              border-radius: 8px;
              padding: 24px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .badge {
              display: inline-block;
              background: #eff6ff;
              color: #1e3a8a;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 4px 10px;
              border-radius: 4px;
              margin-bottom: 12px;
              border: 1px solid #bfdbfe;
            }
            h1 {
              font-size: 20px;
              margin: 4px 0 2px;
              color: #0f172a;
            }
            .health-id {
              font-family: monospace;
              font-size: 15px;
              font-weight: 600;
              color: #1e3a8a;
              margin-bottom: 16px;
            }
            .qr-wrapper {
              background: #ffffff;
              padding: 12px;
              display: inline-block;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              margin: 10px 0;
            }
            .qr-wrapper img {
              display: block;
              width: 220px;
              height: 220px;
            }
            .scan-text {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              margin: 10px 0 4px;
            }
            .notice {
              font-size: 11px;
              color: #64748b;
              line-height: 1.4;
              max-width: 320px;
              margin: 0 auto 14px;
            }
            .meta {
              font-size: 10px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">National Health Authority • CareSphere</div>
            <h1>${patient.name}</h1>
            <div class="health-id">CareSphere ID: ${patient.aadhaar}</div>
            
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" alt="CareSphere Health QR" />
            </div>

            <div class="scan-text">Scan to securely verify patient</div>
            <div class="notice">
              Encodes cryptographically signed verification token. Patient medical records remain protected under consent policy.
            </div>

            <div class="meta">
              Token Ref: ${currentToken.tokenId}<br/>
              Generated: ${formattedDate}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    logAction("QR_PRINTED", "Patient", `Printed Health QR for ${patient.aadhaar}`);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setShowRegenConfirm(false);
    try {
      const newToken = await regenerateQrToken(patient);
      setCurrentToken(newToken);
    } catch (err) {
      console.error("Failed to regenerate QR token:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const formattedTimestamp = currentToken?.updatedAt
    ? new Date(currentToken.updatedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div
        ref={cardRef}
        className="bg-white border-2 border-blue-900/20 rounded-sm shadow-sm overflow-hidden max-w-xl mx-auto"
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 rounded-sm border border-white/20 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-blue-200" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-blue-200 block font-semibold">
                CareSphere Digital Health Exchange
              </span>
              <h3 className="text-lg font-bold leading-tight tracking-tight">Verified Patient Identity</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-sm text-xs font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 text-center bg-gradient-to-b from-white to-slate-50/50">
          {/* Patient Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
            
            {/* Health ID Chip */}
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-sm">
              <span className="text-xs font-medium text-slate-500">CareSphere Health ID:</span>
              <span className="font-mono text-sm font-bold text-blue-900">{patient.aadhaar}</span>
              <button
                type="button"
                onClick={handleCopyHealthId}
                title="Copy Health ID"
                className="text-blue-700 hover:text-blue-900 p-0.5 rounded transition-colors"
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Demographics row */}
            <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
              <span>DOB: <strong className="text-slate-700">{patient.dob}</strong></span>
              <span>•</span>
              <span>Gender: <strong className="text-slate-700">{patient.gender}</strong></span>
              <span>•</span>
              <span>Blood: <strong className="text-slate-700">{patient.bloodGroup}</strong></span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative inline-block my-2">
            <div className="p-3 bg-white border-2 border-slate-200 rounded-sm shadow-inner">
              {loading || regenerating ? (
                <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-50">
                  <RefreshCw className="h-8 w-8 text-blue-900 animate-spin mb-2" />
                  <span className="text-xs font-semibold text-slate-500">Generating Secure Token...</span>
                </div>
              ) : qrDataUrl ? (
                <div className="relative group">
                  <img
                    src={qrDataUrl}
                    alt={`CareSphere QR Code for ${patient.name}`}
                    className="w-56 h-56 object-contain block mx-auto"
                  />
                  <div className="absolute inset-0 bg-blue-950/0 group-hover:bg-blue-950/5 transition-colors pointer-events-none rounded-sm" />
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center bg-slate-50 text-xs text-slate-500">
                  Unable to load QR Code
                </div>
              )}
            </div>

            {/* Security Emblem Centered on QR */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-blue-900 text-white p-1 rounded-full border-2 border-white shadow-sm">
              <Lock className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Verification Text */}
          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-900">
              <UserCheck className="h-4 w-4 text-blue-900" />
              <span>Scan to securely verify patient</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Contains a cryptographic verification token only. Clinical records remain protected and require verified consent.
            </p>
          </div>

          {/* Token Reference & Timestamp */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400">Token:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={currentToken?.tokenId}>
                {currentToken?.tokenId || "CSTOK-..."}
              </span>
              <button
                type="button"
                onClick={handleCopyToken}
                className="text-slate-400 hover:text-slate-700"
                title="Copy Token String"
              >
                {copiedToken ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>Updated: {formattedTimestamp}</span>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || !qrDataUrl}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-blue-900 bg-white border border-blue-200 hover:bg-blue-50 transition-colors rounded-sm shadow-2xs disabled:opacity-50"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Download QR
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !qrDataUrl}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors rounded-sm shadow-2xs disabled:opacity-50"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print QR
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenVerification && currentToken && (
              <button
                type="button"
                onClick={() => onOpenVerification(currentToken)}
                className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm shadow-2xs"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" /> Test Provider Scan
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowRegenConfirm(true)}
              disabled={loading || regenerating}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-sm border border-transparent hover:border-red-200"
              title="Regenerate Token (Revokes previous QR)"
            >
              <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin text-blue-900" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Regeneration Confirmation Modal */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm border border-slate-300 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-sm border border-amber-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Regenerate Health QR Code?</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Regenerating will immediately revoke your existing QR token and issue a fresh one in Firebase. Any physical printouts or previously saved images will no longer pass verification.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRegenConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-sm"
              >
                Keep Current QR
              </button>
              <button
                type="button"
                onClick={handleRegenerate}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-sm"
              >
                Revoke & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
