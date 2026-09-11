import { Link, useLocation } from "react-router-dom";
import { Activity, QrCode } from "lucide-react";
import { cn } from "../../lib/utils";

export default function Navbar() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-blue-900 text-white rounded-sm">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">CareSphere</span>
        </Link>
        
        {isLanding ? (
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-none">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-none">About</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-none">Contact</a>
            <Link to="/verify-patient" className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-sm hover:bg-blue-100 transition-colors flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5" /> Verify Health QR
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/verify-patient" className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-sm hover:bg-blue-100 transition-colors flex items-center gap-1.5">
              <QrCode className="h-3.5 w-3.5" /> Scan QR
            </Link>
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-none">
              Sign Out
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
