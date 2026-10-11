import { ChevronRight, ArrowUpDown } from 'lucide-react';
import { Fixture } from '../types/football';
import { MarketType } from './FilterToolbar';

interface MatchTableProps {
  fixtures: Fixture[];
  selectedMarket: MarketType;
  onSelect: (fixture: Fixture) => void;
  sortBy: 'probability' | 'margin' | 'mismatch' | 'expected_goals' | 'corners' | 'shots' | 'assists';
  setSortBy: (sort: 'probability' | 'margin' | 'mismatch' | 'expected_goals' | 'corners' | 'shots' | 'assists') => void;
}

export function MatchTable({
  fixtures,
  selectedMarket,
  onSelect,
  sortBy,
  setSortBy,
}: MatchTableProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-medium select-none">
              <th className="py-3 px-4">Fixture / League</th>
              <th
                onClick={() => setSortBy('probability')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Straight Win (1X2)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => setSortBy('margin')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Handicap -1.5</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => setSortBy('expected_goals')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Over 1.5 Goals</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Over 2.5 Goals</th>
              <th className="py-3 px-3 text-right">BTTS (Yes)</th>
              <th
                onClick={() => setSortBy('corners')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Corners (Total / &gt;9.5)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => setSortBy('shots')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Shots (Total / SoT)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => setSortBy('assists')}
                className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Assists (xA / &gt;1.5)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {fixtures.map((fixture) => {
              const { homeTeam, awayTeam, league, date, time, handicap15Analysis, markets } = fixture;
              const { straightWin, goals, btts, corners, shots, assists } = markets;

              return (
                <tr
                  key={fixture.id}
                  onClick={() => onSelect(fixture)}
                  className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    fixture.live?.isLive ? 'bg-rose-950/10' : ''
                  }`}
                >
                  {/* Fixture & Competition */}
                  <td className="py-3.5 px-4 min-w-[220px]">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{homeTeam.name}</span>
                      {fixture.live?.isLive ? (
                        <span className="font-mono font-bold text-rose-400 bg-slate-950 px-2 py-0.5 rounded border border-rose-900/40 text-xs">
                          {fixture.live.score.home} - {fixture.live.score.away}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">vs</span>
                      )}
                      <span>{awayTeam.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      {fixture.live?.isLive ? (
                        <span className="text-rose-400 font-bold font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>LIVE {fixture.live.period} {fixture.live.elapsed}'</span>
                        </span>
                      ) : (
                        <span>{date} · <span className="font-mono tabular-nums">{time}</span></span>
                      )}
                      <span>·</span>
                      <span>{league.name}</span>
                    </div>
                  </td>

                  {/* Straight Win (1X2) */}
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span className="text-emerald-400 font-bold">
                      {straightWin.confidence}%
                    </span>
                    <div className="text-[10px] text-slate-400 truncate">
                      {straightWin.favoriteTeam}
                    </div>
                  </td>

                  {/* Handicap -1.5 */}
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span className="text-emerald-400 font-bold">
                      {handicap15Analysis.probability}%
                    </span>
                    <div className="text-[10px] text-slate-400">
                      +{handicap15Analysis.expectedMargin} goals
                    </div>
                  </td>

                  {/* Over 1.5 Goals */}
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span className={`font-bold ${goals.over15Prob === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {goals.over15Prob === 100 ? '100% HIT ✓' : `${goals.over15Prob}%`}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Odds: {goals.over15Odds}
                    </div>
                  </td>

                  {/* Over 2.5 Goals */}
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span className={`font-bold ${goals.over25Prob === 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {goals.over25Prob === 100 ? '100% HIT ✓' : `${goals.over25Prob}%`}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Odds: {goals.over25Odds}
                    </div>
                  </td>

                  {/* Both Teams To Score (BTTS) */}
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span className={`font-bold ${btts.bttsYesProb === 100 ? 'text-emerald-400' : 'text-purple-400'}`}>
                      {btts.bttsYesProb === 100 ? '100% HIT ✓' : `${btts.bttsYesProb}%`}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Odds: {btts.bttsYesOdds}
                    </div>
                  </td>

                  {/* Corners */}
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span className="text-amber-400 font-bold">
                      {corners.projectedTotalCorners}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      &gt;9.5: {corners.over95Prob === 100 ? 'HIT ✓' : `${corners.over95Prob}%`}
                    </div>
                  </td>

                  {/* Shots & SoT */}
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span className="text-blue-400 font-bold">
                      {shots.projectedTotalShots}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {shots.projectedTotalSot} SoT ({shots.over235ShotsProb}% &gt;23.5)
                    </div>
                  </td>

                  {/* Team Assists */}
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span className="text-emerald-400 font-bold">
                      {assists.projectedTotalAssists} xA
                    </span>
                    <div className="text-[10px] text-slate-400">
                      &gt;1.5: {assists.over15AssistsProb}%
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(fixture);
                      }}
                      className="p-1 hover:text-emerald-400 text-slate-400 rounded transition-colors cursor-pointer"
                      title="Inspect all market probabilities"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
