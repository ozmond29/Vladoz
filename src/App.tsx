/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { TopNav, MarketTab } from './components/TopNav';
import { KpiStatsStrip } from './components/KpiStatsStrip';
import { FilterToolbar, MarketType } from './components/FilterToolbar';
import { MatchCard } from './components/MatchCard';
import { MatchTable } from './components/MatchTable';
import { MatchModal } from './components/MatchModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Fixture, ApiSportsAccountStatus } from './types/football';
import { ApiSportsService } from './services/apiSports';
import { MOCK_FIXTURES } from './data/mockFixtures';
import { adjustProbabilitiesForLive } from './utils/probabilityEngine';
import { Info, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeMarketTab, setActiveMarketTab] = useState<MarketTab>('all');
  const [selectedMarket, setSelectedMarket] = useState<MarketType>('all');
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minProbability, setMinProbability] = useState(40);
  const [sortBy, setSortBy] = useState<
    'probability' | 'margin' | 'mismatch' | 'expected_goals' | 'corners' | 'shots' | 'assists'
  >('probability');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fixtures, setFixtures] = useState<Fixture[]>(MOCK_FIXTURES);
  const [liveError, setLiveError] = useState<string | null>(null);

  const [apiStatus, setApiStatus] = useState<ApiSportsAccountStatus>({
    plan: 'Sample Mode',
    active: false,
    requestsUsed: 0,
    requestsLimit: 100,
    connected: false,
    message: 'Using verified sample football data. Connect api-sports.io for live queries.',
  });

  // Keep top nav tab and filter toolbar market in sync
  const handleTopNavTabChange = (tab: MarketTab) => {
    setActiveMarketTab(tab);
    if (tab === 'all') setSelectedMarket('all');
    else if (tab === 'live') setSelectedMarket('live');
    else if (tab === 'handicap') setSelectedMarket('handicap');
    else if (tab === 'straight_win') setSelectedMarket('straight_win');
    else if (tab === 'over_goals') setSelectedMarket('over_15');
    else if (tab === 'btts_corners') setSelectedMarket('btts');
    else if (tab === 'shots_assists') setSelectedMarket('shots');
  };

  const handleMarketChange = (m: MarketType) => {
    setSelectedMarket(m);
    if (m === 'all') setActiveMarketTab('all');
    else if (m === 'live') setActiveMarketTab('live');
    else if (m === 'handicap') setActiveMarketTab('handicap');
    else if (m === 'straight_win') setActiveMarketTab('straight_win');
    else if (m === 'over_15' || m === 'over_25') setActiveMarketTab('over_goals');
    else if (m === 'btts' || m === 'corners') setActiveMarketTab('btts_corners');
    else if (m === 'shots' || m === 'assists') setActiveMarketTab('shots_assists');
  };

  const liveCount = useMemo(() => {
    return fixtures.filter((f) => f.status === 'LIVE' || f.live?.isLive).length;
  }, [fixtures]);

  // Periodic in-play clock tick simulation for active live matches
  useEffect(() => {
    const timer = setInterval(() => {
      setFixtures((prev) =>
        prev.map((fixture) => {
          if (!fixture.live || !fixture.live.isLive) return fixture;
          const nextElapsed = Math.min(90, fixture.live.elapsed + 1);
          const nextPeriod = nextElapsed > 45 ? '2H' : '1H';
          const updatedLive = {
            ...fixture.live,
            elapsed: nextElapsed,
            period: nextPeriod as any,
          };
          const adjusted = adjustProbabilitiesForLive(
            fixture.markets,
            fixture.handicap15Analysis,
            updatedLive,
            fixture.homeTeam.name,
            fixture.awayTeam.name
          );

          return {
            ...fixture,
            live: updatedLive,
            markets: adjusted.markets,
            handicap15Analysis: adjusted.handicap15,
          };
        })
      );
    }, 15000); // ticks every 15s

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    setLiveError(null);
    try {
      if (selectedMarket === 'live' || activeMarketTab === 'live') {
        const result = await ApiSportsService.getLiveFixtures();
        setFixtures(result.fixtures);
        if (result.error) {
          setLiveError(result.error);
        }
      } else {
        const result = await ApiSportsService.getFixtures(selectedLeagueId || undefined);
        setFixtures(result.fixtures);
        if (result.error) {
          setLiveError(result.error);
        }
      }
    } catch (err: unknown) {
      setLiveError(err instanceof Error ? err.message : 'Error fetching fixtures');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check initial API status on mount and load fixtures
  useEffect(() => {
    const init = async () => {
      const status = await ApiSportsService.checkStatus();
      setApiStatus(status);
      loadData();
    };
    init();
  }, []);

  // Re-fetch if league or market changes
  useEffect(() => {
    loadData();
  }, [selectedLeagueId, selectedMarket, activeMarketTab]);

  // Filtered and sorted fixtures
  const filteredFixtures = useMemo(() => {
    return fixtures
      .filter((fixture) => {
        // Live match filter
        if (selectedMarket === 'live' || activeMarketTab === 'live') {
          if (!fixture.live?.isLive && fixture.status !== 'LIVE') {
            return false;
          }
        }

        // League filter
        if (selectedLeagueId && fixture.league.id !== selectedLeagueId) {
          return false;
        }

        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchHome = fixture.homeTeam.name.toLowerCase().includes(q);
          const matchAway = fixture.awayTeam.name.toLowerCase().includes(q);
          const matchLeague = fixture.league.name.toLowerCase().includes(q);
          if (!matchHome && !matchAway && !matchLeague) {
            return false;
          }
        }

        // Market-specific probability filter
        if (selectedMarket === 'straight_win') {
          if (fixture.markets.straightWin.confidence < minProbability) return false;
        } else if (selectedMarket === 'over_15') {
          if (fixture.markets.goals.over15Prob < minProbability) return false;
        } else if (selectedMarket === 'over_25') {
          if (fixture.markets.goals.over25Prob < minProbability) return false;
        } else if (selectedMarket === 'btts') {
          if (fixture.markets.btts.bttsYesProb < minProbability) return false;
        } else if (selectedMarket === 'corners') {
          if (fixture.markets.corners.over95Prob < minProbability) return false;
        } else if (selectedMarket === 'shots') {
          if (fixture.markets.shots.over235ShotsProb < minProbability) return false;
        } else if (selectedMarket === 'assists') {
          if (fixture.markets.assists.over15AssistsProb < minProbability) return false;
        } else if (selectedMarket === 'handicap') {
          if (fixture.handicap15Analysis.probability < minProbability) return false;
        } else {
          // 'all' market filter: at least one market is above minProbability
          const maxProb = Math.max(
            fixture.markets.straightWin.confidence,
            fixture.markets.goals.over15Prob,
            fixture.markets.shots.over235ShotsProb,
            fixture.markets.assists.over15AssistsProb,
            fixture.handicap15Analysis.probability
          );
          if (maxProb < minProbability) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'probability') {
          if (selectedMarket === 'straight_win') {
            return b.markets.straightWin.confidence - a.markets.straightWin.confidence;
          }
          if (selectedMarket === 'over_15') {
            return b.markets.goals.over15Prob - a.markets.goals.over15Prob;
          }
          if (selectedMarket === 'over_25') {
            return b.markets.goals.over25Prob - a.markets.goals.over25Prob;
          }
          if (selectedMarket === 'btts') {
            return b.markets.btts.bttsYesProb - a.markets.btts.bttsYesProb;
          }
          if (selectedMarket === 'corners') {
            return b.markets.corners.over95Prob - a.markets.corners.over95Prob;
          }
          if (selectedMarket === 'shots') {
            return b.markets.shots.over235ShotsProb - a.markets.shots.over235ShotsProb;
          }
          if (selectedMarket === 'assists') {
            return b.markets.assists.over15AssistsProb - a.markets.assists.over15AssistsProb;
          }
          return b.handicap15Analysis.probability - a.handicap15Analysis.probability;
        }
        if (sortBy === 'margin') {
          return b.handicap15Analysis.expectedMargin - a.handicap15Analysis.expectedMargin;
        }
        if (sortBy === 'expected_goals') {
          return b.markets.goals.expectedTotalGoals - a.markets.goals.expectedTotalGoals;
        }
        if (sortBy === 'corners') {
          return b.markets.corners.projectedTotalCorners - a.markets.corners.projectedTotalCorners;
        }
        if (sortBy === 'shots') {
          return b.markets.shots.projectedTotalShots - a.markets.shots.projectedTotalShots;
        }
        if (sortBy === 'assists') {
          return b.markets.assists.projectedTotalAssists - a.markets.assists.projectedTotalAssists;
        }
        if (sortBy === 'mismatch') {
          return (
            b.handicap15Analysis.attackDefenseMismatchIndex -
            a.handicap15Analysis.attackDefenseMismatchIndex
          );
        }
        return 0;
      });
  }, [fixtures, selectedMarket, selectedLeagueId, minProbability, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 3-Zone Top Navigation Contract */}
      <TopNav
        activeMarketTab={activeMarketTab}
        setActiveMarketTab={handleTopNavTabChange}
        apiStatus={apiStatus}
        liveCount={liveCount}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onRefresh={() => loadData()}
        isRefreshing={isRefreshing}
      />

      {/* KPI Stats Proof Banner */}
      <KpiStatsStrip fixtures={fixtures} selectedMarket={selectedMarket} />

      {/* Hero Explainer & Multi-Market Methodology Card */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2 w-full">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Mutating Football Stats Engine · Multi-Market Modeling & Handicap -1.5</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Football Match Probabilities & Statistical Modeling
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Explore dynamic probability models for <strong className="text-white">Straight Win (1X2)</strong>,{' '}
              <strong className="text-white">Asian Handicap -1.5</strong>,{' '}
              <strong className="text-white">Over 1.5 & 2.5 Goals</strong>,{' '}
              <strong className="text-white">Both Teams To Score (BTTS)</strong>,{' '}
              <strong className="text-white">Corner Kicks</strong>,{' '}
              <strong className="text-white">Total Shots & Shots on Target</strong>, and{' '}
              <strong className="text-white">Team Assists (xA)</strong> calibrated dynamically via Att/Def ratings & xG.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="text-slate-400">DataSource Mode:</div>
              <div className="font-mono font-semibold text-white flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span>
                  {apiStatus.connected ? 'api-sports.io Live Feed' : 'Curated Verified Dataset'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/30 hover:bg-emerald-950/60 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{apiStatus.connected ? 'Manage API Key' : 'Connect api-sports.io'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {liveError && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{liveError}</span>
          </div>
        )}
      </div>

      {/* Filter and Sorting Toolbar */}
      <FilterToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLeagueId={selectedLeagueId}
        setSelectedLeagueId={setSelectedLeagueId}
        selectedMarket={selectedMarket}
        setSelectedMarket={handleMarketChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        minProbability={minProbability}
        setMinProbability={setMinProbability}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-6 w-full flex-1">
        {filteredFixtures.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl inline-block text-slate-500">
              <Info className="w-8 h-8 mx-auto" />
            </div>
            <h3 className="text-base font-semibold text-white">No Fixtures Match Current Filters</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Try lowering your minimum probability slider (currently {minProbability}%), clearing
              the search box, or selecting "All Markets Overview".
            </p>
            <button
              onClick={() => {
                setSelectedMarket('all');
                setSelectedLeagueId(null);
                setSearchTerm('');
                setMinProbability(30);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFixtures.map((fixture) => (
              <MatchCard
                key={fixture.id}
                fixture={fixture}
                selectedMarket={selectedMarket}
                onSelect={(f) => setSelectedFixture(f)}
              />
            ))}
          </div>
        ) : (
          <MatchTable
            fixtures={filteredFixtures}
            selectedMarket={selectedMarket}
            onSelect={(f) => setSelectedFixture(f)}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        )}
      </main>

      {/* Match Detailed Analytical Modal */}
      <MatchModal fixture={selectedFixture} onClose={() => setSelectedFixture(null)} />

      {/* API Key Setup Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        status={apiStatus}
        onStatusUpdated={(newStatus) => setApiStatus(newStatus)}
        onRefreshData={() => loadData()}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>Mutating Football Analytics</span>
            <span>·</span>
            <span>1X2, Over 1.5, Over 2.5, BTTS, Corners & Handicap -1.5</span>
            <span>·</span>
            <span>Powered by api-sports.io</span>
          </div>
          <div>
            Statistical probability models for educational and analytical purposes.
          </div>
        </div>
      </footer>
    </div>
  );
}
