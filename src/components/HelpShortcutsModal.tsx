import React, { useState } from 'react';
import {
  X,
  Keyboard,
  Compass,
  Car,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface HelpShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpShortcutsModal: React.FC<HelpShortcutsModalProps> = ({ isOpen, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'shortcuts' | 'heuristics' | 'regulations'>('shortcuts');

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: '1. Navigation & Views (Keys match mnemonics & numbers)',
      shortcuts: [
        { key: 'M or 1', desc: 'Jump to Map View' },
        { key: 'L or 2', desc: 'Jump to Nearby Lots List' },
        { key: 'S or 3', desc: 'Jump to Saved / Bookmarked Lots' },
        { key: 'R or 4', desc: 'Jump to SG Rates & Rules Guide' },
        { key: 'Esc', desc: 'Close one layer at a time (modals, preview card, search, filters)' },
        { key: 'Backspace', desc: 'Return to previous view or previous location jump' },
        { key: '← / →', desc: 'Step to previous / next carpark sequentially' },
      ],
    },
    {
      title: '2. Vehicle Modes & Smart Filtering',
      shortcuts: [
        { key: 'C', desc: 'Cars lot mode (standard vehicle tariffs & lots)' },
        { key: 'K', desc: 'Motor-Bikes mode ($0.65 standard cap / free lots)' },
        { key: 'H', desc: 'Heavy Vehicles mode (buses & trucks)' },
        { key: 'F', desc: 'Cycle Agency filter (All -> HDB -> URA -> Commercial)' },
      ],
    },
    {
      title: '3. Real-Time Actions & Destination Search',
      shortcuts: [
        { key: '/', desc: 'Focus Singapore destination search box' },
        { key: 'U', desc: 'Update & refresh live real-time lot vacancies' },
        { key: 'Space', desc: 'Toggle preview sheet for selected carpark' },
        { key: 'Enter', desc: 'Open full tariff & height breakdown modal' },
        { key: '?', desc: 'Toggle this Shortcuts & Usability Guide' },
      ],
    },
  ];

  const heuristics = [
    {
      num: '1',
      name: 'Visibility of System Status',
      rule: 'Persistent bottom telemetry bar shows active view (1/4), mode (Cars/Bikes), live vacancy count, and sync time.',
    },
    {
      num: '2',
      name: 'Match Between System & Real World',
      rule: 'Keys use mnemonic letters (M=Map, L=List, S=Saved, R=Rates, C=Cars, K=Bikes). Uses official HDB/URA/LTA terms.',
    },
    {
      num: '3',
      name: 'User Control and Freedom',
      rule: 'Esc closes layer-by-layer (Help → Details → Preview → Search). Backspace returns you to previous view.',
    },
    {
      num: '4',
      name: 'Consistency and Standards',
      rule: 'Consistent color palette: Green (>30 lots), Amber (10-30), Rose (<10), Gray (Full). Standard arrow & Space controls.',
    },
    {
      num: '5',
      name: 'Error Prevention',
      rule: 'Shortcuts pause when typing in search to prevent accidental triggers. Auto-suggest prevents Singapore address typos.',
    },
    {
      num: '6',
      name: 'Recognition Rather than Recall',
      rule: 'A visible key strip remains on screen with clickable pills so you never need to memorize hotkeys.',
    },
    {
      num: '7',
      name: 'Flexibility and Efficiency of Use',
      rule: 'Every key has a clickable button for mouse/touch users. Number keys (1-4) jump straight to sections for power users.',
    },
    {
      num: '8',
      name: 'Aesthetic and Minimalist Design',
      rule: 'Floating key strip and telemetry bar smoothly fade when the mouse is still and restore immediately upon motion.',
    },
    {
      num: '9',
      name: 'Help Users Recognize, Diagnose & Recover',
      rule: 'Unassigned keys notify you cleanly and point to [?]. Clear diagnosis on GPS permissions and LTA DataMall connectivity.',
    },
    {
      num: '10',
      name: 'Help and Documentation',
      rule: 'Pressing [?] opens this comprehensive guide grouped by user intent with actionable rules.',
    },
  ];

  return (
    <div
      id="help-shortcuts-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              ?
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base leading-tight">
                Quick Guide & Exclusive Usability
              </h2>
              <p className="text-xs text-slate-500">
                Crafted with Jakob Nielsen's 10 Core Usability Principles
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('shortcuts')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeSubTab === 'shortcuts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Keyboard Shortcuts (Mnemonic)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('heuristics')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeSubTab === 'heuristics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            10 Usability Principles Applied
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('regulations')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeSubTab === 'regulations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            SG Parking Rules & EPS
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeSubTab === 'shortcuts' && (
            <div className="space-y-4">
              {shortcutGroups.map((group) => (
                <div key={group.title} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-800 mb-2.5 uppercase tracking-wider">
                    {group.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.shortcuts.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-2xs text-xs"
                      >
                        <span className="text-slate-600 font-medium">{item.desc}</span>
                        <kbd className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 shrink-0 ml-2">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSubTab === 'heuristics' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
                <strong>Exclusive Usability Standard:</strong> Every single interaction in this app is mapped directly to Jakob Nielsen's 10 Core Usability Heuristics to provide zero-friction parking discovery.
              </div>

              <div className="divide-y divide-slate-100">
                {heuristics.map((h) => (
                  <div key={h.num} className="py-2.5 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {h.num}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900">{h.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{h.rule}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'regulations' && (
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">15-Minute Grace Period</h4>
                <p>
                  Most HDB, URA, and major commercial car parks provide a 15-minute grace period. Entering and exiting within 15 minutes incurs no parking charges (ideal for pick-ups and drop-offs).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Sunday Free Parking Scheme (FPS)</h4>
                <p>
                  Look for the orange "FREE PARKING" badge on HDB carpark signboards. Car parking is free on Sundays and Public Holidays from 7:30 AM to 10:30 PM at eligible estates.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Night Parking Cap ($5.00)</h4>
                <p>
                  HDB and URA cap the maximum overnight parking fee at $5.00 for non-season holders between 10:30 PM and 7:00 AM the next day.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Press <kbd className="font-mono bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">Esc</kbd> anytime to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
