import { Browser, Page } from 'puppeteer-core';
import { storagePut } from './storage';
import { getCredentialByProviderAndBrand } from './googleSheets';
import { getGameLines, isNineLineGame } from './gameReference';
import { getGameReference, getSpinCount } from './pussy888GameReference';
import puppeteer from 'puppeteer-core';


interface TurnoverResult {
  playerId: string;
  provider: string;
  brand: string;
  games: Array<{
    gameName: string;
    lines?: string;
    betting?: number;
    spin?: number;
    totalBetting: number;
    betCount?: number;
  }>;
  totalTurnover: number;
  hasNineLines?: boolean;
  scrapedAt: Date;
}

/**
 * Base scraper class with common functionality
 */
abstract class BaseScraper {
  protected page: Page | null = null;

  setPage(page: Page) {
    this.page = page;
  }

  abstract login(loginUrl: string, username: string, password: string): Promise<void>;
  abstract searchPlayer(playerId: string, fromDate: string | undefined, toDate: string | undefined, fromTime: string | undefined, toTime: string | undefined, onProgress?: (progress: number) => void): Promise<TurnoverResult>;
  abstract checkIfLoggedIn(): Promise<boolean>;
}

/**
 * MEGA888 Scraper - Based on actual website structure
 */
class Mega888Scraper extends BaseScraper {
  async login(loginUrl: string, username: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`[MEGA888] Navigating to login URL: ${loginUrl}`);
    await this.page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for login form
    try {
      await this.page.waitForSelector('input[type="text"], input[placeholder*="user"]', { timeout: 30000 });
      
      // Fill username
      await this.page.type('input[type="text"], input[placeholder*="user"]', username);
      
      // Fill password
      await this.page.type('input[type="password"]', password);
      
      // Submit form using Enter key (more reliable than button click)
      await this.page.keyboard.press('Enter');
      
      // Wait for navigation to complete
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      console.log(`[MEGA888] Login successful`);
    } catch (error) {
      throw new Error(`Login failed for MEGA888: ${error}`);
    }
  }

  async searchPlayer(playerId: string, fromDate: string | undefined = undefined, toDate: string | undefined = undefined, fromTime: string | undefined = undefined, toTime: string | undefined = undefined, onProgress?: (progress: number) => void): Promise<TurnoverResult> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      console.log(`[MEGA888] Searching for player: ${playerId}`);

      // Click "search user" menu item
      console.log(`[MEGA888] Clicking search user menu item...`);
      await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const searchLink = links.find(link => {
          const text = link.textContent?.toLowerCase() || '';
          return text.includes('search user') || text.includes('search');
        });
        if (searchLink) {
          (searchLink as HTMLElement).click();
        }
      });

      // Wait for form to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.page.waitForNetworkIdle({ timeout: 15000 }).catch(() => {});

      // Fill player ID
      console.log(`[MEGA888] Filling player ID: ${playerId}`);
      await this.page.waitForSelector('input[type="text"]', { timeout: 60000 });
      
      // Clear and fill the input
      await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="text"]');
        if (inputs.length > 0) {
          (inputs[inputs.length - 1] as HTMLInputElement).value = '';
          (inputs[inputs.length - 1] as HTMLInputElement).focus();
        }
      });
      
      await this.page.type('input[type="text"]', playerId);

      // Fill dates if provided
      if (fromDate) {
        const dateInputs = await this.page.$$('input[type="date"]');
        if (dateInputs.length > 0) {
          await dateInputs[0].click({ clickCount: 3 });
          await dateInputs[0].type(fromDate);
        }
      }

      // Fill times if provided
      if (fromTime) {
        const timeInputs = await this.page.$$('input[type="time"]');
        if (timeInputs.length > 0) {
          await timeInputs[0].click({ clickCount: 3 });
          await timeInputs[0].type(fromTime);
        }
      }

      if (toTime) {
        const timeInputs = await this.page.$$('input[type="time"]');
        if (timeInputs.length > 1) {
          await timeInputs[1].click({ clickCount: 3 });
          await timeInputs[1].type(toTime);
        }
      }

      // Click OK button
      console.log(`[MEGA888] Clicking OK button...`);
      let okClicked = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          okClicked = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const okBtn = buttons.find(btn => btn.textContent?.trim().toLowerCase() === 'ok');
            if (okBtn) {
              (okBtn as HTMLElement).click();
              return true;
            }
            return false;
          });
          if (okClicked) break;
        } catch (e) {
          console.log(`[MEGA888] OK button click attempt ${attempt + 1} failed`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Wait for table to load
      console.log(`[MEGA888] Waiting for table to load...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});

      // Wait for table with retry logic
      let tableFound = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const hasTable = await this.page.evaluate(() => {
          const tables = document.querySelectorAll('table');
          return tables.length > 0;
        });
        if (hasTable) {
          tableFound = true;
          break;
        }
        console.log(`[MEGA888] Table not found, attempt ${attempt + 1}/5`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      if (!tableFound) {
        throw new Error('Table not found after search');
      }

      // Extract game data from table
      const games = await this.page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tr'));
        const gameData: { gameName: string; totalBetting: number; betCount: number }[] = [];

        // Skip header row (index 0)
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll('td');

          if (cells.length >= 3) {
            const gameName = cells[0]?.textContent?.trim() || ''; // Column 1 = GameName
            const betText = cells[2]?.textContent?.trim() || ''; // Column 3 = Bet
            const bet = parseFloat(betText.replace(/[^0-9.]/g, ''));

            if (gameName && !isNaN(bet) && bet > 0) {
              const existingGame = gameData.find(g => g.gameName === gameName);
              if (existingGame) {
                existingGame.totalBetting += bet;
                existingGame.betCount += 1;
              } else {
                gameData.push({
                  gameName,
                  totalBetting: bet,
                  betCount: 1,
                });
              }
            }
          }
        }

        return gameData;
      });

      const totalTurnover = games.reduce((sum, game) => sum + game.totalBetting, 0);

      console.log(`[MEGA888] Found ${games.length} games, total turnover: ${totalTurnover}`);

      return {
        playerId,
        provider: 'MEGA888',
        brand: '',
        games,
        totalTurnover,
        scrapedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Player search failed for MEGA888: ${error}`);
    }
  }

  async checkIfLoggedIn(): Promise<boolean> {
    if (!this.page) return false;

    try {
      const isLoggedIn = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        const hasLogout = links.some(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('logout') || text.includes('sign out');
        });
        const hasSearch = links.some(el => {
          const text = el.textContent?.toLowerCase() || '';
          const href = (el as HTMLAnchorElement).href || '';
          return text.includes('search user') || href.includes('search');
        });
        return hasLogout || hasSearch;
      });

      console.log(`[MEGA888] Logged in status: ${isLoggedIn}`);
      return isLoggedIn;
    } catch (error) {
      console.log(`[MEGA888] Error checking login status: ${error}`);
      return false;
    }
  }
}

