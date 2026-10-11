import { ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { ApiSportsAccountStatus } from '../types/football';

export type MarketTab = 'all' | 'live' | 'handicap' | 'straight_win' | 'over_goals' | 'btts_corners' | 'shots_assists';

interface TopNavProps {
  activeMarketTab: MarketTab;
  setActiveMarketTab: (tab: MarketTab) => void;
  apiStatus: ApiSportsAccountStatus;
  liveCount?: number;
  onOpenKeyModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function TopNav({
  activeMarketTab,
  setActiveMarketTab,
  apiStatus,
  liveCount = 0,
  onOpenKeyModal,
  onRefresh,
  isRefreshing,
}: TopNavProps) {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveMarketTab('all');
        }}
        className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="text-emerald-400">Mutating</span>
        <span className="text-slate-400 font-normal">·</span>
        <span>Football Markets</span>
      </a>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveMarketTab('live')}
          className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeMarketTab === 'live'
              ? 'text-rose-400 font-semibold underline underline-offset-4'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Live Matches {liveCount > 0 ? `(${liveCount})` : ''}</span>
        </button>
        <button
          onClick={() => setActiveMarketTab('all')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeMarketTab === 'all' ? 'text-emerald-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          All Fixtures
        </button>
        <button
          onClick={() => setActiveMarketTab('straight_win')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeMarketTab === 'straight_win' ? 'text-emerald-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          Straight Win (1X2)
        </button>
        <button
          onClick={() => setActiveMarketTab('handicap')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeMarketTab === 'handicap' ? 'text-emerald-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          Handicap -1.5
        </button>
        <button
          onClick={() => setActiveMarketTab('over_goals')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeMarketTab === 'over_goals' ? 'text-emerald-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          Over 1.5 & 2.5
        </button>
        <button
          onClick={() => setActiveMarketTab('btts_corners')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeMarketTab === 'btts_corners' ? 'text-emerald-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          BTTS & Corners
        </button>
        <button
          onClick={() => setActiveMarketTab('shots_assists')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeMarketTab === 'shots_assists' ? 'text-emerald-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          Shots & Assists
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh match calculations"
          className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        <button
          onClick={onOpenKeyModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {apiStatus.connected ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Key className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {apiStatus.connected
              ? `API-Sports: ${apiStatus.requestsLimit - apiStatus.requestsUsed} left`
              : 'Configure API Key'}
          </span>
        </button>
      </div>
    </header>
  );
}
