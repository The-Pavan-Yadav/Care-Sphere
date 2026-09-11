import re

with open("src/pages/provider/ProviderDashboard.tsx", "r") as f:
    content = f.read()

new_login_view = """function LoginView({ onLoginDoctor, onLoginHospital }: { onLoginDoctor: (d: Doctor) => void, onLoginHospital: (h: Hospital) => void }) {
  const { doctors, hospitals, addDoctor } = useStore();
  const [docId, setDocId] = useState("PRV-1029");
  const [hospId, setHospId] = useState("HOSP-001");
  const [error, setError] = useState("");
  const [view, setView] = useState<'login' | 'register'>('login');

  const [regData, setRegData] = useState({
    name: '', medicalId: '', specialty: '', phone: '', email: '', qualifications: '', hospitalAffiliation: ''
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

  if (view === 'register') {
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
              onClick={() => setView('register')}
              className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 transition-colors rounded-sm"
            >
              <UserCircle className="h-4 w-4 mr-2" /> Create New Doctor Account
            </button>
          </div>
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
"""

content = re.sub(r'function LoginView\(\{ onLoginDoctor, onLoginHospital \}.*?\} // end of LoginView component block, searching up to the next section', new_login_view, content, flags=re.DOTALL)
# wait, regex needs to be precise
content = re.sub(r'function LoginView\(\{ onLoginDoctor, onLoginHospital \}: \{ onLoginDoctor: \(d: Doctor\) => void, onLoginHospital: \(h: Hospital\) => void \}\) \{.*?\n\}\n\n// ==========================================\n// 2\. HOSPITAL ADMIN WORKSPACE', new_login_view + '\n\n// ==========================================\n// 2. HOSPITAL ADMIN WORKSPACE', content, flags=re.DOTALL)

with open("src/pages/provider/ProviderDashboard.tsx", "w") as f:
    f.write(content)
