import { ChevronRight, Target, Flame, Flag, CheckCircle } from 'lucide-react';
import { Fixture } from '../types/football';
import { MarketType } from './FilterToolbar';

interface MatchCardProps {
  fixture: Fixture;
  selectedMarket: MarketType;
  onSelect: (fixture: Fixture) => void;
}

export function MatchCard({ fixture, selectedMarket, onSelect }: MatchCardProps) {
  const { homeTeam, awayTeam, league, date, time, handicap15Analysis, markets, homeStats, awayStats } = fixture;
  const isHomeTarget = handicap15Analysis.targetTeam === 'home';
  const targetTeam = isHomeTarget ? homeTeam : awayTeam;

  const { straightWin, goals, btts, corners, shots, assists } = markets;

  return (
    <div
      onClick={() => onSelect(fixture)}
      className="bg-slate-900/70 border border-slate-800 hover:border-slate-600 rounded-xl p-5 transition-all duration-150 cursor-pointer flex flex-col justify-between group hover:bg-slate-900"
    >
      <div>
        {/* Top unboxed metadata line */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            {fixture.live?.isLive ? (
              <span className="flex items-center gap-1.5 font-bold text-rose-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{fixture.live.period} {fixture.live.elapsed}'</span>
              </span>
            ) : (
              <>
                <span className="font-medium text-slate-300">{league.name}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{date}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono tabular-nums">{time}</span>
              </>
            )}
            {fixture.live?.isLive && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-medium text-slate-300 truncate max-w-[140px]">{league.name}</span>
              </>
            )}
          </div>

          <div className="text-xs font-mono font-medium">
            {fixture.live?.isLive ? (
              <span className="text-rose-400 font-bold">
                LIVE IN-PLAY
              </span>
            ) : (
              <span className="text-emerald-400">
                {straightWin.favoriteTeam} {straightWin.confidence}%
              </span>
            )}
          </div>
        </div>

        {/* Teams Matchup Header */}
        <div className="py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 object-contain shrink-0 drop-shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <div className="text-base font-semibold truncate text-white">
                  {homeTeam.name}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Att {homeStats.attackStrength} · Def {homeStats.defenseStrength}
                </div>
              </div>
            </div>

            {/* Live Score or VS separator */}
            {fixture.live?.isLive ? (
              <div className="text-center px-3 py-1 bg-slate-950 border border-rose-900/50 rounded-lg shrink-0 shadow-inner">
                <div className="text-lg font-black font-mono tracking-wider text-rose-400 tabular-nums">
                  {fixture.live.score.home} - {fixture.live.score.away}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {fixture.live.corners.home + fixture.live.corners.away} corners
                </div>
              </div>
            ) : (
              <div className="text-center px-2 shrink-0">
                <span className="text-xs text-slate-600 font-mono uppercase tracking-widest block">VS</span>
              </div>
            )}

            {/* Away Team */}
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
              <div className="min-w-0">
                <div className="text-base font-semibold truncate text-slate-200">
                  {awayTeam.name}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Att {awayStats.attackStrength} · Def {awayStats.defenseStrength}
                </div>
              </div>
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 object-contain shrink-0 drop-shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Market-Specific Focus Display */}
        {selectedMarket === 'live' ? (
          <div className="p-3.5 bg-slate-950/80 border border-rose-900/40 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>In-Play Live Probabilities</span>
              </span>
              <span className="text-rose-400 font-mono font-bold">
                {fixture.live?.period} {fixture.live?.elapsed}'
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Live 1X2 Winner</div>
                <div className="font-mono text-emerald-400 font-bold mt-0.5">
                  {straightWin.predictedOutcome} ({straightWin.confidence}%)
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Odds: @{straightWin.homeOdds}</div>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Live Handicap -1.5</div>
                <div className={`font-mono font-bold mt-0.5 ${handicap15Analysis.probability >= 70 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {handicap15Analysis.probability}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Exp: +{handicap15Analysis.expectedMargin} margin</div>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Over 1.5 Goals</div>
                <div className={`font-mono font-bold mt-0.5 ${goals.over15Prob === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {goals.over15Prob === 100 ? '100% (HIT ✓)' : `${goals.over15Prob}%`}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">&gt;2.5: {goals.over25Prob === 100 ? '100% (HIT ✓)' : `${goals.over25Prob}%`}</div>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Live BTTS & Corners</div>
                <div className={`font-mono font-bold mt-0.5 ${btts.bttsYesProb === 100 ? 'text-emerald-400' : 'text-purple-400'}`}>
                  BTTS: {btts.bttsYesProb === 100 ? '100% (HIT ✓)' : `${btts.bttsYesProb}%`}
                </div>
                <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                  Corners: {corners.projectedTotalCorners} ({corners.over95Prob}% &gt;9.5)
                </div>
              </div>
            </div>
          </div>
        ) : selectedMarket === 'straight_win' ? (
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">1X2 Straight Win Probabilities</span>
              <span className="text-emerald-400 font-semibold font-mono">
                Fav: {straightWin.favoriteTeam}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400">Home (1)</div>
                <div className="text-base font-bold font-mono text-emerald-400">{straightWin.homeProb}%</div>
                <div className="text-[11px] text-slate-500 font-mono">@{straightWin.homeOdds}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400">Draw (X)</div>
                <div className="text-base font-bold font-mono text-amber-400">{straightWin.drawProb}%</div>
                <div className="text-[11px] text-slate-500 font-mono">@{straightWin.drawOdds}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400">Away (2)</div>
                <div className="text-base font-bold font-mono text-cyan-400">{straightWin.awayProb}%</div>
                <div className="text-[11px] text-slate-500 font-mono">@{straightWin.awayOdds}</div>
              </div>
            </div>
          </div>
        ) : selectedMarket === 'over_15' ? (
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Over 1.5 Match Goals</span>
              <span className="text-cyan-400 font-semibold font-mono">
                Exp. Goals: {goals.expectedTotalGoals}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-cyan-800/40">
                <div className="text-slate-400">Over 1.5 Goals</div>
                <div className="text-xl font-bold font-mono text-cyan-400">{goals.over15Prob}%</div>
                <div className="text-[11px] text-slate-500 font-mono">Est. Odds: {goals.over15Odds}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400">Under 1.5 Goals</div>
                <div className="text-xl font-bold font-mono text-slate-300">{goals.under15Prob}%</div>
                <div className="text-[11px] text-slate-500 font-mono">Under 2 goals</div>
              </div>
            </div>
          </div>
        ) : selectedMarket === 'over_25' ? (
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Over 2.5 Match Goals</span>
              <span className="text-indigo-400 font-semibold font-mono">
                Exp. Goals: {goals.expectedTotalGoals}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-indigo-800/40">
                <div className="text-slate-400">Over 2.5 Goals</div>
                <div className="text-xl font-bold font-mono text-indigo-400">{goals.over25Prob}%</div>
                <div className="text-[11px] text-slate-500 font-mono">Est. Odds: {goals.over25Odds}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400">Under 2.5 Goals</div>
                <div className="text-xl font-bold font-mono text-slate-300">{goals.under25Prob}%</div>
                <div className="text-[11px] text-slate-500 font-mono">Max 2 goals</div>
              </div>
            </div>
          </div>
        ) : selectedMarket === 'btts' ? (
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Both Teams To Score (BTTS)</span>
              <span className="text-purple-400 font-semibold font-mono">
                {btts.bttsYesProb >= 60 ? 'High BTTS Chance' : 'Defensive Resilience'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-purple-800/40">
                <div className="text-slate-400">BTTS - YES</div>
                <div className="text-xl font-bold font-mono text-purple-400">{btts.bttsYesProb}%</div>
                <div className="text-[11px] text-slate-500 font-mono">Est. Odds: {btts.bttsYesOdds}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="text-slate-400">BTTS - NO</div>
                <div className="text-xl font-bold font-mono text-slate-300">{btts.bttsNoProb}%</div>
                <div className="text-[11px] text-slate-500 font-mono">Est. Odds: {btts.bttsNoOdds}</div>
              </div>
            </div>
          </div>
        ) : selectedMarket === 'corners' ? (
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Corner Kicks Expectancy</span>
              <span className="text-amber-400 font-semibold font-mono">
                Projected: {corners.projectedTotalCorners} corners
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400">Over 8.5</div>
                <div className="text-base font-bold font-mono text-amber-400">{corners.over85Prob}%</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-amber-800/50">
                <div className="text-slate-400">Over 9.5</div>
                <div className="text-base font-bold font-mono text-amber-300">{corners.over95Prob}%</div>
                <div className="text-[10px] text-slate-500 font-mono">@{corners.over95Odds}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400">Over 10.5</div>
                <div className="text-base font-bold font-mono text-slate-300">{corners.over105Prob}%</div>
              </div>
            </div>
          </div>
        ) : selectedMarket === 'handicap' ? (
          <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Handicap -1.5 ({isHomeTarget ? 'Home' : 'Away'})</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-emerald-400">
                  {handicap15Analysis.confidenceGrade}
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  {handicap15Analysis.probability}%
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${handicap15Analysis.probability}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Expected Margin: <strong className="font-mono text-white">+{handicap15Analysis.expectedMargin}</strong></span>
              <span>Est. Odds: <strong className="font-mono text-emerald-400">{handicap15Analysis.estimatedOdds}</strong></span>
            </div>
          </div>
        ) : selectedMarket === 'shots' ? (
          <div className="p-3.5 bg-slate-950/70 border border-blue-900/40 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Shots & Shots on Target (SoT)</span>
              <span className="text-blue-400 font-semibold font-mono">
                Projected: {shots.projectedTotalShots} shots ({shots.projectedTotalSot} on target)
              </span>
            </div>

            {/* Shots team comparison bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{homeTeam.name}: <strong>{shots.homeShots}</strong> ({shots.homeSot} SoT)</span>
                <span>{awayTeam.name}: <strong>{shots.awayShots}</strong> ({shots.awaySot} SoT)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(shots.homeShots / shots.projectedTotalShots) * 100}%` }}
                />
                <div
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${(shots.awayShots / shots.projectedTotalShots) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Over 23.5 Shots</div>
                <div className="text-base font-bold font-mono text-blue-400">{shots.over235ShotsProb}%</div>
                <div className="text-[10px] text-slate-500 font-mono">@{shots.over245Odds}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-blue-800/40">
                <div className="text-slate-400 text-[11px]">Over 8.5 SoT</div>
                <div className="text-base font-bold font-mono text-cyan-300">{shots.over85SotProb}%</div>
                <div className="text-[10px] text-slate-500 font-mono">@{shots.over85SotOdds}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Shots Leader</div>
                <div className="text-xs font-bold font-mono text-slate-200 truncate mt-1">{shots.shotsLeader}</div>
                <div className="text-[10px] text-slate-500 font-mono">{shots.shotsDominanceIndex}% share</div>
              </div>
            </div>
          </div>
        ) : selectedMarket === 'assists' ? (
          <div className="p-3.5 bg-slate-950/70 border border-emerald-900/40 rounded-lg space-y-2.5 my-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Team Assists & Expected Creation (xA)</span>
              <span className="text-emerald-400 font-semibold font-mono">
                Projected: {assists.projectedTotalAssists} assists
              </span>
            </div>

            {/* Assists comparison bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{homeTeam.name}: <strong>{assists.homeExpectedAssists} xA</strong></span>
                <span>{awayTeam.name}: <strong>{assists.awayExpectedAssists} xA</strong></span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${(assists.homeExpectedAssists / assists.projectedTotalAssists) * 100}%` }}
                />
                <div
                  className="h-full bg-teal-400 transition-all"
                  style={{ width: `${(assists.awayExpectedAssists / assists.projectedTotalAssists) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="bg-slate-900 p-2 rounded border border-emerald-800/40">
                <div className="text-slate-400 text-[11px]">Over 1.5 Assists</div>
                <div className="text-base font-bold font-mono text-emerald-400">{assists.over15AssistsProb}%</div>
                <div className="text-[10px] text-slate-500 font-mono">@{assists.over15Odds}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Over 2.5 Assists</div>
                <div className="text-base font-bold font-mono text-teal-300">{assists.over25AssistsProb}%</div>
                <div className="text-[10px] text-slate-500 font-mono">@{assists.over25Odds}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[11px]">Playmaker Rating</div>
                <div className="text-base font-bold font-mono text-slate-200">{assists.keyPlaymakerRating}/100</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{assists.assistLeader}</div>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Market Overview Matrix with 5 Core Markets + 2 New High-Demand Markets */
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2 my-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <span>Market Probabilities Overview (7 Markets)</span>
              <span className="text-emerald-400 font-medium">Att/Def & xG Modeled</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800/60">
                <div className="text-slate-400 text-[11px]">Straight Win (1X2)</div>
                <div className="font-mono text-emerald-400 font-bold mt-0.5 truncate">
                  {straightWin.predictedOutcome === 'HOME' ? homeTeam.name : straightWin.predictedOutcome === 'AWAY' ? awayTeam.name : 'Draw'} ({straightWin.confidence}%)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Odds: @{straightWin.homeOdds}</div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800/60">
                <div className="text-slate-400 text-[11px]">Handicap -1.5</div>
                <div className="font-mono text-emerald-400 font-bold mt-0.5">
                  {handicap15Analysis.probability}% ({handicap15Analysis.confidenceGrade})
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Exp: +{handicap15Analysis.expectedMargin} goals</div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800/60">
                <div className="text-slate-400 text-[11px]">Over 1.5 / 2.5 Goals</div>
                <div className="font-mono text-cyan-400 font-bold mt-0.5">
                  &gt;1.5: {goals.over15Prob}% · &gt;2.5: {goals.over25Prob}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">xG: {goals.expectedTotalGoals} total</div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded border border-slate-800/60">
                <div className="text-slate-400 text-[11px]">BTTS & Corners</div>
                <div className="font-mono text-purple-400 font-bold mt-0.5">
                  BTTS: {btts.bttsYesProb}%
                </div>
                <div className="text-[10px] text-amber-400 mt-0.5">
                  Corners: {corners.projectedTotalCorners} ({corners.over95Prob}% &gt;9.5)
                </div>
              </div>

              {/* NEW MARKET 1: Total Shots & Shots on Target */}
              <div className="bg-slate-900/80 p-2 rounded border border-blue-900/40">
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Total Shots & SoT</span>
                  <span className="text-blue-400 font-mono">{shots.over235ShotsProb}% &gt;23.5</span>
                </div>
                <div className="font-mono text-blue-300 font-bold mt-0.5">
                  {shots.projectedTotalShots} shots ({shots.projectedTotalSot} SoT)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  H: {shots.homeShots} · A: {shots.awayShots}
                </div>
              </div>

              {/* NEW MARKET 2: Team Assists */}
              <div className="bg-slate-900/80 p-2 rounded border border-emerald-900/40">
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Team Assists (xA)</span>
                  <span className="text-emerald-400 font-mono">{assists.over15AssistsProb}% &gt;1.5</span>
                </div>
                <div className="font-mono text-emerald-300 font-bold mt-0.5">
                  {assists.projectedTotalAssists} xA total
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  H: {assists.homeExpectedAssists} · A: {assists.awayExpectedAssists}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistical Adjacency Row */}
        <div className="grid grid-cols-2 gap-3 py-2 text-xs">
          <div className="bg-slate-950/40 p-2 rounded border border-slate-800/60">
            <div className="text-slate-400 truncate">{homeTeam.name} (Home)</div>
            <div className="text-xs font-mono tabular-nums text-slate-200 mt-0.5">
              Avg Goals: {homeStats.avgGoalsFor.toFixed(1)} · Shots: {shots.homeShots} ({shots.homeSot} SoT) · xA: {assists.homeExpectedAssists}
            </div>
          </div>

          <div className="bg-slate-950/40 p-2 rounded border border-slate-800/60">
            <div className="text-slate-400 truncate">{awayTeam.name} (Away)</div>
            <div className="text-xs font-mono tabular-nums text-slate-200 mt-0.5">
              Avg Goals: {awayStats.avgGoalsFor.toFixed(1)} · Shots: {shots.awayShots} ({shots.awaySot} SoT) · xA: {assists.awayExpectedAssists}
            </div>
          </div>
        </div>
      </div>

      {/* Footer trigger */}
      <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-xs truncate max-w-[240px]">
          {selectedMarket === 'straight_win'
            ? `1X2: ${straightWin.predictedOutcome} favored`
            : selectedMarket === 'over_15'
            ? `xG: ${goals.expectedTotalGoals} total goals projected`
            : selectedMarket === 'corners'
            ? `Corners: ${corners.projectedTotalCorners} total expected`
            : selectedMarket === 'btts'
            ? `BTTS probability: ${btts.bttsYesProb}%`
            : selectedMarket === 'shots'
            ? `Shots: ${shots.projectedTotalShots} total (${shots.over235ShotsProb}% >23.5 shots)`
            : selectedMarket === 'assists'
            ? `Assists: ${assists.projectedTotalAssists} projected (${assists.over15AssistsProb}% >1.5)`
            : handicap15Analysis.keyInsights[0]}
        </span>
        <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium shrink-0">
          <span>All Markets</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
