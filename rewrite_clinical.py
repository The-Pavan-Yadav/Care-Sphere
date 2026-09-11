with open("src/pages/provider/ProviderDashboard.tsx", "r") as f:
    content = f.read()

# Find the start of ClinicalWorkspace
start_idx = content.find("// ==========================================\n// 4. CLINICAL WORKSPACE")
if start_idx != -1:
    new_clinical_workspace = """// ==========================================
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
"""
    new_content = content[:start_idx] + new_clinical_workspace
    with open("src/pages/provider/ProviderDashboard.tsx", "w") as f:
        f.write(new_content)
