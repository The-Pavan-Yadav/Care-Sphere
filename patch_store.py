with open("src/lib/Store.tsx", "r") as f:
    content = f.read()

content = content.replace("addPatient: (patient: Patient) => void;", "addPatient: (patient: Patient) => void;\n  updatePatient: (patient: Patient) => void;")

update_patient_fn = """  const updatePatient = async (patient: Patient) => {
    await setDoc(doc(db, "patients", patient.aadhaar), patient);
    logAction("PATIENT_UPDATE", "System", `Updated patient: ${patient.aadhaar}`);
  };

  const addEncounter"""

content = content.replace("  const addEncounter", update_patient_fn)

ret_pattern = "addPatient,\n    addDoctor"
new_ret = "addPatient,\n    updatePatient,\n    addDoctor"
content = content.replace(ret_pattern, new_ret)

with open("src/lib/Store.tsx", "w") as f:
    f.write(content)
