import React from "react";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  LayoutDashboard, Clock, FileText, TestTube, Microscope, 
  Pill, Calendar, Building2, Shield, Settings, Share2, 
  Activity, AlertCircle, LogIn, ShieldCheck, UserPlus, Fingerprint
} from "lucide-react";
import { useStore, Patient } from "../../lib/Store";

export default function PatientDashboard() {
  const { patients, addPatient } = useStore();
  const [activePatientAadhaar, setActivePatientAadhaar] = useState<string | null>(() => {
    return window.localStorage.getItem("cs_active_patient");
  });
  const [view, setView] = useState<'login' | 'register'>('login');
  const [searchParams, setSearchParams] = useSearchParams();

  const activePatient = useMemo(() => patients.find(p => p.aadhaar === activePatientAadhaar) || null, [patients, activePatientAadhaar]);

  const handleLogin = (patient: Patient) => {
    setActivePatientAadhaar(patient.aadhaar);
    window.localStorage.setItem("cs_active_patient", patient.aadhaar);
  };


  useEffect(() => {
    const login = searchParams.get('login');
    if (login === 'true') {
      setActivePatientAadhaar(null);
      window.localStorage.removeItem("cs_active_patient");
      setSearchParams({});
    }

    const demo = searchParams.get('demo');
    if (demo === 'true' && !activePatientAadhaar) {
      const demoPatient = patients.find(p => p.aadhaar === '8492-4910-8432');
      if (demoPatient) {
        handleLogin(demoPatient);
      }
      setSearchParams({});
    }
  }, [searchParams, activePatientAadhaar, patients, setSearchParams]);

  const handleSignOut = () => {
    setActivePatientAadhaar(null);
    window.localStorage.removeItem("cs_active_patient");
  };

  if (activePatient) {
    return <DashboardLayout patient={activePatient} onSignOut={handleSignOut} />;
  }

  if (view === 'login') {
    return <LoginView onLogin={handleLogin} onGoToRegister={() => setView('register')} />;
  }

  return <RegisterView onRegister={(p) => { addPatient(p); handleLogin(p); }} onGoToLogin={() => setView('login')} />;
}

