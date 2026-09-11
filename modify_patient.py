import re

with open("src/pages/patient/PatientDashboard.tsx", "r") as f:
    content = f.read()

new_effect = """
  useEffect(() => {
    const login = searchParams.get('login');
    if (login === 'true') {
      setActivePatientAadhaar(null);
      window.localStorage.removeItem("cs_active_patient");
      setSearchParams({});
    }

    const demo = searchParams.get('demo');
    if (demo === 'true' && !activePatientAadhaar) {
      const demoPatient = patients.find(p => p.aadhaar === '8492-4910-8432');
      if (demoPatient) {
        handleLogin(demoPatient);
      }
      setSearchParams({});
    }
  }, [searchParams, activePatientAadhaar, patients, setSearchParams]);
"""

content = re.sub(
    r'  useEffect\(\(\) => \{\n    const demo = searchParams\.get\(\'demo\'\);\n.*?  \}, \[searchParams, activePatientAadhaar, patients, setSearchParams\]\);\n',
    new_effect,
    content,
    flags=re.DOTALL
)

with open("src/pages/patient/PatientDashboard.tsx", "w") as f:
    f.write(content)
