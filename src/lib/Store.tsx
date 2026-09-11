import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, onSnapshot, doc, setDoc, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "./firebase";

export type Patient = {
  aadhaar: string;
  name: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  mobile: string;
  email: string;
  address: string;
  emergencyContact: string;
  allergies: string;
  createdAt: string;
};

export type Encounter = {
  id: string;
  patientAadhaar: string;
  date: string;
  title: string;
  provider: string;
  facility: string;
  notes: string;
};

export type Condition = {
  id: string;
  patientAadhaar: string;
  title: string;
  onset: string;
  status: string;
};

export type Medication = {
  id: string;
  patientAadhaar: string;
  name: string;
  dosage: string;
  provider: string;
};

export type Vitals = {
  id: string;
  patientAadhaar: string;
  bloodPressure: string;
  heartRate: string;
  weight: string;
  height: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
};

export type DoctorRequest = {
  id: string;
  medicalId: string;
  hospitalId: string;
  doctorName: string;
  hospitalName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
};

export type Doctor = {
  medicalId: string;
  name: string;
  specialty: string;
  hospitalIds: string[];
  phone?: string;
  email?: string;
  qualifications?: string;
};

export type Hospital = {
  hospitalId: string;
  name: string;
  type: string;
  address: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  departments?: string;
  adminDetails?: string;
};

