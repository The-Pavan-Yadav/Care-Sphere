import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, Calendar, Activity, Plus, 
  ChevronLeft, LayoutDashboard, UploadCloud, 
  ClipboardList, CheckCircle2, Clock, Building2, UserCircle, LogIn, Link as LinkIcon, UserPlus
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
  const { doctors, hospitals, addDoctor, addHospital } = useStore();
  const [docId, setDocId] = useState("PRV-1029");
  const [hospId, setHospId] = useState("HOSP-001");
  const [error, setError] = useState("");
  const [view, setView] = useState<'login' | 'register_doctor' | 'register_hospital'>('login');

  const [regData, setRegData] = useState({
    name: '', medicalId: '', specialty: '', phone: '', email: '', qualifications: '', hospitalAffiliation: ''
  });

  const [hospRegData, setHospRegData] = useState({
    name: '', registrationNumber: '', phone: '', email: '', address: '', departments: '', adminDetails: ''
  });

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (doctors.find(d => d.medicalId === regData.medicalId)) {
      setError("Medical ID already exists.");
      return;
    }
    const newDoc: Doctor = {
      medicalId: regData.medicalId,
      name: regData.name,
      specialty: regData.specialty,
      phone: regData.phone,
      email: regData.email,
      qualifications: regData.qualifications,
      hospitalIds: regData.hospitalAffiliation ? [regData.hospitalAffiliation] : []
    };
    await addDoctor(newDoc);
    onLoginDoctor(newDoc);
  };

  const handleHospRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `HOSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newHosp: Hospital = {
      hospitalId: newId,
      name: hospRegData.name,
      type: "General Hospital",
      address: hospRegData.address,
      registrationNumber: hospRegData.registrationNumber,
      phone: hospRegData.phone,
      email: hospRegData.email,
      departments: hospRegData.departments,
      adminDetails: hospRegData.adminDetails
    };
    await addHospital(newHosp);
    onLoginHospital(newHosp);
  };

  if (view === 'register_doctor') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6 py-12">
        <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm max-w-2xl w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Doctor Account</h2>
              <p className="text-sm text-slate-500">Register for clinical workspace access.</p>
            </div>
            <button 
              onClick={() => setView('login')}
              className="text-sm font-semibold text-blue-900 hover:text-blue-800 transition-colors"
            >
              Back to Login
            </button>
          </div>
          
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. Dr. Jane Smith" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medical/Professional ID</label>
              <input type="text" value={regData.medicalId} onChange={e => setRegData({...regData, medicalId: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. PRV-2000" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specialization</label>
              <input type="text" value={regData.specialty} onChange={e => setRegData({...regData, specialty: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. Cardiology" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input type="tel" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="+1-555-0000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="jane.smith@example.com" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Qualifications</label>
              <input type="text" value={regData.qualifications} onChange={e => setRegData({...regData, qualifications: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. MD, FACC" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hospital Affiliation (Optional Hospital ID)</label>
              <input type="text" value={regData.hospitalAffiliation} onChange={e => setRegData({...regData, hospitalAffiliation: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. HOSP-001" />
            </div>
            <div className="col-span-1 md:col-span-2 mt-4">
              <button type="submit" className="w-full flex items-center justify-center bg-blue-900 text-white px-4 py-3 text-sm font-bold hover:bg-blue-800 transition-colors rounded-sm">
                Create Account & Login
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-sm border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'register_hospital') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6 py-12">
        <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm max-w-2xl w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Hospital Account</h2>
              <p className="text-sm text-slate-500">Register your facility for portal access.</p>
            </div>
            <button 
              onClick={() => setView('login')}
              className="text-sm font-semibold text-blue-900 hover:text-blue-800 transition-colors"
            >
              Back to Login
            </button>
          </div>
          
          <form onSubmit={handleHospRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hospital Name</label>
              <input type="text" value={hospRegData.name} onChange={e => setHospRegData({...hospRegData, name: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. City General Hospital" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registration Number</label>
              <input type="text" value={hospRegData.registrationNumber} onChange={e => setHospRegData({...hospRegData, registrationNumber: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. REG-12345" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input type="tel" value={hospRegData.phone} onChange={e => setHospRegData({...hospRegData, phone: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="+1-555-0000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" value={hospRegData.email} onChange={e => setHospRegData({...hospRegData, email: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="admin@hospital.com" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Departments (Comma separated)</label>
              <input type="text" value={hospRegData.departments} onChange={e => setHospRegData({...hospRegData, departments: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. ICU, Pediatrics, Emergency" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
              <input type="text" value={hospRegData.address} onChange={e => setHospRegData({...hospRegData, address: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="123 Care Ave, Healthcare City" required />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Authorized Administrator Details</label>
              <input type="text" value={hospRegData.adminDetails} onChange={e => setHospRegData({...hospRegData, adminDetails: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900" placeholder="e.g. John Doe, Chief Administrator" required />
            </div>
            <div className="col-span-1 md:col-span-2 mt-4">
              <button type="submit" className="w-full flex items-center justify-center bg-slate-800 text-white px-4 py-3 text-sm font-bold hover:bg-slate-700 transition-colors rounded-sm">
                Create Account & Access Portal
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-sm border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Doctor Login */}
        <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm flex flex-col">
          <div className="flex h-12 w-12 items-center justify-center bg-blue-50 text-blue-900 border border-blue-100 rounded-sm mb-6">
            <UserCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Doctor Access</h2>
          <p className="text-sm text-slate-500 mb-8">Access your clinical workspace using your unique Medical/Professional ID.</p>
          
          <form onSubmit={handleDocLogin} className="space-y-4 mb-8">
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

          <div className="mt-auto pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600 mb-3">Don't have an account?</p>
            <button 
              type="button"
              onClick={() => setView('register_doctor')}
              className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 transition-colors rounded-sm"
            >
              <UserCircle className="h-4 w-4 mr-2" /> Create New Doctor Account
            </button>
          </div>
        </div>

        {/* Hospital Login */}
        <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm flex flex-col">
          <div className="flex h-12 w-12 items-center justify-center bg-slate-100 text-slate-700 border border-slate-200 rounded-sm mb-6">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Hospital Admin Access</h2>
          <p className="text-sm text-slate-500 mb-8">Manage facility doctors and organizational links using your Hospital ID.</p>
          
          <form onSubmit={handleHospLogin} className="space-y-4 mb-8">
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
          
          <div className="mt-auto pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600 mb-3">New Facility?</p>
            <button 
              type="button"
              onClick={() => setView('register_hospital')}
              className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 transition-colors rounded-sm"
            >
              <Building2 className="h-4 w-4 mr-2" /> Create New Hospital Account
            </button>
          </div>
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
  const { doctors, linkDoctorToHospital, doctorRequests, updateDoctorRequest, updateDoctor } = useStore();
  const linkedDoctors = doctors.filter(d => d.hospitalIds.includes(hospital.hospitalId));
  
  // Pending Requests for this hospital
  const pendingRequests = doctorRequests.filter(req => req.hospitalId === hospital.hospitalId && req.status === 'Pending');

  const handleApprove = (req: any) => {
    updateDoctorRequest({ ...req, status: 'Approved' });
    linkDoctorToHospital(req.medicalId, hospital.hospitalId);
  };

  const handleReject = (req: any) => {
    updateDoctorRequest({ ...req, status: 'Rejected' });
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
        
        {/* Left Col: Roster & Requests */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Doctor Requests */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-amber-50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-amber-900 flex items-center"><UserPlus className="mr-2 h-4 w-4 text-amber-600" /> Pending Doctor Requests</h2>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">{pendingRequests.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingRequests.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No pending requests at this time.</div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{req.doctorName}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Med ID: {req.medicalId}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Requested: {new Date(req.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleReject(req)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-sm hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors">Reject</button>
                      <button onClick={() => handleApprove(req)} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-sm hover:bg-blue-800 transition-colors">Approve Link</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 flex items-center"><UserCircle className="mr-2 h-4 w-4 text-blue-900" /> Linked Doctors Roster</h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{linkedDoctors.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {linkedDoctors.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No doctors linked to this facility.</div>
              ) : (
                linkedDoctors.map(doc => (
                  <div key={doc.medicalId} className="p-6 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Med ID: {doc.medicalId} <span className="mx-2 text-slate-300">|</span> {doc.specialty}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-sm shadow-sm p-6 text-white">
            <h3 className="text-sm font-bold mb-4 flex items-center"><Activity className="mr-2 h-4 w-4 text-blue-400" /> Hospital Overview</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-slate-300"><span className="text-white font-medium">Type:</span> {hospital.type}</p>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-slate-300"><span className="text-white font-medium">Location:</span> {hospital.address}</p>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                <p className="text-sm text-slate-300"><span className="text-white font-medium">Roster Size:</span> {linkedDoctors.length} providers</p>
              </li>
            </ul>
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'hospitals'>('dashboard');
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
            <li>
              <button onClick={() => setActiveTab('hospitals')} className={`w-full flex items-center px-6 py-2.5 text-sm font-medium transition-colors ${ activeTab === 'hospitals' ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }`}>
                <Building2 className={`mr-3 h-4 w-4 ${activeTab === 'hospitals' ? 'text-blue-900' : 'text-slate-400'}`} /> My Hospitals
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
          {activeTab === 'hospitals' && <DoctorHospitals doctor={doctor} />}
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
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'overview' | 'history' | 'add_record'>('overview');
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors text-slate-600"><ChevronLeft className="h-5 w-5" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
              <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-semibold rounded-sm">ID: {patient.aadhaar}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">DOB: {patient.dob} | Blood: {patient.bloodGroup}</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200">
          <WorkspaceTab active={activeWorkspaceTab === 'overview'} onClick={() => setActiveWorkspaceTab('overview')} icon={Activity} label="Overview" />
          <WorkspaceTab active={activeWorkspaceTab === 'history'} onClick={() => setActiveWorkspaceTab('history')} icon={Clock} label="Health Timeline" />
          <WorkspaceTab active={activeWorkspaceTab === 'add_record'} onClick={() => setActiveWorkspaceTab('add_record')} icon={Plus} label="Add Record" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {activeWorkspaceTab === 'overview' && <ClinicalOverview patient={patient} />}
          {activeWorkspaceTab === 'history' && <PatientHistoryView patient={patient} />}
          {activeWorkspaceTab === 'add_record' && <AddRecordView patient={patient} doctor={doctor} onSuccess={() => setActiveWorkspaceTab('history')} />}
        </div>
      </div>
    </div>
  );
}

function WorkspaceTab({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${
        active ? 'bg-white text-blue-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent'
      }`}
    >
      <Icon className="mr-2 h-4 w-4" /> {label}
    </button>
  );
}

