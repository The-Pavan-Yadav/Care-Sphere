with open("src/pages/provider/ProviderDashboard.tsx", "r") as f:
    content = f.read()

import re

# Update HospitalAdminWorkspace
new_hospital_admin = """function HospitalAdminWorkspace({ hospital, onLogout }: { hospital: Hospital, onLogout: () => void }) {
  const { doctors, linkDoctorToHospital, doctorRequests, updateDoctorRequest, updateDoctor } = useStore();
  const linkedDoctors = doctors.filter(d => d.hospitalIds.includes(hospital.hospitalId));
  
  // Pending Requests for this hospital
  const pendingRequests = doctorRequests.filter(req => req.hospitalId === hospital.hospitalId && req.status === 'Pending');

  const handleApprove = (req: any) => {
    // 1. Update request status
    updateDoctorRequest({ ...req, status: 'Approved' });
    
    // 2. Link doctor
    const doc = doctors.find(d => d.medicalId === req.medicalId);
    if (doc && !doc.hospitalIds.includes(hospital.hospitalId)) {
      updateDoctor({ ...doc, hospitalIds: [...doc.hospitalIds, hospital.hospitalId] });
      // Or if linkDoctorToHospital handles it fine:
      // linkDoctorToHospital(req.medicalId, hospital.hospitalId);
    }
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
}"""

# regex replace HospitalAdminWorkspace
pattern = r"function HospitalAdminWorkspace.*?return \(\n.*?</div>\n  \);\n}"
content = re.sub(pattern, new_hospital_admin, content, flags=re.DOTALL)

with open("src/pages/provider/ProviderDashboard.tsx", "w") as f:
    f.write(content)