/**
 * PUSSY888 Scraper - Fixed to target main content form
 * Table columns: GameName | TableID | Bet | Win | BeginMoney | EndMoney | DateTime
 */
class Pussy888Scraper extends BaseScraper {
  async login(loginUrl: string, username: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Retry logic for slow brands like OK188SG
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[PUSSY888] Login attempt ${attempt}/${maxRetries}`);
        console.log(`[PUSSY888] Navigating to login URL: ${loginUrl}`);
        
        // Increase timeout to 60s for slow brands
        await this.page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Generic login form filling
        await this.page.waitForSelector('input[type="text"], input[placeholder*="user"]', { timeout: 60000 });
        await this.page.type('input[type="text"], input[placeholder*="user"]', username);
        await this.page.type('input[type="password"]', password);

        // Click login button
        const loginButton = await this.page.$('button[type="submit"], input[type="submit"]');
        if (loginButton) {
          await loginButton.click();
        } else {
          await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, input[type="button"]'));
            const loginBtn = buttons.find(btn => {
              const text = btn.textContent?.toLowerCase() || (btn as HTMLInputElement).value?.toLowerCase() || '';
              return text.includes('login') || text.includes('submit') || text.includes('sign in');
            });
            if (loginBtn) (loginBtn as HTMLElement).click();
          });
        }

        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
        console.log(`[PUSSY888] Login successful on attempt ${attempt}`);
        return; // Success - exit retry loop
      } catch (error) {
        lastError = error as Error;
        console.log(`[PUSSY888] Login attempt ${attempt} failed: ${error}`);
        
        if (attempt < maxRetries) {
          // Wait before retrying
          console.log(`[PUSSY888] Waiting 3 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    // All retries failed
    throw new Error(`Login failed for PUSSY888 after ${maxRetries} attempts: ${lastError?.message}`);
  }

