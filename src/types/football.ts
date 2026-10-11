export interface Team {
  id: number;
  name: string;
  logo: string;
  shortCode?: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  season: number;
}

export interface MatchMarginResult {
  opponent: string;
  isHome: boolean;
  scoreFor: number;
  scoreAgainst: number;
  margin: number; // scoreFor - scoreAgainst
  coveredHandicap15: boolean; // margin >= 2
  date: string;
}

export interface TeamHandicapStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  cleanSheets: number;
  // Specific to -1.5 handicap (wins by 2+ goals)
  winsBy2Plus: number;
  winsBy2PlusRate: number; // percentage (0 - 100)
  // When defending against handicap (losses by 2+ goals)
  lossesBy2Plus: number;
  lossesBy2PlusRate: number; // percentage (0 - 100)
  // Attack & defense rating indices (0 - 100)
  attackStrength: number;
  defenseStrength: number;
  recentMargins: MatchMarginResult[]; // last 5-6 matches
}

export interface Handicap15Analysis {
  targetTeam: 'home' | 'away';
  targetTeamName: string;
  opponentTeamName: string;
  probability: number; // 0 - 100%
  confidenceGrade: 'PRIME' | 'STRONG' | 'MODERATE' | 'CAUTION';
  expectedMargin: number; // e.g. +2.35
  favoriteHomeAwayCoverRate: number; // Favorite's 2+ win rate at home/away
  underdogLossMarginRate: number; // Underdog's 2+ loss rate away/home
  attackDefenseMismatchIndex: number; // 0 - 100
  estimatedOdds: number; // e.g. 1.85
  keyInsights: string[];
  recommendedBet: string;
}

export interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  winner: string;
  coveredTarget15: boolean;
}

export interface ApiSportsPrediction {
  winner: string;
  advice: string;
  percent: {
    home: string;
    draw: string;
    away: string;
  };
  comparison: {
    form: { home: number; away: number };
    attack: { home: number; away: number };
    defense: { home: number; away: number };
    h2h: { home: number; away: number };
    poisson: { home: number; away: number };
  };
}

export interface StraightWinAnalysis {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  predictedOutcome: 'HOME' | 'DRAW' | 'AWAY';
  favoriteTeam: string;
  confidence: number;
}

export interface GoalsOverUnderAnalysis {
  over15Prob: number;
  under15Prob: number;
  over15Odds: number;
  over25Prob: number;
  under25Prob: number;
  over25Odds: number;
  expectedTotalGoals: number;
  homeOver15Rate: number;
  awayOver15Rate: number;
  homeOver25Rate: number;
  awayOver25Rate: number;
}

export interface BttsAnalysis {
  bttsYesProb: number;
  bttsNoProb: number;
  bttsYesOdds: number;
  bttsNoOdds: number;
  homeScoredRate: number;
  awayScoredRate: number;
  homeConcededRate: number;
  awayConcededRate: number;
  combinedBttsRate: number;
}

export interface CornersAnalysis {
  projectedTotalCorners: number;
  homeCornersAvg: number;
  awayCornersAvg: number;
  over85Prob: number;
  over95Prob: number;
  over105Prob: number;
  over95Odds: number;
  cornerFavorite: string;
}

export interface ShotsAnalysis {
  projectedTotalShots: number;
  homeShots: number;
  awayShots: number;
  projectedTotalSot: number; // Shots on Target
  homeSot: number;
  awaySot: number;
  over235ShotsProb: number; // Over 23.5 total shots
  over255ShotsProb: number; // Over 25.5 total shots
  homeOver135ShotsProb: number; // Home shots > 13.5
  awayOver95ShotsProb: number; // Away shots > 9.5
  over85SotProb: number; // Over 8.5 shots on target
  over85SotOdds: number;
  over245Odds: number;
  shotsLeader: string;
  shotsDominanceIndex: number; // percentage share of favored team
}

export interface AssistsAnalysis {
  projectedTotalAssists: number;
  homeExpectedAssists: number; // Expected Assists (xA)
  awayExpectedAssists: number;
  over15AssistsProb: number; // Match Over 1.5 assists
  over25AssistsProb: number; // Match Over 2.5 assists
  homeOver15AssistsProb: number; // Home team Over 1.5 assists
  awayOver05AssistsProb: number; // Away team Over 0.5 assists
  over15Odds: number;
  over25Odds: number;
  assistLeader: string;
  keyPlaymakerRating: number; // 0 - 100 rating
}

export interface MarketsData {
  straightWin: StraightWinAnalysis;
  goals: GoalsOverUnderAnalysis;
  btts: BttsAnalysis;
  corners: CornersAnalysis;
  shots: ShotsAnalysis;
  assists: AssistsAnalysis;
}

export interface LiveMatchData {
  isLive: boolean;
  elapsed: number; // in minutes (e.g. 38, 67)
  period: '1H' | 'HT' | '2H' | 'ET' | 'P';
  score: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  events?: {
    minute: number;
    type: 'GOAL' | 'CARD' | 'CORNER';
    team: 'home' | 'away';
    detail: string;
  }[];
}

export interface Fixture {
  id: number;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  round?: string;
  venue: string;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  homeStats: TeamHandicapStats;
  awayStats: TeamHandicapStats;
  handicap15Analysis: Handicap15Analysis;
  markets: MarketsData;
  live?: LiveMatchData;
  h2h: HeadToHeadMatch[];
  apiPrediction?: ApiSportsPrediction;
}

export interface ApiSportsAccountStatus {
  email?: string;
  plan: string;
  active: boolean;
  requestsUsed: number;
  requestsLimit: number;
  connected: boolean;
  message?: string;
}
