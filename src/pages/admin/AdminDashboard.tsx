import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Users, Building2, Activity, Database, FileText, 
  ShieldCheck, Pill, Microscope, LayoutDashboard, 
  Search, Plus, Stethoscope, ChevronRight
} from "lucide-react";
import { useStore } from "../../lib/Store";

type AdminTab = 
  | 'analytics' 
  | 'patients' 
  | 'doctors' 
  | 'hospitals' 
  | 'records' 
  | 'labs' 
  | 'prescriptions' 
  | 'audit';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 items-stretch">
      
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-white hidden md:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Government Portal</h2>
            <p className="text-sm font-semibold text-slate-900 flex items-center">
              <ShieldCheck className="mr-2 h-4 w-4 text-blue-900" /> System Admin
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              <SidebarItem active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={LayoutDashboard} label="Health Analytics" />
              
              <div className="pt-4 pb-1 px-6"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registries</p></div>
              <SidebarItem active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} icon={Users} label="Patients Registry" />
              <SidebarItem active={activeTab === 'hospitals'} onClick={() => setActiveTab('hospitals')} icon={Building2} label="Hospital Management" />
              <SidebarItem active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')} icon={Stethoscope} label="Doctor Verification" />
              
              <div className="pt-4 pb-1 px-6"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Data Oversight</p></div>
              <SidebarItem active={activeTab === 'records'} onClick={() => setActiveTab('records')} icon={FileText} label="Medical Records" />
              <SidebarItem active={activeTab === 'labs'} onClick={() => setActiveTab('labs')} icon={Microscope} label="Lab & Scan Reports" />
              <SidebarItem active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')} icon={Pill} label="Prescriptions" />
              
              <div className="pt-4 pb-1 px-6"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security & Compliance</p></div>
              <SidebarItem active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={Database} label="Audit Logs" />
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-8 pb-12">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'analytics' && <HealthAnalyticsView />}
            {activeTab === 'patients' && <PatientsRegistryView />}
            {activeTab === 'hospitals' && <HospitalManagementView />}
            {activeTab === 'doctors' && <DoctorVerificationView />}
            {activeTab === 'records' && <MedicalRecordsView />}
            {activeTab === 'labs' && <LabsAndScansView />}
            {activeTab === 'prescriptions' && <PrescriptionsView />}
            {activeTab === 'audit' && <AuditLogsView />}
          </div>
        </div>
      </div>

    </div>
  );
}

function SidebarItem({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center px-6 py-2 text-sm font-medium transition-colors ${
          active 
            ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon className={`mr-3 h-4 w-4 ${active ? 'text-blue-900' : 'text-slate-400'}`} />
        {label}
      </button>
    </li>
  );
}

// =====================================
// VIEWS
// =====================================

function HealthAnalyticsView() {
  const { patients, hospitals, doctors, encounters, medications } = useStore();
  
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">Health Analytics Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time metrics across the CareSphere national ecosystem.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Registered Patients" value={patients.length} icon={Users} trend="+12% this month" />
        <StatCard title="Active Facilities" value={hospitals.length} icon={Building2} trend="+2 new" />
        <StatCard title="Verified Providers" value={doctors.length} icon={Stethoscope} trend="Fully Staffed" />
        <StatCard title="Clinical Records" value={encounters.length + medications.length} icon={FileText} trend="+45% utilization" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-blue-900" /> Recent System Activity
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm font-medium text-slate-700">New Patient Registrations</span>
              <span className="text-sm font-mono text-slate-500">24 today</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm font-medium text-slate-700">Clinical Encounters Logged</span>
              <span className="text-sm font-mono text-slate-500">142 today</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm font-medium text-slate-700">Prescriptions Issued</span>
              <span className="text-sm font-mono text-slate-500">89 today</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm font-medium text-slate-700">Lab Reports Uploaded</span>
              <span className="text-sm font-mono text-slate-500">35 today</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm flex flex-col items-center justify-center text-center">
           <ShieldCheck className="h-12 w-12 text-slate-300 mb-3" />
           <h3 className="text-base font-bold text-slate-900 mb-1">Ecosystem is Secure</h3>
           <p className="text-sm text-slate-500 max-w-sm">All identity services and health record synchronization pipelines are operating nominally.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: number, icon: any, trend: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
        <Icon className="h-5 w-5 text-blue-900 opacity-80" />
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-400 mt-2">{trend}</p>
    </div>
  );
}

