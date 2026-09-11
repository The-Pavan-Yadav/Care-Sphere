import React, { useState, useMemo } from "react";
import { 
  Building2, Calendar, Clock, CheckCircle2, ChevronRight, ChevronLeft, 
  X, AlertCircle, Stethoscope, MapPin, CalendarCheck, ArrowRight, Check
} from "lucide-react";
import { useStore, Hospital, Doctor, Patient, Appointment } from "../../lib/Store";

interface BookAppointmentFlowProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
  preselectedHospitalId?: string;
  preselectedDoctorId?: string;
}

const DEFAULT_TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

const VISIT_TYPES = [
  "General Consultation",
  "Follow-up Review",
  "Specialist Evaluation",
  "Diagnostic & Lab Review",
  "Preventive Wellness Check"
];

export default function BookAppointmentFlow({
  patient,
  isOpen,
  onClose,
  onSuccess,
  preselectedHospitalId,
  preselectedDoctorId
}: BookAppointmentFlowProps) {
  const { hospitals, doctors, appointments, addAppointment } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(() => {
    if (preselectedHospitalId) {
      return hospitals.find(h => h.hospitalId === preselectedHospitalId) || null;
    }
    return null;
  });
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(() => {
    if (preselectedDoctorId) {
      return doctors.find(d => d.medicalId === preselectedDoctorId) || null;
    }
    return null;
  });

  // Calculate default available date (tomorrow)
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [visitType, setVisitType] = useState<string>("General Consultation");
  const [reason, setReason] = useState<string>("");
  
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Step 1: Filter Hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => 
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.address.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.hospitalId.toLowerCase().includes(hospitalSearch.toLowerCase())
    );
  }, [hospitals, hospitalSearch]);

  // Step 2: Filter Doctors actively associated with the selected hospital
  const associatedDoctors = useMemo(() => {
    if (!selectedHospital) return [];
    return doctors.filter(doc => 
      doc.hospitalIds && doc.hospitalIds.includes(selectedHospital.hospitalId)
    ).filter(doc =>
      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.medicalId.toLowerCase().includes(doctorSearch.toLowerCase())
    );
  }, [doctors, selectedHospital, doctorSearch]);

  // Step 4: Booked slots for selected doctor on selected date
  const bookedSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return new Set<string>();
    const booked = appointments
      .filter(apt => 
        apt.doctorId === selectedDoctor.medicalId && 
        apt.date === selectedDate && 
        apt.status !== 'Cancelled'
      )
      .map(apt => apt.time);
    return new Set(booked);
  }, [appointments, selectedDoctor, selectedDate]);

  if (!isOpen) return null;

  const handleSelectHospital = (h: Hospital) => {
    setSelectedHospital(h);
    // Reset doctor if not associated
    if (selectedDoctor && !selectedDoctor.hospitalIds.includes(h.hospitalId)) {
      setSelectedDoctor(null);
    }
    setStep(2);
  };

  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setStep(3);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Clear slot on date change
    setStep(4);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  const handleProceedToConfirm = () => {
    if (!selectedTime) {
      setErrorMessage("Please select an available appointment time slot.");
      return;
    }
    setErrorMessage("");
    setStep(5);
  };

  const handleConfirmBooking = async () => {
    if (!selectedHospital || !selectedDoctor || !selectedDate || !selectedTime) {
      setErrorMessage("Incomplete appointment details. Please review all steps.");
      return;
    }

    // Check double-booking again before writing to Firestore
    const isAlreadyBooked = appointments.some(apt => 
      apt.doctorId === selectedDoctor.medicalId && 
      apt.date === selectedDate && 
      apt.time === selectedTime &&
      apt.status !== 'Cancelled'
    );

    if (isAlreadyBooked) {
      setErrorMessage("Sorry, this time slot was just booked by another patient. Please select a different time.");
      setStep(4);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const aptId = `APT-${Date.now().toString().slice(-6)}`;
      const newAppointment: Appointment = {
        id: aptId,
        patientAadhaar: patient.aadhaar,
        patientName: patient.name,
        hospitalId: selectedHospital.hospitalId,
        hospitalName: selectedHospital.name,
        doctorId: selectedDoctor.medicalId,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        date: selectedDate,
        time: selectedTime,
        type: visitType,
        reason: reason.trim() || "Routine Consultation",
        status: "Confirmed",
        createdAt: new Date().toISOString()
      };

      await addAppointment(newAppointment);
      setIsSubmitting(false);
      onSuccess(newAppointment);
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
      setIsSubmitting(false);
      setErrorMessage("An error occurred while booking. Please try again.");
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-sm shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center bg-blue-900 text-white rounded-sm text-xs font-bold">
                {step}
              </span>
              <h2 className="text-lg font-bold text-slate-900">Book Medical Appointment</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled through verified National Health ID: <span className="font-mono font-medium text-slate-700">{patient.aadhaar}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-sm hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Breadcrumbs */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500 overflow-x-auto">
          {[
            { num: 1, label: "Select Hospital" },
            { num: 2, label: "Select Doctor" },
            { num: 3, label: "Choose Date" },
            { num: 4, label: "Select Slot" },
            { num: 5, label: "Confirm Booking" }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center whitespace-nowrap">
              <button
                type="button"
                disabled={s.num > step}
                onClick={() => {
                  if (s.num < step) setStep(s.num as any);
                }}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === s.num
                    ? "font-bold text-blue-900"
                    : s.num < step
                    ? "text-slate-700 hover:text-blue-900 cursor-pointer"
                    : "text-slate-300 cursor-not-allowed"
                }`}
              >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === s.num
                    ? "bg-blue-900 text-white font-bold"
                    : s.num < step
                    ? "bg-blue-100 text-blue-900 font-bold"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {s.num < step ? "✓" : s.num}
                </span>
                {s.label}
              </button>
              {idx < 4 && <ChevronRight className="h-3.5 w-3.5 mx-2 text-slate-300" />}
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* ================= STEP 1: SELECT HOSPITAL ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Step 1: Select Registered Healthcare Facility</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Choose an approved hospital or clinic in the CareSphere network.</p>
                </div>
                <input
                  type="text"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  placeholder="Search hospital name, location..."
                  className="px-3.5 py-2 text-xs border border-slate-300 rounded-sm focus:outline-none focus:border-blue-900 w-full sm:w-64"
                />
              </div>

              {filteredHospitals.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-sm p-12 text-center">
                  <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No registered hospitals found.</p>
                  <p className="text-xs text-slate-400 mt-1">Please check the search term or contact system administration.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHospitals.map(h => {
                    const isSelected = selectedHospital?.hospitalId === h.hospitalId;
                    const affiliatedDocCount = doctors.filter(d => d.hospitalIds?.includes(h.hospitalId)).length;

                    return (
                      <div
                        key={h.hospitalId}
                        onClick={() => handleSelectHospital(h)}
                        className={`p-5 rounded-sm border transition-all cursor-pointer bg-white relative hover:shadow-sm ${
                          isSelected
                            ? "border-blue-900 ring-1 ring-blue-900 bg-blue-50/30"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-sm shrink-0 ${isSelected ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600"}`}>
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Available
                                </span>
                              </div>
                              <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {h.hospitalId} <span className="mx-1 text-slate-300">|</span> {h.type}</p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="line-clamp-1">{h.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            <strong className="text-slate-900 font-semibold">{affiliatedDocCount}</strong> {affiliatedDocCount === 1 ? 'Doctor' : 'Doctors'} on roster
                          </span>
                          <span className="font-semibold text-blue-900 flex items-center gap-1">
                            Select Facility <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: SELECT DOCTOR ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Selected Facility</p>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedHospital?.name}</h4>
                  <p className="text-xs text-slate-600 font-mono">ID: {selectedHospital?.hospitalId} • {selectedHospital?.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-blue-900 hover:underline border border-blue-200 bg-white px-3 py-1.5 rounded-sm"
                >
                  Change Facility
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Step 2: Choose Attending Doctor</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Showing doctors with an approved association at this hospital.</p>
                </div>
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Search doctor or specialty..."
                  className="px-3.5 py-2 text-xs border border-slate-300 rounded-sm focus:outline-none focus:border-blue-900 w-full sm:w-64"
                />
              </div>

              {associatedDoctors.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-sm p-12 text-center">
                  <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-800">No active doctors associated with this hospital yet.</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Doctors must be requested and approved by this hospital facility before appointments can be scheduled.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-sm hover:bg-blue-800 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Select Different Hospital
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {associatedDoctors.map(doc => {
                    const isSelected = selectedDoctor?.medicalId === doc.medicalId;

                    return (
                      <div
                        key={doc.medicalId}
                        onClick={() => handleSelectDoctor(doc)}
                        className={`p-5 rounded-sm border transition-all cursor-pointer bg-white relative hover:shadow-sm ${
                          isSelected
                            ? "border-blue-900 ring-1 ring-blue-900 bg-blue-50/30"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-sm shrink-0 ${isSelected ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                            <Stethoscope className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Available
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-blue-900 mt-0.5">{doc.specialty}</p>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">Medical ID: {doc.medicalId}</p>
                            
                            <div className="mt-3 bg-slate-50 p-2.5 rounded-sm border border-slate-100 text-[11px] text-slate-600">
                              <p className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span>Consultation Hours: <strong>09:00 AM – 05:00 PM</strong></span>
                              </p>
                              <p className="text-slate-400 text-[10px] mt-1">Verified CareSphere Practitioner</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Approved Facility Partner</span>
                          <span className="font-semibold text-blue-900 flex items-center gap-1">
                            Select Doctor <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: SELECT DATE ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Step 3: Choose Appointment Date</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Booking with <strong className="text-slate-800">{selectedDoctor?.name}</strong> at <strong className="text-slate-800">{selectedHospital?.name}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-sm bg-slate-50 hover:bg-slate-100"
                  >
                    Change Doctor
                  </button>
                </div>
              </div>

              {/* Date Selection Grid (14 upcoming days) */}
              <div className="bg-white border border-slate-200 p-5 rounded-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-900" /> Upcoming Available Dates (Next 14 Days)
                  </p>
                  <span className="text-xs font-mono text-slate-500">Selected: {selectedDate}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {availableDatesList.map(item => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        onClick={() => handleSelectDate(item.dateStr)}
                        className={`p-3 rounded-sm border text-center transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? "border-blue-900 bg-blue-900 text-white shadow-sm"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                          {item.dayName}
                        </span>
                        <span className="text-xl font-bold my-0.5">
                          {item.dayNum}
                        </span>
                        <span className={`text-[10px] font-medium ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                          {item.monthName}
                        </span>
                        {item.isToday && (
                          <span className={`text-[9px] font-bold uppercase mt-1 px-1 rounded-xs ${
                            isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-900"
                          }`}>
                            Today
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom date input for advance booking */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">Or pick a specific future date:</span>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(e.target.value);
                        setSelectedTime("");
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-sm focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2.5 text-xs font-bold rounded-sm hover:bg-blue-800 transition-colors"
                >
                  Continue to Select Time Slot <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: SELECT TIME SLOT ================= */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 p-4 rounded-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Step 4: Select Appointment Time Slot</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Date: <strong className="text-slate-800">{new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-sm bg-slate-50 hover:bg-slate-100"
                >
                  Change Date
                </button>
              </div>

              {/* Time Slots */}
              <div className="bg-white border border-slate-200 p-5 rounded-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-900" /> Available Time Slots
                  </p>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-xs bg-white border border-slate-300"></span> Available
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-xs bg-slate-100 border border-slate-200"></span> Booked
                    </span>
                    <span className="flex items-center gap-1 text-blue-900 font-bold">
                      <span className="h-2.5 w-2.5 rounded-xs bg-blue-900"></span> Selected
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {DEFAULT_TIME_SLOTS.map(time => {
                    const isBooked = bookedSlots.has(time);
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isBooked}
                        onClick={() => handleSelectTime(time)}
                        className={`p-3 rounded-sm border text-xs font-semibold transition-all relative ${
                          isBooked
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through"
                            : isSelected
                            ? "bg-blue-900 border-blue-900 text-white shadow-sm font-bold"
                            : "bg-white border-slate-200 hover:border-blue-900 hover:text-blue-900 text-slate-700"
                        }`}
                      >
                        {time}
                        {isBooked && (
                          <span className="block text-[9px] font-normal no-underline text-slate-400 mt-0.5">
                            Booked
                          </span>
                        )}
                        {isSelected && (
                          <span className="block text-[9px] font-normal text-blue-100 mt-0.5">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consultation Details */}
              <div className="bg-white border border-slate-200 p-5 rounded-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Consultation Purpose & Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Visit Category *
                    </label>
                    <select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:outline-none focus:border-blue-900 bg-white"
                    >
                      {VISIT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Reason / Symptoms (Optional)
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Routine checkup, BP monitoring, dizziness"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:outline-none focus:border-blue-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-200 rounded-sm bg-white"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to Date
                </button>

                <button
                  type="button"
                  onClick={handleProceedToConfirm}
                  disabled={!selectedTime}
                  className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-sm transition-colors ${
                    selectedTime 
                      ? "bg-blue-900 text-white hover:bg-blue-800 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Review & Confirm <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: CONFIRM APPOINTMENT ================= */}
          {step === 5 && selectedHospital && selectedDoctor && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">Step 5: Final Review</span>
                    <h3 className="text-base font-bold text-white mt-0.5">Appointment Summary</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-sm text-xs font-bold uppercase tracking-wider">
                    Status: Confirmed Upon Booking
                  </span>
                </div>

                <div className="p-6 divide-y divide-slate-100">
                  {/* Patient Info */}
                  <div className="pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{patient.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aadhaar Health ID</span>
                      <p className="text-sm font-mono text-blue-900 font-bold mt-0.5">{patient.aadhaar}</p>
                    </div>
                  </div>

                  {/* Hospital & Doctor Details */}
                  <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-blue-900" /> Hospital Facility
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{selectedHospital.name}</h4>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {selectedHospital.hospitalId}</p>
                      <p className="text-xs text-slate-600 mt-1">{selectedHospital.address}</p>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5 text-blue-900" /> Attending Doctor
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{selectedDoctor.name}</h4>
                      <p className="text-xs font-bold text-blue-900 mt-0.5">{selectedDoctor.specialty}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">Medical ID: {selectedDoctor.medicalId}</p>
                    </div>
                  </div>

                  {/* Date, Time & Visit Type */}
                  <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" /> Appointment Date
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-1">{selectedDate}</p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: 'long' })}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" /> Allocated Slot
                      </span>
                      <p className="text-sm font-bold text-blue-900 mt-1">{selectedTime}</p>
                      <p className="text-[11px] text-slate-500">Standard 30-min Clinical Window</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visit Category</span>
                      <p className="text-sm font-bold text-slate-900 mt-1">{visitType}</p>
                      {reason && <p className="text-[11px] text-slate-500 truncate">Notes: {reason}</p>}
                    </div>
                  </div>

                  {/* Single Source of Truth Notice */}
                  <div className="pt-4 flex items-start gap-2.5 text-xs text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      This booking synchronizes live in <strong>CareSphere Firestore</strong> and will instantly appear in your 
                      portal, the doctor's clinical queue, and the hospital administration dashboard.
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-200 rounded-sm bg-white"
                >
                  <ChevronLeft className="h-4 w-4" /> Edit Time / Details
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-blue-900 text-white px-8 py-3 text-sm font-bold rounded-sm hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="h-4 w-4" />
                      <span>Confirm & Book Appointment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