  async searchPlayer(playerId: string, fromDate: string | undefined = undefined, toDate: string | undefined = undefined, fromTime: string | undefined = undefined, toTime: string | undefined = undefined, onProgress?: (progress: number) => void): Promise<TurnoverResult> {
    if (!this.page) throw new Error('Page not initialized');

    try {
      console.log(`[PUSSY888] Searching for player: ${playerId}`);

      // Click "search user" menu item to load search form
      console.log(`[PUSSY888] Clicking search user menu item...`);
      await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const searchUserLink = links.find(link => {
          const text = link.textContent?.toLowerCase() || '';
          return text.includes('search user') || text.includes('search');
        });
        if (searchUserLink) {
          (searchUserLink as HTMLElement).click();
          console.log('Search user menu clicked');
        }
      });

      // Wait for search form to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});

      // FIXED: Find and fill the main content search input (not sidebar) with longer timeout
      console.log(`[PUSSY888] Finding main content input field...`);
      
      // Identify main content input by checking for visible, enabled inputs (with longer timeout)
      const mainInputSelector = await this.page.evaluate(() => {
        // Get all text inputs (retry if not found)
        const allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
        
        // Filter to find inputs that are visible and in main content area
        const visibleInputs = allInputs.filter(input => {
          const rect = (input as HTMLElement).getBoundingClientRect();
          const style = window.getComputedStyle(input as HTMLElement);
          const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
          const isEnabled = !(input as HTMLInputElement).disabled;
          return isVisible && isEnabled;
        });

        console.log(`Found ${visibleInputs.length} visible input fields`);

        // Return index of the last visible input (most likely to be main form, not sidebar)
        if (visibleInputs.length > 0) {
          return allInputs.indexOf(visibleInputs[visibleInputs.length - 1]);
        }
        return 0;
      });

      console.log(`[PUSSY888] Using input field at index: ${mainInputSelector}`);

