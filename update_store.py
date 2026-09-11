import re
with open("src/lib/Store.tsx", "r") as f:
    content = f.read()

new_doctor_type = """export type Doctor = {
  medicalId: string;
  name: string;
  specialty: string;
  hospitalIds: string[];
  phone?: string;
  email?: string;
  qualifications?: string;
};"""
content = re.sub(r'export type Doctor = \{[\s\S]*?\n\};', new_doctor_type, content, count=1)
with open("src/lib/Store.tsx", "w") as f:
    f.write(content)
