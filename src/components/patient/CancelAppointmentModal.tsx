import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useStore, Appointment } from "../../lib/Store";

interface CancelAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onSuccess
}: CancelAppointmentModalProps) {
  const { cancelAppointment } = useStore();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    try {
      await cancelAppointment(appointment.id, reason.trim() || "Cancelled by patient request");
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Cancel error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-sm shadow-xl overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50">
          <div className="flex items-center gap-2 text-rose-800">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <h3 className="text-base font-bold">Cancel Appointment</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel your scheduled appointment with{" "}
            <strong className="text-slate-900">{appointment.doctorName}</strong> at{" "}
            <strong className="text-slate-900">{appointment.hospitalName}</strong> on{" "}
            <span className="font-mono font-bold text-blue-900">{appointment.date} at {appointment.time}</span>?
          </p>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 border border-slate-200 rounded-sm">
            Once cancelled, this time slot will immediately be made available for other patients in CareSphere.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Schedule conflict, feeling better, personal emergency"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:outline-none focus:border-rose-600 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-300 rounded-sm bg-white"
          >
            Keep Appointment
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold rounded-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Cancelling..." : "Yes, Cancel Appointment"}
          </button>
        </div>

      </div>
    </div>
  );
}