      // Focus and clear the target input
      await this.page.evaluate((index) => {
        const inputs = document.querySelectorAll('input[type="text"]');
        if (inputs[index]) {
          const input = inputs[index] as HTMLInputElement;
          input.focus();
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, mainInputSelector);

      // Type player ID into the main content input
      await this.page.evaluate((index, playerId) => {
        const inputs = document.querySelectorAll('input[type="text"]');
        if (inputs[index]) {
          const input = inputs[index] as HTMLInputElement;
          input.value = playerId;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, mainInputSelector, playerId);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Fill date if provided
      if (fromDate) {
        const dateInputs = await this.page.$$('input[type="date"]');
        if (dateInputs.length > 0) {
          await dateInputs[0].click({ clickCount: 3 });
          await dateInputs[0].type(fromDate);
        }
      }

      // Fill time if provided
      if (fromTime) {
        const timeInputs = await this.page.$$('input[type="time"]');
        if (timeInputs.length > 0) {
          await timeInputs[0].click({ clickCount: 3 });
          await timeInputs[0].type(fromTime);
        }
      }

      if (toTime) {
        const timeInputs = await this.page.$$('input[type="time"]');
        if (timeInputs.length > 1) {
          await timeInputs[1].click({ clickCount: 3 });
          await timeInputs[1].type(toTime);
        }
      }

      // Click Go/Search button (blue button in the search form)
      console.log(`[PUSSY888] Clicking Go button...`);
      let goClicked = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          goClicked = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, input[type="button"]'));
            const goBtn = buttons.find(btn => {
              const text = btn.textContent?.trim().toLowerCase() || (btn as HTMLInputElement).value?.toLowerCase() || '';
              return text === 'go' || text === 'search' || text === 'submit';
            });
            if (goBtn) {
              (goBtn as HTMLElement).click();
              return true;
            }
            return false;
          });
          if (goClicked) break;
        } catch (e) {
          console.log(`[PUSSY888] Go button click attempt ${attempt + 1} failed`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Wait for user search result to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Click game log button in the user result table
      console.log(`[PUSSY888] Clicking game log button...`);
      let gameLogClicked = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          gameLogClicked = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, a'));
            const gameLogBtn = buttons.find(btn => {
              const text = btn.textContent?.trim().toLowerCase() || '';
              return text.includes('game log') || (text.includes('game') && text.includes('log'));
            });
            if (gameLogBtn) {
              (gameLogBtn as HTMLElement).click();
              return true;
            }
            return false;
          });
          if (gameLogClicked) break;
        } catch (e) {
          console.log(`[PUSSY888] Game log button click attempt ${attempt + 1} failed`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Wait for game log page to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fill date form on game log page
      console.log(`[PUSSY888] Filling game log date form...`);
      
      // Directly set date value to input field (bypass date picker popup)
      if (fromDate) {
        console.log(`[PUSSY888] Setting date directly to input field: ${fromDate}`);
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Debug: Check what date inputs exist on page
        const dateInputsInfo = await this.page.evaluate(() => {
          const allInputs = Array.from(document.querySelectorAll('input'));
          return allInputs.map(input => ({
            id: input.id,
            type: input.type,
            value: (input as HTMLInputElement).value,
            className: input.className,
            onclick: input.getAttribute('onclick'),
            placeholder: input.placeholder
          }));
        });
        console.log(`[PUSSY888] Found ${dateInputsInfo.length} input fields on page:`, JSON.stringify(dateInputsInfo, null, 2));
        
        // Inject date value directly to input field #txt_StartDateTime
        const dateSetResult = await this.page.evaluate((targetDate) => {
          // Find input field by ID (from screenshot: id="txt_StartDateTime")
          const dateInput = document.getElementById('txt_StartDateTime') as HTMLInputElement;
          
          if (dateInput) {
            const oldValue = dateInput.value;
            // Directly set value
            dateInput.value = targetDate;
            
            // Trigger change event to ensure form recognizes the change
            const event = new Event('change', { bubbles: true });
            dateInput.dispatchEvent(event);
            
            const newValue = dateInput.value;
            console.log(`Set date input value from "${oldValue}" to "${newValue}"`);
            return { success: true, method: 'byId', oldValue, newValue };
          }
          
          // Fallback: try to find by class="form-control" and onclick="MdatePicker();"
          const allInputs = Array.from(document.querySelectorAll('input.form-control'));
          const dateInputFallback = allInputs.find(input => {
            const onclick = (input as HTMLInputElement).getAttribute('onclick');
            return onclick?.includes('MdatePicker');
          }) as HTMLInputElement;
          
          if (dateInputFallback) {
            const oldValue = dateInputFallback.value;
            dateInputFallback.value = targetDate;
            const event = new Event('change', { bubbles: true });
            dateInputFallback.dispatchEvent(event);
            const newValue = dateInputFallback.value;
            console.log(`Set date input value (fallback) from "${oldValue}" to "${newValue}"`);
            return { success: true, method: 'fallback', oldValue, newValue };
          }
          
          console.log('Could not find date input field');
          return { success: false, method: 'none', oldValue: null, newValue: null };
        }, fromDate);
        
        console.log(`[PUSSY888] Date set result:`, JSON.stringify(dateSetResult, null, 2));
        
        // Take screenshot after setting date
        const screenshotBuffer = await this.page.screenshot({ fullPage: true });
        const screenshotResult = await storagePut(
          `pussy888-debug/date-set-${Date.now()}.png`,
          screenshotBuffer,
          'image/png'
        );
        console.log(`[PUSSY888] Screenshot after date set: ${screenshotResult.url}`);
        
        const dateSet = dateSetResult.success;
        
        if (dateSet) {
          console.log(`[PUSSY888] Successfully set date to: ${fromDate}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`[PUSSY888] Warning: Could not find date input field`);
        }
      } else {
        console.log(`[PUSSY888] No fromDate provided, using default date`);
      }
      // Note: PUSSY888 only supports single date selection, not date range

      // Set time picker values (Begin Time and End Time)
      if (fromTime || toTime) {
        console.log(`[PUSSY888] Setting time range: ${fromTime || '00:00:00'} to ${toTime || '23:59:59'}`);
        
        const timeSetResult = await this.page.evaluate((beginTime, endTime) => {
          // Bootstrap Timepicker uses specific div IDs: begin_tp and end_tp
          // Find input fields inside these divs
          const beginTimePicker = document.getElementById('begin_tp');
          const endTimePicker = document.getElementById('end_tp');
          
          // Find input field inside begin_tp div
          const beginTimeInput = beginTimePicker?.querySelector('input[type="text"]') as HTMLInputElement;
          
          // Find input field inside end_tp div
          const endTimeInput = endTimePicker?.querySelector('input[type="text"]') as HTMLInputElement;
          
          const results = { beginSet: false, endSet: false, beginOld: '', beginNew: '', endOld: '', endNew: '' };
          
          if (beginTimeInput && beginTime) {
            results.beginOld = beginTimeInput.value;
            beginTimeInput.value = beginTime;
            const event = new Event('change', { bubbles: true });
            beginTimeInput.dispatchEvent(event);
            results.beginNew = beginTimeInput.value;
            results.beginSet = true;
            console.log(`Set Begin Time from "${results.beginOld}" to "${results.beginNew}"`);
          }
          
          if (endTimeInput && endTime) {
            results.endOld = endTimeInput.value;
            endTimeInput.value = endTime;
            const event = new Event('change', { bubbles: true });
            endTimeInput.dispatchEvent(event);
            results.endNew = endTimeInput.value;
            results.endSet = true;
            console.log(`Set End Time from "${results.endOld}" to "${results.endNew}"`);
          }
          
          return results;
        }, fromTime || '00:00:00', toTime || '23:59:59');
        
        console.log(`[PUSSY888] Time set result:`, JSON.stringify(timeSetResult, null, 2));
        
        if (timeSetResult.beginSet || timeSetResult.endSet) {
          console.log(`[PUSSY888] Successfully set time range`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`[PUSSY888] Warning: Could not find time input fields, will filter by time in backend`);
        }
      } else {
        console.log(`[PUSSY888] No time range specified, using default (full day)`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Click OK button to load game history
      console.log(`[PUSSY888] Clicking OK button to load game history...`);
      let okClicked = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          okClicked = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, input[type="button"]'));
            const okBtn = buttons.find(btn => {
              const text = btn.textContent?.trim().toLowerCase() || (btn as HTMLInputElement).value?.toLowerCase() || '';
              return text === 'ok' || text === 'search' || text === 'submit';
            });
            if (okBtn) {
              (okBtn as HTMLElement).click();
              return true;
            }
            return false;
          });
          if (okClicked) break;
        } catch (e) {
          console.log(`[PUSSY888] OK button click attempt ${attempt + 1} failed`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Wait for game history table to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract data from table
      // Table structure: GameName | TableID | Bet | Win | BeginMoney | EndMoney | DateTime

      // Debug: Check current page state
      const currentUrl = this.page.url();
      const pageHtml = await this.page.content();
      console.log(`[PUSSY888] Current URL after search: ${currentUrl}`);
      console.log(`[PUSSY888] Page HTML length: ${pageHtml.length}`);

      // Take screenshot for debugging
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        const timestamp = Date.now();
        const fileName = `pussy888-search-result-${timestamp}.png`;
        const { url: screenshotUrl } = await storagePut(fileName, screenshot, 'image/png');
        console.log(`[PUSSY888] Screenshot saved: ${screenshotUrl}`);
      } catch (uploadError) {
        console.log(`[PUSSY888] Failed to save screenshot: ${uploadError}`);
      }

      // Extract data from all pages with pagination
      const allRawGames: Array<{ gameName: string; betText: string; bet: number; dateTime: string }> = [];
      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage && currentPage <= 150) {
        console.log(`[PUSSY888] Extracting data from page ${currentPage}...`);
        // Update progress: 10% at start, 90% at end, distribute middle 80% across pages
        const estimatedTotalPages = 100; // Estimate for progress calculation
        const progressPercent = 10 + Math.min(80 * (currentPage / estimatedTotalPages), 80);
        if (onProgress) onProgress(Math.round(progressPercent));
        // Note: Activity during pagination will keep browser session alive
        // (idle timeout is 30 minutes, reset on each page)

        const pageGames = await this.page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('table tr'));
          console.log(`Found ${rows.length} table rows on current page`);

          const rawData: Array<{ gameName: string; betText: string; bet: number; dateTime: string }> = [];
          const debugRows: Array<{ gameName: string; betText: string; reason: string }> = [];

          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            if (cells.length >= 7) {
              const gameName = cells[0]?.textContent?.trim() || '';
              const betText = cells[2]?.textContent?.trim() || '';
              const dateTime = cells[6]?.textContent?.trim() || '';
              
              if (gameName.toLowerCase().includes('set score') || !gameName) {
                continue;
              }
              
              const bet = parseFloat(betText.replace(/[^0-9.]/g, ''));

              if (gameName && !isNaN(bet) && bet > 0 && dateTime) {
                rawData.push({ gameName, betText, bet, dateTime });
              }
            }
          }
          
          return rawData;
        });

        allRawGames.push(...pageGames);
        console.log(`[PUSSY888] Total games collected so far: ${allRawGames.length}`);
        
        // Small delay to ensure page is ready before checking for next button
        await new Promise(resolve => setTimeout(resolve, 500));

        const nextPageExists = await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          
          const nextBtn = buttons.find(btn => {
            const text = btn.textContent?.trim() || '';
            const title = (btn as HTMLElement).title?.toLowerCase() || '';
            return text === '>' || text === '>>' || text.toLowerCase() === 'next' || title.includes('next');
          });

          let numberedNextBtn = null;
          const pageButtons = buttons.filter(btn => {
            const text = btn.textContent?.trim() || '';
            return /^\d+$/.test(text);
          });

          if (pageButtons.length > 0) {
            const pageNums = pageButtons.map(b => parseInt(b.textContent?.trim() || '0'));
            const maxPage = Math.max(...pageNums);
            numberedNextBtn = pageButtons.find(b => parseInt(b.textContent?.trim() || '0') === maxPage + 1);
          }

          const btnToClick = nextBtn || numberedNextBtn;
          if (btnToClick) {
            (btnToClick as HTMLElement).click();
            return true;
          }
          return false;
        });

        if (!nextPageExists) {
          console.log(`[PUSSY888] No next page button found, pagination complete`);
          hasNextPage = false;
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
          await this.page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
          await new Promise(resolve => setTimeout(resolve, 1000));
          currentPage++;
        }
      }
      
      // Update progress to 90% after pagination complete
      if (onProgress) onProgress(90);

      // Filter by date and time range if provided
      let rawGames = allRawGames;
      if (fromDate || fromTime || toTime) {
        const fromTimeFilter = fromTime || '00:00:00';
        const toTimeFilter = toTime || '23:59:59';
        console.log(`[PUSSY888] Filtering ${rawGames.length} games by date: ${fromDate || 'any'}, time range: ${fromTimeFilter} - ${toTimeFilter}`);
        
        rawGames = rawGames.filter(game => {
          // DateTime format: "2026-02-17 00:53:10"
          const parts = game.dateTime.split(' ');
          const datePart = parts[0] || '';
          const timePart = parts[1] || '';
          if (!datePart || !timePart) return false;
          
          // Filter by date if provided
          if (fromDate && datePart !== fromDate) {
            return false;
          }
          
          // Filter by time range
          return timePart >= fromTimeFilter && timePart <= toTimeFilter;
        });
        
        console.log(`[PUSSY888] After date+time filtering: ${rawGames.length} games remaining`);
      }
      
      // Update progress to 95% before processing
      if (onProgress) onProgress(95);

      const gameMap = new Map<string, { gameName: string; lines: string; betting: number; spin: number; totalBetting: number }>();
      let hasNineLines = false;
      const skipped: string[] = [];

      console.log(`[PUSSY888] Processing ${rawGames.length} raw games from ${currentPage} pages...`);
      
      // FIXED: Count occurrences of each GameName + Bet combination
      const countMap = new Map<string, number>();
      for (const rawGame of rawGames) {
        const key = `${rawGame.gameName}|${rawGame.bet}`;
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }
      console.log(`[PUSSY888] Found ${countMap.size} unique GameName+Bet combinations from ${rawGames.length} total rows`);

      // FIXED: Create aggregated games with correct spin count
      const processedKeys = new Set<string>();
      const unmatchedGames = new Set<string>();
      for (const rawGame of rawGames) {
        const { gameName, betText, bet } = rawGame;
        const key = `${gameName}|${bet}`;

        // Skip if already processed this combination
        if (processedKeys.has(key)) continue;
        processedKeys.add(key);

        if (betText.toLowerCase().includes('free')) continue;

        const gameRef = getGameReference(gameName);
        if (!gameRef) {
          if (!unmatchedGames.has(gameName)) {
            console.log(`[PUSSY888] Game not found in reference: "${gameName}" (bet: ${bet}), skipping`);
            unmatchedGames.add(gameName);
          }
          continue;
        }

        const lines = gameRef.lines;
        const canonicalGameName = gameRef.name; // Use canonical name from Google Sheets
        
        if (lines.includes('9')) {
          hasNineLines = true;
        }

        // FIXED: Spin = count of rows with this GameName + Bet combination
        const spin = countMap.get(key) || 1;
        
        // FIXED: Total Betting = Bet × Spin
        const totalBetting = bet * spin;
        const aggregateKey = `${canonicalGameName}|${bet}|${lines}`;
        gameMap.set(aggregateKey, { gameName: canonicalGameName, lines, betting: bet, spin, totalBetting });
        console.log(`[PUSSY888] Row: ${canonicalGameName} | ${lines} | Bet: ${bet} | Spin: ${spin} | Total: ${totalBetting}`);
      }

      const games = Array.from(gameMap.values());

      const totalTurnover = games.reduce((sum, game) => sum + game.totalBetting, 0);
      console.log(`[PUSSY888] Found ${games.length} unique games, total turnover: ${totalTurnover}, hasNineLines: ${hasNineLines}`);
      
      if (unmatchedGames.size > 0) {
        console.log(`[PUSSY888] Warning: ${unmatchedGames.size} unmatched game names: ${Array.from(unmatchedGames).join(', ')}`);
      }

      return {
        playerId,
        provider: 'PUSSY888',
        brand: '',
        games,
        totalTurnover,
        hasNineLines,
        scrapedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Player search failed for PUSSY888: ${error}`);
    }
  }

  async checkIfLoggedIn(): Promise<boolean> {
    if (!this.page) return false;

    try {
      const isLoggedIn = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button'));
        const hasLogout = links.some(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('logout') || text.includes('sign out');
        });
        const hasSearch = links.some(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('search') || text.includes('user');
        });
        return hasLogout || hasSearch;
      });

