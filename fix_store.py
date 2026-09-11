with open("src/lib/Store.tsx", "r") as f:
    content = f.read()

old_val = """    <StoreContext.Provider value={{
      patients,
      doctors,
      hospitals,
      encounters,
      conditions,
      medications,
      vitals,"""

new_val = """    <StoreContext.Provider value={{
      patients,
      doctors,
      hospitals,
      encounters,
      conditions,
      medications,
      doctorRequests,
      vitals,"""

content = content.replace(old_val, new_val)

old_funcs = """      auditLogs,
      addPatient,
      addDoctor,
      addHospital,"""

new_funcs = """      auditLogs,
      addPatient,
      updatePatient,
      addDoctorRequest,
      updateDoctorRequest,
      updateDoctor,
      addDoctor,
      addHospital,"""

content = content.replace(old_funcs, new_funcs)

with open("src/lib/Store.tsx", "w") as f:
    f.write(content)
