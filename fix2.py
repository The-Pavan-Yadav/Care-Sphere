with open("src/lib/Store.tsx", "r") as f:
    content = f.read()
import re
new_value = """    <StoreContext.Provider value={{
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
    }}>"""

content = re.sub(r"<StoreContext\.Provider value=\{\{.*?\}>", new_value, content, flags=re.DOTALL)
with open("src/lib/Store.tsx", "w") as f:
    f.write(content)