function ClinicalOverview({ patient }: { patient: Patient }) {
  const { vitals, conditions, updateVitals, updatePatient } = useStore();
  const patientVitals = vitals[patient.aadhaar];
  
  const [editingVitals, setEditingVitals] = useState(false);
  const [vitalsData, setVitalsData] = useState({ bloodPressure: patientVitals?.bloodPressure || '', heartRate: patientVitals?.heartRate || '', weight: patientVitals?.weight || '', height: patientVitals?.height || '' });
  
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [allergiesText, setAllergiesText] = useState(patient.allergies || 'None');

  const myConditions = conditions.filter(c => c.patientAadhaar === patient.aadhaar && c.status === 'Active');

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    updateVitals({
      id: `VIT-${Date.now()}`,
      patientAadhaar: patient.aadhaar,
      bloodPressure: vitalsData.bloodPressure,
      heartRate: vitalsData.heartRate,
      weight: vitalsData.weight,
      height: vitalsData.height,
      updatedAt: new Date().toISOString()
    });
    setEditingVitals(false);
  };

  const handleSaveAllergies = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient({ ...patient, allergies: allergiesText });
    setEditingAllergies(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Vitals */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Current Vitals</h3>
          {!editingVitals && (
            <button onClick={() => setEditingVitals(true)} className="text-xs font-semibold text-blue-900 hover:underline border border-blue-200 bg-blue-50 px-3 py-1 rounded-sm">Update Vitals</button>
          )}
        </div>
        
        {editingVitals ? (
          <form onSubmit={handleSaveVitals} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Blood Pressure</label>
                <input required type="text" value={vitalsData.bloodPressure} onChange={e => setVitalsData({...vitalsData, bloodPressure: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm" placeholder="120/80" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Heart Rate (bpm)</label>
                <input required type="text" value={vitalsData.heartRate} onChange={e => setVitalsData({...vitalsData, heartRate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm" placeholder="72" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Weight</label>
                <input required type="text" value={vitalsData.weight} onChange={e => setVitalsData({...vitalsData, weight: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm" placeholder="70 kg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Height</label>
                <input required type="text" value={vitalsData.height} onChange={e => setVitalsData({...vitalsData, height: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm" placeholder="175 cm" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingVitals(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-sm hover:bg-blue-800 transition-colors">Save Vitals</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div><p className="text-xs font-semibold text-slate-500 uppercase">Blood Pressure</p><p className="text-lg font-bold text-slate-900 mt-1">{patientVitals?.bloodPressure || "--"}</p></div>
            <div><p className="text-xs font-semibold text-slate-500 uppercase">Heart Rate</p><p className="text-lg font-bold text-slate-900 mt-1">{patientVitals ? `${patientVitals.heartRate} bpm` : "--"}</p></div>
            <div><p className="text-xs font-semibold text-slate-500 uppercase">Weight</p><p className="text-lg font-bold text-slate-900 mt-1">{patientVitals?.weight || "--"}</p></div>
            <div><p className="text-xs font-semibold text-slate-500 uppercase">Height</p><p className="text-lg font-bold text-slate-900 mt-1">{patientVitals?.height || "--"}</p></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conditions */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Conditions</h3>
          </div>
          {myConditions.length > 0 ? (
            <ul className="space-y-3">
              {myConditions.map(c => (
                <li key={c.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Onset: {new Date(c.onset).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-rose-50 text-rose-700 font-bold uppercase tracking-wider rounded-sm">Active</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic">No active conditions.</p>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Allergies</h3>
            {!editingAllergies && (
              <button onClick={() => setEditingAllergies(true)} className="text-xs font-semibold text-amber-900 border border-amber-200 bg-amber-50 px-3 py-1 rounded-sm hover:underline">Edit Allergies</button>
            )}
          </div>
          {editingAllergies ? (
            <form onSubmit={handleSaveAllergies} className="space-y-3">
              <input type="text" value={allergiesText} onChange={e => setAllergiesText(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm" placeholder="e.g. Penicillin, Peanuts" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingAllergies(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-sm hover:bg-blue-800">Save</button>
              </div>
            </form>
          ) : (
            <p className="text-sm font-medium text-amber-900">{patient.allergies || 'None reported'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientHistoryView({ patient }: { patient: Patient }) {
  const { encounters } = useStore();
  const patientEncounters = encounters.filter(e => e.patientAadhaar === patient.aadhaar).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8 animate-in fade-in duration-500">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Lifelong Health Timeline</h2>
      {patientEncounters.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-sm">No historical records found.</div>
      ) : (
        <div className="relative border-l border-slate-200 ml-4 space-y-8 py-4">
          {patientEncounters.map((enc) => (
            <div key={enc.id} className="relative pl-8">
              <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-900"></span>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{enc.title}</h4>
                  </div>
                  <span className="text-sm font-mono font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-sm">{enc.date}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Provider / Facility</p>
                    <p className="text-sm text-slate-800 mt-0.5">{enc.provider} &bull; {enc.facility}</p>
                  </div>
                </div>
                {enc.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Clinical Notes / Details</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{enc.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddRecordView({ patient, doctor, onSuccess }: { patient: Patient, doctor: Doctor, onSuccess: () => void }) {
  const { addEncounter, addCondition, addMedication, hospitals } = useStore();
  const [recordType, setRecordType] = useState('Clinical Consultation');
  
  const linkedHospitals = doctor.hospitalIds.map(id => {
    const h = hospitals.find(x => x.hospitalId === id);
    return h ? h.name : "Unknown Facility";
  });

  const [formData, setFormData] = useState({ 
    title: '', notes: '', diagnosis: '', rxName: '', rxDosage: '', facility: linkedHospitals[0] || 'Independent Practice' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Auto-prefix title based on type to aid Patient Portal filtering
    let finalTitle = formData.title;
    if (recordType === 'Lab Report' && !finalTitle.toLowerCase().includes('lab')) finalTitle = `Lab Report: ${finalTitle}`;
    if (recordType === 'Scan Report' && !finalTitle.toLowerCase().includes('scan')) finalTitle = `Scan Report: ${finalTitle}`;
    if (recordType === 'Vaccination' && !finalTitle.toLowerCase().includes('vaccin')) finalTitle = `Vaccination: ${finalTitle}`;
    if (recordType === 'Surgery/Procedure' && !finalTitle.toLowerCase().includes('surgery')) finalTitle = `Surgery: ${finalTitle}`;
    if (recordType === 'Follow-up Appointment' && !finalTitle.toLowerCase().includes('follow-up')) finalTitle = `Follow-up Appointment: ${finalTitle}`;

    addEncounter({ 
      id: `ENC-${Date.now()}`, 
      patientAadhaar: patient.aadhaar, 
      date: dateStr, 
      title: finalTitle, 
      provider: doctor.name, 
      facility: formData.facility, 
      notes: formData.notes || `Added via ${recordType} module.` 
    });

    if (formData.diagnosis) {
      addCondition({ id: `COND-${Date.now()}`, patientAadhaar: patient.aadhaar, title: formData.diagnosis, onset: dateStr, status: 'Active' });
    }
    if (formData.rxName) {
      addMedication({ id: `MED-${Date.now()}`, patientAadhaar: patient.aadhaar, name: formData.rxName, dosage: formData.rxDosage || 'As directed', provider: doctor.name });
    }
    
    setFormData({ title: '', notes: '', diagnosis: '', rxName: '', rxDosage: '', facility: formData.facility });
    onSuccess();
  };

  const types = ['Clinical Consultation', 'Lab Report', 'Scan Report', 'Vaccination', 'Surgery/Procedure', 'Follow-up Appointment'];

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm animate-in fade-in duration-500">
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-5">
        <h2 className="text-lg font-bold text-slate-900">Add Medical Record</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        <div className="flex gap-2 border-b border-slate-100 pb-6 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setRecordType(t)}
              className={`px-4 py-2 text-xs font-bold rounded-sm transition-colors border ${
                recordType === t ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-5 border-b border-slate-100 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Facility / Hospital Context *</label>
              <select value={formData.facility} onChange={e => setFormData({...formData, facility: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-900 bg-white">
                {linkedHospitals.length === 0 && <option>Independent Practice</option>}
                {linkedHospitals.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Record Title *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm" placeholder={recordType === 'Clinical Consultation' ? "e.g. Chest pain evaluation" : `e.g. ${recordType} details`} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Notes / Details {recordType === 'Clinical Consultation' && '*'}</label>
            <textarea required={recordType === 'Clinical Consultation'} rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm leading-relaxed" placeholder="Detailed clinical notes, findings, or procedure description..." />
          </div>

          {(recordType === 'Clinical Consultation' || recordType === 'Follow-up Appointment') && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Add Diagnosis (Optional)</label>
                <input type="text" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm" placeholder="e.g. Hypertension" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Prescribe Medication (Optional)</label>
                <input type="text" value={formData.rxName} onChange={e => setFormData({...formData, rxName: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm" placeholder="e.g. Amlodipine 5mg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Dosage Instructions</label>
                <input type="text" value={formData.rxDosage} onChange={e => setFormData({...formData, rxDosage: e.target.value})} className="block w-full rounded-sm border border-slate-300 px-4 py-2.5 text-sm" placeholder="e.g. Once daily after meals" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-6 py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 transition-colors rounded-sm flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Save & Broadcast to Unified Record
          </button>
        </div>
      </form>
    </div>
  );
}


function DoctorHospitals({ doctor }: { doctor: Doctor }) {
  const { hospitals, doctorRequests, addDoctorRequest } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Existing hospitals
  const myHospitals = doctor.hospitalIds.map(id => hospitals.find(h => h.hospitalId === id)).filter(Boolean) as Hospital[];
  
  // Pending requests
  const myPendingRequests = doctorRequests.filter(req => req.medicalId === doctor.medicalId && req.status === 'Pending');
  
  // Search for new hospitals
  const searchResults = hospitals.filter(h => 
    !doctor.hospitalIds.includes(h.hospitalId) && 
    !myPendingRequests.some(req => req.hospitalId === h.hospitalId) &&
    (h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.hospitalId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendRequest = (hospital: Hospital) => {
    addDoctorRequest({
      id: `REQ-${Date.now()}`,
      medicalId: doctor.medicalId,
      hospitalId: hospital.hospitalId,
      doctorName: doctor.name,
      hospitalName: hospital.name,
      status: 'Pending',
      date: new Date().toISOString()
    });
    setSearchQuery(""); // clear search
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Hospitals</h1>
        <p className="text-sm text-slate-600 mt-1">Manage your hospital affiliations and send join requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 flex items-center"><Building2 className="mr-2 h-4 w-4 text-blue-900" /> Current Affiliations</h2>
            </div>
            <div className="divide-y divide-slate-100 p-2">
              {myHospitals.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No hospital affiliations yet.</div>
              ) : (
                myHospitals.map(h => (
                  <div key={h.hospitalId} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{h.address}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-blue-900 bg-blue-50 px-2 py-1 rounded-sm border border-blue-100">{h.hospitalId}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {myPendingRequests.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-amber-50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-amber-900 flex items-center"><Clock className="mr-2 h-4 w-4 text-amber-600" /> Pending Requests</h2>
              </div>
              <div className="divide-y divide-slate-100 p-2">
                {myPendingRequests.map(req => (
                  <div key={req.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{req.hospitalName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Requested on {new Date(req.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-sm tracking-wider">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 h-fit">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center"><Plus className="mr-2 h-4 w-4 text-blue-900" /> Add New Hospital</h2>
          <div className="relative mb-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="block w-full rounded-sm border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 transition-colors" placeholder="Search registered hospitals..." />
          </div>

          {searchQuery.length > 0 && (
            <div className="border border-slate-200 rounded-sm overflow-hidden">
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No matching hospitals found.</div>
                ) : (
                  searchResults.map(h => (
                    <div key={h.hospitalId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {h.hospitalId}</p>
                      </div>
                      <button onClick={() => handleSendRequest(h)} className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors rounded-sm text-center">
                        Send Request
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
