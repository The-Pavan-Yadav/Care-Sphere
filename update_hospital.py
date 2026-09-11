import re
with open("src/lib/Store.tsx", "r") as f:
    content = f.read()

new_hospital_type = """export type Hospital = {
  hospitalId: string;
  name: string;
  type: string;
  address: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  departments?: string;
  adminDetails?: string;
};"""
content = re.sub(r'export type Hospital = \{[\s\S]*?\n\};', new_hospital_type, content, count=1)
with open("src/lib/Store.tsx", "w") as f:
    f.write(content)
