import re

with open("src/pages/admin/AdminDashboard.tsx", "r") as f:
    content = f.read()

new_effect = """
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setIsAuthenticated(false);
      setSearchParams({});
    } else if (searchParams.get('demo') === 'true') {
      setIsAuthenticated(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);
"""

content = re.sub(
    r'  useEffect\(\(\) => \{\n    if \(searchParams\.get\(\'demo\'\) === \'true\'\) \{\n.*?  \}, \[searchParams, setSearchParams\]\);\n',
    new_effect,
    content,
    flags=re.DOTALL
)

with open("src/pages/admin/AdminDashboard.tsx", "w") as f:
    f.write(content)
