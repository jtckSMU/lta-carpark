import React from 'react';
import {
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  Code2,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const RatesGuideView: React.FC = () => {
  return (
    <div className="w-full flex-1 max-w-4xl mx-auto p-4 pb-24 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Singapore Parking Guide & API Reference</h2>
        <p className="text-xs text-slate-500 mt-1">
          Standard rates, electronic parking regulations, and developer API connectivity guide
        </p>
      </div>

      {/* Standard HDB & URA Rates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Central Area Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
              SG
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">HDB & URA Central Area</h3>
              <p className="text-[11px] text-slate-400">CBD, Orchard, Bugis, Chinatown</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Peak Hours (7:00 AM – 5:00 PM, Mon-Sat)</span>
              <strong className="text-slate-900">$1.20 / 30 mins</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Other Hours (5:00 PM – 10:30 PM)</span>
              <strong className="text-slate-900">$0.60 / 30 mins</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Night Parking (10:30 PM – 7:00 AM)</span>
              <strong className="text-slate-900">$0.60/30m (Capped at $5.00)</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Grace Period</span>
              <span className="font-semibold text-emerald-600">15 mins free entry</span>
            </div>
          </div>
        </div>

        {/* Non-Central Area Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              HDB
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Outside Central Area</h3>
              <p className="text-[11px] text-slate-400">Heartlands (Tampines, Jurong, Bishan, etc.)</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Standard Rate (7:00 AM – 10:30 PM)</span>
              <strong className="text-slate-900">$0.60 / 30 mins</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Night Parking (10:30 PM – 7:00 AM)</span>
              <strong className="text-slate-900">$0.60/30m (Capped at $5.00)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Sundays & Public Holidays (FPS)</span>
              <strong className="text-emerald-600 font-bold">FREE (7:00 AM – 10:30 PM)</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Grace Period</span>
              <span className="font-semibold text-emerald-600">15 mins free entry</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10 Core Usability Heuristics Applied Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            UX
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">10 Core Usability Principles in ParkFinder</h3>
            <p className="text-[11px] text-slate-400">Jakob Nielsen's classic heuristics adapted for zero-distraction driving UX</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">1. Visibility of System Status</span>
            <p className="text-slate-600 mt-0.5">Bottom telemetry bar names the view [1/4], vehicle mode, lots available, and live LTA sync status.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">2. Match Between System & Real World</span>
            <p className="text-slate-600 mt-0.5">Keys match first letters (M=Map, L=List, S=Saved, R=Rates, C=Cars, K=Bikes). Uses official HDB/URA standards.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">3. User Control & Freedom</span>
            <p className="text-slate-600 mt-0.5">Esc closes layer-by-layer (Help → Modal → Preview → Search). Backspace returns you to the view you left.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">4. Consistency & Standards</span>
            <p className="text-slate-600 mt-0.5">Green for high vacancy (&gt;30), Amber for moderate (10-30), Rose for scarce (&lt;10). Number keys 1-4 switch sections.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">5. Error Prevention</span>
            <p className="text-slate-600 mt-0.5">Hotkeys pause while typing in search box. Singapore bounds validation prevents map drift outside SG.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">6. Recognition Rather Than Recall</span>
            <p className="text-slate-600 mt-0.5">Floating interactive key strip remains visible with shortcuts on screen. Active filters display visible chips.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">7. Flexibility & Efficiency of Use</span>
            <p className="text-slate-600 mt-0.5">Every key has a clickable button for touch/mouse users. Quick preset pills jump to Orchard, Marina Bay, CBD instantly.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">8. Aesthetic & Minimalist Design</span>
            <p className="text-slate-600 mt-0.5">Key strip and telemetry bar fade to 35% opacity when the mouse is still to keep map clear, restoring on motion.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">9. Diagnose & Recover from Errors</span>
            <p className="text-slate-600 mt-0.5">Pressing an unassigned key explains so and points to [?]. Clear diagnosis banner if GPS is denied.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800">10. Help & Documentation</span>
            <p className="text-slate-600 mt-0.5">Pressing [?] or clicking the guide pill opens a full grouped shortcut and regulation reference anytime.</p>
          </div>
        </div>
      </div>

      {/* Motorcycle & Heavy Vehicles Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Motorcycles & Heavy Vehicles Parking Rules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="font-semibold text-slate-800 mb-1">Motorcycles</div>
            <ul className="space-y-1 text-slate-600">
              <li>• Day parking (7:00 AM – 10:30 PM): <strong>$0.65 per session</strong></li>
              <li>• Night parking (10:30 PM – 7:00 AM): <strong>$0.65 per session</strong></li>
              <li>• Per-minute EPS car parks: <strong>$0.20 per hour</strong></li>
              <li>• Grace period: <strong>10 minutes</strong></li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="font-semibold text-slate-800 mb-1">Heavy Vehicles</div>
            <ul className="space-y-1 text-slate-600">
              <li>• Day parking (7:00 AM – 10:30 PM): <strong>$1.20 per 30 mins</strong></li>
              <li>• Night parking (10:30 PM – 7:00 AM): <strong>Capped at $12.00</strong></li>
              <li>• Requires valid HVP parking disc or designated Heavy EPS lots</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Connection & Backend Integration Ready Box */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Code2 className="w-4 h-4" />
          Developer API Connection Ready
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          Ready for Live Singapore Government Carpark APIs
        </h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          As requested, the frontend and service layer (`src/services/carparkService.ts`) are structured to plug directly into live Singapore government feeds:
        </p>

        <div className="space-y-3 text-xs">
          {/* Data.gov.sg */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between font-semibold text-white mb-1">
              <span>1. Data.gov.sg Carpark Availability API (Free, No Auth)</span>
              <a
                href="https://beta.data.gov.sg/collections/139/datasets/d_23f946fa557947f93a8043bbef41dd09/view"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
              >
                Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <code className="text-[11px] text-emerald-300 bg-slate-950 px-2 py-1 rounded block mt-1 overflow-x-auto">
              GET https://api.data.gov.sg/v1/transport/carpark-availability
            </code>
            <p className="text-[11px] text-slate-400 mt-1">
              Provides real-time lot availability for all HDB and URA carparks across Singapore updated every 1 minute.
            </p>
          </div>

          {/* LTA DataMall */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center justify-between font-semibold text-white mb-1">
              <span>2. LTA DataMall Car Park Availability v2</span>
              <a
                href="https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
              >
                Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <code className="text-[11px] text-emerald-300 bg-slate-950 px-2 py-1 rounded block mt-1 overflow-x-auto">
              GET https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
            </code>
            <p className="text-[11px] text-slate-400 mt-1">
              Headers: <span className="text-amber-300">AccountKey: &lt;LTA_ACCOUNT_KEY&gt;</span>. (Note: No total lots in this feed).
            </p>
          </div>

          {/* Local Serverless Endpoints (/api/health & /api/carpark-availability) */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-blue-500/40">
            <div className="flex items-center justify-between font-semibold text-blue-300 mb-1">
              <span>3. Local Serverless Routes (Project Root `/api`)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700">
                Active
              </span>
            </div>
            <div className="space-y-1.5 mt-2">
              <div>
                <span className="text-[11px] text-slate-300 font-medium">Health Check:</span>
                <code className="text-[11px] text-blue-300 bg-slate-950 px-2 py-0.5 rounded block mt-0.5">
                  GET /api/health
                </code>
              </div>
              <div>
                <span className="text-[11px] text-slate-300 font-medium">LTA Carpark Lots (Feed):</span>
                <code className="text-[11px] text-blue-300 bg-slate-950 px-2 py-0.5 rounded block mt-0.5">
                  GET /api/carpark-availability
                </code>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              These routes read <code className="text-amber-300">LTA_ACCOUNT_KEY</code> from your environment, forwards the required <code className="text-amber-300">AccountKey</code> header to LTA DataMall, and normalizes coordinates and vacancies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
