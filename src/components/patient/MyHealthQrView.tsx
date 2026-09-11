import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Building2,
  UserPlus,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Info,
  Activity
} from "lucide-react";
import { useStore, Patient, Doctor, Hospital, PatientQrToken } from "../../lib/Store";
import HealthQrCard from "../qr/HealthQrCard";

interface MyHealthQrViewProps {
  patient: Patient;
}

export default function MyHealthQrView({ patient }: MyHealthQrViewProps) {
  const navigate = useNavigate();
  const {
    doctors,
    hospitals,
    accessPermissions,
    auditLogs,
    grantAccess,
    revokeAccess,
    patientQrTokens,
    logAction
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<"qr" | "permissions" | "history">("qr");

  // Grant Access Modal / Form State
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantType, setGrantType] = useState<"Doctor" | "Hospital">("Doctor");
  const [selectedGranteeId, setSelectedGranteeId] = useState<string>("");
  const [grantLevel, setGrantLevel] = useState<"Standard_Records" | "Full_Chart">("Standard_Records");
  const [grantPurpose, setGrantPurpose] = useState<string>("Ongoing Care & Consultation");
  const [grantSubmitting, setGrantSubmitting] = useState(false);

  // Active token for this patient
  const currentToken = useMemo(() => {
    return patientQrTokens.find(
      (t) => t.patientAadhaar === patient.aadhaar && t.status === "Active"
    ) || null;
  }, [patientQrTokens, patient.aadhaar]);

  // Active permissions for this patient
  const patientPermissions = useMemo(() => {
    return accessPermissions.filter((p) => p.patientAadhaar === patient.aadhaar);
  }, [accessPermissions, patient.aadhaar]);

  const activePermissions = useMemo(() => {
    return patientPermissions.filter((p) => p.status === "Active");
  }, [patientPermissions]);

  const pendingRequests = useMemo(() => {
    return patientPermissions.filter((p) => p.status === "Pending");
  }, [patientPermissions]);

  // Scan activity logs for this patient
  const qrAuditLogs = useMemo(() => {
    return auditLogs.filter(
      (l) =>
        (l.action.includes("QR") || l.action.includes("ACCESS")) &&
        (l.details.includes(patient.aadhaar) || (currentToken && l.details.includes(currentToken.tokenId)))
    );
  }, [auditLogs, patient.aadhaar, currentToken]);

  const handleOpenVerification = (token: PatientQrToken) => {
    navigate(`/verify-patient?token=${encodeURIComponent(token.tokenId)}`);
  };

  const handleApproveRequest = async (permissionId: string, granteeName: string) => {
    const existing = accessPermissions.find((p) => p.id === permissionId);
    if (!existing) return;
    await grantAccess(
      existing.patientAadhaar,
      existing.granteeId,
      existing.granteeName,
      existing.granteeType,
      existing.accessLevel,
      existing.purpose
    );
  };

  const handleDenyRequest = async (permissionId: string) => {
    await revokeAccess(permissionId);
  };

  const handleRevokePermission = async (permissionId: string, granteeName: string) => {
    if (window.confirm(`Are you sure you want to revoke medical record access from ${granteeName}?`)) {
      await revokeAccess(permissionId);
    }
  };

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGranteeId) return;
    setGrantSubmitting(true);

    try {
      let granteeName = "";
      if (grantType === "Doctor") {
        const doc = doctors.find((d) => d.medicalId === selectedGranteeId);
        granteeName = doc ? `${doc.name} (${doc.specialty})` : selectedGranteeId;
      } else {
        const hosp = hospitals.find((h) => h.hospitalId === selectedGranteeId);
        granteeName = hosp ? hosp.name : selectedGranteeId;
      }

      await grantAccess(
        patient.aadhaar,
        selectedGranteeId,
        granteeName,
        grantType,
        grantLevel,
        grantPurpose
      );

      setShowGrantModal(false);
      setSelectedGranteeId("");
    } catch (err) {
      console.error("Error creating grant:", err);
    } finally {
      setGrantSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header Banner */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-900 mb-1">
            <QrCode className="h-4 w-4" />
            CareSphere Identity & Access Architecture
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Health QR & Consent Control</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Your unique, cryptographically signed digital Health QR. Healthcare providers scan this code to securely verify your identity. Access to your medical records is strictly governed by your explicit consent.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("qr")}
            className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${
              activeSubTab === "qr"
                ? "bg-white text-blue-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Digital QR Code
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("permissions")}
            className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors relative ${
              activeSubTab === "permissions"
                ? "bg-white text-blue-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Access Permissions
            {pendingRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("history")}
            className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${
              activeSubTab === "history"
                ? "bg-white text-blue-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Scan Audit Logs
          </button>
        </div>
      </div>

      {/* Pending Access Approval Alert (if any doctor requested access) */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-sm">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                {pendingRequests.length} Pending Doctor Access Request{pendingRequests.length > 1 ? "s" : ""}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Healthcare providers have requested permission to review your medical records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveSubTab("permissions")}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-sm transition-colors shadow-2xs"
          >
            Review & Approve
          </button>
        </div>
      )}

      {/* TAB 1: QR CODE VIEW */}
      {activeSubTab === "qr" && (
        <div className="space-y-8">
          <HealthQrCard patient={patient} onOpenVerification={handleOpenVerification} />

          {/* Privacy & Architectural Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="p-4 bg-white border border-slate-200 rounded-sm">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                <Lock className="h-4 w-4" /> Zero-Exposure QR
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Raw clinical data is never encoded inside the QR image. The code contains only a cryptographically signed verification endpoint token.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-sm">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" /> Consent Gate
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scanning the QR confirms patient identity for check-in. Medical records remain locked until you approve access or link your provider.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-sm">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                <KeyRound className="h-4 w-4" /> Instant Revocation
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If your physical QR card is lost or misplaced, regenerate it at any time to immediately invalidate previous tokens across all hospitals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCESS PERMISSIONS & CONSENT MANAGER */}
      {activeSubTab === "permissions" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Authorized Care Team & Facilities</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage which doctors and hospitals are permitted to view your clinical records and prescriptions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedGranteeId(doctors[0]?.medicalId || "");
                setShowGrantModal(true);
              }}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm shadow-2xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Grant Access to Provider
            </button>
          </div>

          {/* Pending Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="border border-amber-300 bg-amber-50/50 rounded-sm overflow-hidden">
              <div className="bg-amber-100/70 px-5 py-3 border-b border-amber-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-700" /> Pending Access Requests ({pendingRequests.length})
                </h3>
              </div>
              <div className="divide-y divide-amber-200">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{req.granteeName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-sm">
                          {req.granteeType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Purpose: <span className="font-semibold text-slate-800">{req.purpose}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Requested: {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : "Recently"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleDenyRequest(req.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-sm"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveRequest(req.id, req.granteeName)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-sm shadow-2xs"
                      >
                        Approve Access
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Authorizations Table */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Medical Records Permissions ({activePermissions.length})
              </h3>
            </div>

            {activePermissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No active provider permissions. Doctors who scan your QR code will be restricted to identity verification until you grant access.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activePermissions.map((perm) => (
                  <div key={perm.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{perm.granteeName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm font-semibold">
                          {perm.granteeType}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-sm">
                          {perm.accessLevel === "Full_Chart" ? "Full Clinical Chart" : "Standard Records"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Purpose: <span className="font-medium text-slate-800">{perm.purpose}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Granted: {new Date(perm.grantedAt).toLocaleDateString()} at {new Date(perm.grantedAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleRevokePermission(perm.id, perm.granteeName)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-sm transition-colors"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Revoke Access
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QR SCAN AUDIT LOGS */}
      {activeSubTab === "history" && (
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Cryptographic Scan & Access Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every scan and authorization event is immutably recorded in CareSphere Firestore.
              </p>
            </div>
            {currentToken && (
              <div className="text-right text-xs font-mono">
                <span className="text-slate-400">Total Verified Scans:</span>{" "}
                <strong className="text-blue-900">{currentToken.scanCount || 0}</strong>
              </div>
            )}
          </div>

          {qrAuditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No QR scans or access events recorded yet for this patient ID.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {qrAuditLogs.map((log) => (
                <div key={log.id} className="p-4 px-6 flex items-start justify-between gap-4 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-900">{log.action}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">{log.actor}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">{log.details}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grant Access Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm border border-slate-300 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-900" /> Grant Records Access
              </h3>
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGrant} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Provider Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGrantType("Doctor");
                      setSelectedGranteeId(doctors[0]?.medicalId || "");
                    }}
                    className={`py-2 text-xs font-bold rounded-sm border transition-colors ${
                      grantType === "Doctor"
                        ? "bg-blue-50 border-blue-900 text-blue-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGrantType("Hospital");
                      setSelectedGranteeId(hospitals[0]?.hospitalId || "");
                    }}
                    className={`py-2 text-xs font-bold rounded-sm border transition-colors ${
                      grantType === "Hospital"
                        ? "bg-blue-50 border-blue-900 text-blue-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Hospital / Facility
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select {grantType} *
                </label>
                <select
                  required
                  value={selectedGranteeId}
                  onChange={(e) => setSelectedGranteeId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 focus:border-blue-900 focus:outline-none"
                >
                  {grantType === "Doctor" ? (
                    doctors.map((d) => (
                      <option key={d.medicalId} value={d.medicalId}>
                        {d.name} — {d.specialty} ({d.medicalId})
                      </option>
                    ))
                  ) : (
                    hospitals.map((h) => (
                      <option key={h.hospitalId} value={h.hospitalId}>
                        {h.name} ({h.location})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Access Level
                </label>
                <select
                  value={grantLevel}
                  onChange={(e) => setGrantLevel(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 focus:border-blue-900 focus:outline-none"
                >
                  <option value="Standard_Records">Standard Clinical Records & Labs</option>
                  <option value="Full_Chart">Comprehensive Chart & History</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Clinical Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={grantPurpose}
                  onChange={(e) => setGrantPurpose(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 focus:border-blue-900 focus:outline-none"
                  placeholder="e.g. Cardiology consult, Annual physical, Outpatient care"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-100 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantSubmitting || !selectedGranteeId}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-sm shadow-2xs disabled:opacity-50"
                >
                  {grantSubmitting ? "Granting..." : "Confirm & Authorize"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
