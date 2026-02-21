/**
 * PUSSY888 Game Reference Data
 * Source: Google Sheets - https://docs.google.com/spreadsheets/d/13kiyqi8YZGQCyH6cLYcU6ZpUy2njqum02fSrIBGt8D8/edit?gid=102705531
 * 
 * Column B: Game Name
 * Column C: Lines
 * Column D onwards: Bet Amount → Spin Count mapping
 */

export interface GameSpinMapping {
  [betAmount: number]: number; // bet amount -> spin count
}

export interface GameReference {
  name: string;
  lines: string;
  spinMapping: GameSpinMapping;
}

/**
 * PUSSY888 Game Reference Data
 * Extracted from the spreadsheet with bet amount to spin count mapping
 */
export const pussy888Games: Record<string, GameReference> = {
  "Magical Spin": { name: "Magical Spin", lines: "25 lines", spinMapping: {} },
  "Top Gun": { name: "Top Gun", lines: "25 lines", spinMapping: {} },
  "Iceland": { name: "Iceland", lines: "50 lines", spinMapping: {} },
  "Green Light": { name: "Green Light", lines: "50 lines", spinMapping: {} },
  "Land of Gold": { name: "Land of Gold", lines: "40 lines", spinMapping: {} },
  "Halloween Fortune": { name: "Halloween Fortune", lines: "50 lines", spinMapping: {} },
  "Yun cong Long": { name: "Yun cong Long", lines: "40 lines", spinMapping: {} },
  "Desert": { name: "Desert", lines: "20 lines", spinMapping: {} },
  "Safari Heat": { name: "Safari Heat", lines: "15 lines", spinMapping: {} },
  "Penguin vacation": { name: "Penguin vacation", lines: "30 lines", spinMapping: {} },
  "Cherry Love": { name: "Cherry Love", lines: "30 lines", spinMapping: {} },
  "Gaelic Luck": { name: "Gaelic Luck", lines: "20 lines", spinMapping: {} },
  "Football": { name: "Football", lines: "25 lines", spinMapping: {} },
  "Yu Huang Da Di": { name: "Yu Huang Da Di", lines: "20 lines", spinMapping: {} },
  "ZhaoCalinBao": { name: "ZhaoCalinBao", lines: "5 lines", spinMapping: {} },
  "Captain Treasure Pro": { name: "Captain Treasure Pro", lines: "20 lines", spinMapping: {} },
  "5 Dragons": { name: "5 Dragons", lines: "25 lines", spinMapping: {} },
  "Lucky Panda": { name: "Lucky Panda", lines: "72 lines", spinMapping: {} },
  "Triple Twister": { name: "Triple Twister", lines: "50 lines", spinMapping: {} },
  "8 treasure 1 Queen": { name: "8 treasure 1 Queen", lines: "50 lines", spinMapping: {} },
  "Epic Ape": { name: "Epic Ape", lines: "40 lines", spinMapping: {} },
  "Tiger Claw": { name: "Tiger Claw", lines: "40 lines", spinMapping: {} },
  "Warriors Gold": { name: "Warriors Gold", lines: "25 lines", spinMapping: {} },
  "Lie yan Zuan Shi": { name: "Lie yan Zuan Shi", lines: "50 lines", spinMapping: {} },
  "Age of the Gold King of Olympus": { name: "Age of the Gold King of Olympus", lines: "50 lines", spinMapping: {} },
  "Yuan Pu Lian Huan": { name: "Yuan Pu Lian Huan", lines: "25 lines", spinMapping: {} },
  "Ghosts of christmas": { name: "Ghosts of christmas", lines: "20 lines", spinMapping: {} },
  "Marilyn Monroe": { name: "Marilyn Monroe", lines: "20 lines", spinMapping: {} },
  "Beach Life": { name: "Beach Life", lines: "20 lines", spinMapping: {} },
  "Sultans gold": { name: "Sultans gold", lines: "20 lines", spinMapping: {} },
  "Hologram Wilds": { name: "Hologram Wilds", lines: "40 lines", spinMapping: {} },
  "Fortune of the Fox": { name: "Fortune of the Fox", lines: "25 lines", spinMapping: {} },
  "Age of Egypt": { name: "Age of Egypt", lines: "20 lines", spinMapping: {} },
  "Berry Berry Bonanza": { name: "Berry Berry Bonanza", lines: "9 lines", spinMapping: {} },
  "The riches of Don Quixote": { name: "The riches of Don Quixote", lines: "50 lines", spinMapping: {} },
  "Crystal Waters": { name: "Crystal Waters", lines: "20 lines", spinMapping: {} },
  "Zhao Cai Tong Zi": { name: "Zhao Cai Tong Zi", lines: "9 lines", spinMapping: {} },
  "Sea captain": { name: "Sea captain", lines: "25 lines", spinMapping: {} },
  "Lotto madness": { name: "Lotto madness", lines: "20 lines", spinMapping: {} },
  "Rome and Glory": { name: "Rome and Glory", lines: "20 lines", spinMapping: {} },
  "Stone Age": { name: "Stone Age", lines: "25 lines", spinMapping: {} },
  "Farmers Market": { name: "Farmers Market", lines: "9 lines", spinMapping: {} },
  "Orient Express": { name: "Orient Express", lines: "20 lines", spinMapping: {} },
  "A night Out": { name: "A night Out", lines: "20 lines", spinMapping: {} },
  "Paydirt": { name: "Paydirt", lines: "25 lines", spinMapping: {} },
  "Fei Long Zai Tian": { name: "Fei Long Zai Tian", lines: "25 lines", spinMapping: {} },
  "Golden Tree": { name: "Golden Tree", lines: "25 lines", spinMapping: {} },
  "Shinning Star": { name: "Shinning Star", lines: "25 lines", spinMapping: {} },
  "Si Xiang": { name: "Si Xiang", lines: "9 lines", spinMapping: {} },
  "Ranch Story": { name: "Ranch Story", lines: "25 lines", spinMapping: {} },
  "Western Ranch Story": { name: "Western Ranch Story", lines: "25 lines", spinMapping: {} },
  "Cookie Pop": { name: "Cookie Pop", lines: "30 lines", spinMapping: {} },
  "Circus": { name: "Circus", lines: "20 lines", spinMapping: {} },
  "Treasure Island": { name: "Treasure Island", lines: "25 lines", spinMapping: {} },
  "Pirate ship": { name: "Pirate ship", lines: "30 lines", spinMapping: {} },
  "Fairy Garden": { name: "Fairy Garden", lines: "20 lines", spinMapping: {} },
  "Fire Discover": { name: "Fire Discover", lines: "25 lines", spinMapping: {} },
  "Coyote Cash": { name: "Coyote Cash", lines: "25 lines", spinMapping: {} },
  "T- Rex": { name: "T- Rex", lines: "25 lines", spinMapping: {} },
  "Big Shot 2": { name: "Big Shot 2", lines: "20 lines", spinMapping: {} },
  "Banana Monkey": { name: "Banana Monkey", lines: "25 lines", spinMapping: {} },
  "Football Carnival": { name: "Football Carnival", lines: "50 lines", spinMapping: {} },
  "Fortune 2": { name: "Fortune 2", lines: "40 lines", spinMapping: {} },
  "Sun Wukong": { name: "Sun Wukong", lines: "15 lines", spinMapping: {} },
  "Wealth treasure": { name: "Wealth treasure", lines: "20 lines", spinMapping: {} },
  "The great King Empire": { name: "The great King Empire", lines: "25 lines", spinMapping: {} },
  "Nian Nian You Yu": { name: "Nian Nian You Yu", lines: "9 lines", spinMapping: {} },
  "Wild Spirit": { name: "Wild Spirit", lines: "9 lines", spinMapping: {} },
  "Football Fans": { name: "Football Fans", lines: "25 lines", spinMapping: {} },
  "Funny Fruit Farm": { name: "Funny Fruit Farm", lines: "25 lines", spinMapping: {} },
  "Money Fever": { name: "Money Fever", lines: "25 lines", spinMapping: {} },
  "Fairy garden": { name: "Fairy garden", lines: "25 lines", spinMapping: {} },
  "Yi": { name: "Yi", lines: "20 lines", spinMapping: {} },
  "True love": { name: "True love", lines: "15 lines", spinMapping: {} },
  "Santa Surprise": { name: "Santa Surprise", lines: "20 lines", spinMapping: {} },
  "Aztees Treasure": { name: "Aztees Treasure", lines: "20 lines", spinMapping: {} },
  "the pyramid of Ramesses": { name: "the pyramid of Ramesses", lines: "20 lines", spinMapping: {} },
  "Diamond valley": { name: "Diamond valley", lines: "20 lines", spinMapping: {} },
  "Riches of Cleopatra": { name: "Riches of Cleopatra", lines: "20 lines", spinMapping: {} },
  "Rally": { name: "Rally", lines: "20 lines", spinMapping: {} },
  "Sherlock Mystery": { name: "Sherlock Mystery", lines: "20 lines", spinMapping: {} },
  "spud Reillys crop of gold": { name: "spud Reillys crop of gold", lines: "20 lines", spinMapping: {} },
  "Thai Temple": { name: "Thai Temple", lines: "15 lines", spinMapping: {} },
  "Pharaoh's Secrets": { name: "Pharaoh's Secrets", lines: "20 lines", spinMapping: {} },
  "豔姿公主": { name: "豔姿公主", lines: "20 lines", spinMapping: {} },
  "Geishas Garden": { name: "Geishas Garden", lines: "20 lines", spinMapping: {} },
  "Silver bullet": { name: "Silver bullet", lines: "9 lines", spinMapping: {} },
  "Dolphin": { name: "Dolphin", lines: "9 lines", spinMapping: {} },
  "Three Kingdom": { name: "Three Kingdom", lines: "9 lines", spinMapping: {} },
  "Season Greeting": { name: "Season Greeting", lines: "9 lines", spinMapping: {} },
  "Xin Pan Jin Lian": { name: "Xin Pan Jin Lian", lines: "9 lines", spinMapping: {} },
  "Fong Shen": { name: "Fong Shen", lines: "9 lines", spinMapping: {} },
  "royal": { name: "royal", lines: "9 lines", spinMapping: {} },
  "Silent Samurai": { name: "Silent Samurai", lines: "9 lines", spinMapping: {} },
  "Great stars": { name: "Great stars", lines: "9 lines", spinMapping: {} },
  "Spartan": { name: "Spartan", lines: "9 lines", spinMapping: {} },
  "Kimochi": { name: "Kimochi", lines: "9 lines", spinMapping: {} },
  "Amazon Jungle": { name: "Amazon Jungle", lines: "9 lines", spinMapping: {} },
  "Victory": { name: "Victory", lines: "20 lines", spinMapping: {} },
  "Tally Ho": { name: "Tally Ho", lines: "20 lines", spinMapping: {} },
  "Robin Hood": { name: "Robin Hood", lines: "15 lines", spinMapping: {} },
  "Dragon Gold": { name: "Dragon Gold", lines: "20 lines", spinMapping: {} },
  "Fortune 3": { name: "Fortune 3", lines: "20 lines", spinMapping: {} },
  "Big Shot 3": { name: "Big Shot 3", lines: "20 lines", spinMapping: {} },
  "Alice": { name: "Alice", lines: "15 lines", spinMapping: {} },
  "Thai Paradise": { name: "Thai Paradise", lines: "15 lines", spinMapping: {} },
  "Laura": { name: "Laura", lines: "15 lines", spinMapping: {} },
  "Pirate": { name: "Pirate", lines: "20 lines", spinMapping: {} },
  "Irish Luck": { name: "Irish Luck", lines: "30 lines", spinMapping: {} },
  "Fortune Panda": { name: "Fortune Panda", lines: "50 lines", spinMapping: {} },
  "Golden Lotus": { name: "Golden Lotus", lines: "25 lines", spinMapping: {} },
  "Big Prosperity": { name: "Big Prosperity", lines: "25 lines", spinMapping: {} },
  "Wong Choy": { name: "Wong Choy", lines: "25 lines", spinMapping: {} },
  "Striper Night": { name: "Striper Night", lines: "50 lines", spinMapping: {} },
  "Emperor Gate": { name: "Emperor Gate", lines: "50 lines", spinMapping: {} },
  "Japan Fortune": { name: "Japan Fortune", lines: "50 lines", spinMapping: {} },
  "Great China": { name: "Great China", lines: "50 lines", spinMapping: {} },
  "Age of the Gold": { name: "Age of the Gold", lines: "50 lines", spinMapping: {} },
  "Amazing Thailand": { name: "Amazing Thailand", lines: "50 lines", spinMapping: {} },
  "Indian Myth": { name: "Indian Myth", lines: "50 lines", spinMapping: {} },
  "Golden Slot": { name: "Golden Slot", lines: "50 lines", spinMapping: {} },
  "African Wildlife": { name: "African Wildlife", lines: "50 lines", spinMapping: {} },
  "Dragons": { name: "Dragons", lines: "25 lines", spinMapping: {} },
  "Boy Kings Treasure": { name: "Boy Kings Treasure", lines: "20 lines", spinMapping: {} },
  "WildFox": { name: "WildFox", lines: "50 lines", spinMapping: {} },
  "Golden Slut": { name: "Golden Slut", lines: "25 lines", spinMapping: {} },
  "Nian Nian You yu": { name: "Nian Nian You yu", lines: "40 lines", spinMapping: {} },
  "大财神": { name: "大财神", lines: "15 lines", spinMapping: {} },
};

