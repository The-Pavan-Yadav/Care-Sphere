import re

with open("src/pages/patient/PatientDashboard.tsx", "r") as f:
    content = f.read()

# 1. Update TabID
tabid_pattern = r"type TabID = 'dashboard' \| 'timeline' \| 'records' \| 'labs' \| 'scans' \| 'prescriptions' \| 'medications' \| 'appointments' \| 'providers' \| 'insurance' \| 'settings';"
new_tabid = "type TabID = 'dashboard' | 'timeline' | 'records' | 'labs' | 'scans' | 'prescriptions' | 'medications' | 'appointments' | 'providers' | 'overview' | 'insurance' | 'settings';"
content = content.replace(tabid_pattern, new_tabid)

# 2. Add to navItems
nav_pattern = r"\{ id: 'providers' as TabID, label: 'Doctors/Hospitals', icon: Building2 \},"
new_nav = "{ id: 'providers' as TabID, label: 'Doctors/Hospitals', icon: Building2 },\n    { id: 'overview' as TabID, label: 'Health Overview', icon: Activity },"
content = content.replace(nav_pattern, new_nav)

# 3. Add to Switch
switch_pattern = r"\{activeTab === 'providers' && <ProvidersView patient=\{patient\} />\}"
new_switch = "{activeTab === 'providers' && <ProvidersView patient={patient} />}\n          {activeTab === 'overview' && <HealthOverviewView patient={patient} />}"
content = content.replace(switch_pattern, new_switch)

# 4. Add Component
component = """
function HealthOverviewView({ patient }: { patient: Patient }) {
  const { vitals, conditions, medications, encounters } = useStore();
  const patientVitals = vitals[patient.aadhaar];
  
  const myConditions = useMemo(() => conditions.filter(c => c.patientAadhaar === patient.aadhaar && c.status === 'Active'), [conditions, patient.aadhaar]);
  const myMedications = useMemo(() => medications.filter(m => m.patientAadhaar === patient.aadhaar), [medications, patient.aadhaar]);
  const myEncounters = useMemo(() => encounters.filter(e => e.patientAadhaar === patient.aadhaar).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [encounters, patient.aadhaar]);
  
  const testResults = useMemo(() => myEncounters.filter(e => e.title.toLowerCase().includes('test') || e.title.toLowerCase().includes('lab') || e.title.toLowerCase().includes('scan') || e.title.toLowerCase().includes('report')), [myEncounters]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Health Overview</h2>
          <p className="text-slate-500 text-sm mt-1">At-a-glance summary of your current health status and records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Vitals & Key Stats */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-900 flex items-center"><Activity className="h-5 w-5 mr-2 text-blue-900" /> Current Vitals</h3>
               {patientVitals && <span className="text-xs text-slate-400 font-medium">Last updated: {new Date(patientVitals.updatedAt).toLocaleDateString()}</span>}
             </div>
             {patientVitals ? (
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Blood Pressure</p>
                    <p className="text-xl font-bold text-slate-900">{patientVitals.bloodPressure}</p>
                 </div>
                 <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Heart Rate</p>
                    <p className="text-xl font-bold text-slate-900">{patientVitals.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span></p>
                 </div>
                 <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Weight</p>
                    <p className="text-xl font-bold text-slate-900">{patientVitals.weight}</p>
                 </div>
                 <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Height</p>
                    <p className="text-xl font-bold text-slate-900">{patientVitals.height}</p>
                 </div>
               </div>
             ) : (
               <div className="text-center py-6 bg-slate-50 border border-slate-100 rounded-sm">
                 <p className="text-sm text-slate-500">No recent vitals recorded.</p>
               </div>
             )}
          </div>

          {/* Active Conditions & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 flex items-center mb-4"><AlertCircle className="h-4 w-4 mr-2 text-rose-600" /> Active Conditions</h3>
              <div className="flex-1">
                {myConditions.length > 0 ? (
                  <ul className="space-y-3">
                    {myConditions.map(c => (
                      <li key={c.id} className="flex justify-between items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{c.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Onset: {new Date(c.onset).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-rose-50 text-rose-700 font-bold uppercase tracking-wider rounded-sm">Active</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 italic">No active conditions recorded.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 flex items-center mb-4"><Shield className="h-4 w-4 mr-2 text-amber-600" /> Allergies</h3>
              <div className="flex-1 bg-amber-50/50 p-4 border border-amber-100 rounded-sm">
                {patient.allergies && patient.allergies !== 'None' ? (
                  <p className="text-sm font-medium text-amber-900">{patient.allergies}</p>
                ) : (
                  <p className="text-sm text-slate-500">No known allergies.</p>
                )}
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center mb-4"><Pill className="h-4 w-4 mr-2 text-indigo-600" /> Current Medications</h3>
            {myMedications.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myMedications.map(m => (
                  <div key={m.id} className="p-3 border border-slate-100 bg-slate-50 rounded-sm flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.dosage}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 italic">No active medications.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Health Trends */}
          <div className="bg-slate-900 rounded-sm shadow-sm p-6 text-white">
             <h3 className="text-sm font-bold flex items-center mb-4"><Activity className="h-4 w-4 mr-2 text-blue-400" /> Health Trends</h3>
             <ul className="space-y-4">
               <li className="flex items-start">
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                 <p className="text-sm text-slate-300"><span className="text-white font-medium">Vitals:</span> {patientVitals ? 'Stable based on latest readings.' : 'Awaiting baseline assessment.'}</p>
               </li>
               <li className="flex items-start">
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                 <p className="text-sm text-slate-300"><span className="text-white font-medium">Conditions:</span> Managing {myConditions.length} active condition(s).</p>
               </li>
               <li className="flex items-start">
                 <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                 <p className="text-sm text-slate-300"><span className="text-white font-medium">Encounters:</span> {myEncounters.length} total visits recorded in CareSphere.</p>
               </li>
             </ul>
          </div>

          {/* Recent Test Results */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center mb-4"><TestTube className="h-4 w-4 mr-2 text-purple-600" /> Recent Test Results</h3>
            {testResults.length > 0 ? (
              <ul className="space-y-4">
                {testResults.slice(0, 3).map(tr => (
                  <li key={tr.id} className="border-l-2 border-purple-200 pl-3">
                    <p className="text-sm font-semibold text-slate-800">{tr.title}</p>
                    <p className="text-xs text-slate-500">{new Date(tr.date).toLocaleDateString()} &bull; {tr.facility}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic text-center py-2">No recent test results found in encounters.</p>
            )}
          </div>

          {/* Vaccination Status */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center mb-4"><ShieldCheck className="h-4 w-4 mr-2 text-emerald-600" /> Vaccination Status</h3>
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-100 rounded-sm">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Up to Date</p>
                <p className="text-xs text-emerald-700 mt-0.5">No pending mandatory vaccines</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
"""

with open("src/pages/patient/PatientDashboard.tsx", "w") as f:
    f.write(content + "\n" + component)

