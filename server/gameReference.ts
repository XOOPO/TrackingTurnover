/**
 * Game reference data for detecting lines from game names
 * Source: https://docs.google.com/spreadsheets/d/13kiyqi8YZGQCyH6cLYcU6ZpUy2njqum02fSrIBGt8D8/
 */

export const GAME_LINES_MAP: Record<string, number> = {
  // 9 Lines Games
  'Beat the Beast': 9,
  'Midas Golden Touch': 9,
  'Highway King': 9,
  'Captain treasure': 9,
  '金猴王': 9,
  '财神到': 9,
  'Highway Kings Pro': 9,
  'ZhaoCaiJinBao': 9,

  // 5 Lines Games
  'Golden Tour': 5,

  // 15 Lines Games
  '大财神': 15,
  'Neptune Treasure': 15,
  'Panther Moon': 15,
  'Safari Heat': 15,

  // 20 Lines Games
  '凤凰转世': 20,
  'Fortune Lions': 20,
  'Arctic Treasure': 20,
  'Dolphin Reef': 20,
  'Easter surprise': 20,
  'Desert': 20,
  'Gaelic Luck': 20,
  'Yu Huang Da Di': 20,
  'Captain Teasure Pro': 20,
  'Ghosts of christmas': 20,
  'Beach Life': 20,
  'Age of Egypt': 20,

  // 25 Lines Games
  'Great Blue': 25,
  'Archer': 25,
  'Bonus Bears': 25,
  'Dragons': 25,
  'Seaworld': 25,
  'Magical Spin': 25,
  'Top Gun': 25,
  'Football': 25,
  '5 Dragons': 25,
  'Warriors Gold': 25,
  'Yuan Pu Lian Huan': 25,
  'Fortune of the Fox': 25,

  // 30 Lines Games
  'Halloween Party': 30,
  'Penguin vacation': 30,
  'Cherry Love': 30,

  // 40 Lines Games
  'Tiger Glory': 40,
  'Roaring Wilds': 40,
  'Cat Queen': 40,
  'White King': 40,
  'Buffalo Bltz': 40,
  'Jin Qian Wa': 40,
  'Land of Gold': 40,
  'Yun cong Long': 40,
  'Epic Ape': 40,
  'Tiger Claw': 40,
  'Hologram Wilds': 40,

  // 50 Lines Games
  'Primal Megaways': 50,
  'Great Rhino': 50,
  'Iceland': 50,
  'Green Light': 50,
  'Halloween Fortune': 50,
  'Triple Twister': 50,
  '8 treasure 1 Queen': 50,
  'Lie yan Zuan Shi': 50,
  'Age of the Gold King of Olympus': 50,

  // 72 Lines Games
  'Lucky Panda': 72,
};

/**
 * Detect lines from bet amount
 * 9 lines = 0.09, 5 lines = 0.05, 15 lines = 0.15, etc.
 */
export function detectLinesFromBet(bet: number): number {
  if (bet < 0.06) return 5;
  if (bet < 0.12) return 9;
  if (bet < 0.18) return 15;
  if (bet < 0.22) return 20;
  if (bet < 0.27) return 25;
  if (bet < 0.35) return 30;
  if (bet < 0.45) return 40;
  if (bet < 0.75) return 50;
  return 72; // Lucky Panda or higher
}

/**
 * Get lines for a game by name or bet amount
 */
export function getGameLines(gameName: string, bet: number): number {
  // Try to find exact match in game map
  const exactMatch = GAME_LINES_MAP[gameName];
  if (exactMatch) return exactMatch;

  // Try case-insensitive match
  const lowerName = gameName.toLowerCase();
  for (const [name, lines] of Object.entries(GAME_LINES_MAP)) {
    if (name.toLowerCase() === lowerName) {
      return lines;
    }
  }

  // Fallback to bet-based detection
  return detectLinesFromBet(bet);
}

/**
 * Check if a game has 9 lines (illegal in some jurisdictions)
 */
export function isNineLineGame(gameName: string, bet: number): boolean {
  const lines = getGameLines(gameName, bet);
  return lines === 9;
}
