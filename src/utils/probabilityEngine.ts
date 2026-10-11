import {
  TeamHandicapStats,
  Team,
  Handicap15Analysis,
  MarketsData,
  StraightWinAnalysis,
  GoalsOverUnderAnalysis,
  BttsAnalysis,
  CornersAnalysis,
  ShotsAnalysis,
  AssistsAnalysis,
} from '../types/football';

/**
 * Calculates comprehensive probabilities for Straight Win, Over 1.5, Over 2.5, BTTS, and Corners
 */
export function calculateMarketProbabilities(
  homeStats: TeamHandicapStats,
  awayStats: TeamHandicapStats,
  homeTeam: Team,
  awayTeam: Team,
  handicapAnalysis?: Handicap15Analysis
): MarketsData {
  // 1. Straight Win (1X2) Calculation
  const homePower = homeStats.attackStrength * 0.6 + (100 - awayStats.defenseStrength) * 0.4 + 10;
  const awayPower = awayStats.attackStrength * 0.5 + (100 - homeStats.defenseStrength) * 0.35;

  const rawHome = Math.max(12, Math.min(85, homePower * 0.75));
  const rawAway = Math.max(8, Math.min(75, awayPower * 0.65));
  const rawDraw = Math.max(12, 100 - (rawHome + rawAway));

  const totalRaw1X2 = rawHome + rawAway + rawDraw;
  const homeProb = Math.round((rawHome / totalRaw1X2) * 100);
  const awayProb = Math.round((rawAway / totalRaw1X2) * 100);
  const drawProb = 100 - homeProb - awayProb;

  const homeOdds = Number(Math.max(1.12, (100 / Math.max(homeProb, 1)) * 0.95).toFixed(2));
  const drawOdds = Number(Math.max(2.8, (100 / Math.max(drawProb, 1)) * 0.94).toFixed(2));
  const awayOdds = Number(Math.max(1.2, (100 / Math.max(awayProb, 1)) * 0.95).toFixed(2));

  let predictedOutcome: 'HOME' | 'DRAW' | 'AWAY' = 'HOME';
  let favoriteTeam = homeTeam.name;
  let confidence = homeProb;

  if (awayProb > homeProb && awayProb > drawProb) {
    predictedOutcome = 'AWAY';
    favoriteTeam = awayTeam.name;
    confidence = awayProb;
  } else if (drawProb > homeProb && drawProb > awayProb) {
    predictedOutcome = 'DRAW';
    favoriteTeam = 'Draw Match';
    confidence = drawProb;
  }

  const straightWin: StraightWinAnalysis = {
    homeProb,
    drawProb,
    awayProb,
    homeOdds,
    drawOdds,
    awayOdds,
    predictedOutcome,
    favoriteTeam,
    confidence,
  };

  // 2. Goals Over/Under 1.5 and 2.5
  const expectedTotalGoals = Number(
    Math.max(1.5, homeStats.avgGoalsFor * 0.65 + awayStats.avgGoalsFor * 0.5 + (awayStats.avgGoalsAgainst * 0.4 + homeStats.avgGoalsAgainst * 0.35)).toFixed(2)
  );

  // Over 1.5 probability is typically high in modern football (68% - 94%)
  const over15Prob = Math.min(94, Math.max(62, Math.round(50 + expectedTotalGoals * 13)));
  const under15Prob = 100 - over15Prob;
  const over15Odds = Number((100 / over15Prob * 0.96).toFixed(2));

  // Over 2.5 probability
  const over25Prob = Math.min(88, Math.max(38, Math.round(28 + expectedTotalGoals * 17)));
  const under25Prob = 100 - over25Prob;
  const over25Odds = Number((100 / over25Prob * 0.95).toFixed(2));

  const homeOver15Rate = Math.min(95, Math.max(50, Math.round((homeStats.goalsFor / Math.max(1, homeStats.played)) * 25 + 30)));
  const awayOver15Rate = Math.min(90, Math.max(45, Math.round((awayStats.goalsFor / Math.max(1, awayStats.played)) * 22 + 28)));
  const homeOver25Rate = Math.min(85, Math.max(30, Math.round(homeOver15Rate * 0.75)));
  const awayOver25Rate = Math.min(80, Math.max(25, Math.round(awayOver15Rate * 0.72)));

  const goals: GoalsOverUnderAnalysis = {
    over15Prob,
    under15Prob,
    over15Odds,
    over25Prob,
    under25Prob,
    over25Odds,
    expectedTotalGoals,
    homeOver15Rate,
    awayOver15Rate,
    homeOver25Rate,
    awayOver25Rate,
  };

  // 3. Both Teams To Score (BTTS)
  const homeScoredRate = Math.min(95, Math.max(55, Math.round(100 - (homeStats.cleanSheets / Math.max(1, homeStats.played)) * 50)));
  const awayScoredRate = Math.min(90, Math.max(40, Math.round(awayStats.attackStrength * 0.85)));
  const homeConcededRate = Math.min(90, Math.max(30, Math.round(100 - (homeStats.defenseStrength * 0.7))));
  const awayConcededRate = Math.min(95, Math.max(35, Math.round(100 - (awayStats.defenseStrength * 0.65))));

  // BTTS probability
  const bttsYesProb = Math.min(
    82,
    Math.max(32, Math.round(homeScoredRate * 0.45 + awayScoredRate * 0.35 + (homeConcededRate + awayConcededRate) * 0.1))
  );
  const bttsNoProb = 100 - bttsYesProb;
  const bttsYesOdds = Number((100 / bttsYesProb * 0.95).toFixed(2));
  const bttsNoOdds = Number((100 / bttsNoProb * 0.95).toFixed(2));
  const combinedBttsRate = Math.round((bttsYesProb + (100 - homeStats.cleanSheets * 10)) / 2);

  const btts: BttsAnalysis = {
    bttsYesProb,
    bttsNoProb,
    bttsYesOdds,
    bttsNoOdds,
    homeScoredRate,
    awayScoredRate,
    homeConcededRate,
    awayConcededRate,
    combinedBttsRate,
  };

  // 4. Corners Analysis
  // Dominant teams generate 6 - 8.5 corners; underdogs generate 2.5 - 4.5
  const homeCornersAvg = Number(Math.max(4.2, Math.min(8.8, 3.5 + (homeStats.attackStrength / 100) * 4.8)).toFixed(1));
  const awayCornersAvg = Number(Math.max(2.8, Math.min(6.5, 2.2 + (awayStats.attackStrength / 100) * 3.8)).toFixed(1));
  const projectedTotalCorners = Number((homeCornersAvg + awayCornersAvg).toFixed(1));

  // Over 8.5, 9.5, 10.5 corners probabilities
  const over85Prob = Math.min(88, Math.max(45, Math.round(35 + (projectedTotalCorners - 7.5) * 16)));
  const over95Prob = Math.min(82, Math.max(35, Math.round(over85Prob - 14)));
  const over105Prob = Math.min(72, Math.max(25, Math.round(over95Prob - 16)));
  const over95Odds = Number((100 / over95Prob * 0.95).toFixed(2));

  const cornerFavorite = homeCornersAvg >= awayCornersAvg ? homeTeam.name : awayTeam.name;

  const corners: CornersAnalysis = {
    projectedTotalCorners,
    homeCornersAvg,
    awayCornersAvg,
    over85Prob,
    over95Prob,
    over105Prob,
    over95Odds,
    cornerFavorite,
  };

  // 5. Total Shots, Home Shots, Away Shots & Shots on Target (SoT)
  // Modeled dynamically using offensive attack strength, opponent defensive resistance, and xG
  const homeXg = Math.max(0.4, Number((homeStats.avgGoalsFor * 0.65 + ((100 - awayStats.defenseStrength) / 100) * 0.85).toFixed(2)));
  const awayXg = Math.max(0.3, Number((awayStats.avgGoalsFor * 0.55 + ((100 - homeStats.defenseStrength) / 100) * 0.65).toFixed(2)));

  const homeBaseShots = 7.2 + (homeStats.attackStrength / 100) * 9.2 + ((100 - awayStats.defenseStrength) / 100) * 3.8 + homeXg * 1.35;
  const awayBaseShots = 5.6 + (awayStats.attackStrength / 100) * 7.8 + ((100 - homeStats.defenseStrength) / 100) * 3.0 + awayXg * 1.15;

  const homeShots = Number(Math.max(6.5, Math.min(25.0, homeBaseShots)).toFixed(1));
  const awayShots = Number(Math.max(4.5, Math.min(20.0, awayBaseShots)).toFixed(1));
  const projectedTotalShots = Number((homeShots + awayShots).toFixed(1));

  // Shots on Target (SoT): Conversion accuracy directly scales with offensive finishing quality
  const homeSotRatio = 0.31 + (homeStats.attackStrength / 100) * 0.11;
  const awaySotRatio = 0.29 + (awayStats.attackStrength / 100) * 0.09;
  const homeSot = Number(Math.max(2.0, homeShots * homeSotRatio).toFixed(1));
  const awaySot = Number(Math.max(1.5, awayShots * awaySotRatio).toFixed(1));
  const projectedTotalSot = Number((homeSot + awaySot).toFixed(1));

  // Threshold probabilities
  const over235ShotsProb = Math.min(94, Math.max(26, Math.round(50 + (projectedTotalShots - 23.5) * 11)));
  const over255ShotsProb = Math.min(88, Math.max(18, Math.round(50 + (projectedTotalShots - 25.5) * 11)));
  const homeOver135ShotsProb = Math.min(92, Math.max(20, Math.round(50 + (homeShots - 13.5) * 13)));
  const awayOver95ShotsProb = Math.min(88, Math.max(18, Math.round(50 + (awayShots - 9.5) * 14)));
  const over85SotProb = Math.min(93, Math.max(24, Math.round(50 + (projectedTotalSot - 8.5) * 15)));
  const over85SotOdds = Number((100 / Math.max(1, over85SotProb) * 0.95).toFixed(2));
  const over245Odds = Number((100 / Math.max(1, over235ShotsProb) * 0.95).toFixed(2));
  const shotsLeader = homeShots >= awayShots ? homeTeam.name : awayTeam.name;
  const shotsDominanceIndex = Math.round((Math.max(homeShots, awayShots) / projectedTotalShots) * 100);

  const shots: ShotsAnalysis = {
    projectedTotalShots,
    homeShots,
    awayShots,
    projectedTotalSot,
    homeSot,
    awaySot,
    over235ShotsProb,
    over255ShotsProb,
    homeOver135ShotsProb,
    awayOver95ShotsProb,
    over85SotProb,
    over85SotOdds,
    over245Odds,
    shotsLeader,
    shotsDominanceIndex,
  };

  // 6. Team Assists Analysis
  // Modeled dynamically using chance creation, Att/Def differential and match xG
  const homeExpectedAssists = Number(
    Math.max(0.35, homeXg * 0.74 * (0.85 + (homeStats.attackStrength / 100) * 0.32)).toFixed(2)
  );
  const awayExpectedAssists = Number(
    Math.max(0.25, awayXg * 0.70 * (0.85 + (awayStats.attackStrength / 100) * 0.28)).toFixed(2)
  );
  const projectedTotalAssists = Number((homeExpectedAssists + awayExpectedAssists).toFixed(2));

  const over15AssistsProb = Math.min(95, Math.max(28, Math.round(44 + (projectedTotalAssists - 1.5) * 28)));
  const over25AssistsProb = Math.min(86, Math.max(15, Math.round(25 + (projectedTotalAssists - 2.5) * 26)));
  const homeOver15AssistsProb = Math.min(88, Math.max(16, Math.round(35 + (homeExpectedAssists - 1.5) * 32)));
  const awayOver05AssistsProb = Math.min(88, Math.max(20, Math.round(45 + (awayExpectedAssists - 0.5) * 38)));
  const over15AssistsOdds = Number((100 / Math.max(1, over15AssistsProb) * 0.95).toFixed(2));
  const over25AssistsOdds = Number((100 / Math.max(1, over25AssistsProb) * 0.95).toFixed(2));
  const assistLeader = homeExpectedAssists >= awayExpectedAssists ? homeTeam.name : awayTeam.name;
  const keyPlaymakerRating = Math.min(98, Math.round(homeStats.attackStrength * 0.55 + (100 - awayStats.defenseStrength) * 0.45));

  const assists: AssistsAnalysis = {
    projectedTotalAssists,
    homeExpectedAssists,
    awayExpectedAssists,
    over15AssistsProb,
    over25AssistsProb,
    homeOver15AssistsProb,
    awayOver05AssistsProb,
    over15Odds: over15AssistsOdds,
    over25Odds: over25AssistsOdds,
    assistLeader,
    keyPlaymakerRating,
  };

  return {
    straightWin,
    goals,
    btts,
    corners,
    shots,
    assists,
  };
}

