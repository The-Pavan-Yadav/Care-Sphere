import re

with open("src/pages/admin/AdminDashboard.tsx", "r") as f:
    content = f.read()

login_code = """
export default function AdminDashboardWrapper() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setIsAuthenticated(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  if (!isAuthenticated) {
    return <AdminLoginView onLogin={() => setIsAuthenticated(true)} />;
  }
  
  return <AdminDashboard />;
}

function AdminLoginView({ onLogin }: { onLogin: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier === "admin" && password === "admin") {
      onLogin();
    } else {
      setError("Invalid credentials. Try admin/admin");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm max-w-md w-full">
        <div className="flex h-12 w-12 items-center justify-center bg-blue-50 text-blue-900 border border-blue-100 rounded-sm mb-6">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">System Administrator Login</h2>
        <p className="text-sm text-slate-500 mb-8">Secure access for government and institutional administration.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin ID</label>
            <input 
              type="text" 
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
              placeholder="e.g. admin"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passcode</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
              placeholder="e.g. admin"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-blue-900 text-white font-semibold py-3 rounded-sm hover:bg-blue-800 transition-colors mt-2"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}

"""

# replace the export default function AdminDashboard() with just function AdminDashboard()
content = content.replace("export default function AdminDashboard() {", "function AdminDashboard() {")
# add the wrapper and login view at the end
content += login_code

# add useSearchParams to imports
content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";\nimport { useSearchParams } from "react-router-dom";')

with open("src/pages/admin/AdminDashboard.tsx", "w") as f:
    f.write(content)
