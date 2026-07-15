import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Bell,
  CheckCircle,
  Cpu,
  Clock,
  Microscope,
  BarChart3,
  Shield,
  Layers,
  Activity,
  Box
} from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-950 font-sans selection:bg-gray-200">
      
      {/* ── Background Grid ─────────────────────────────────────────────────── */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40" 
        style={{
          backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="relative z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                <ZapIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">LogiSight</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
              <span className="text-black border-b-2 border-black py-5 cursor-pointer">Dashboard</span>
              <span className="hover:text-black transition-colors cursor-pointer">Solutions</span>
              <span className="hover:text-black transition-colors cursor-pointer">Case Studies</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search insights..." 
                className="pl-9 pr-4 py-1.5 bg-gray-100 border border-transparent rounded-md text-sm focus:bg-white focus:border-gray-300 focus:outline-none transition-all w-64"
              />
            </div>
            <button className="text-gray-500 hover:text-black transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <Link
              to="/login"
              className="px-4 py-1.5 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Left Copy */}
        <div className="flex-1 text-left">
          <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-bold tracking-widest uppercase rounded-sm mb-8">
            Logistics Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
            Stop Overpaying on<br />
            <span className="text-gray-800">Freight Invoices</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-lg leading-relaxed mb-10">
            Enterprise-grade auditing powered by precision intelligence. We identify anomalies, recover lost revenue, and streamline global logistics finances with 99.9% accuracy.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3.5 bg-black text-white font-semibold rounded-sm hover:bg-gray-900 transition-colors"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3.5 bg-white text-black font-semibold rounded-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Right UI Mockup */}
        <div className="flex-1 w-full max-w-xl relative">
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xl p-6 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-bold text-lg">Global Audit Control</h3>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-gray-300"></div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200 p-4 rounded-sm">
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Total Audited</p>
                <p className="text-2xl font-bold">$4.2M</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-sm">
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Recovered</p>
                <p className="text-2xl font-bold text-gray-400">$284K</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-sm">
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Disputes</p>
                <p className="text-2xl font-bold text-red-600">12</p>
              </div>
            </div>

            {/* Bar Chart Mock */}
            <div className="h-48 bg-gray-100 rounded-sm flex items-end gap-3 p-4">
              <div className="w-full bg-gray-300 h-[40%] rounded-t-sm"></div>
              <div className="w-full bg-gray-300 h-[25%] rounded-t-sm"></div>
              <div className="w-full bg-gray-300 h-[65%] rounded-t-sm"></div>
              <div className="w-full bg-gray-300 h-[50%] rounded-t-sm"></div>
              <div className="w-full bg-gray-300 h-[75%] rounded-t-sm"></div>
              <div className="w-full bg-gray-300 h-[20%] rounded-t-sm"></div>
              <div className="w-full bg-gray-300 h-[45%] rounded-t-sm"></div>
            </div>
          </div>

          {/* Overlapping Badge */}
          <div className="absolute -bottom-6 -left-6 bg-blue-100 border border-blue-200 rounded-sm p-4 flex items-center gap-3 shadow-xl z-20">
            <CheckCircle className="w-6 h-6 text-blue-900" />
            <div>
              <p className="font-bold text-blue-950 text-sm">99.9% Accuracy</p>
              <p className="text-[9px] font-bold tracking-widest text-blue-800/70 uppercase">Certified Intelligence</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className="w-full h-px bg-gray-200 relative z-10"></div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <Cpu className="w-8 h-8 mb-4 text-gray-800" strokeWidth={1.5} />
            <p className="text-4xl font-medium mb-2">99%+</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Mapping Accuracy</p>
            <p className="text-sm text-gray-500">Eliminating human error in charge code standardisation.</p>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="w-8 h-8 mb-4 text-gray-800" strokeWidth={1.5} />
            <p className="text-4xl font-medium mb-2">12h/mo</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Time Saved</p>
            <p className="text-sm text-gray-500">Automated workflows that free your team from manual entry.</p>
          </div>
          <div className="flex flex-col items-center">
            <Microscope className="w-8 h-8 mb-4 text-gray-800" strokeWidth={1.5} />
            <p className="text-4xl font-medium mb-2">6+</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Anomaly Types</p>
            <p className="text-sm text-gray-500">Deep scanning for weight shifts, rate mismatches, and duplicates.</p>
          </div>
        </div>
      </section>

      {/* ── High-Stakes Precision ────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-[#F8F9FA] border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">High-Stakes Precision</h2>
            <p className="text-gray-600">
              LogiSight is built for high-volume freight environments where a 1% error margin can mean millions in lost revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Left Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-800 mb-4">Core Intelligence</p>
                <h3 className="text-2xl font-bold mb-4">Autonomous Charge Detection</h3>
                <p className="text-gray-600 leading-relaxed mb-12 text-sm">
                  Our neural engine automatically maps hundreds of charge codes across all LTL, FTL, and parcel carriers to your internal ledger with zero manual configuration.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-700 rounded-sm border border-gray-200">Carrier Mapping</span>
                <span className="px-3 py-1.5 bg-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-700 rounded-sm border border-gray-200">GL Integration</span>
                <span className="px-3 py-1.5 bg-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-700 rounded-sm border border-gray-200">AI Validation</span>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-[#111827] rounded-lg border border-gray-800 p-8 flex flex-col justify-between text-white shadow-xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Data Integrity</p>
                <h3 className="text-2xl font-bold mb-4">Dispute Management</h3>
                <p className="text-gray-400 leading-relaxed mb-12 text-sm">
                  One-click dispute generation. Our system prepares the required evidence, contacts carriers, and tracks recovery status until the credit is in your account.
                </p>
              </div>
              <div className="bg-[#1F2937] p-4 rounded-sm">
                <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
                  <span className="text-gray-300">Audit Pipeline</span>
                  <span className="text-white">84%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[84%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Bottom Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-4">
                <BarChart3 className="w-4 h-4 text-gray-800" />
              </div>
              <h4 className="font-bold mb-2">Predictive Benchmarking</h4>
              <p className="text-sm text-gray-600">Compare your lane rates against anonymized market indices in real-time.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-4">
                <Shield className="w-4 h-4 text-gray-800" />
              </div>
              <h4 className="font-bold mb-2">SOC-2 Enterprise Security</h4>
              <p className="text-sm text-gray-600">Military-grade encryption for your financial data and carrier credentials.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-4">
                <Layers className="w-4 h-4 text-gray-800" />
              </div>
              <h4 className="font-bold mb-2">Universal API Sink</h4>
              <p className="text-sm text-gray-600">Seamlessly ingest data from SAP, Oracle, NetSuite, and 500+ TMS platforms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Engineered for the Audit Desk ──────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left: Image Placeholder */}
          <div className="flex-1 w-full bg-[#0F172A] rounded-xl overflow-hidden border border-gray-800 shadow-2xl relative aspect-video flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-[#0F172A] to-[#0F172A]"></div>
            
            {/* Mock Dashboard Elements inside */}
            <div className="w-full h-full p-4 grid grid-cols-3 grid-rows-2 gap-4 relative z-10 opacity-70">
              <div className="bg-slate-800/50 rounded border border-slate-700/50 col-span-2"></div>
              <div className="bg-slate-800/50 rounded border border-slate-700/50"></div>
              <div className="bg-slate-800/50 rounded border border-slate-700/50"></div>
              <div className="bg-slate-800/50 rounded border border-slate-700/50 col-span-2"></div>
            </div>

            {/* Overlapping ROI box */}
            <div className="absolute top-1/2 left-1/2 translate-x-10 -translate-y-1/2 bg-white rounded-sm p-4 shadow-xl z-20 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Average ROI</p>
                <p className="text-xl font-bold">18.4x</p>
              </div>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-10">Engineered for the Audit Desk</h2>
            
            <div className="space-y-8 mb-10">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold mb-1">Zero-Config Ingestion</h4>
                  <p className="text-gray-600 text-sm">Drag and drop PDFs, EDI feeds, or CSVs. Our system handles the normalization instantly.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold mb-1">Anomaly Identification</h4>
                  <p className="text-gray-600 text-sm">AI scans for 6+ distinct leak types including duplicate billing and accessorial bloat.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold mb-1">Revenue Recovery</h4>
                  <p className="text-gray-600 text-sm">Approve suggested disputes and watch recovered revenue stream back to your bottom line.</p>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-black text-white font-semibold rounded-sm hover:bg-gray-900 transition-colors"
            >
              Explore the Platform <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-gray-200 bg-[#FDFDFD] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
              <ZapIcon className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900">LogiSight</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} LogiSight. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Simple internal icon for the logo
function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );
}
