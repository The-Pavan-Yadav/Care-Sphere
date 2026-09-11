import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  UserCheck,
  Building2,
  Calendar,
  AlertTriangle,
  FileText,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  HeartPulse,
  Share2,
  Search
} from "lucide-react";
import { useStore, Patient, Doctor, Hospital, PatientQrToken } from "../../lib/Store";

export default function PatientVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenQuery = searchParams.get("token") || "";

  const {
    patientQrTokens,
    patients,
    doctors,
    hospitals,
    accessPermissions,
    recordQrScan,
    requestAccess,
    grantAccess,
    hasAccess,
    logAction
  } = useStore();

  const [inputToken, setInputToken] = useState(tokenQuery);
  const [activeTokenString, setActiveTokenString] = useState(tokenQuery);

  // Selected viewer/provider for verification simulation
  const [selectedProviderType, setSelectedProviderType] = useState<"doctor" | "hospital">("doctor");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("PRV-1029"); // Dr. Robert Smith
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("HOSP-001");

  // Access request form state
  const [requestPurpose, setRequestPurpose] = useState("Outpatient Consultation & Evaluation");
  const [requestLevel, setRequestLevel] = useState<"Standard_Records" | "Full_Chart">("Standard_Records");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState("");

  // Break glass emergency state
  const [showBreakGlass, setShowBreakGlass] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState("");
  const [breakGlassSubmitting, setBreakGlassSubmitting] = useState(false);

  useEffect(() => {
    if (tokenQuery) {
      setInputToken(tokenQuery);
      setActiveTokenString(tokenQuery);
    }
  }, [tokenQuery]);

  // Find matching token in Firestore
  const matchedToken = useMemo(() => {
    if (!activeTokenString) return null;
    return patientQrTokens.find(
      (t) => t.tokenId.trim().toLowerCase() === activeTokenString.trim().toLowerCase()
    );
  }, [patientQrTokens, activeTokenString]);

  // Find matching patient
  const matchedPatient = useMemo(() => {
    if (!matchedToken) return null;
    return patients.find((p) => p.aadhaar === matchedToken.patientAadhaar) || null;
  }, [matchedToken, patients]);

  // Record QR scan on first load
  useEffect(() => {
    if (matchedToken && matchedToken.status === "Active") {
      const viewer = selectedProviderType === "doctor" ? `Dr. ${selectedDoctorId}` : `Facility ${selectedHospitalId}`;
      recordQrScan(matchedToken.tokenId, "Healthcare Provider", viewer);
    }
  }, [matchedToken?.tokenId]);

  const currentDoctor = doctors.find((d) => d.medicalId === selectedDoctorId);
  const currentHospital = hospitals.find((h) => h.hospitalId === selectedHospitalId);

  // Check if current doctor or hospital has access
  const activeGranteeId = selectedProviderType === "doctor" ? selectedDoctorId : selectedHospitalId;
  const activeGranteeName = selectedProviderType === "doctor" ? currentDoctor?.name || selectedDoctorId : currentHospital?.name || selectedHospitalId;

  const currentPermission = useMemo(() => {
    if (!matchedPatient) return null;
    return accessPermissions.find(
      (p) => p.patientAadhaar === matchedPatient.aadhaar && p.granteeId === activeGranteeId
    );
  }, [accessPermissions, matchedPatient, activeGranteeId]);

  const isGlobalAccessAllowed = useMemo(() => {
    if (!matchedPatient) return false;
    return accessPermissions.some(
      (p) => p.patientAadhaar === matchedPatient.aadhaar && p.granteeId === "ALL_AFFILIATED" && p.status === "Active"
    );
  }, [accessPermissions, matchedPatient]);

  const hasAuthorizedAccess = (currentPermission && currentPermission.status === "Active") || isGlobalAccessAllowed;
  const isPendingRequest = currentPermission && currentPermission.status === "Pending";

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      setActiveTokenString(inputToken.trim());
    }
  };

  const handleSendAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedPatient) return;
    setRequestSubmitting(true);

    try {
      await requestAccess(
        matchedPatient.aadhaar,
        activeGranteeId,
        activeGranteeName,
        selectedProviderType === "doctor" ? "Doctor" : "Hospital",
        requestPurpose
      );
      setRequestSuccessMessage(`Access request for ${activeGranteeName} submitted to patient. Awaiting confirmation.`);
      setTimeout(() => setRequestSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error requesting access:", err);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleBreakGlassOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedPatient || !breakGlassReason.trim()) return;
    setBreakGlassSubmitting(true);

    try {
      await grantAccess(
        matchedPatient.aadhaar,
        activeGranteeId,
        `${activeGranteeName} (Emergency Break-Glass)`,
        selectedProviderType === "doctor" ? "Doctor" : "Hospital",
        "Full_Chart",
        `EMERGENCY OVERRIDE: ${breakGlassReason}`
      );
      logAction(
        "EMERGENCY_BREAK_GLASS_ACCESS",
        activeGranteeName,
        `Emergency override access invoked for patient ${matchedPatient.aadhaar}. Reason: ${breakGlassReason}`
      );
      setShowBreakGlass(false);
      setBreakGlassReason("");
    } catch (err) {
      console.error("Failed emergency override:", err);
    } finally {
      setBreakGlassSubmitting(false);
    }
  };

  const handleOpenClinicalChart = () => {
    // Navigate to Provider Dashboard with patient selected
    navigate(`/provider?patientAadhaar=${matchedPatient?.aadhaar}&doctorId=${selectedDoctorId}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-900 font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-blue-900" />
              CareSphere National Health Exchange
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Patient Identity Verification</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/provider"
              className="text-xs font-bold text-slate-600 hover:text-blue-900 bg-white border border-slate-200 px-3 py-2 rounded-sm transition-colors shadow-2xs"
            >
              Provider Portal
            </Link>
            <Link
              to="/patient"
              className="text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 px-3 py-2 rounded-sm transition-colors shadow-2xs"
            >
              Patient Portal
            </Link>
          </div>
        </div>

        {/* Verification Token Bar (Search / Verify alternate token) */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-2xs">
          <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Enter or paste CareSphere QR Token (e.g. CSTOK-849249108432-...)"
                className="w-full pl-9 pr-4 py-2 text-xs font-mono border border-slate-300 rounded-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm"
            >
              Verify Token
            </button>
          </form>

          {/* Quick sample tokens for testing */}
          {patientQrTokens.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0">
                Quick Test Tokens:
              </span>
              {patientQrTokens.slice(0, 3).map((t) => (
                <button
                  key={t.tokenId}
                  type="button"
                  onClick={() => {
                    setInputToken(t.tokenId);
                    setActiveTokenString(t.tokenId);
                  }}
                  className={`text-[11px] font-mono px-2 py-1 rounded-sm border transition-colors flex-shrink-0 ${
                    activeTokenString === t.tokenId
                      ? "bg-blue-50 border-blue-300 text-blue-900 font-bold"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {t.patientName} ({t.tokenId.slice(0, 14)}...)
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Invalid or Missing Token State */}
        {(!matchedToken || matchedToken.status === "Revoked" || !matchedPatient) && (
          <div className="bg-white border-2 border-red-200 rounded-sm p-8 text-center shadow-sm">
            <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {matchedToken && matchedToken.status === "Revoked"
                ? "QR Token Revoked by Patient"
                : "Invalid or Unrecognized QR Token"}
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              {matchedToken && matchedToken.status === "Revoked"
                ? "This QR code has been superseded or revoked by the patient. Please ask the patient to generate and present an updated Health QR code from their portal."
                : "The provided verification token could not be resolved in the CareSphere registry. Ensure the QR code was generated by a registered patient account."}
            </p>

            {matchedToken && (
              <div className="mt-4 inline-block font-mono text-xs bg-slate-100 px-3 py-1.5 rounded text-slate-600">
                Token: {matchedToken.tokenId} (Status: {matchedToken.status})
              </div>
            )}
          </div>
        )}

        {/* Valid Verified Patient Screen */}
        {matchedToken && matchedToken.status === "Active" && matchedPatient && (
          <div className="space-y-6">
            
            {/* Top Verification Badge */}
            <div className="bg-emerald-900 text-white p-5 rounded-sm shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-7 w-7 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
                      Identity Confirmed
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-[10px] font-bold rounded-sm uppercase tracking-wide">
                      Active
                    </span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight mt-0.5">CareSphere Verified Patient Record</h2>
                </div>
              </div>

              <div className="text-right text-xs text-emerald-200 font-mono">
                <div>Scan Verified #{matchedToken.scanCount || 1}</div>
                <div className="text-[10px] text-emerald-300">
                  {new Date().toLocaleTimeString()} • Encrypted TLS
                </div>
              </div>
            </div>

            {/* Patient Basic Identity Card */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-900" /> Basic Patient Demographics
                </h3>
                <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-sm">
                  ID: {matchedPatient.aadhaar}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                  <span className="block text-base font-bold text-slate-900 mt-1">{matchedPatient.name}</span>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth / Age</span>
                  <span className="block text-sm font-semibold text-slate-900 mt-1">
                    {matchedPatient.dob}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Gender / Blood Group</span>
                  <span className="block text-sm font-semibold text-slate-900 mt-1">
                    {matchedPatient.gender} • <strong className="text-red-700">{matchedPatient.bloodGroup}</strong>
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</span>
                  <span className="block text-sm font-semibold text-slate-900 mt-1">
                    {matchedPatient.emergencyContact || "None listed"}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Address</span>
                  <span className="block text-sm text-slate-700 mt-1">{matchedPatient.address}</span>
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Known Critical Allergies</span>
                  {matchedPatient.allergies && matchedPatient.allergies !== "None" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 bg-red-50 text-red-700 border border-red-200 rounded-sm text-xs font-bold">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600" /> {matchedPatient.allergies}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 mt-1 block">No known allergies reported</span>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Records Access & Consent Gate */}
            <div className="bg-white border-2 border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-5 w-5 text-blue-300" />
                  <h3 className="text-base font-bold">Medical Records Authorization & Consent Status</h3>
                </div>
                <span className="text-xs font-mono text-blue-200">
                  CareSphere Privacy Protocol v2.4
                </span>
              </div>

              {/* Explanatory Banner */}
              <div className="bg-blue-50/70 border-b border-blue-100 p-4 px-6 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-900 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-950 leading-relaxed">
                  <strong>Consent Architecture Enforced:</strong> Scanning the patient's QR code confirms identity at front desk/triage. In accordance with patient privacy regulations, clinical encounters, diagnostic reports, and prescriptions remain locked until authorized by patient consent.
                </p>
              </div>

              {/* Provider Identity Simulator */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Scanning Provider Profile:
                    </span>
                    <div className="mt-1 flex items-center gap-3">
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="text-xs font-semibold bg-white border border-slate-300 rounded-sm px-3 py-1.5 focus:border-blue-900 focus:outline-none"
                      >
                        {doctors.map((d) => (
                          <option key={d.medicalId} value={d.medicalId}>
                            {d.name} ({d.specialty})
                          </option>
                        ))}
                      </select>

                      <span className="text-xs text-slate-400">at</span>

                      <select
                        value={selectedHospitalId}
                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                        className="text-xs font-semibold bg-white border border-slate-300 rounded-sm px-3 py-1.5 focus:border-blue-900 focus:outline-none"
                      >
                        {hospitals.map((h) => (
                          <option key={h.hospitalId} value={h.hospitalId}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Access Status:</span>
                    {hasAuthorizedAccess ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-sm text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Authorized
                      </span>
                    ) : isPendingRequest ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-sm text-xs font-bold">
                        <Clock className="h-4 w-4 text-amber-600" /> Approval Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-sm text-xs font-bold">
                        <Lock className="h-4 w-4 text-slate-500" /> Not Granted
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Outcome Area */}
              <div className="p-6">
                {hasAuthorizedAccess ? (
                  /* AUTHORIZED STATE */
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm flex items-start gap-4">
                      <div className="p-2 bg-emerald-600 text-white rounded-sm">
                        <Unlock className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-emerald-950">
                          Clinical Records Access Active
                        </h4>
                        <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                          Patient {matchedPatient.name} has granted permission to {activeGranteeName}. You are authorized to review encounters, lab reports, vitals history, and prescribe medications.
                        </p>
                        {currentPermission?.purpose && (
                          <p className="text-xs text-emerald-700 font-mono mt-2">
                            Authorization Purpose: {currentPermission.purpose}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleOpenClinicalChart}
                        className="inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm shadow-sm"
                      >
                        Open Clinical Chart in Provider Portal <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : isPendingRequest ? (
                  /* PENDING REQUEST STATE */
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm flex items-start gap-4">
                      <div className="p-2 bg-amber-600 text-white rounded-sm">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-amber-950">
                          Access Request Pending Patient Consent
                        </h4>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          A digital access request from {activeGranteeName} is currently awaiting approval in the patient's CareSphere portal. The patient can approve it from their "My Health QR" or "Share / Grant Access" tab.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBreakGlass(true)}
                        className="text-xs font-bold text-red-700 hover:text-red-900 underline"
                      >
                        Invoke Emergency Break-Glass Override
                      </button>

                      <Link
                        to="/patient"
                        className="text-xs font-bold text-blue-900 hover:underline inline-flex items-center"
                      >
                        Switch to Patient Portal to Approve <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* RESTRICTED / REQUEST ACCESS STATE */
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm flex items-start gap-4">
                      <div className="p-2 bg-slate-800 text-white rounded-sm">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">
                          Access to Medical Records Restricted
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {activeGranteeName} is not yet on {matchedPatient.name}'s authorized care team. To access past encounters, lab reports, and medication histories, submit an access request below or ask the patient to approve sharing in their CareSphere portal.
                        </p>
                      </div>
                    </div>

                    {/* Request Access Form */}
                    <form onSubmit={handleSendAccessRequest} className="bg-white border border-slate-200 p-5 rounded-sm space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Submit Patient Records Access Request
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Clinical Purpose *
                          </label>
                          <select
                            value={requestPurpose}
                            onChange={(e) => setRequestPurpose(e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 focus:border-blue-900 focus:outline-none"
                          >
                            <option value="Outpatient Consultation & Evaluation">Outpatient Consultation & Evaluation</option>
                            <option value="Inpatient Admission & Triage">Inpatient Admission & Triage</option>
                            <option value="Specialist Referral Assessment">Specialist Referral Assessment</option>
                            <option value="Prescription & Medication Review">Prescription & Medication Review</option>
                            <option value="Diagnostic Lab / Radiology Review">Diagnostic Lab / Radiology Review</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Requested Access Level
                          </label>
                          <select
                            value={requestLevel}
                            onChange={(e) => setRequestLevel(e.target.value as any)}
                            className="w-full text-xs border border-slate-300 rounded-sm px-3 py-2 focus:border-blue-900 focus:outline-none"
                          >
                            <option value="Standard_Records">Standard Clinical Records & Labs</option>
                            <option value="Full_Chart">Comprehensive Chart & History</option>
                          </select>
                        </div>
                      </div>

                      {requestSuccessMessage && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-sm">
                          {requestSuccessMessage}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowBreakGlass(true)}
                          className="text-xs font-bold text-red-700 hover:text-red-900 underline"
                        >
                          Emergency Break-Glass Override
                        </button>

                        <button
                          type="submit"
                          disabled={requestSubmitting}
                          className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm shadow-2xs disabled:opacity-50"
                        >
                          <Share2 className="mr-1.5 h-3.5 w-3.5" />
                          {requestSubmitting ? "Submitting Request..." : "Request Access from Patient"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Break-Glass Modal */}
            {showBreakGlass && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                <div className="bg-white rounded-sm border-2 border-red-300 max-w-lg w-full p-6 shadow-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-red-100 text-red-700 rounded-sm">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-red-950">Emergency Break-Glass Protocol</h3>
                      <p className="text-xs text-red-700 font-mono mt-0.5">
                        SECURITY AUDIT ALERT • IMMUTABLE RECORD
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                    This protocol overrides patient consent under emergency medical provisions (e.g. unconscious patient, life-threatening trauma). All break-glass events are cryptographically logged in Firebase and flagged for medical auditor review.
                  </p>

                  <form onSubmit={handleBreakGlassOverride} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Documented Emergency Clinical Justification *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={breakGlassReason}
                        onChange={(e) => setBreakGlassReason(e.target.value)}
                        placeholder="State specific medical emergency justification (e.g. Unconscious patient presented at ED with acute cardiovascular distress)..."
                        className="w-full text-xs border border-slate-300 rounded-sm p-3 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBreakGlass(false)}
                        className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-100 rounded-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={breakGlassSubmitting || !breakGlassReason.trim()}
                        className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors rounded-sm shadow-sm disabled:opacity-50"
                      >
                        {breakGlassSubmitting ? "Invoking Override..." : "Confirm & Unlock Emergency Records"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
