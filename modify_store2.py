import re

with open("src/lib/Store.tsx", "r") as f:
    content = f.read()

# Replace imports
imports = """import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, onSnapshot, doc, setDoc, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "./firebase";
"""
content = re.sub(r'import \{ createContext.*?\n', imports, content, count=1)

# Remove useLocalStorage
content = re.sub(r'function useLocalStorage<T>.*?\n}\n\n', '', content, flags=re.DOTALL)

# Replace StoreProvider
new_provider = """export function StoreProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
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
"""

content = re.sub(r'export function StoreProvider\(\{ children \}: \{ children: ReactNode \}\) \{.*return \(\s*<StoreContext\.Provider value=\{\{', new_provider, content, flags=re.DOTALL)

with open("src/lib/Store.tsx", "w") as f:
    f.write(content)