/**
 * Adjusts pre-match market probabilities dynamically for LIVE in-play match state
 */
export function adjustProbabilitiesForLive(
  markets: MarketsData,
  handicap15: Handicap15Analysis,
  live: {
    score: { home: number; away: number };
    elapsed: number;
    corners: { home: number; away: number };
  },
  homeTeamName: string,
  awayTeamName: string
): { markets: MarketsData; handicap15: Handicap15Analysis } {
  const { score, elapsed, corners } = live;
  const timeFactor = Math.max(0.04, (90 - elapsed) / 90);
  const totalGoals = score.home + score.away;
  const currentMargin = score.home - score.away; // from home perspective
  const targetIsHome = handicap15.targetTeam === 'home';
  const targetMargin = targetIsHome ? currentMargin : -currentMargin;

  // 1. Live 1X2 Probabilities
  let homeProb = markets.straightWin.homeProb;
  let drawProb = markets.straightWin.drawProb;
  let awayProb = markets.straightWin.awayProb;

  if (currentMargin > 0) {
    // Home leading
    if (currentMargin >= 2) {
      homeProb = Math.min(99, Math.round(86 + (1 - timeFactor) * 13));
      drawProb = Math.max(1, Math.round(9 * timeFactor));
      awayProb = Math.max(0, 100 - homeProb - drawProb);
    } else {
      homeProb = Math.min(95, Math.round(62 + (1 - timeFactor) * 32));
      drawProb = Math.max(3, Math.round(26 * timeFactor));
      awayProb = Math.max(1, 100 - homeProb - drawProb);
    }
  } else if (currentMargin < 0) {
    // Away leading
    if (currentMargin <= -2) {
      awayProb = Math.min(99, Math.round(86 + (1 - timeFactor) * 13));
      drawProb = Math.max(1, Math.round(9 * timeFactor));
      homeProb = Math.max(0, 100 - awayProb - drawProb);
    } else {
      awayProb = Math.min(95, Math.round(62 + (1 - timeFactor) * 32));
      drawProb = Math.max(3, Math.round(26 * timeFactor));
      homeProb = Math.max(1, 100 - awayProb - drawProb);
    }
  } else {
    // Tied match
    drawProb = Math.min(88, Math.round(30 + (1 - timeFactor) * 54));
    const remainder = 100 - drawProb;
    homeProb = Math.round(remainder * 0.55);
    awayProb = 100 - drawProb - homeProb;
  }

  const liveStraightWin: StraightWinAnalysis = {
    homeProb,
    drawProb,
    awayProb,
    homeOdds: Number((100 / Math.max(1, homeProb) * 0.96).toFixed(2)),
    drawOdds: Number((100 / Math.max(1, drawProb) * 0.95).toFixed(2)),
    awayOdds: Number((100 / Math.max(1, awayProb) * 0.96).toFixed(2)),
    predictedOutcome:
      homeProb >= awayProb && homeProb >= drawProb
        ? 'HOME'
        : awayProb >= homeProb && awayProb >= drawProb
        ? 'AWAY'
        : 'DRAW',
    favoriteTeam: homeProb >= awayProb ? homeTeamName : awayTeamName,
    confidence: Math.max(homeProb, awayProb, drawProb),
  };

  // 2. Live Goals Over 1.5 & Over 2.5
  let over15Prob = markets.goals.over15Prob;
  let over25Prob = markets.goals.over25Prob;

  if (totalGoals >= 2) {
    over15Prob = 100; // already hit!
  } else if (totalGoals === 1) {
    over15Prob = Math.min(96, Math.max(25, Math.round(75 * timeFactor + 20)));
  } else {
    over15Prob = Math.min(85, Math.max(10, Math.round(65 * timeFactor * timeFactor + 10)));
  }

  if (totalGoals >= 3) {
    over25Prob = 100; // already hit!
  } else if (totalGoals === 2) {
    over25Prob = Math.min(95, Math.max(20, Math.round(70 * timeFactor + 18)));
  } else if (totalGoals === 1) {
    over25Prob = Math.min(75, Math.max(8, Math.round(50 * timeFactor * timeFactor + 8)));
  } else {
    over25Prob = Math.min(55, Math.max(3, Math.round(40 * Math.pow(timeFactor, 2.5))));
  }

  const liveGoals: GoalsOverUnderAnalysis = {
    ...markets.goals,
    over15Prob,
    under15Prob: 100 - over15Prob,
    over15Odds: over15Prob === 100 ? 1.01 : Number((100 / Math.max(1, over15Prob) * 0.95).toFixed(2)),
    over25Prob,
    under25Prob: 100 - over25Prob,
    over25Odds: over25Prob === 100 ? 1.01 : Number((100 / Math.max(1, over25Prob) * 0.95).toFixed(2)),
  };

  // 3. Live BTTS
  let bttsYesProb = markets.btts.bttsYesProb;
  if (score.home > 0 && score.away > 0) {
    bttsYesProb = 100; // Both already scored!
  } else if (score.home > 0 || score.away > 0) {
    bttsYesProb = Math.min(85, Math.max(8, Math.round(55 * timeFactor + 10)));
  } else {
    bttsYesProb = Math.min(65, Math.max(4, Math.round(45 * Math.pow(timeFactor, 1.8))));
  }

  const liveBtts: BttsAnalysis = {
    ...markets.btts,
    bttsYesProb,
    bttsNoProb: 100 - bttsYesProb,
    bttsYesOdds: bttsYesProb === 100 ? 1.01 : Number((100 / Math.max(1, bttsYesProb) * 0.95).toFixed(2)),
    bttsNoOdds: bttsYesProb === 100 ? 50.0 : Number((100 / Math.max(1, 100 - bttsYesProb) * 0.95).toFixed(2)),
  };

  // 4. Live Corners
  const totalCornersTaken = corners.home + corners.away;
  const projectedTotalCorners = Number((totalCornersTaken + timeFactor * 5.2).toFixed(1));
  let over95Prob = markets.corners.over95Prob;

  if (totalCornersTaken >= 10) {
    over95Prob = 100;
  } else {
    const needed = 10 - totalCornersTaken;
    const expectedRemaining = timeFactor * 5.2;
    over95Prob = Math.min(98, Math.max(5, Math.round((expectedRemaining / Math.max(0.1, needed)) * 55)));
  }

  const liveCorners: CornersAnalysis = {
    ...markets.corners,
    projectedTotalCorners,
    over95Prob,
    over95Odds: over95Prob === 100 ? 1.01 : Number((100 / Math.max(1, over95Prob) * 0.95).toFixed(2)),
  };

  // 5. Live Handicap -1.5
  let liveHandicapProb = handicap15.probability;
  if (targetMargin >= 2) {
    liveHandicapProb = Math.min(98, Math.round(75 + (1 - timeFactor) * 23));
  } else if (targetMargin === 1) {
    liveHandicapProb = Math.min(75, Math.max(15, Math.round(45 * timeFactor + 25)));
  } else {
    liveHandicapProb = Math.min(42, Math.max(2, Math.round(25 * Math.pow(timeFactor, 2))));
  }

  const liveHandicap15: Handicap15Analysis = {
    ...handicap15,
    probability: liveHandicapProb,
    expectedMargin: Number((targetMargin + timeFactor * 0.4).toFixed(2)),
    estimatedOdds: Number((100 / Math.max(1, liveHandicapProb) * 0.96).toFixed(2)),
  };

  // 6. Live Shots & SoT
  const shotsElapsedRatio = Math.min(1, elapsed / 90);
  const currentEstShots = Math.round(markets.shots.projectedTotalShots * shotsElapsedRatio * 0.98);
  const remainingShots = timeFactor * markets.shots.projectedTotalShots * 0.98;
  const liveProjectedTotalShots = Number((currentEstShots + remainingShots).toFixed(1));
  const liveOver235ShotsProb = liveProjectedTotalShots >= 24 ? 100 : Math.min(96, Math.max(5, Math.round(50 + (liveProjectedTotalShots - 23.5) * 14)));

  const liveShots: ShotsAnalysis = {
    ...markets.shots,
    projectedTotalShots: liveProjectedTotalShots,
    over235ShotsProb: liveOver235ShotsProb,
    over245Odds: liveOver235ShotsProb === 100 ? 1.01 : Number((100 / Math.max(1, liveOver235ShotsProb) * 0.95).toFixed(2)),
  };

  // 7. Live Team Assists
  const estimatedAssistsDone = Math.round(totalGoals * 0.72);
  const remainingAssists = timeFactor * markets.assists.projectedTotalAssists * 0.85;
  const liveProjectedAssists = Number((estimatedAssistsDone + remainingAssists).toFixed(2));
  let liveOver15AssistsProb = markets.assists.over15AssistsProb;
  if (estimatedAssistsDone >= 2) {
    liveOver15AssistsProb = 100;
  } else {
    liveOver15AssistsProb = Math.min(96, Math.max(8, Math.round(40 + (liveProjectedAssists - 1.5) * 32)));
  }

  const liveAssists: AssistsAnalysis = {
    ...markets.assists,
    projectedTotalAssists: liveProjectedAssists,
    over15AssistsProb: liveOver15AssistsProb,
    over15Odds: liveOver15AssistsProb === 100 ? 1.01 : Number((100 / Math.max(1, liveOver15AssistsProb) * 0.95).toFixed(2)),
  };

  return {
    markets: {
      straightWin: liveStraightWin,
      goals: liveGoals,
      btts: liveBtts,
      corners: liveCorners,
      shots: liveShots,
      assists: liveAssists,
    },
    handicap15: liveHandicap15,
  };
}
