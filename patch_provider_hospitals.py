with open("src/pages/provider/ProviderDashboard.tsx", "r") as f:
    content = f.read()

# 1. Update useState for activeTab
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments'>('dashboard');",
    "const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'hospitals'>('dashboard');"
)

# 2. Add 'My Hospitals' to Sidebar nav
nav_item = """            <li>
              <button onClick={() => setActiveTab('hospitals')} className={`w-full flex items-center px-6 py-2.5 text-sm font-medium transition-colors ${ activeTab === 'hospitals' ? 'bg-blue-50 text-blue-900 border-r-2 border-blue-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }`}>
                <Building2 className={`mr-3 h-4 w-4 ${activeTab === 'hospitals' ? 'text-blue-900' : 'text-slate-400'}`} /> My Hospitals
              </button>
            </li>"""
content = content.replace(
    "Appointments\n              </button>\n            </li>",
    f"Appointments\n              </button>\n            </li>\n{nav_item}"
)

# 3. Add Component to Main Content Area
content = content.replace(
    "{activeTab === 'appointments' && <DoctorAppointments onSelectPatient={setSelectedPatient} />}",
    "{activeTab === 'appointments' && <DoctorAppointments onSelectPatient={setSelectedPatient} />}\n          {activeTab === 'hospitals' && <DoctorHospitals doctor={doctor} />}"
)

# 4. Add DoctorHospitals component
hospital_component = """
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
"""

content = content + "\n" + hospital_component

with open("src/pages/provider/ProviderDashboard.tsx", "w") as f:
    f.write(content)
