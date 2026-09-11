import re

with open("src/pages/provider/ProviderDashboard.tsx", "r") as f:
    content = f.read()

new_effect = """
  useEffect(() => {
    const login = searchParams.get('login');
    if (login === 'true') {
      setAuthRole('none');
      setActiveDoctor(null);
      setActiveHospital(null);
      setSearchParams({});
    }

    const demo = searchParams.get('demo');
    if (demo === 'true' && authRole === 'none') {
      const doc = doctors.find(d => d.medicalId === "PRV-1029");
      if (doc) {
        setActiveDoctor(doc);
        setAuthRole('doctor');
      }
      setSearchParams({});
    }
  }, [searchParams, authRole, doctors, setSearchParams]);
"""

content = re.sub(
    r'  useEffect\(\(\) => \{\n    const demo = searchParams\.get\(\'demo\'\);\n.*?  \}, \[searchParams, authRole, doctors, setSearchParams\]\);\n',
    new_effect,
    content,
    flags=re.DOTALL
)

with open("src/pages/provider/ProviderDashboard.tsx", "w") as f:
    f.write(content)