      console.log(`[PUSSY888] Logged in status: ${isLoggedIn}`);
      return isLoggedIn;
    } catch (error) {
      console.log(`[PUSSY888] Error checking login status: ${error}`);
      return false;
    }
  }
}

/**
 * Scraper factory and orchestration
 */
const scraperPool: Map<string, { browser: Browser; scraper: BaseScraper; lastUsed: number }> = new Map();
const POOL_TIMEOUT = 30 * 60 * 1000; // 30 minutes - increased to handle long pagination

export async function scrapePlayerTurnover(
  provider: string,
  brand: string,
  playerId: string,
  fromDate: string | undefined = undefined,
  toDate: string | undefined = undefined,
  fromTime: string | undefined = undefined,
  toTime: string | undefined = undefined,
  onProgress?: (progress: number) => void
): Promise<TurnoverResult> {

  const browserPath = process.env.CHROME_PATH || '/usr/bin/chromium';

  console.log(`[Scraper] Starting scrape for ${provider}/${brand}/${playerId}`);

  // Get or create scraper instance
  const poolKey = `${provider}/${brand}`;
  let poolEntry = scraperPool.get(poolKey);

  if (poolEntry) {
    console.log(`[Scraper] Reusing browser session for ${poolKey}`);
    poolEntry.lastUsed = Date.now();
  } else {
    console.log(`[Scraper] Creating new browser session for ${poolKey}`);
    const browser = await puppeteer.launch({
      executablePath: browserPath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    let scraper: BaseScraper;
    if (provider === 'MEGA888') {
      scraper = new Mega888Scraper();
    } else if (provider === 'PUSSY888') {
      scraper = new Pussy888Scraper();
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    scraper.setPage(page);
    poolEntry = { browser, scraper, lastUsed: Date.now() };
    scraperPool.set(poolKey, poolEntry);
  }

  try {
    // Check if already logged in
    const isLoggedIn = await poolEntry.scraper.checkIfLoggedIn();
    console.log(`[Scraper] Already logged in for ${poolKey}: ${isLoggedIn}`);

    if (!isLoggedIn) {
      // Get credentials from Google Sheets
      const credentials = await getCredentialByProviderAndBrand(provider, brand);
      if (!credentials) {
        throw new Error(`Credentials not found for ${provider}/${brand}`);
      }
      console.log(`[Scraper] Got credentials for ${provider}/${brand}`);

      // Login
      await poolEntry.scraper.login(credentials.loginUrl, credentials.username, credentials.password);
      console.log(`[Scraper] Login successful for ${provider}/${brand}`);
    }

    // Search for player
    const result = await poolEntry.scraper.searchPlayer(playerId, fromDate, toDate, fromTime, toTime, onProgress);
    console.log(`[Scraper] Search completed for ${playerId}: ${result.games.length} games`);

    // Reset lastUsed timer after successful search
    poolEntry.lastUsed = Date.now();
    return result;
  } catch (error) {
    console.error(`[Scraper] Error during scraping: ${error}`);
    // Close browser on error
    try {
      await poolEntry.browser.close();
    } catch (closeError) {
      console.error(`[Scraper] Error closing browser: ${closeError}`);
    }
    scraperPool.delete(poolKey);
    throw error;
  }
}



// Clean up old browser sessions periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(scraperPool.entries());
  for (const [key, entry] of entries) {
    if (now - entry.lastUsed > POOL_TIMEOUT) {
      console.log(`[Scraper] Closing idle browser session: ${key}`);
      entry.browser.close();
      scraperPool.delete(key);
    }
  }
}, 60000); // Check every minute

/**
 * Main scraping function called by routers
 */
export async function scrapeTurnoverData(
  provider: string,
  playerId: string,
  brand?: string,
  fromDate: string | undefined = undefined,
  toDate: string | undefined = undefined,
  fromTime: string | undefined = undefined,
  toTime: string | undefined = undefined,
  onProgress?: (progress: number) => void
): Promise<TurnoverResult> {
  const result = await scrapePlayerTurnover(provider, brand || '', playerId, fromDate, toDate, fromTime, toTime, onProgress);
  return result;
}

export { TurnoverResult };
