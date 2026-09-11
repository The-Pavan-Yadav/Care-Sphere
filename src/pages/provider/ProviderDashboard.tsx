import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, Calendar, Activity, Plus, 
  ChevronLeft, LayoutDashboard, UploadCloud, 
  ClipboardList, CheckCircle2, Clock, Building2, UserCircle, LogIn, Link as LinkIcon
} from "lucide-react";
import { useStore, Patient, Doctor, Hospital } from "../../lib/Store";

export default function ProviderDashboard() {
  const [authRole, setAuthRole] = useState<'none' | 'doctor' | 'hospital'>('none');
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(null);
  const { doctors } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();


  useEffect(() => {
    const login = searchParams.get('login');
    if (login === 'true') {
      setAuthRole('none');
      setActiveDoctor(null);
      setActiveHospital(null);
      setSearchParams({});
    }

    const demo = searchParams.get('demo');
    if (demo === 'true' && authRole === 'none') {
      const doc = doctors.find(d => d.medicalId === "PRV-1029");
      if (doc) {
        setActiveDoctor(doc);
        setAuthRole('doctor');
      }
      setSearchParams({});
    }
  }, [searchParams, authRole, doctors, setSearchParams]);

  if (authRole === 'none') {
    return <LoginView onLoginDoctor={(doc) => { setActiveDoctor(doc); setAuthRole('doctor'); }} onLoginHospital={(hosp) => { setActiveHospital(hosp); setAuthRole('hospital'); }} />;
  }

  if (authRole === 'hospital' && activeHospital) {
    return <HospitalAdminWorkspace hospital={activeHospital} onLogout={() => { setAuthRole('none'); setActiveHospital(null); }} />;
  }

  if (authRole === 'doctor' && activeDoctor) {
    return <DoctorWorkspace doctor={activeDoctor} onLogout={() => { setAuthRole('none'); setActiveDoctor(null); }} />;
  }

  return null;
}

