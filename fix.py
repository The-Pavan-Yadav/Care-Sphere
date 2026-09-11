with open("src/pages/patient/PatientDashboard.tsx", "r") as f:
    content = f.read()

switch_pattern = "{activeTab === 'providers' && <ProvidersView patient={patient} />}"
new_switch = "{activeTab === 'providers' && <ProvidersView patient={patient} />}\n          {activeTab === 'overview' && <HealthOverviewView patient={patient} />}"
content = content.replace(switch_pattern, new_switch)

with open("src/pages/patient/PatientDashboard.tsx", "w") as f:
    f.write(content)
