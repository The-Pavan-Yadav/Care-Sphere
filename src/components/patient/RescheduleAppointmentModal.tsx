import React, { useState, useMemo } from "react";
import { X, Calendar, Clock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useStore, Appointment } from "../../lib/Store";

interface RescheduleAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

export default function RescheduleAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onSuccess
}: RescheduleAppointmentModalProps) {
  const { appointments, rescheduleAppointment } = useStore();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (appointment) return appointment.date;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate booked slots for this doctor on selectedDate
  const bookedSlots = useMemo(() => {
    if (!appointment || !selectedDate) return new Set<string>();
    const booked = appointments
      .filter(apt => 
        apt.id !== appointment.id && // exclude current appointment
        apt.doctorId === appointment.doctorId && 
        apt.date === selectedDate && 
        apt.status !== 'Cancelled'
      )
      .map(apt => apt.time);
    return new Set(booked);
  }, [appointments, appointment, selectedDate]);

  if (!isOpen || !appointment) return null;

  // Generate 14 selectable upcoming dates
  const availableDatesList = Array.from({ length: 14 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const dayNum = d.getDate();
    return {
      dateStr,
      dayName,
      monthName,
      dayNum,
      isToday: index === 0
    };
  });

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage("Please select both a new date and an available time slot.");
      return;
    }

    if (selectedDate === appointment.date && selectedTime === appointment.time) {
      setErrorMessage("The chosen date and time are identical to your existing appointment.");
      return;
    }

    // Double booking prevention check
    const isDoubleBooked = appointments.some(apt =>
      apt.id !== appointment.id &&
      apt.doctorId === appointment.doctorId &&
      apt.date === selectedDate &&
      apt.time === selectedTime &&
      apt.status !== 'Cancelled'
    );

    if (isDoubleBooked) {
      setErrorMessage("That time slot is no longer available. Please choose a different slot.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await rescheduleAppointment(appointment.id, selectedDate, selectedTime);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Reschedule error:", err);
      setIsSubmitting(false);
      setErrorMessage("Failed to reschedule appointment. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-sm shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Reference ID: {appointment.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-sm hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Details Banner */}
        <div className="bg-amber-50/70 border-b border-amber-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Current Schedule</span>
            <p className="font-semibold text-slate-900">{appointment.doctorName} • {appointment.hospitalName}</p>
          </div>
          <div className="text-left sm:text-right font-mono text-amber-900 font-bold">
            {appointment.date} at {appointment.time}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: New Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-900" /> Choose New Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {availableDatesList.map(item => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.dateStr);
                      setSelectedTime("");
                    }}
                    className={`p-2.5 rounded-sm border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? "border-blue-900 bg-blue-900 text-white shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                      {item.dayName}
                    </span>
                    <span className="text-lg font-bold my-0.5">
                      {item.dayNum}
                    </span>
                    <span className={`text-[9px] font-medium ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: New Time Slot */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-900" /> Choose New Time Slot
              </label>
              <span className="text-xs text-slate-500 font-mono">Date: {selectedDate}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {DEFAULT_TIME_SLOTS.map(time => {
                const isBooked = bookedSlots.has(time);
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2.5 rounded-sm border text-xs font-semibold transition-all ${
                      isBooked
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through"
                        : isSelected
                        ? "bg-blue-900 border-blue-900 text-white font-bold"
                        : "bg-white border-slate-200 hover:border-blue-900 text-slate-700"
                    }`}
                  >
                    {time}
                    {isBooked && <span className="block text-[8px] font-normal no-underline text-slate-400">Unavailable</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-300 rounded-sm bg-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedDate || !selectedTime || isSubmitting}
            onClick={handleConfirmReschedule}
            className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2.5 text-xs font-bold rounded-sm hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Confirm Reschedule"}
          </button>
        </div>

      </div>
    </div>
  );
}
