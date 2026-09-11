import re

with open("src/pages/provider/ProviderDashboard.tsx", "r") as f:
    content = f.read()

new_login_view = """function LoginView({ onLoginDoctor, onLoginHospital }: { onLoginDoctor: (d: Doctor) => void, onLoginHospital: (h: Hospital) => void }) {
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
"""

start_idx = content.find("function LoginView(")
end_idx = content.find("function HospitalAdminWorkspace(")
if start_idx != -1 and end_idx != -1:
    # Need to find the end of the previous block.
    # Actually, we can just replace everything from `function LoginView(` to the comment block `// 2. HOSPITAL ADMIN WORKSPACE`
    import re
    # Find the comment block
    pattern = r'function LoginView\(.*?// ==========================================\n// 2\. HOSPITAL ADMIN WORKSPACE'
    
    # We will do it with index instead of regex to be 100% safe
    end_comment = content.find("// ==========================================\n// 2. HOSPITAL ADMIN WORKSPACE")
    if end_comment != -1:
        new_content = content[:start_idx] + new_login_view + "\n\n" + content[end_comment:]
        with open("src/pages/provider/ProviderDashboard.tsx", "w") as f:
            f.write(new_content)
        print("Success using index!")
    else:
        print("Could not find end comment.")
else:
    print("Could not find start/end functions.")