function PatientsRegistryView() {
  const { patients } = useStore();
  const [search, setSearch] = useState("");
  
  const filtered = patients.filter(p => p.aadhaar.includes(search) || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients Registry</h1>
          <p className="text-sm text-slate-500 mt-1">National database of registered citizens and their primary identifiers.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search Aadhaar or Name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-sm text-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 w-64" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Aadhaar ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">DOB</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Blood Group</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map(p => (
                <tr key={p.aadhaar} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-blue-900">{p.aadhaar}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4">{p.dob}</td>
                  <td className="px-6 py-4">{p.mobile}<br/><span className="text-xs text-slate-400">{p.email}</span></td>
                  <td className="px-6 py-4 font-semibold">{p.bloodGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HospitalManagementView() {
  const { hospitals, addHospital } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [newHosp, setNewHosp] = useState({ name: '', type: 'General Hospital', address: '' });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHosp.name || !newHosp.address) return;
    const id = `HOSP-${Math.floor(Math.random() * 900) + 100}`;
    addHospital({ hospitalId: id, name: newHosp.name, type: newHosp.type, address: newHosp.address });
    setShowForm(false);
    setNewHosp({ name: '', type: 'General Hospital', address: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage institutional access and facility directory.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-sm hover:bg-slate-700 transition-colors">
          {showForm ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Register Facility</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Register New Facility</h3>
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Facility Name</label>
              <input required type="text" value={newHosp.name} onChange={e => setNewHosp({...newHosp, name: e.target.value})} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Facility Type</label>
              <select value={newHosp.type} onChange={e => setNewHosp({...newHosp, type: e.target.value})} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-blue-900 bg-white">
                <option>General Hospital</option><option>Specialty Clinic</option><option>Diagnostic Center</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Address / Location</label>
              <input required type="text" value={newHosp.address} onChange={e => setNewHosp({...newHosp, address: e.target.value})} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
            </div>
            <div className="md:col-span-1">
              <button type="submit" className="w-full bg-blue-900 text-white px-4 py-2 text-sm font-bold rounded-sm hover:bg-blue-800 transition-colors">Save Facility</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr><th className="px-6 py-4">Hospital ID</th><th className="px-6 py-4">Facility Name</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Address</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {hospitals.map(h => (
              <tr key={h.hospitalId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-blue-900">{h.hospitalId}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{h.name}</td>
                <td className="px-6 py-4">{h.type}</td>
                <td className="px-6 py-4">{h.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DoctorVerificationView() {
  const { doctors, addDoctor } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', specialty: '' });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.specialty) return;
    const id = `PRV-${Math.floor(Math.random() * 9000) + 1000}`;
    addDoctor({ medicalId: id, name: newDoc.name, specialty: newDoc.specialty, hospitalIds: [] });
    setShowForm(false);
    setNewDoc({ name: '', specialty: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Verification</h1>
          <p className="text-sm text-slate-500 mt-1">Global registry of authorized medical professionals.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-sm hover:bg-slate-700 transition-colors">
          {showForm ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Professional</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Register Medical Professional</h3>
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input required type="text" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900" placeholder="e.g. Dr. Jane Doe" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Specialty</label>
              <input required type="text" value={newDoc.specialty} onChange={e => setNewDoc({...newDoc, specialty: e.target.value})} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900" />
            </div>
            <div className="md:col-span-1">
              <button type="submit" className="w-full bg-blue-900 text-white px-4 py-2 text-sm font-bold rounded-sm hover:bg-blue-800 transition-colors">Register Doctor</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">Medical ID</th>
              <th className="px-6 py-4">Provider Name</th>
              <th className="px-6 py-4">Specialty</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Facility Associations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {doctors.map(d => (
              <tr key={d.medicalId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-blue-900">{d.medicalId}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{d.name}</td>
                <td className="px-6 py-4">{d.specialty}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                  </span>
                </td>
                <td className="px-6 py-4">
                  {d.hospitalIds.length > 0 ? (
                    <span className="font-mono text-xs">{d.hospitalIds.join(", ")}</span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Unassociated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MedicalRecordsView() {
  const { encounters, patients } = useStore();
  const sorted = [...encounters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">National Medical Records</h1>
        <p className="text-sm text-slate-500 mt-1">Cross-facility chronological timeline of patient encounters.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Patient Details</th>
              <th className="px-6 py-4">Encounter</th>
              <th className="px-6 py-4">Facility / Provider</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sorted.map(enc => {
              const patient = patients.find(p => p.aadhaar === enc.patientAadhaar);
              return (
                <tr key={enc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">{enc.date}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{patient?.name || 'Unknown'}</p>
                    <p className="font-mono text-xs text-slate-400 mt-0.5">{enc.patientAadhaar}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{enc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{enc.notes}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{enc.facility}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{enc.provider}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-900 font-semibold text-xs hover:underline">Inspect</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LabsAndScansView() {
  const { encounters, patients } = useStore();
  // Filter for encounters that look like uploads/reports based on title/notes in our demo
  const reports = encounters.filter(e => e.title.includes('Report') || e.title.includes('Scan') || e.title.includes('Uploaded'));
  const sorted = [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">Lab & Scan Reports Oversight</h1>
        <p className="text-sm text-slate-500 mt-1">Digitized diagnostic documents across all facilities.</p>
      </div>

      {sorted.length === 0 ? (
         <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-sm">No digitized lab or scan reports found in the ecosystem.</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">Patient Aadhaar</th>
                <th className="px-6 py-4">Origin Facility</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sorted.map(enc => (
                <tr key={enc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500">{enc.date}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{enc.title}</td>
                  <td className="px-6 py-4 font-mono text-xs">{enc.patientAadhaar}</td>
                  <td className="px-6 py-4">{enc.facility}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm text-[10px] font-bold uppercase tracking-wider">Attached</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PrescriptionsView() {
  const { medications, patients } = useStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">Global Prescriptions Ledger</h1>
        <p className="text-sm text-slate-500 mt-1">Cross-reference active medications prescribed across the ecosystem.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">Prescription ID</th>
              <th className="px-6 py-4">Medication & Dosage</th>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Prescribing Provider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {medications.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center">No prescriptions found.</td></tr>
            ) : medications.map(med => {
              const patient = patients.find(p => p.aadhaar === med.patientAadhaar);
              return (
                <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{med.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{med.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{med.dosage}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{patient?.name}</p>
                    <p className="font-mono text-xs text-slate-400 mt-0.5">{med.patientAadhaar}</p>
                  </td>
                  <td className="px-6 py-4">{med.provider}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditLogsView() {
  const { auditLogs } = useStore();
  const sortedLogs = [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Immutable record of all access and modification events.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4 w-48">Timestamp</th>
              <th className="px-6 py-4 w-32">Action Type</th>
              <th className="px-6 py-4 w-32">Actor</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-slate-100 border border-slate-200 text-slate-600">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">{log.actor}</td>
                <td className="px-6 py-4 text-slate-700">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboardWrapper() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setIsAuthenticated(false);
      setSearchParams({});
    } else if (searchParams.get('demo') === 'true') {
      setIsAuthenticated(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  if (!isAuthenticated) {
    return <AdminLoginView onLogin={() => setIsAuthenticated(true)} />;
  }
  
  return <AdminDashboard />;
}

function AdminLoginView({ onLogin }: { onLogin: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier === "9100" && password === "9100") {
      onLogin();
    } else {
      setError("Invalid credentials. Try 9100/9100");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm max-w-md w-full">
        <div className="flex h-12 w-12 items-center justify-center bg-blue-50 text-blue-900 border border-blue-100 rounded-sm mb-6">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">System Administrator Login</h2>
        <p className="text-sm text-slate-500 mb-8">Secure access for government and institutional administration.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin ID</label>
            <input 
              type="text" 
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
              placeholder="Enter Admin ID"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passcode</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
              placeholder="Enter Passcode"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-blue-900 text-white font-semibold py-3 rounded-sm hover:bg-blue-800 transition-colors mt-2"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}

