with open("src/pages/provider/ProviderDashboard.tsx", "r") as f:
    content = f.read()

old_func = """  const handleApprove = (req: any) => {
    // 1. Update request status
    updateDoctorRequest({ ...req, status: 'Approved' });
    
    // 2. Link doctor
    const doc = doctors.find(d => d.medicalId === req.medicalId);
    if (doc && !doc.hospitalIds.includes(hospital.hospitalId)) {
      updateDoctor({ ...doc, hospitalIds: [...doc.hospitalIds, hospital.hospitalId] });
      // Or if linkDoctorToHospital handles it fine:
      // linkDoctorToHospital(req.medicalId, hospital.hospitalId);
    }
  };"""

new_func = """  const handleApprove = (req: any) => {
    updateDoctorRequest({ ...req, status: 'Approved' });
    linkDoctorToHospital(req.medicalId, hospital.hospitalId);
  };"""

content = content.replace(old_func, new_func)

with open("src/pages/provider/ProviderDashboard.tsx", "w") as f:
    f.write(content)
