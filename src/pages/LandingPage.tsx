import { Link } from "react-router-dom";
import { User, Stethoscope, ShieldCheck, ArrowRight, Shield, Activity, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Main Hero Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-12 pb-16">
        <div className="inline-flex items-center border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-900 mb-6 rounded-sm">
          <span className="flex h-1.5 w-1.5 rounded-none bg-blue-900 mr-2"></span>
          Enterprise Healthcare Integration
        </div>
        
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
          One Patient.<br className="hidden sm:block" /> 
          <span className="text-blue-900">One Lifelong Health Record.</span>
        </h1>
        
        <p className="max-w-2xl text-base text-slate-600 mb-10">
          CareSphere provides a unified, secure health identity platform. Connect patients, authorized providers, and administrators through a single longitudinal medical record.
        </p>

        {/* Compact Features Bar */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 max-w-3xl mx-auto w-full mb-12">
            <FeatureItem title="Universal Interoperability" icon={Activity} />
            <FeatureItem title="Cryptographic Security" icon={Shield} />
            <FeatureItem title="Longitudinal Records" icon={FileText} />
        </div>

        {/* Main Portals Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto w-full">
          <PortalCard 
            title="Patient Portal"
            description="Access personal longitudinal health records, test results, and clinical history."
            icon={User}
            href="/patient"
            demoLabel="Patient Demo"
          />
          <PortalCard 
            title="Doctor / Hospital Portal"
            description="Authorized access to patient histories, diagnostics, and clinical documentation."
            icon={Stethoscope}
            href="/provider"
            demoLabel="Doctor / Hospital Demo"
          />
          <PortalCard 
            title="Admin Portal"
            description="System configuration, institutional onboarding, and compliance auditing."
            icon={ShieldCheck}
            href="/admin"
            demoLabel="Admin Demo"
          />
        </div>
      </div>
    </div>
  );
}

function PortalCard({ title, description, icon: Icon, href, demoLabel }: { title: string, description: string, icon: any, href: string, demoLabel: string }) {
  return (
    <div className="flex flex-col text-left">
      {/* Primary Action Card */}
      <Link
        to={`${href}?login=true`}
        className="group flex flex-col flex-1 bg-white border border-slate-200 p-6 hover:border-blue-900 transition-all hover:shadow-sm rounded-sm"
      >
        <div className="mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center bg-slate-50 border border-slate-200 text-blue-900 rounded-sm mb-5">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-sm font-semibold text-blue-900 group-hover:text-blue-800">
          Access System <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
      
      {/* Secondary Demo Button */}
      <div className="mt-3">
        <Link 
          to={`${href}?demo=true`} 
          className="group/demo flex items-center justify-center text-xs font-semibold text-slate-500 hover:text-blue-900 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-sm transition-colors w-full"
        >
          {demoLabel} <ArrowRight className="ml-1.5 h-3 w-3 text-slate-400 group-hover/demo:text-blue-900" />
        </Link>
      </div>
    </div>
  );
}

function FeatureItem({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <Icon className="h-4 w-4 text-blue-900" />
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}
