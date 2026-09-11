export default function Footer() {
  return (
    <footer className="bg-white py-8 border-t border-slate-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">CareSphere</span>
            <span className="text-sm text-slate-500">&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-blue-900">Privacy Policy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-blue-900">Terms of Service</a>
            <a href="#" className="text-sm text-slate-500 hover:text-blue-900">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
