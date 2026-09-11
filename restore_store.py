import re

with open("src/lib/Store.tsx", "r") as f:
    content = f.read()

# Replace imports
imports = """import { createContext, useContext, useState, ReactNode } from "react";
"""
content = re.sub(r'import \{ createContext.*?\nimport \{ collection.*?\nimport \{ signInAnonymously.*?\nimport \{ db, auth \} from "\./firebase";\n', imports, content, count=1, flags=re.DOTALL)

new_provider = """function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(error);
    }
  };

  return [storedValue, setValue] as const;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useLocalStorage<Patient[]>("cs_patients", initialPatients);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>("cs_doctors", initialDoctors);
  const [hospitals, setHospitals] = useLocalStorage<Hospital[]>("cs_hospitals", initialHospitals);
  const [encounters, setEncounters] = useLocalStorage<Encounter[]>("cs_encounters", initialEncounters);
  const [conditions, setConditions] = useLocalStorage<Condition[]>("cs_conditions", initialConditions);
  const [medications, setMedications] = useLocalStorage<Medication[]>("cs_medications", initialMedications);
  const [vitals, setVitals] = useLocalStorage<Record<string, Vitals>>("cs_vitals", initialVitals);
  const [auditLogs, setAuditLogs] = useLocalStorage<AuditLog[]>("cs_auditLogs", initialAuditLogs);

  const logAction = (action: string, actor: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addDoctor = (doctor: Doctor) => {
    setDoctors(prev => [...prev, doctor]);
    logAction("DOCTOR_REGISTER", "Hospital Admin", `Registered doctor: ${doctor.medicalId}`);
  };

  const addHospital = (hospital: Hospital) => {
    setHospitals(prev => [...prev, hospital]);
    logAction("HOSPITAL_REGISTER", "System Admin", `Registered hospital: ${hospital.hospitalId}`);
  };

  const linkDoctorToHospital = (medicalId: string, hospitalId: string) => {
    setDoctors(prev => prev.map(d => {
      if (d.medicalId === medicalId && !d.hospitalIds.includes(hospitalId)) {
        return { ...d, hospitalIds: [...d.hospitalIds, hospitalId] };
      }
      return d;
    }));
    logAction("DOCTOR_LINK", "Hospital Admin", `Linked doctor ${medicalId} to hospital ${hospitalId}`);
  };

  const addPatient = (patient: Patient) => {
    setPatients(prev => [...prev, patient]);
    logAction("PATIENT_REGISTER", "Patient", `Registered Aadhaar: ${patient.aadhaar}`);
  };

  const addEncounter = (encounter: Encounter) => {
    setEncounters(prev => [encounter, ...prev]);
    logAction("ENCOUNTER_ADD", encounter.provider, `Added encounter for: ${encounter.patientAadhaar}`);
  };

  const addCondition = (condition: Condition) => {
    setConditions(prev => [...prev, condition]);
    logAction("CONDITION_ADD", "System", `Added condition for: ${condition.patientAadhaar}`);
  };

  const addMedication = (medication: Medication) => {
    setMedications(prev => [...prev, medication]);
    logAction("MEDICATION_ADD", medication.provider, `Prescribed medication for: ${medication.patientAadhaar}`);
  };

  const updateVitals = (newVitals: Vitals) => {
    setVitals(prev => ({ ...prev, [newVitals.patientAadhaar]: newVitals }));
    logAction("VITALS_UPDATE", "Provider", `Updated vitals for: ${newVitals.patientAadhaar}`);
  };

  return (
    <StoreContext.Provider value={{
"""

content = re.sub(r'export function StoreProvider\(\{ children \}: \{ children: ReactNode \}\) \{.*return \(\s*<StoreContext\.Provider value=\{\{', new_provider, content, flags=re.DOTALL)

with open("src/lib/Store.tsx", "w") as f:
    f.write(content)