// ==========================================
// 1. LOGIN / ENTRY VIEW
// ==========================================
function LoginView({ onLoginDoctor, onLoginHospital }: { onLoginDoctor: (d: Doctor) => void, onLoginHospital: (h: Hospital) => void }) {
  const { doctors, hospitals } = useStore();
  const [docId, setDocId] = useState("PRV-1029");
  const [hospId, setHospId] = useState("HOSP-001");
  const [error, setError] = useState("");

  const handleDocLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.medicalId === docId);
    if (doc) { onLoginDoctor(doc); } else { setError("Doctor Medical ID not found."); }
  };

  const handleHospLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const hosp = hospitals.find(h => h.hospitalId === hospId);
    if (hosp) { onLoginHospital(hosp); } else { setError("Hospital ID not found."); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Doctor Login */}
        <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center bg-blue-50 text-blue-900 border border-blue-100 rounded-sm mb-6">
            <UserCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Doctor Access</h2>
          <p className="text-sm text-slate-500 mb-8">Access your clinical workspace using your unique Medical/Professional ID.</p>
          
          <form onSubmit={handleDocLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medical ID</label>
              <input type="text" value={docId} onChange={e => setDocId(e.target.value)} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono" placeholder="e.g. PRV-1029" required />
            </div>
            <button type="submit" className="w-full flex items-center justify-center bg-blue-900 text-white px-4 py-3 text-sm font-bold hover:bg-blue-800 transition-colors rounded-sm mb-4">
              <LogIn className="h-4 w-4 mr-2" /> Authenticate as Doctor
            </button>
            <div className="pt-4 border-t border-slate-100 text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Demo Credentials</p>
               <button type="button" onClick={() => setDocId("PRV-1029")} className="text-xs font-mono bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-sm border border-slate-200 transition-colors">Dr. James Wilson (PRV-1029)</button>
            </div>
          </form>
        </div>

        {/* Hospital Login */}
        <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center bg-slate-100 text-slate-700 border border-slate-200 rounded-sm mb-6">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Hospital Admin Access</h2>
          <p className="text-sm text-slate-500 mb-8">Manage facility doctors and organizational links using your Hospital ID.</p>
          
          <form onSubmit={handleHospLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hospital ID</label>
              <input type="text" value={hospId} onChange={e => setHospId(e.target.value)} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono" placeholder="e.g. HOSP-001" required />
            </div>
            <button type="submit" className="w-full flex items-center justify-center bg-slate-800 text-white px-4 py-3 text-sm font-bold hover:bg-slate-700 transition-colors rounded-sm mb-4">
              <LogIn className="h-4 w-4 mr-2" /> Access Hospital Portal
            </button>
            <div className="pt-4 border-t border-slate-100 text-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Demo Credentials</p>
               <button type="button" onClick={() => setHospId("HOSP-001")} className="text-xs font-mono bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-sm border border-slate-200 transition-colors">Metro Diagnostic Center (HOSP-001)</button>
            </div>
          </form>
        </div>

      </div>
      
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-900 text-white px-6 py-3 rounded-sm shadow-md text-sm font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. HOSPITAL ADMIN WORKSPACE
// ==========================================
function HospitalAdminWorkspace({ hospital, onLogout }: { hospital: Hospital, onLogout: () => void }) {
  const { doctors, linkDoctorToHospital } = useStore();
  const linkedDoctors = doctors.filter(d => d.hospitalIds.includes(hospital.hospitalId));
  const [linkDocId, setLinkDocId] = useState("");
  const [message, setMessage] = useState("");

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.medicalId === linkDocId);
    if (!doc) {
      setMessage("Error: Doctor not found in global registry.");
      return;
    }
    if (doc.hospitalIds.includes(hospital.hospitalId)) {
      setMessage("Doctor is already linked to this hospital.");
      return;
    }
    linkDoctorToHospital(doc.medicalId, hospital.hospitalId);
    setMessage(`Success: ${doc.name} linked to ${hospital.name}.`);
    setLinkDocId("");
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{hospital.name}</h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">ID: {hospital.hospitalId} <span className="mx-2 text-slate-300">|</span> {hospital.type}</p>
        </div>
        <button onClick={onLogout} className="text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-4 py-2 rounded-sm bg-white hover:bg-slate-50 transition-colors">
          Sign Out
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Roster */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <UserCircle className="mr-2 h-4 w-4 text-slate-500" /> Authorized Doctors
              </h2>
              <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-sm">{linkedDoctors.length} TOTAL</span>
            </div>
            <div className="divide-y divide-slate-100">
              {linkedDoctors.map(doc => (
                <div key={doc.medicalId} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.specialty}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-sm border border-slate-200">{doc.medicalId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center">
              <LinkIcon className="mr-2 h-4 w-4 text-blue-900" /> Link New Doctor
            </h3>
            <p className="text-xs text-slate-500 mb-4">Enter a doctor's Medical ID to authorize them for your hospital.</p>
            <form onSubmit={handleLink} className="space-y-4">
              <input type="text" value={linkDocId} onChange={e => setLinkDocId(e.target.value)} placeholder="Medical ID (e.g. PRV-1029)" className="w-full text-sm border border-slate-300 rounded-sm px-3 py-2 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 font-mono" required />
              <button type="submit" className="w-full text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 py-2.5 rounded-sm transition-colors">Authorize Doctor</button>
            </form>
            {message && <div className="mt-4 text-xs font-medium text-blue-900 bg-blue-50 border border-blue-100 p-2 rounded-sm">{message}</div>}
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 3. DOCTOR WORKSPACE (Existing but integrated)
// ==========================================
const MOCK_DOCTOR_APPOINTMENTS = [
  { id: 'APT-1', patientName: 'Sarah Jenkins', aadhaar: '8492-4910-8432', date: '2026-10-12', time: '09:00 AM', type: 'Follow-up', status: 'Scheduled' },
  { id: 'APT-2', patientName: 'Arjun Patel', aadhaar: '9082-1102-5541', date: '2026-10-12', time: '10:30 AM', type: 'Consultation', status: 'Scheduled' },
  { id: 'APT-3', patientName: 'Emily Chen', aadhaar: '1243-9821-0021', date: '2026-10-12', time: '02:00 PM', type: 'Lab Review', status: 'Scheduled' }
];

function DoctorWorkspace({ doctor, onLogout }: { doctor: Doctor, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  if (selectedPatient) {
    return <ClinicalWorkspace patient={selectedPatient} doctor={doctor} onBack={() => setSelectedPatient(null)} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Doctor</h2>
          <p className="text-sm font-semibold text-slate-900">{doctor.name}</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{doctor.medicalId}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-6 py-2.5 text-sm font-medium transition-colors ${ activeTab === 'dashboard' ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }`}>
                <LayoutDashboard className={`mr-3 h-4 w-4 ${activeTab === 'dashboard' ? 'text-blue-900' : 'text-slate-400'}`} /> Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center px-6 py-2.5 text-sm font-medium transition-colors ${ activeTab === 'appointments' ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }`}>
                <Calendar className={`mr-3 h-4 w-4 ${activeTab === 'appointments' ? 'text-blue-900' : 'text-slate-400'}`} /> Appointments
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
          <button onClick={onLogout} className="w-full text-xs font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-100 py-2 rounded-sm transition-colors">Sign Out</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DoctorHome onSelectPatient={setSelectedPatient} />}
          {activeTab === 'appointments' && <DoctorAppointments onSelectPatient={setSelectedPatient} />}
        </div>
      </div>

    </div>
  );
}

function DoctorHome({ onSelectPatient }: { onSelectPatient: (p: Patient) => void }) {
  const { patients } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = patients.filter(p => p.aadhaar.includes(searchQuery) || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Patient Lookup</h1>
        <p className="text-sm text-slate-600 mb-6">Search CareSphere by Aadhaar Health ID or patient name.</p>
        
        <div className="max-w-2xl mx-auto relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="block w-full rounded-sm border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono transition-colors" placeholder="ENTER AADHAAR ID OR NAME..." />
        </div>

        {searchQuery.length > 0 && (
          <div className="mt-4 max-w-2xl mx-auto text-left border border-slate-200 bg-white rounded-sm overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">Search Results</div>
            <div className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No patient found.</div>
              ) : (
                filteredPatients.map(p => (
                  <button key={p.aadhaar} onClick={() => onSelectPatient(p)} className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">{p.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {p.aadhaar}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">Open Record <ChevronLeft className="ml-1 h-4 w-4 rotate-180" /></span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Appointments */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 flex items-center"><Calendar className="mr-2 h-4 w-4 text-blue-900" /> Today's Appointments</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {MOCK_DOCTOR_APPOINTMENTS.map(apt => (
            <div key={apt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-6">
                <div className="text-center w-24">
                  <span className="block text-sm font-bold text-slate-900">{apt.time}</span>
                  <span className="block text-xs text-slate-500 uppercase mt-0.5">{apt.type}</span>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{apt.patientName}</h4>
                  <p className="text-xs font-mono text-slate-500 mt-1">ID: {apt.aadhaar}</p>
                </div>
              </div>
              <button onClick={() => { const patient = patients.find(p => p.aadhaar === apt.aadhaar); if (patient) onSelectPatient(patient); }} className="px-4 py-2 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors rounded-sm">
                Start Consultation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DoctorAppointments({ onSelectPatient }: { onSelectPatient: (p: Patient) => void }) {
  const { patients } = useStore();
  const [appointments, setAppointments] = useState(MOCK_DOCTOR_APPOINTMENTS);

  const completeAppointment = (id: string) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Completed' } : a));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Appointments</h1>
        <p className="text-sm text-slate-600 mt-1">View and manage your upcoming schedule.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {appointments.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">{apt.date} <span className="text-slate-400 mx-1">|</span> {apt.time}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{apt.patientName}<br/><span className="text-xs font-mono text-slate-500 font-normal">{apt.aadhaar}</span></td>
                  <td className="px-6 py-4">{apt.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${apt.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    {apt.status === 'Scheduled' && (
                      <>
                        <button onClick={() => completeAppointment(apt.id)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-100 transition-colors rounded-sm inline-flex items-center"><CheckCircle2 className="mr-1 h-3 w-3" /> Mark Done</button>
                        <button onClick={() => { const patient = patients.find(p => p.aadhaar === apt.aadhaar); if (patient) onSelectPatient(patient); }} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm">Open Chart</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. CLINICAL WORKSPACE
// ==========================================
function ClinicalWorkspace({ patient, doctor, onBack }: { patient: Patient, doctor: Doctor, onBack: () => void }) {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'overview' | 'history' | 'consultation' | 'upload'>('overview');
  const { vitals } = useStore();
  const patientVitals = vitals[patient.aadhaar];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors text-slate-600"><ChevronLeft className="h-5 w-5" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
              <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-semibold rounded-sm">ID: {patient.aadhaar}</span>
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200">
          <WorkspaceTab active={activeWorkspaceTab === 'overview'} onClick={() => setActiveWorkspaceTab('overview')} icon={Activity} label="Overview" />
          <WorkspaceTab active={activeWorkspaceTab === 'history'} onClick={() => setActiveWorkspaceTab('history')} icon={Clock} label="History" />
          <WorkspaceTab active={activeWorkspaceTab === 'consultation'} onClick={() => setActiveWorkspaceTab('consultation')} icon={ClipboardList} label="Consultation" />
          <WorkspaceTab active={activeWorkspaceTab === 'upload'} onClick={() => setActiveWorkspaceTab('upload')} icon={UploadCloud} label="Upload" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {activeWorkspaceTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 bg-white rounded-sm shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Latest Vitals</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Blood Pressure</p><p className="text-lg font-bold text-slate-900 mt-1">{patientVitals?.bloodPressure || "--"}</p></div>
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Heart Rate</p><p className="text-lg font-bold text-slate-900 mt-1">{patientVitals ? `${patientVitals.heartRate} bpm` : "--"}</p></div>
                </div>
              </div>
            </div>
          )}
          {activeWorkspaceTab === 'history' && <PatientHistoryView patient={patient} />}
          {activeWorkspaceTab === 'consultation' && <RecordConsultationView patient={patient} doctor={doctor} onSuccess={() => setActiveWorkspaceTab('history')} />}
          {activeWorkspaceTab === 'upload' && <UploadReportView patient={patient} doctor={doctor} onSuccess={() => setActiveWorkspaceTab('history')} />}
        </div>
      </div>
    </div>
  );
}

function WorkspaceTab({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center px-4 py-2 text-sm font-semibold rounded-sm transition-all ${ active ? 'bg-white text-blue-900 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent' }`}>
      <Icon className="mr-2 h-4 w-4" /> {label}
    </button>
  );
}

function PatientHistoryView({ patient }: { patient: Patient }) {
  const { encounters } = useStore();
  const patientEncounters = encounters.filter(e => e.patientAadhaar === patient.aadhaar).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Patient Clinical History</h2>
      {patientEncounters.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-sm">No historical records found.</div>
      ) : (
        <div className="relative border-l border-slate-200 ml-4 space-y-8 py-4">
          {patientEncounters.map((enc) => (
            <div key={enc.id} className="relative pl-8">
              <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-300"></span>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{enc.title}</h4>
                  </div>
                  <span className="text-sm font-mono font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-sm">{enc.date}</span>
                </div>
                <p className="text-sm font-medium text-blue-900 mt-2">{enc.provider} <span className="mx-2 text-slate-300">|</span> {enc.facility}</p>
                <div className="mt-4 bg-white border border-slate-200 p-4 rounded-sm">
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{enc.notes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecordConsultationView({ patient, doctor, onSuccess }: { patient: Patient, doctor: Doctor, onSuccess: () => void }) {
  const { addEncounter, addCondition, addMedication, hospitals } = useStore();
  
  // Resolve doctor's linked hospital names
  const linkedHospitals = doctor.hospitalIds.map(id => {
    const h = hospitals.find(x => x.hospitalId === id);
    return h ? h.name : "Unknown Facility";
  });
  
  const [formData, setFormData] = useState({ title: '', notes: '', diagnosis: '', rxName: '', rxDosage: '', facility: linkedHospitals[0] || 'Independent Practice' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.notes) return;
    const dateStr = new Date().toISOString().split('T')[0];

    addEncounter({ id: `ENC-${Date.now()}`, patientAadhaar: patient.aadhaar, date: dateStr, title: formData.title, provider: doctor.name, facility: formData.facility, notes: formData.notes });
    if (formData.diagnosis) addCondition({ id: `COND-${Date.now()}`, patientAadhaar: patient.aadhaar, title: formData.diagnosis, onset: dateStr, status: 'Active' });
    if (formData.rxName) addMedication({ id: `MED-${Date.now()}`, patientAadhaar: patient.aadhaar, name: formData.rxName, dosage: formData.rxDosage || 'As directed', provider: doctor.name });
    
    onSuccess();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-5">
        <h2 className="text-lg font-bold text-slate-900">Record New Consultation</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="space-y-4 border-b border-slate-100 pb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Facility / Hospital Context *</label>
            <select value={formData.facility} onChange={e => setFormData({...formData, facility: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 bg-white">
              {linkedHospitals.length === 0 && <option>Independent Practice</option>}
              {linkedHospitals.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Encounter Title *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm" placeholder="e.g. Chest pain evaluation" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Clinical Notes *</label>
            <textarea required rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm leading-relaxed" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-6 py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Save Record
          </button>
        </div>
      </form>
    </div>
  );
}

function UploadReportView({ patient, doctor, onSuccess }: { patient: Patient, doctor: Doctor, onSuccess: () => void }) {
  const { addEncounter, hospitals } = useStore();
  const linkedHospitals = doctor.hospitalIds.map(id => hospitals.find(x => x.hospitalId === id)?.name || "Independent Practice");
  const [formData, setFormData] = useState({ type: 'Laboratory Report', notes: '', facility: linkedHospitals[0] || 'Independent Practice' });
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      addEncounter({ id: `ENC-${Date.now()}`, patientAadhaar: patient.aadhaar, date: new Date().toISOString().split('T')[0], title: `${formData.type} Uploaded`, provider: doctor.name, facility: formData.facility, notes: formData.notes || 'Document attached.' });
      setIsUploading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm max-w-2xl mx-auto">
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-5"><h2 className="text-lg font-bold text-slate-900">Upload Report</h2></div>
      <form onSubmit={handleUpload} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Facility Context</label>
          <select value={formData.facility} onChange={e => setFormData({...formData, facility: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 bg-white">
            {linkedHospitals.map(h => <option key={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1.5">Document Category</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 bg-white">
            <option>Laboratory Report</option><option>Radiology / Scan Report</option>
          </select>
        </div>
        <div className="flex justify-end border-t border-slate-200 pt-6">
          <button type="submit" disabled={isUploading} className="px-6 py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm">
            {isUploading ? 'Uploading...' : 'Upload & Attach'}
          </button>
        </div>
      </form>
    </div>
  );
}
