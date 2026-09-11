import re

with open("src/pages/LandingPage.tsx", "r") as f:
    content = f.read()

# Replace the primary Link's `to={href}` with `to={`${href}?login=true`}`
content = re.sub(
    r'<Link\s+to=\{href\}\s+className="group flex flex-col',
    '<Link\n        to={`${href}?login=true`}\n        className="group flex flex-col',
    content,
    count=1
)

with open("src/pages/LandingPage.tsx", "w") as f:
    f.write(content)
