with open("src/lib/Store.tsx", "r") as f:
    content = f.read()

type_def = """export type DoctorRequest = {
  id: string;
  medicalId: string;
  hospitalId: string;
  doctorName: string;
  hospitalName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
};

export type Doctor = {"""
content = content.replace("export type Doctor = {", type_def)

ctx_def = """  medications: Medication[];
  doctorRequests: DoctorRequest[];
  vitals: Record<string, Vitals>; // Keyed by patientAadhaar"""
content = content.replace("  medications: Medication[];\n  vitals: Record<string, Vitals>; // Keyed by patientAadhaar", ctx_def)

fn_def = """  updatePatient: (patient: Patient) => void;
  addDoctorRequest: (req: DoctorRequest) => void;
  updateDoctorRequest: (req: DoctorRequest) => void;
  updateDoctor: (doctor: Doctor) => void;
  addDoctor:"""
content = content.replace("  updatePatient: (patient: Patient) => void;\n  addDoctor:", fn_def)

state_def = """  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doctorRequests, setDoctorRequests] = useState<DoctorRequest[]>([]);
  const [vitals, setVitals] = useState<Record<string, Vitals>>({});"""
content = content.replace("  const [conditions, setConditions] = useState<Condition[]>([]);\n  const [medications, setMedications] = useState<Medication[]>([]);\n  const [vitals, setVitals] = useState<Record<string, Vitals>>({});", state_def)

subscribe_def = """    const unsubMedications = onSnapshot(collection(db, "medications"), snapshot => {
      setMedications(snapshot.docs.map(doc => doc.data() as Medication));
    });
    
    const unsubRequests = onSnapshot(collection(db, "doctorRequests"), snapshot => {
      setDoctorRequests(snapshot.docs.map(doc => doc.data() as DoctorRequest));
    });

    const unsubVitals"""
content = content.replace("    const unsubMedications = onSnapshot(collection(db, \"medications\"), snapshot => {\n      setMedications(snapshot.docs.map(doc => doc.data() as Medication));\n    });\n\n    const unsubVitals", subscribe_def)


unsub_def = """      unsubMedications();
      unsubRequests();
      unsubVitals();"""
content = content.replace("      unsubMedications();\n      unsubVitals();", unsub_def)

funcs_def = """  const updatePatient = async (patient: Patient) => {
    await setDoc(doc(db, "patients", patient.aadhaar), patient);
    logAction("PATIENT_UPDATE", "System", `Updated patient: ${patient.aadhaar}`);
  };

  const addDoctorRequest = async (req: DoctorRequest) => {
    await setDoc(doc(db, "doctorRequests", req.id), req);
  };

  const updateDoctorRequest = async (req: DoctorRequest) => {
    await setDoc(doc(db, "doctorRequests", req.id), req);
  };

  const updateDoctor = async (doctor: Doctor) => {
    await setDoc(doc(db, "doctors", doctor.medicalId), doctor);
  };"""
content = content.replace("  const updatePatient = async (patient: Patient) => {\n    await setDoc(doc(db, \"patients\", patient.aadhaar), patient);\n    logAction(\"PATIENT_UPDATE\", \"System\", `Updated patient: ${patient.aadhaar}`);\n  };", funcs_def)

ret_def = """    updatePatient,
    addDoctorRequest,
    updateDoctorRequest,
    updateDoctor,
    addDoctor,"""
content = content.replace("    updatePatient,\n    addDoctor,", ret_def)

ctx_ret_def = """    conditions,
    medications,
    doctorRequests,
    vitals,"""
content = content.replace("    conditions,\n    medications,\n    vitals,", ctx_ret_def)

with open("src/lib/Store.tsx", "w") as f:
    f.write(content)
