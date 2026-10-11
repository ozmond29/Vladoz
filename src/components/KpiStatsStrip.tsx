import { Fixture } from '../types/football';
import { MarketType } from './FilterToolbar';

interface KpiStatsStripProps {
  fixtures: Fixture[];
  selectedMarket: MarketType;
}

export function KpiStatsStrip({ fixtures, selectedMarket }: KpiStatsStripProps) {
  const total = fixtures.length;

  if (total === 0) return null;

  // Global calculations
  const avgHomeWinProb = Math.round(
    fixtures.reduce((acc, f) => acc + f.markets.straightWin.homeProb, 0) / total
  );

  const avgOver15Prob = Math.round(
    fixtures.reduce((acc, f) => acc + f.markets.goals.over15Prob, 0) / total
  );

  const avgOver25Prob = Math.round(
    fixtures.reduce((acc, f) => acc + f.markets.goals.over25Prob, 0) / total
  );

  const avgBttsProb = Math.round(
    fixtures.reduce((acc, f) => acc + f.markets.btts.bttsYesProb, 0) / total
  );

  const avgCorners = (
    fixtures.reduce((acc, f) => acc + f.markets.corners.projectedTotalCorners, 0) / total
  ).toFixed(1);

  const avgShots = (
    fixtures.reduce((acc, f) => acc + f.markets.shots.projectedTotalShots, 0) / total
  ).toFixed(1);

  const avgSot = (
    fixtures.reduce((acc, f) => acc + f.markets.shots.projectedTotalSot, 0) / total
  ).toFixed(1);

  const avgAssists = (
    fixtures.reduce((acc, f) => acc + f.markets.assists.projectedTotalAssists, 0) / total
  ).toFixed(2);

  const avgHandicap15Prob = (
    fixtures.reduce((acc, f) => acc + f.handicap15Analysis.probability, 0) / total
  ).toFixed(1);

  return (
    <div className="border-b border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {/* 1. Straight Win Metric */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 truncate">Straight Win Fav</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {avgHomeWinProb}%
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Avg win index
            </div>
          </div>

          {/* 2. Handicap -1.5 */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 truncate">Handicap -1.5</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {avgHandicap15Prob}%
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Win by 2+ goals
            </div>
          </div>

          {/* 3. Over 1.5 Goals */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 truncate">Over 1.5 Goals</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-cyan-400">
              {avgOver15Prob}%
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              &ge; 2 match goals
            </div>
          </div>

          {/* 4. BTTS Rate */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 truncate">BTTS (Both Score)</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-purple-400">
              {avgBttsProb}%
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Both teams net
            </div>
          </div>

          {/* 5. Projected Corners */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 truncate">Avg Corners</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-400">
              {avgCorners}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Match total corners
            </div>
          </div>

          {/* 6. Projected Shots & SoT */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 truncate">Shots & SoT</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-blue-400">
              {avgShots} <span className="text-xs font-normal text-slate-400">({avgSot})</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Total (on target)
            </div>
          </div>

          {/* 7. Team Assists */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 truncate">Team Assists</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-teal-300">
              {avgAssists} xA
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Expected assists
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
