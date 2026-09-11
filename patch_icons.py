with open("src/pages/provider/ProviderDashboard.tsx", "r") as f:
    content = f.read()

content = content.replace("UserCircle, LogIn, Link as LinkIcon", "UserCircle, LogIn, Link as LinkIcon, UserPlus")

with open("src/pages/provider/ProviderDashboard.tsx", "w") as f:
    f.write(content)
