import { Search, LayoutGrid, TableProperties } from 'lucide-react';
import { LEAGUES_DATA } from '../data/mockFixtures';

export type MarketType =
  | 'all'
  | 'live'
  | 'handicap'
  | 'straight_win'
  | 'over_15'
  | 'over_25'
  | 'btts'
  | 'corners'
  | 'shots'
  | 'assists';

interface FilterToolbarProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedLeagueId: number | null;
  setSelectedLeagueId: (id: number | null) => void;
  selectedMarket: MarketType;
  setSelectedMarket: (m: MarketType) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (m: 'grid' | 'table') => void;
  minProbability: number;
  setMinProbability: (val: number) => void;
  sortBy: 'probability' | 'margin' | 'mismatch' | 'expected_goals' | 'corners' | 'shots' | 'assists';
  setSortBy: (sort: 'probability' | 'margin' | 'mismatch' | 'expected_goals' | 'corners' | 'shots' | 'assists') => void;
}

export function FilterToolbar({
  searchTerm,
  setSearchTerm,
  selectedLeagueId,
  setSelectedLeagueId,
  selectedMarket,
  setSelectedMarket,
  viewMode,
  setViewMode,
  minProbability,
  setMinProbability,
  sortBy,
  setSortBy,
}: FilterToolbarProps) {
  return (
    <div className="bg-slate-950 border-b border-slate-800 py-4 px-6 space-y-3">
      {/* Upper toolbar: Search, League, and View Options */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search & League */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <select
            value={selectedLeagueId || ''}
            onChange={(e) => setSelectedLeagueId(e.target.value ? Number(e.target.value) : null)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Competitions</option>
            {LEAGUES_DATA.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.country})
              </option>
            ))}
          </select>
        </div>

        {/* Right: Min probability slider, Sort, and View toggle */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Min Prob:</span>
            <input
              type="range"
              min="30"
              max="85"
              step="5"
              value={minProbability}
              onChange={(e) => setMinProbability(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono tabular-nums text-slate-200 w-8">{minProbability}%</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="probability">Top Market Probability</option>
              <option value="margin">Handicap Goal Margin</option>
              <option value="expected_goals">Highest Projected Goals</option>
              <option value="corners">Highest Corners Expectancy</option>
              <option value="shots">Highest Shots Expectancy</option>
              <option value="assists">Highest Team Assists (xA)</option>
              <option value="mismatch">Attack/Defense Gap</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              title="Cards Grid"
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Data Table"
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lower toolbar: Specific Market Filter Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-xs text-slate-500 whitespace-nowrap mr-1">Market Focus:</span>
        <button
          onClick={() => setSelectedMarket('live')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedMarket === 'live'
              ? 'bg-rose-950 text-rose-300 border border-rose-700 shadow-xs'
              : 'text-slate-400 hover:text-rose-300 bg-slate-900/60'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Live In-Play</span>
        </button>
        <button
          onClick={() => setSelectedMarket('all')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'all'
              ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          All Markets Overview
        </button>
        <button
          onClick={() => setSelectedMarket('straight_win')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'straight_win'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          Straight Win (1X2)
        </button>
        <button
          onClick={() => setSelectedMarket('handicap')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'handicap'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          Handicap -1.5
        </button>
        <button
          onClick={() => setSelectedMarket('over_15')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'over_15'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          Over 1.5 Goals
        </button>
        <button
          onClick={() => setSelectedMarket('over_25')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'over_25'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          Over 2.5 Goals
        </button>
        <button
          onClick={() => setSelectedMarket('btts')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'btts'
              ? 'bg-purple-950 text-purple-300 border border-purple-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          Both Teams To Score (BTTS)
        </button>
        <button
          onClick={() => setSelectedMarket('corners')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'corners'
              ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          Corners (Over 9.5 & Totals)
        </button>
        <button
          onClick={() => setSelectedMarket('shots')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'shots'
              ? 'bg-blue-950 text-blue-300 border border-blue-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          Shots & SoT (Totals)
        </button>
        <button
          onClick={() => setSelectedMarket('assists')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedMarket === 'assists'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          Team Assists (xA)
        </button>
      </div>
    </div>
  );
}