type StoreContextType = {
  patients: Patient[];
  doctors: Doctor[];
  hospitals: Hospital[];
  encounters: Encounter[];
  conditions: Condition[];
  medications: Medication[];
  doctorRequests: DoctorRequest[];
  vitals: Record<string, Vitals>; // Keyed by patientAadhaar
  auditLogs: AuditLog[];
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  addDoctorRequest: (req: DoctorRequest) => void;
  updateDoctorRequest: (req: DoctorRequest) => void;
  updateDoctor: (doctor: Doctor) => void;
  addDoctor: (doctor: Doctor) => void;
  addHospital: (hospital: Hospital) => void;
  linkDoctorToHospital: (medicalId: string, hospitalId: string) => void;
  addEncounter: (encounter: Encounter) => void;
  addCondition: (condition: Condition) => void;
  addMedication: (medication: Medication) => void;
  updateVitals: (vitals: Vitals) => void;
  logAction: (action: string, actor: string, details: string) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Demo Data
const initialHospitals: Hospital[] = [
  {
    hospitalId: "HOSP-001",
    name: "City General Hospital",
    type: "General Hospital",
    address: "100 Main St, Springfield"
  },
  {
    hospitalId: "HOSP-002",
    name: "Heart & Vascular Center",
    type: "Specialty Clinic",
    address: "200 Heart Ave, Springfield"
  }
];

const initialDoctors: Doctor[] = [
  {
    medicalId: "PRV-1029",
    name: "Dr. Robert Smith",
    specialty: "Cardiology",
    hospitalIds: ["HOSP-001", "HOSP-002"]
  },
  {
    medicalId: "PRV-1030",
    name: "Dr. Emily Chen",
    specialty: "General Practice",
    hospitalIds: ["HOSP-001"]
  }
];

const initialPatients: Patient[] = [
  {
    aadhaar: "8492-4910-8432",
    name: "Sarah Jenkins",
    dob: "1984-05-12",
    gender: "Female",
    bloodGroup: "O+",
    mobile: "+1-555-0192",
    email: "sarah.j@example.com",
    address: "123 Maple St, Springfield",
    emergencyContact: "Mark Jenkins (+1-555-0193)",
    allergies: "Penicillin",
    createdAt: "2026-01-15T08:00:00Z"
  }
];

const initialEncounters: Encounter[] = [
  {
    id: "ENC-1001",
    patientAadhaar: "8492-4910-8432",
    date: "2026-10-12",
    title: "General Examination",
    provider: "Dr. Emily Chen",
    facility: "City General Hospital",
    notes: "Patient in good health. BP slightly elevated."
  },
  {
    id: "ENC-1002",
    patientAadhaar: "8492-4910-8432",
    date: "2026-09-05",
    title: "Lab: Complete Blood Count (CBC)",
    provider: "Dr. James Wilson",
    facility: "Metro Diagnostic Center",
    notes: "All levels within normal ranges."
  }
];

const initialConditions: Condition[] = [
  {
    id: "COND-101",
    patientAadhaar: "8492-4910-8432",
    title: "Essential Hypertension",
    onset: "Diagnosed: 2021",
    status: "Monitored"
  }
];

const initialMedications: Medication[] = [
  {
    id: "MED-201",
    patientAadhaar: "8492-4910-8432",
    name: "Lisinopril 10mg",
    dosage: "1 tablet daily",
    provider: "Dr. Emily Chen"
  }
];

const initialVitals: Record<string, Vitals> = {
  "8492-4910-8432": {
    id: "VIT-301",
    patientAadhaar: "8492-4910-8432",
    bloodPressure: "120/80",
    heartRate: "72",
    weight: "65.2",
    height: "170",
    updatedAt: "2026-10-12T09:15:00Z"
  }
};

const initialAuditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-09-11T01:15:00Z",
    action: "SYSTEM_INIT",
    actor: "Admin",
    details: "CareSphere Demo System Initialized"
  }
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doctorRequests, setDoctorRequests] = useState<DoctorRequest[]>([]);
  const [vitals, setVitals] = useState<Record<string, Vitals>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    
    const initialize = async () => {
      try {
        await signInAnonymously(auth).catch(e => console.warn("Auth failed, continuing anyway:", e));
        
        unsubs.push(onSnapshot(collection(db, "patients"), (snap) => setPatients(snap.docs.map(d => d.data() as Patient))));
        unsubs.push(onSnapshot(collection(db, "doctors"), (snap) => setDoctors(snap.docs.map(d => d.data() as Doctor))));
        unsubs.push(onSnapshot(collection(db, "hospitals"), (snap) => setHospitals(snap.docs.map(d => d.data() as Hospital))));
        unsubs.push(onSnapshot(collection(db, "encounters"), (snap) => setEncounters(snap.docs.map(d => d.data() as Encounter))));
        unsubs.push(onSnapshot(collection(db, "conditions"), (snap) => setConditions(snap.docs.map(d => d.data() as Condition))));
        unsubs.push(onSnapshot(collection(db, "medications"), (snap) => setMedications(snap.docs.map(d => d.data() as Medication))));
        unsubs.push(onSnapshot(collection(db, "vitals"), (snap) => {
          const vMap: Record<string, Vitals> = {};
          snap.docs.forEach(d => {
            const v = d.data() as Vitals;
            vMap[v.patientAadhaar] = v;
          });
          setVitals(vMap);
        }));
        unsubs.push(onSnapshot(collection(db, "auditLogs"), (snap) => setAuditLogs(snap.docs.map(d => d.data() as AuditLog).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))));

        const pSnap = await getDocs(collection(db, "patients"));
        if (pSnap.empty) {
          console.log("Seeding initial data...");
          initialPatients.forEach(p => setDoc(doc(db, "patients", p.aadhaar), p));
          initialDoctors.forEach(d => setDoc(doc(db, "doctors", d.medicalId), d));
          initialHospitals.forEach(h => setDoc(doc(db, "hospitals", h.hospitalId), h));
          initialEncounters.forEach(e => setDoc(doc(db, "encounters", e.id), e));
          initialConditions.forEach(c => setDoc(doc(db, "conditions", c.id), c));
          initialMedications.forEach(m => setDoc(doc(db, "medications", m.id), m));
          Object.values(initialVitals).forEach(v => setDoc(doc(db, "vitals", v.patientAadhaar), v));
          initialAuditLogs.forEach(l => setDoc(doc(db, "auditLogs", l.id), l));
        }

        setIsReady(true);
      } catch (err) {
        console.error("Firebase init error:", err);
        setIsReady(true);
      }
    };

    initialize();
    
    return () => unsubs.forEach(fn => fn());
  }, []);

  const logAction = async (action: string, actor: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
    };
    await setDoc(doc(db, "auditLogs", newLog.id), newLog).catch(console.error);
  };

  const addDoctor = async (doctor: Doctor) => {
    await setDoc(doc(db, "doctors", doctor.medicalId), doctor);
    logAction("DOCTOR_REGISTER", "Hospital Admin", `Registered doctor: ${doctor.medicalId}`);
  };

  const addHospital = async (hospital: Hospital) => {
    await setDoc(doc(db, "hospitals", hospital.hospitalId), hospital);
    logAction("HOSPITAL_REGISTER", "System Admin", `Registered hospital: ${hospital.hospitalId}`);
  };

  const linkDoctorToHospital = async (medicalId: string, hospitalId: string) => {
    const d = doctors.find(doc => doc.medicalId === medicalId);
    if (d && !d.hospitalIds.includes(hospitalId)) {
      await setDoc(doc(db, "doctors", medicalId), { ...d, hospitalIds: [...d.hospitalIds, hospitalId] });
      logAction("DOCTOR_LINK", "Hospital Admin", `Linked doctor ${medicalId} to hospital ${hospitalId}`);
    }
  };

  const addPatient = async (patient: Patient) => {
    await setDoc(doc(db, "patients", patient.aadhaar), patient);
    logAction("PATIENT_REGISTER", "Patient", `Registered Aadhaar: ${patient.aadhaar}`);
  };

  const updatePatient = async (patient: Patient) => {
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
  };

  const addEncounter = async (encounter: Encounter) => {
    await setDoc(doc(db, "encounters", encounter.id), encounter);
    logAction("ENCOUNTER_ADD", encounter.provider, `Added encounter for: ${encounter.patientAadhaar}`);
  };

  const addCondition = async (condition: Condition) => {
    await setDoc(doc(db, "conditions", condition.id), condition);
    logAction("CONDITION_ADD", "System", `Added condition for: ${condition.patientAadhaar}`);
  };

  const addMedication = async (medication: Medication) => {
    await setDoc(doc(db, "medications", medication.id), medication);
    logAction("MEDICATION_ADD", medication.provider, `Prescribed medication for: ${medication.patientAadhaar}`);
  };

  const updateVitals = async (newVitals: Vitals) => {
    await setDoc(doc(db, "vitals", newVitals.patientAadhaar), newVitals);
    logAction("VITALS_UPDATE", "Provider", `Updated vitals for: ${newVitals.patientAadhaar}`);
  };

  if (!isReady) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Connecting to CareSphere...</p></div>;
  }

  return (
        <StoreContext.Provider value={{
      patients,
      doctors,
      hospitals,
      encounters,
      conditions,
      medications,
      doctorRequests,
      vitals,
      auditLogs,
      addPatient,
      updatePatient,
      addDoctorRequest,
      updateDoctorRequest,
      updateDoctor,
      addDoctor,
      addHospital,
      linkDoctorToHospital,
      addEncounter,
      addCondition,
      addMedication,
      updateVitals,
      logAction
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