// ==========================================
// LOGIN & REGISTRATION
// ==========================================
function LoginView({ onLogin, onGoToRegister }: { onLogin: (p: Patient) => void, onGoToRegister: () => void }) {
  const { patients } = useStore();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.aadhaar === identifier || p.mobile === identifier || p.email.toLowerCase() === identifier.toLowerCase());
    if (patient) {
      onLogin(patient);
    } else {
      setError("No account found with this Aadhaar, Mobile, or Email.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm max-w-md w-full">
        <div className="flex h-12 w-12 items-center justify-center bg-blue-50 text-blue-900 border border-blue-100 rounded-sm mb-6">
          <Fingerprint className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Patient Login</h2>
        <p className="text-sm text-slate-500 mb-8">Access your lifelong health record using your Aadhaar Number, Mobile, or Email.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Identifier</label>
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono" placeholder="Aadhaar, Mobile, or Email" required />
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button type="submit" className="w-full flex items-center justify-center bg-blue-900 text-white px-4 py-3 text-sm font-bold hover:bg-blue-800 transition-colors rounded-sm">
            <LogIn className="h-4 w-4 mr-2" /> Open My Record
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600 mb-3">Don't have a CareSphere Health ID?</p>
          <button onClick={onGoToRegister} className="text-sm font-bold text-blue-900 hover:underline flex items-center justify-center w-full mb-6">
            <UserPlus className="h-4 w-4 mr-2" /> Register as a New Patient
          </button>
          
          <div className="pt-4 border-t border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Demo Accounts</p>
             <div className="flex justify-center gap-3">
                <button type="button" onClick={() => setIdentifier("8492-4910-8432")} className="text-xs font-mono bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-sm border border-slate-200 transition-colors">John Doe</button>
                <button type="button" onClick={() => setIdentifier("9082-1102-5541")} className="text-xs font-mono bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-sm border border-slate-200 transition-colors">Sarah Jenkins</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterView({ onRegister, onGoToLogin }: { onRegister: (p: Patient) => void, onGoToLogin: () => void }) {
  const [formData, setFormData] = useState({
    name: '', aadhaar: '', dob: '', gender: 'Male', bloodGroup: 'O+',
    mobile: '', email: '', address: '', emergencyContact: '', allergies: 'None'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ ...formData, createdAt: new Date().toISOString() });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6 py-12">
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm max-w-3xl w-full">
        <div className="border-b border-slate-200 bg-slate-50 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create CareSphere ID</h2>
            <p className="text-sm text-slate-500 mt-1">Register for your lifelong health record using Aadhaar.</p>
          </div>
          <button onClick={onGoToLogin} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Cancel</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-slate-100 pb-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aadhaar Number (Health ID) *</label>
              <input required type="text" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono" placeholder="xxxx-xxxx-xxxx" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth *</label>
              <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender *</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 bg-white">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group *</label>
              <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 bg-white">
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allergies</label>
              <input type="text" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. Penicillin, Peanuts" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number *</label>
              <input required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Residential Address *</label>
              <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Emergency Contact *</label>
              <input required type="text" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="Name and Phone Number" />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="flex items-center justify-center bg-blue-900 text-white px-8 py-3 text-sm font-bold hover:bg-blue-800 transition-colors rounded-sm">
              <UserPlus className="h-4 w-4 mr-2" /> Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD WORKSPACE
// ==========================================
type TabID = 'dashboard' | 'timeline' | 'records' | 'labs' | 'scans' | 'prescriptions' | 'medications' | 'appointments' | 'providers' | 'insurance' | 'settings';

function DashboardLayout({ patient, onSignOut }: { patient: Patient, onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState<TabID>('dashboard');
  const [shareGranted, setShareGranted] = useState(false);

  const handleShare = () => {
    setShareGranted(true);
    setTimeout(() => setShareGranted(false), 3000);
  };

  const navItems = [
    { id: 'dashboard' as TabID, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timeline' as TabID, label: 'Health Timeline', icon: Clock },
    { id: 'records' as TabID, label: 'Medical Records', icon: FileText },
    { id: 'labs' as TabID, label: 'Lab Reports', icon: TestTube },
    { id: 'scans' as TabID, label: 'Scan Reports', icon: Microscope },
    { id: 'prescriptions' as TabID, label: 'Prescriptions', icon: FileText },
    { id: 'medications' as TabID, label: 'Medications', icon: Pill },
    { id: 'appointments' as TabID, label: 'Appointments', icon: Calendar },
    { id: 'providers' as TabID, label: 'Doctors/Hospitals', icon: Building2 },
    { id: 'insurance' as TabID, label: 'Insurance', icon: Shield },
    { id: 'settings' as TabID, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Patient</h2>
          <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-6 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 ${activeTab === item.id ? 'text-blue-900' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
          <button onClick={onSignOut} className="w-full text-xs font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-100 py-2 rounded-sm transition-colors">Sign Out</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              CareSphere Health ID: <span className="font-mono text-blue-900 font-medium ml-1">{patient.aadhaar}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleShare}
              className={`flex items-center px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${
                shareGranted ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-900 text-white hover:bg-blue-800'
              }`}
            >
              {shareGranted ? <><ShieldCheck className="mr-2 h-4 w-4" /> Provider Access Enabled</> : <><Share2 className="mr-2 h-4 w-4" /> Share / Grant Access</>}
            </button>
          </div>
        </div>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <MainDashboardView patient={patient} onNavigate={setActiveTab} />}
          {activeTab === 'timeline' && <TimelineView patient={patient} />}
          {activeTab === 'records' && <MedicalRecordsView patient={patient} />}
          {activeTab === 'labs' && <ReportsView patient={patient} filter="Lab" />}
          {activeTab === 'scans' && <ReportsView patient={patient} filter="Scan" />}
          {activeTab === 'prescriptions' && <PrescriptionsView patient={patient} />}
          {activeTab === 'medications' && <MedicationsView patient={patient} />}
          {activeTab === 'appointments' && <AppointmentsView />}
          {activeTab === 'providers' && <ProvidersView patient={patient} />}
          {activeTab === 'insurance' && <InsuranceView patient={patient} />}
          {activeTab === 'settings' && <SettingsView patient={patient} />}
        </div>

      </div>
    </div>
  );
}

// ==========================================
// VIEWS
// ==========================================

function MainDashboardView({ patient, onNavigate }: { patient: Patient, onNavigate: (tab: TabID) => void }) {
  const { vitals, encounters, medications } = useStore();
  const patientVitals = vitals[patient.aadhaar];
  
  const myEncounters = useMemo(() => encounters.filter(e => e.patientAadhaar === patient.aadhaar).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [encounters, patient.aadhaar]);
  const myMedications = useMemo(() => medications.filter(m => m.patientAadhaar === patient.aadhaar), [medications, patient.aadhaar]);

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Main Info) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Health Summary Widget */}
          <div className="border border-slate-200 bg-white rounded-sm shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 flex items-center">
                <Activity className="mr-2 h-4 w-4 text-blue-900" /> Vitals & Profile
              </h2>
              {patientVitals && <span className="text-xs font-mono text-slate-500">Last updated: {new Date(patientVitals.updatedAt).toLocaleDateString()}</span>}
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryItem label="Blood Group" value={patient.bloodGroup} />
              <SummaryItem label="Blood Pressure" value={patientVitals?.bloodPressure || "--"} />
              <SummaryItem label="Heart Rate" value={patientVitals ? `${patientVitals.heartRate} bpm` : "--"} />
              <SummaryItem label="Weight" value={patientVitals ? `${patientVitals.weight} kg` : "--"} />
            </div>
            {patient.allergies && patient.allergies !== "None" && patient.allergies !== "None reported" && (
              <div className="border-t border-slate-100 bg-red-50/50 p-4 px-5 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900">Active Allergies</h4>
                  <p className="text-sm text-red-700 mt-0.5">{patient.allergies}</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Records Widget */}
          <div className="border border-slate-200 bg-white rounded-sm shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 flex items-center">
                <FileText className="mr-2 h-4 w-4 text-blue-900" /> Recent Medical Records
              </h2>
              <button onClick={() => onNavigate('records')} className="text-xs font-semibold text-blue-900 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-100">
              {myEncounters.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No medical records found.</div>
              ) : myEncounters.slice(0, 3).map((record) => (
                <div key={record.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{record.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{record.provider} <span className="mx-1 text-slate-300">|</span> {record.facility}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 border border-slate-200 bg-white px-2 py-1 rounded-sm">{record.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Medications Widget */}
          <div className="border border-slate-200 bg-white rounded-sm shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 flex items-center">
                <Pill className="mr-2 h-4 w-4 text-blue-900" /> Active Medications
              </h2>
              <button onClick={() => onNavigate('medications')} className="text-xs font-semibold text-blue-900 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-100">
              {myMedications.length === 0 ? (
                 <div className="p-6 text-center text-sm text-slate-500">No active medications.</div>
              ) : myMedications.map((med) => (
                <div key={med.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{med.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{med.dosage} <span className="mx-1 text-slate-300">|</span> Rx: {med.provider}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-sm">Active</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6">
          <div className="border border-slate-200 bg-white rounded-sm shadow-sm p-6 text-center">
             <div className="inline-flex items-center justify-center h-12 w-12 bg-blue-50 border border-blue-100 text-blue-900 rounded-full mb-4">
               <Calendar className="h-5 w-5" />
             </div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Upcoming Appointments</h3>
             <p className="text-sm text-slate-500 mt-2 italic">No upcoming appointments scheduled.</p>
          </div>

          <div className="border border-slate-200 bg-white rounded-sm shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-blue-900" /> Lifelong Timeline
              </h2>
            </div>
            <div className="p-6">
              {myEncounters.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No events in timeline.</p>
              ) : (
                <div className="relative border-l border-slate-200 ml-3 space-y-6">
                  {myEncounters.slice(0, 4).map((event) => (
                    <div key={event.id} className="relative pl-6">
                      <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-900"></span>
                      <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{event.date} • {event.facility}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => onNavigate('timeline')} className="w-full mt-6 flex items-center justify-center py-2 text-sm font-semibold text-blue-900 border border-slate-200 hover:bg-slate-50 transition-colors rounded-sm">
                View Full Timeline
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function TimelineView({ patient }: { patient: Patient }) {
  const { encounters } = useStore();
  const myEncounters = useMemo(() => encounters.filter(e => e.patientAadhaar === patient.aadhaar).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [encounters, patient.aadhaar]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Lifelong Health Timeline</h2>
        <p className="text-sm text-slate-600 mt-1">A complete chronological history of all medical events across all providers.</p>
      </div>
      <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
        {myEncounters.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No historical records found.</div>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 space-y-8 py-4">
            {myEncounters.map((event) => (
              <div key={event.id} className="relative pl-8">
                <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-900 shadow-sm"></span>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">{event.title}</h4>
                    </div>
                    <span className="text-sm font-mono font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-sm">{event.date}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-900 mt-3">{event.provider} <span className="mx-2 text-slate-300">|</span> {event.facility}</p>
                  {event.notes && <p className="text-sm text-slate-700 mt-3 bg-white border border-slate-200 p-3 rounded-sm leading-relaxed">{event.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MedicalRecordsView({ patient }: { patient: Patient }) {
  const { encounters } = useStore();
  const records = encounters.filter(e => e.patientAadhaar === patient.aadhaar).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-8">
      <div className="border border-slate-200 bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="text-base font-semibold text-slate-900">All Medical Records</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Record Title</th><th className="px-5 py-3">Provider</th><th className="px-5 py-3">Facility</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center">No records found.</td></tr> : records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono">{r.date}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{r.title}</td>
                  <td className="px-5 py-4">{r.provider}</td>
                  <td className="px-5 py-4">{r.facility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ patient, filter }: { patient: Patient, filter: 'Lab' | 'Scan' }) {
  const { encounters } = useStore();
  // Filter for reports based on title content for demo purposes
  const records = encounters.filter(e => e.patientAadhaar === patient.aadhaar && (filter === 'Lab' ? (e.title.includes('Lab') || e.title.includes('Blood')) : (e.title.includes('Scan') || e.title.includes('Radiology') || e.title.includes('X-Ray')))).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-8">
      <div className="border border-slate-200 bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="text-base font-semibold text-slate-900">{filter} Reports</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Document Title</th><th className="px-5 py-3">Facility</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center">No {filter.toLowerCase()} reports uploaded to your account.</td></tr> : records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono">{r.date}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{r.title}</td>
                  <td className="px-5 py-4">{r.facility}</td>
                  <td className="px-5 py-4"><span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-sm">Attached</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PrescriptionsView({ patient }: { patient: Patient }) {
  const { medications } = useStore();
  const records = medications.filter(m => m.patientAadhaar === patient.aadhaar);
  return (
    <div className="p-8">
      <div className="border border-slate-200 bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="text-base font-semibold text-slate-900">Prescriptions Ledger</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr><th className="px-5 py-3">Prescription ID</th><th className="px-5 py-3">Medication</th><th className="px-5 py-3">Dosage</th><th className="px-5 py-3">Prescribing Provider</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center">No prescriptions found.</td></tr> : records.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs">{m.id}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{m.name}</td>
                  <td className="px-5 py-4">{m.dosage}</td>
                  <td className="px-5 py-4">{m.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MedicationsView({ patient }: { patient: Patient }) {
  const { medications } = useStore();
  const records = medications.filter(m => m.patientAadhaar === patient.aadhaar);
  return (
    <div className="p-8">
      <div className="border border-slate-200 bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="text-base font-semibold text-slate-900">Current Medications</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr><th className="px-5 py-3">Medication</th><th className="px-5 py-3">Dosage</th><th className="px-5 py-3">Provider</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center">No active medications.</td></tr> : records.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{m.name}</td>
                  <td className="px-5 py-4">{m.dosage}</td>
                  <td className="px-5 py-4">{m.provider}</td>
                  <td className="px-5 py-4"><span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-sm">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ patient }: { patient: Patient }) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="border border-slate-200 bg-white rounded-sm shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Patient Settings</h2>
        
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Identity Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-1">Full Name</p>
                <p className="font-semibold text-slate-900">{patient.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">CareSphere Health ID</p>
                <p className="font-mono text-slate-900">{patient.aadhaar}</p>
              </div>
            </div>
          </div>
          
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-1">Mobile</p>
                <p className="text-slate-900">{patient.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-slate-900">{patient.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Address</p>
                <p className="text-slate-900">{patient.address}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Emergency Contact</h3>
            <p className="text-sm text-slate-900">{patient.emergencyContact}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentsView() {
  return (
    <div className="p-8">
      <div className="border border-slate-200 bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="text-base font-semibold text-slate-900">Upcoming Appointments</h2></div>
        <div className="p-8 text-center">
          <p className="text-sm text-slate-500">No upcoming appointments scheduled.</p>
        </div>
      </div>
    </div>
  );
}

function ProvidersView({ patient }: { patient: Patient }) {
  const { encounters } = useStore();
  
  // Extract unique providers and facilities from encounters
  const uniqueProviders = useMemo(() => {
    const myEncounters = encounters.filter(e => e.patientAadhaar === patient.aadhaar);
    const set = new Set<string>();
    const list: { provider: string, facility: string, lastSeen: string }[] = [];
    
    myEncounters.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(e => {
      const key = `${e.provider}|${e.facility}`;
      if (!set.has(key)) {
        set.add(key);
        list.push({ provider: e.provider, facility: e.facility, lastSeen: e.date });
      }
    });
    return list;
  }, [encounters, patient.aadhaar]);

  return (
    <div className="p-8">
      <div className="border border-slate-200 bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4"><h2 className="text-base font-semibold text-slate-900">My Doctors & Hospitals</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr><th className="px-5 py-3">Provider</th><th className="px-5 py-3">Facility</th><th className="px-5 py-3">Last Visit</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {uniqueProviders.length === 0 ? <tr><td colSpan={3} className="px-5 py-8 text-center">No affiliated providers found.</td></tr> : uniqueProviders.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{p.provider}</td>
                  <td className="px-5 py-4">{p.facility}</td>
                  <td className="px-5 py-4 font-mono text-xs">{p.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InsuranceView({ patient }: { patient: Patient }) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="border border-slate-200 bg-white rounded-sm shadow-sm overflow-hidden text-center p-8">
        <Shield className="h-12 w-12 text-blue-900 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">National Health Coverage</h2>
        <p className="text-sm text-slate-600 mb-6">Your CareSphere ID is linked to the national health scheme.</p>
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm text-left inline-block w-full max-w-md">
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Policy Holder</p>
            <p className="text-base font-semibold text-slate-900 mt-1">{patient.name}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aadhaar Health ID</p>
            <p className="text-base font-mono text-slate-900 mt-1">{patient.aadhaar}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coverage Status</p>
            <span className="inline-flex items-center px-3 py-1 mt-2 bg-green-50 text-green-700 border border-green-200 rounded-sm text-xs font-bold uppercase tracking-wider">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
