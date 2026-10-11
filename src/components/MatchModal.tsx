import { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Swords,
  Calculator,
  CornerUpRight,
  Target,
  Flame,
} from 'lucide-react';
import { Fixture } from '../types/football';

interface MatchModalProps {
  fixture: Fixture | null;
  onClose: () => void;
}

export function MatchModal({ fixture, onClose }: MatchModalProps) {
  if (!fixture) return null;

  const {
    homeTeam,
    awayTeam,
    league,
    date,
    time,
    venue,
    handicap15Analysis,
    markets,
    homeStats,
    awayStats,
    h2h,
  } = fixture;

  const { straightWin, goals, btts, corners, shots, assists } = markets;
  const isHomeTarget = handicap15Analysis.targetTeam === 'home';
  const targetTeam = isHomeTarget ? homeTeam : awayTeam;
  const opponentTeam = isHomeTarget ? awayTeam : homeTeam;

  // Active view tab inside modal
  const [modalTab, setModalTab] = useState<
    'matrix' | 'straight' | 'goals' | 'btts' | 'corners' | 'handicap' | 'shots' | 'assists'
  >('matrix');

  // Interactive Simulator state
  const [simHomeScore, setSimHomeScore] = useState<number>(isHomeTarget ? 3 : 1);
  const [simAwayScore, setSimAwayScore] = useState<number>(isHomeTarget ? 0 : 2);
  const [simCorners, setSimCorners] = useState<number>(
    Math.round(corners.projectedTotalCorners)
  );
  const [simShots, setSimShots] = useState<number>(
    Math.round(shots.projectedTotalShots)
  );
  const [simAssists, setSimAssists] = useState<number>(
    Math.max(1, Math.round(assists.projectedTotalAssists))
  );

  const totalGoals = simHomeScore + simAwayScore;
  const simMargin = isHomeTarget ? simHomeScore - simAwayScore : simAwayScore - simHomeScore;
  const isHandicapCovered = simMargin >= 2;
  const isOver15Covered = totalGoals >= 2;
  const isOver25Covered = totalGoals >= 3;
  const isBttsCovered = simHomeScore > 0 && simAwayScore > 0;
  const isOver95CornersCovered = simCorners >= 10;
  const isOver235ShotsCovered = simShots >= 24;
  const isOver15AssistsCovered = simAssists >= 2;
  const simWinner =
    simHomeScore > simAwayScore ? 'HOME' : simAwayScore > simHomeScore ? 'AWAY' : 'DRAW';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">{league.name}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{date}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{time}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="truncate max-w-[200px]">{venue}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Match Banner */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Home Team */}
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={homeTeam.logo}
                  alt={homeTeam.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h2 className="text-xl font-bold text-white">{homeTeam.name}</h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Home: {homeStats.wins}W - {homeStats.draws}D - {homeStats.losses}L
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Avg Goals: {homeStats.avgGoalsFor.toFixed(2)} · Corners: {corners.homeCornersAvg}
                  </div>
                </div>
              </div>

              {/* Center Match Status / Live Score */}
              {fixture.live?.isLive ? (
                <div className="text-center px-5 py-2.5 bg-slate-950 border border-rose-900/60 rounded-xl shrink-0 shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-bold font-mono uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>{fixture.live.period} {fixture.live.elapsed}'</span>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-widest text-white tabular-nums my-0.5">
                    {fixture.live.score.home} - {fixture.live.score.away}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Corners: {fixture.live.corners.home} - {fixture.live.corners.away}
                  </div>
                </div>
              ) : (
                <div className="text-center px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
                  <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                    Projected Winner
                  </div>
                  <div className="text-base font-bold font-mono mt-0.5 text-emerald-400">
                    {straightWin.favoriteTeam}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {straightWin.confidence}% confidence
                  </div>
                </div>
              )}

              {/* Away Team */}
              <div className="flex items-center gap-4 flex-1 justify-end text-right">
                <div>
                  <h2 className="text-xl font-bold text-white">{awayTeam.name}</h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Away: {awayStats.wins}W - {awayStats.draws}D - {awayStats.losses}L
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Avg Goals: {awayStats.avgGoalsFor.toFixed(2)} · Corners: {corners.awayCornersAvg}
                  </div>
                </div>
                <img
                  src={awayTeam.logo}
                  alt={awayTeam.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modal Section Nav Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
            <button
              onClick={() => setModalTab('matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                modalTab === 'matrix' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All 7 Markets Matrix
            </button>
            <button
              onClick={() => setModalTab('straight')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                modalTab === 'straight' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Straight Win (1X2)
            </button>
            <button
              onClick={() => setModalTab('goals')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                modalTab === 'goals' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Over 1.5 & 2.5 Goals
            </button>
            <button
              onClick={() => setModalTab('btts')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                modalTab === 'btts' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Both Teams To Score
            </button>
            <button
              onClick={() => setModalTab('corners')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                modalTab === 'corners' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Corners
            </button>
            <button
              onClick={() => setModalTab('handicap')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                modalTab === 'handicap' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Handicap -1.5
            </button>
            <button
              onClick={() => setModalTab('shots')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                modalTab === 'shots' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Shots & SoT
            </button>
            <button
              onClick={() => setModalTab('assists')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                modalTab === 'assists' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Team Assists (xA)
            </button>
          </div>

          {/* TAB 1: ALL 5 MARKETS MATRIX */}
          {modalTab === 'matrix' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Straight Win Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>1. Straight Win (1X2)</span>
                    <span className="text-emerald-400 font-mono font-bold">{straightWin.predictedOutcome}</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {straightWin.confidence}%
                  </div>
                  <div className="text-xs text-slate-400">
                    Favorite: <strong className="text-white">{straightWin.favoriteTeam}</strong> (@{straightWin.homeOdds})
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between font-mono">
                    <span>1: {straightWin.homeProb}%</span>
                    <span>X: {straightWin.drawProb}%</span>
                    <span>2: {straightWin.awayProb}%</span>
                  </div>
                </div>

                {/* 2. Over 1.5 Goals Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>2. Over 1.5 Goals</span>
                    <span className="text-cyan-400 font-mono font-bold">2+ Goals</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {goals.over15Prob}%
                  </div>
                  <div className="text-xs text-slate-400">
                    Fair Market Odds: <strong className="text-white">@{goals.over15Odds}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                    Under 1.5 Prob: {goals.under15Prob}%
                  </div>
                </div>

                {/* 3. Over 2.5 Goals Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>3. Over 2.5 Goals</span>
                    <span className="text-indigo-400 font-mono font-bold">3+ Goals</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-indigo-400">
                    {goals.over25Prob}%
                  </div>
                  <div className="text-xs text-slate-400">
                    Projected Total Goals: <strong className="text-white font-mono">{goals.expectedTotalGoals}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                    Under 2.5 Prob: {goals.under25Prob}% (@{goals.over25Odds})
                  </div>
                </div>

                {/* 4. BTTS Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>4. Both Teams To Score</span>
                    <span className="text-purple-400 font-mono font-bold">BTTS</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-purple-400">
                    {btts.bttsYesProb}%
                  </div>
                  <div className="text-xs text-slate-400">
                    BTTS Yes Odds: <strong className="text-white">@{btts.bttsYesOdds}</strong> · No: @{btts.bttsNoOdds}
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                    Home Scored Rate: {btts.homeScoredRate}% · Away: {btts.awayScoredRate}%
                  </div>
                </div>

                {/* 5. Corners Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>5. Match Corner Kicks</span>
                    <span className="text-amber-400 font-mono font-bold">Corners</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {corners.projectedTotalCorners} <span className="text-xs text-slate-400">avg</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Over 9.5 Corners Prob: <strong className="text-white font-mono">{corners.over95Prob}%</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                    Home Avg: {corners.homeCornersAvg} · Away Avg: {corners.awayCornersAvg}
                  </div>
                </div>

                {/* 6. Handicap -1.5 Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>6. Asian Handicap -1.5</span>
                    <span className="text-emerald-400 font-mono font-bold">Win by 2+</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {handicap15Analysis.probability}%
                  </div>
                  <div className="text-xs text-slate-400">
                    Projected Margin: <strong className="text-white font-mono">+{handicap15Analysis.expectedMargin}</strong> goals
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                    Target 2+ Win Rate: {handicap15Analysis.favoriteHomeAwayCoverRate}%
                  </div>
                </div>

                {/* 7. Total Shots & Shots on Target Card */}
                <div className="p-4 bg-slate-950/60 border border-blue-900/40 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>7. Total Shots & SoT</span>
                    <span className="text-blue-400 font-mono font-bold">&gt;23.5: {shots.over235ShotsProb}%</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-blue-300">
                    {shots.projectedTotalShots} <span className="text-xs text-slate-400">shots</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Projected on Target: <strong className="text-white font-mono">{shots.projectedTotalSot} SoT</strong> ({shots.over85SotProb}% &gt;8.5)
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                    {homeTeam.name}: {shots.homeShots} ({shots.homeSot} SoT) · {awayTeam.name}: {shots.awayShots} ({shots.awaySot} SoT)
                  </div>
                </div>

                {/* 8. Team Assists (xA) Card */}
                <div className="p-4 bg-slate-950/60 border border-emerald-900/40 rounded-xl space-y-2">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>8. Team Assists (xA)</span>
                    <span className="text-emerald-400 font-mono font-bold">&gt;1.5: {assists.over15AssistsProb}%</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-300">
                    {assists.projectedTotalAssists} <span className="text-xs text-slate-400">expected</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Over 2.5 Assists: <strong className="text-white font-mono">{assists.over25AssistsProb}%</strong> (@{assists.over25Odds})
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                    Home xA: {assists.homeExpectedAssists} · Away xA: {assists.awayExpectedAssists} · Creator: {assists.assistLeader}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRAIGHT WIN (1X2) */}
          {modalTab === 'straight' && (
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>1X2 Match Winner Probability Distribution</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">{homeTeam.name} Win (1)</div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400">{straightWin.homeProb}%</div>
                  <div className="text-xs text-slate-500 font-mono">Model Odds: @{straightWin.homeOdds}</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">Draw (X)</div>
                  <div className="text-3xl font-extrabold font-mono text-amber-400">{straightWin.drawProb}%</div>
                  <div className="text-xs text-slate-500 font-mono">Model Odds: @{straightWin.drawOdds}</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">{awayTeam.name} Win (2)</div>
                  <div className="text-3xl font-extrabold font-mono text-cyan-400">{straightWin.awayProb}%</div>
                  <div className="text-xs text-slate-500 font-mono">Model Odds: @{straightWin.awayOdds}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300">
                <div className="font-semibold text-white">Comparative Team Strength:</div>
                <div className="flex justify-between text-slate-400">
                  <span>{homeTeam.name} Attack: {homeStats.attackStrength} · Defense: {homeStats.defenseStrength}</span>
                  <span>{awayTeam.name} Attack: {awayStats.attackStrength} · Defense: {awayStats.defenseStrength}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOALS (OVER 1.5 & OVER 2.5) */}
          {modalTab === 'goals' && (
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-cyan-400" />
                <span>Over 1.5 and Over 2.5 Goals Expectancy</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 border border-cyan-800/40 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Over 1.5 Match Goals</span>
                    <span className="text-cyan-400 font-mono font-bold text-lg">{goals.over15Prob}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${goals.over15Prob}%` }} />
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>Under 1.5: {goals.under15Prob}%</span>
                    <span>Est. Odds: @{goals.over15Odds}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 border border-indigo-800/40 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">Over 2.5 Match Goals</span>
                    <span className="text-indigo-400 font-mono font-bold text-lg">{goals.over25Prob}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${goals.over25Prob}%` }} />
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>Under 2.5: {goals.under25Prob}%</span>
                    <span>Est. Odds: @{goals.over25Odds}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="text-white font-semibold">Expected Total Match Goals (xG Total): <span className="font-mono text-cyan-400">{goals.expectedTotalGoals}</span></div>
                <div className="text-slate-400">
                  {homeTeam.name} averages {homeStats.avgGoalsFor.toFixed(2)} goals scored at home. {awayTeam.name} averages {awayStats.avgGoalsFor.toFixed(2)} goals scored away.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BTTS */}
          {modalTab === 'btts' && (
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-white">
                Both Teams To Score (BTTS) Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 border border-purple-800/50 rounded-xl space-y-2 text-center">
                  <div className="text-xs text-slate-400">BTTS - YES (Both Find Net)</div>
                  <div className="text-3xl font-extrabold font-mono text-purple-400">{btts.bttsYesProb}%</div>
                  <div className="text-xs text-slate-500 font-mono">Fair Odds: @{btts.bttsYesOdds}</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-center">
                  <div className="text-xs text-slate-400">BTTS - NO (At Least One Clean Sheet)</div>
                  <div className="text-3xl font-extrabold font-mono text-slate-300">{btts.bttsNoProb}%</div>
                  <div className="text-xs text-slate-500 font-mono">Fair Odds: @{btts.bttsNoOdds}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300">
                <div className="font-semibold text-white">Scoring and Clean Sheet Metrics:</div>
                <ul className="space-y-1 text-slate-400">
                  <li>• {homeTeam.name} has kept {homeStats.cleanSheets} clean sheets in {homeStats.played} fixtures.</li>
                  <li>• {awayTeam.name} has scored in {btts.awayScoredRate}% of away league games.</li>
                  <li>• Combined mutual scoring tendency: <strong className="text-white font-mono">{btts.combinedBttsRate}%</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: CORNERS */}
          {modalTab === 'corners' && (
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CornerUpRight className="w-5 h-5 text-amber-400" />
                <span>Corner Kicks Analysis & Probability Thresholds</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Over 8.5 Corners</div>
                  <div className="text-2xl font-bold font-mono text-amber-400">{corners.over85Prob}%</div>
                  <div className="text-[11px] text-slate-500 font-mono">&ge; 9 total corners</div>
                </div>

                <div className="p-4 bg-slate-900 border border-amber-800/60 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Over 9.5 Corners (Target)</div>
                  <div className="text-2xl font-bold font-mono text-amber-300">{corners.over95Prob}%</div>
                  <div className="text-[11px] text-slate-500 font-mono">Odds: @{corners.over95Odds}</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Over 10.5 Corners</div>
                  <div className="text-2xl font-bold font-mono text-slate-300">{corners.over105Prob}%</div>
                  <div className="text-[11px] text-slate-500 font-mono">&ge; 11 total corners</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="text-white font-semibold">Total Match Expected Corners: <span className="font-mono text-amber-400">{corners.projectedTotalCorners}</span></div>
                <div className="text-slate-400">
                  {homeTeam.name} generates an average of <strong className="text-white">{corners.homeCornersAvg}</strong> corners per match, while {awayTeam.name} generates <strong className="text-white">{corners.awayCornersAvg}</strong>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HANDICAP -1.5 */}
          {modalTab === 'handicap' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Handicap -1.5 Probability</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-emerald-400">
                      {handicap15Analysis.probability}%
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      [{handicap15Analysis.confidenceGrade}]
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Projected Goal Difference</div>
                  <div className="text-3xl font-extrabold font-mono text-white">
                    +{handicap15Analysis.expectedMargin}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs text-slate-400">Fair Value Odds</div>
                  <div className="text-3xl font-extrabold font-mono text-cyan-400">
                    {handicap15Analysis.estimatedOdds}
                  </div>
                </div>
              </div>

              {/* Attack vs Defense */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Swords className="w-4 h-4 text-emerald-400" />
                  <span>Attack Force vs Defense Resistance</span>
                </h3>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Home Attack ({homeTeam.name}): <strong className="font-mono">{homeStats.attackStrength}/100</strong></span>
                    <span>Away Defense ({awayTeam.name}): <strong className="font-mono">{awayStats.defenseStrength}/100</strong></span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${homeStats.attackStrength}%` }} />
                    <div className="bg-amber-500 h-full rounded-full ml-auto" style={{ width: `${awayStats.defenseStrength}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SHOTS & SHOTS ON TARGET */}
          {modalTab === 'shots' && (
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span>Total Shots & Shots on Target (SoT) Modeling</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">Total Projected Shots</div>
                  <div className="text-3xl font-extrabold font-mono text-blue-400">{shots.projectedTotalShots}</div>
                  <div className="text-xs text-slate-500 font-mono">Over 23.5: {shots.over235ShotsProb}% (@{shots.over245Odds})</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">Shots on Target (SoT)</div>
                  <div className="text-3xl font-extrabold font-mono text-cyan-300">{shots.projectedTotalSot}</div>
                  <div className="text-xs text-slate-500 font-mono">Over 8.5 SoT: {shots.over85SotProb}% (@{shots.over85SotOdds})</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">Shot Volume Leader</div>
                  <div className="text-lg font-bold font-mono text-slate-200 mt-1">{shots.shotsLeader}</div>
                  <div className="text-xs text-slate-500 font-mono">{shots.shotsDominanceIndex}% shot share dominance</div>
                </div>
              </div>

              {/* Team Split Visual Bar */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Team Shot Generation Breakdown</span>
                  <span className="text-slate-400 font-mono">Att Force & Porous Defense Scaled</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>{homeTeam.name} (Home): <strong>{shots.homeShots}</strong> shots ({shots.homeSot} SoT)</span>
                  <span>{awayTeam.name} (Away): <strong>{shots.awayShots}</strong> shots ({shots.awaySot} SoT)</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(shots.homeShots / shots.projectedTotalShots) * 100}%` }}
                  />
                  <div
                    className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${(shots.awayShots / shots.projectedTotalShots) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80 font-mono">
                  <div>Home Shots &gt;13.5: <strong className="text-white">{shots.homeOver135ShotsProb}%</strong></div>
                  <div className="text-right">Away Shots &gt;9.5: <strong className="text-white">{shots.awayOver95ShotsProb}%</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TEAM ASSISTS */}
          {modalTab === 'assists' && (
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Team Assists & Expected Chance Creation (xA)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">Total Projected Assists</div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400">{assists.projectedTotalAssists}</div>
                  <div className="text-xs text-slate-500 font-mono">Over 1.5 Assists: {assists.over15AssistsProb}% (@{assists.over15Odds})</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">Over 2.5 Assists Probability</div>
                  <div className="text-3xl font-extrabold font-mono text-teal-300">{assists.over25AssistsProb}%</div>
                  <div className="text-xs text-slate-500 font-mono">Model Odds: @{assists.over25Odds}</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-1">
                  <div className="text-xs text-slate-400">Creative Playmaker Index</div>
                  <div className="text-3xl font-extrabold font-mono text-slate-200">{assists.keyPlaymakerRating}/100</div>
                  <div className="text-xs text-slate-500 font-mono">Primary Creator: {assists.assistLeader}</div>
                </div>
              </div>

              {/* Team Assists Split */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Expected Assists (xA) Share</span>
                  <span className="text-slate-400 font-mono">xG-Assisted Ratio (68%-75%)</span>
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>{homeTeam.name}: <strong>{assists.homeExpectedAssists} xA</strong> ({assists.homeOver15AssistsProb}% &gt;1.5)</span>
                  <span>{awayTeam.name}: <strong>{assists.awayExpectedAssists} xA</strong> ({assists.awayOver05AssistsProb}% &gt;0.5)</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
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
            </div>
          )}

          {/* ALL-IN-ONE MULTI-MARKET SIMULATOR */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>All-in-One Multi-Market Outcome Simulator (7 Markets)</span>
              </h3>
              <span className="text-xs text-slate-400">Simulate final score, corners, shots & assists</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block truncate">{homeTeam.name} Goals</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  value={simHomeScore}
                  onChange={(e) => setSimHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-base text-center focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block truncate">{awayTeam.name} Goals</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  value={simAwayScore}
                  onChange={(e) => setSimAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-base text-center focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Total Corners</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={simCorners}
                  onChange={(e) => setSimCorners(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-base text-center focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Total Shots</label>
                <input
                  type="number"
                  min="0"
                  max="45"
                  value={simShots}
                  onChange={(e) => setSimShots(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-base text-center focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[11px] text-slate-400 block">Team Assists</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={simAssists}
                  onChange={(e) => setSimAssists(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-base text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Verification checklist for all 7 markets */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
              <div className={`p-2 rounded border text-center ${simWinner === 'HOME' ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <div className="text-[10px]">1X2 Winner</div>
                <div className="font-mono font-bold mt-0.5">{simWinner}</div>
              </div>

              <div className={`p-2 rounded border text-center ${isHandicapCovered ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <div className="text-[10px]">Handicap -1.5</div>
                <div className="font-mono font-bold mt-0.5">{isHandicapCovered ? '✓ WON' : '✗ LOST'}</div>
              </div>

              <div className={`p-2 rounded border text-center ${isOver15Covered ? 'bg-cyan-950/40 border-cyan-700/60 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <div className="text-[10px]">Over 1.5 Goals</div>
                <div className="font-mono font-bold mt-0.5">{isOver15Covered ? '✓ WON' : '✗ LOST'}</div>
              </div>

              <div className={`p-2 rounded border text-center ${isBttsCovered ? 'bg-purple-950/40 border-purple-700/60 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <div className="text-[10px]">BTTS</div>
                <div className="font-mono font-bold mt-0.5">{isBttsCovered ? '✓ YES' : '✗ NO'}</div>
              </div>

              <div className={`p-2 rounded border text-center ${isOver95CornersCovered ? 'bg-amber-950/40 border-amber-700/60 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <div className="text-[10px]">Corners &gt;9.5</div>
                <div className="font-mono font-bold mt-0.5">{isOver95CornersCovered ? '✓ WON' : '✗ LOST'}</div>
              </div>

              <div className={`p-2 rounded border text-center ${isOver235ShotsCovered ? 'bg-blue-950/40 border-blue-700/60 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <div className="text-[10px]">Shots &gt;23.5</div>
                <div className="font-mono font-bold mt-0.5">{isOver235ShotsCovered ? '✓ WON' : '✗ LOST'}</div>
              </div>

              <div className={`p-2 rounded border text-center ${isOver15AssistsCovered ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <div className="text-[10px]">Assists &gt;1.5</div>
                <div className="font-mono font-bold mt-0.5">{isOver15AssistsCovered ? '✓ WON' : '✗ LOST'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400">
            Handicap Recommendation: <strong className="text-white">{handicap15Analysis.recommendedBet}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