/**
 * Game name aliases for case-insensitive and typo-tolerant matching
 */
const gameAliases: Record<string, string> = {
  "iceland": "Iceland",
  "dragon": "Dragons",
  "dragons": "Dragons",
  "boyking": "Boy Kings Treasure",
  "boy king": "Boy Kings Treasure",
  "boykinng": "Boy Kings Treasure",
  "booking": "Boy Kings Treasure",
  "girls": "Striper Night",
  "goldenslut": "Golden Slut",
  "wildfox": "WildFox",
  "niannianyouyu": "Nian Nian You yu",
  "panda": "Great China",
  "luckypanda": "Lucky Panda"
};

function normalizeGameName(name: string): string {
  return name.toLowerCase().trim();
}

export function getGameReference(gameName: string): GameReference | null {
  if (!gameName) return null;
  
  // Try exact match first
  if (pussy888Games[gameName]) {
    return pussy888Games[gameName];
  }
  
  const normalized = normalizeGameName(gameName);
  
  // Try alias match
  if (gameAliases[normalized]) {
    const aliasedName = gameAliases[normalized];
    if (pussy888Games[aliasedName]) {
      return pussy888Games[aliasedName];
    }
  }
  
  // Try case-insensitive match
  for (const [key, value] of Object.entries(pussy888Games)) {
    if (normalizeGameName(key) === normalized) {
      return value;
    }
  }
  
  return null;
}

export function getSpinCount(gameName: string, betAmount: number): number | null {
  const gameRef = getGameReference(gameName);
  if (!gameRef) return null;
  return gameRef.spinMapping[betAmount] || null;
}
