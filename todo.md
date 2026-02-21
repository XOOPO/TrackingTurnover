# Project TODO

## Phase 1: Database Schema & Google Sheets Integration
- [x] Create database schema untuk user activity logs
- [x] Create database schema untuk provider credentials cache
- [x] Setup Google Sheets API integration
- [x] Create helper functions untuk read credentials dari Google Spreadsheet

## Phase 2: Backend tRPC Procedures
- [x] Create tRPC procedure untuk search turnover by ID/Provider/Brand
- [x] Create tRPC procedure untuk get user activity logs
- [x] Create tRPC procedure untuk get provider list
- [x] Create database query helpers untuk activity logging

## Phase 3: Web Automation Module
- [x] Install puppeteer atau playwright untuk web automation
- [x] Create scraper module untuk MEGA888
- [x] Create scraper module untuk PRAGMATIC SLOT
- [x] Create scraper module untuk PUSSY888
- [x] Create scraper module untuk 918KISS
- [x] Create scraper module untuk 918KAYA
- [x] Create scraper module untuk LIVE22 WEB
- [x] Create scraper module untuk BETWOS
- [x] Create error handling dan retry logic untuk scrapers

## Phase 4: Frontend Dashboard
- [x] Design color scheme dan typography
- [x] Create DashboardLayout dengan sidebar navigation
- [x] Create search form dengan dropdown Provider dan Brand
- [x] Create results display component untuk game list dan total betting
- [x] Implement loading states dan error handling
- [x] Add user profile display dengan logout button

## Phase 5: Activity Log Viewer
- [x] Create activity log page dengan table display
- [x] Add filtering dan sorting untuk activity logs
- [x] Add pagination untuk activity logs
- [x] Test semua fitur end-to-end

## Phase 6: Final Delivery
- [x] Run vitest tests
- [x] Create checkpoint
- [x] Deliver to user

## Bug Fixes
- [x] Fix Google Spreadsheet API error - credentials tidak bisa dibaca
- [x] Test fix dengan real data
- [x] Create checkpoint setelah fix

## Scraper Fixes
- [x] Fix CSS selector error - :has-text() tidak valid di Puppeteer
- [x] Improve scraper dengan XPath atau evaluate untuk find buttons
- [x] Test scraper fix
- [x] Create checkpoint

## Flow Fixes (Based on Video)
- [x] Update brand list - add OK188SG dan MBSG (total 4 brands)
- [x] Fix spreadsheet column mapping - columns C-J untuk 4 brands
- [x] Update scraper selectors untuk match placeholder attributes
- [ ] Test dengan real PUSSY888 login
- [x] Create checkpoint

## Remaining Selector Fixes
- [x] Fix :has-text() selector di searchPlayer function
- [x] Create checkpoint

## New Features (User Request)
- [x] Add 3 new brands: M24SG, FWSG, OXSG (total 7 brands)
- [x] Update spreadsheet mapping untuk support columns K-P (3 brands baru)
- [x] Add date filter di search form (from date - to date)
- [x] Update database schema untuk store date range (optional parameters)
- [x] Update scraper untuk accept date parameters
- [x] Fix scraper timeout - increase dari 10s ke 30s
- [ ] Add better error handling dengan screenshots (deferred - can be added later)
- [x] Test dengan real data
- [x] Create checkpoint

## Bug Fix - Click Error
- [x] Fix "Node is either not clickable or not an Element" error
- [x] Add waitForSelector before click operations
- [x] Add fallback mechanism dengan keyboard Enter
- [x] Test fix
- [x] Create checkpoint

## MEGA888 Scraper Update (Based on Screenshots)
- [x] Update MEGA888 scraper flow: Login → Click "Search User" menu → Input Player ID → Click "Ok"
- [x] Navigate to Player Game Log page by clicking "game log" button
- [x] Fill date and time range form
- [x] Extract game data from result table
- [x] Test dengan real data
- [x] Create checkpoint

## Bug Fix - Timeout Error
- [x] Increase wait timeout untuk table selector (10s → 45s)
- [x] Add retry logic untuk button clicks (3 attempts)
- [x] Add page URL logging untuk debugging
- [x] Make selectors more flexible (multiple selector fallbacks)
- [x] Test fix
- [x] Create checkpoint

## Bug Fix - SPA Navigation
- [x] Remove waitForNavigation (doesn't work for SPA)
- [x] Add networkidle wait after button clicks
- [x] Add specific element wait instead of navigation
- [x] Test fix
- [x] Create checkpoint

## Feature - Time Picker
- [x] Add From Time dan To Time inputs di frontend
- [x] Update backend schema untuk accept time parameters
- [x] Update scraper untuk fill time inputs di MEGA888
- [x] Test time filtering
- [x] Create checkpoint

## Bug Fix - Table Detection
- [x] Improve table selector untuk match actual HTML structure
- [x] Increase wait time untuk table loading (5 attempts x 3 seconds)
- [x] Add multiple selector fallbacks (using evaluate to check all tables)
- [x] Test fix
- [x] Create checkpoint

## Feature - Screenshot on Error
- [x] Capture screenshot saat table not found error
- [x] Upload screenshot to S3
- [x] Include screenshot URL di error message
- [x] Test screenshot feature
- [x] Create checkpoint

## Bug Fix - Button Click Issue (From Screenshot Analysis)
- [x] Fix MEGA888 "Ok" button click - button tidak ter-click dengan benar
- [x] Add input validation sebelum click button
- [x] Add force click dengan page.evaluate untuk bypass overlay
- [x] Add wait setelah input untuk ensure value ter-fill
- [x] Replace button click dengan Enter key submission (more natural)
- [x] Add smart selector detection (try multiple selectors)
- [x] Test fix dengan screenshot verification - BERHASIL!
- [ ] Create checkpoint

## Bug Fix - Selector Timeout Error
- [x] Fix "Waiting for selector failed" error - improve error handling
- [x] Add better logging dengan URL dan screenshot untuk debug
- [x] Remove redundant waitForSelector call
- [x] Fix login function dengan smart selector detection
- [x] Add screenshot capture untuk login page errors
- [ ] Test dengan WBSG brand
- [ ] Create checkpoint

## Credential Update
- [ ] Update Google Spreadsheet dengan WBSG credential yang benar (Mega5168s0 / Wbsgqqwwee123)
- [ ] Test scraper dengan WBSG credential yang sudah di-update

## Column Mapping Fix
- [x] Fix M24SG column mapping - should be Column O (username) and P (password), NOT K-L
- [x] Fix OXSG column mapping - should be Column K (username) and L (password), NOT O-P
- [x] Update googleSheets.ts dengan mapping yang benar

## Session Reuse Implementation
- [x] Implement browser session persistence untuk avoid re-login
- [x] Add global browser pool per provider+brand
- [x] Reuse browser session untuk subsequent requests (30 min expiry)
- [x] Skip login if already logged in
- [ ] Test dengan WBSG brand

## PUSSY888 Turnover Parsing Issue
- [x] Fix checkIfLoggedIn selector error - :has-text() tidak valid di Puppeteer
- [x] Fix table parsing untuk PUSSY888 - turnover shows $0.00 padahal ada data
- [x] Check table structure dan column mapping
- [x] Test dengan Player ID sg218168988
- [x] Create PUSSY888Scraper class dengan correct column mapping (Bet = column 2)
- [x] Update scrapeTurnoverData to use PUSSY888Scraper
- [x] Test dengan Player ID sg218168988 untuk verify turnover extraction
- [x] Add screenshot capture di PUSSY888 scraper untuk debug table not found issue
- [x] Check if scraper navigate ke correct page dengan game history table
- [x] Verify table selector dan row parsing logic
- [x] Fix PUSSY888 scraper to click "search user" menu before filling form
- [x] Test with Player ID sg218168988 to verify table extraction works - SUCCESS!

## Infrastructure Issue
- [x] Fix Puppeteer Chrome binary issue - "Could not find Chrome (ver. 145.0.7632.67)"
- [x] Configure Puppeteer to use system Chromium at /usr/bin/chromium-browser

## Critical Fix - Chrome Binary Still Failing
- [x] Fix "Could not find Chrome (ver. 145.0.7632.67)" error - previous fix didn't work
- [x] Switched from puppeteer to puppeteer-core (no bundled Chrome)
- [x] Use system Chromium 128 at /usr/bin/chromium-browser
- [x] Test scraper after fix - PUSSY888 working!

## PUSSY888 Search Form Button Fix
- [x] Fix PUSSY888 scraper - was clicking OK button but should click Go button
- [x] Updated searchPlayer to look for Go/Search/Submit buttons
- [x] Added retry logic for button clicking (3 attempts)
- [x] Test with Player ID sg218168988 - SUCCESS! Found 1 game with $996.00 turnover

## PUSSY888 Complex Calculation (Phase 2)
- [x] Update PUSSY888 scraper to aggregate game data by GameName
- [x] Implement Free Spin filtering (skip rows where Bet = "Free game")
- [x] Implement 9-lines detection (bet < 0.09 = 9 lines)
- [x] Calculate Lines from Bet amount (e.g., 0.09 = 9 lines, 0.50 = 50 lines)
- [x] Aggregate: Group by GameName, sum Bet and Spin counts
- [x] Calculate Total Betting = Bet × Spin for each game
- [x] Return aggregated data structure with GameName, Lines, Betting, Spin, TotalBetting
- [x] Update frontend to display detailed game table with new columns
- [x] Add 9-lines warning section (show if any game has bet < 0.09)
- [x] Test with real PUSSY888 data - SUCCESS! Displays 72 Lines with correct calculation
- [ ] Create checkpoint

## PUSSY888 Correct Calculation (Phase 3 - Fix)
- [ ] Fetch PUSSY888 game reference from Google Sheets (Column B: Game Name, Column C: Lines)
- [ ] Parse bet amount → spin count mapping from columns D onwards
- [ ] Update scraper to extract GameName and BetAmount from table rows
- [ ] Lookup GameName in reference to get Lines (fixed per game)
- [ ] Lookup BetAmount in reference to get SpinCount
- [ ] Aggregate by GameName (group same games together)
- [ ] Test with real data - verify GoldenSlut calculation
- [ ] Update frontend display if needed
- [ ] Create checkpoint


## PUSSY888 Game Log Navigation Fix (Phase 4)
- [x] Update PUSSY888 scraper to click game log button after user search
- [x] Fill date form (User name, Select date, Begin Time, End Time)
- [x] Click OK button to load game history
- [x] Extract game history table (GameName, TableID, Bet, Win, BeginMoney, EndMoney, DateTime)
- [x] Add game name matching with reference data
- [x] Calculate spin count from bet amount and reference
- [ ] Handle pagination if multiple pages exist
- [x] Test with real player data - SUCCESS! ICELAND ($3.50) and Dragon ($11.25) calculated correctly
- [x] Verify Dragon and games are correctly identified and calculated


## PUSSY888 Pagination & Individual Row Extraction (Phase 5)
- [ ] Update scraper to extract individual rows (not aggregate)
- [ ] Each row should show: GameName, Bet, Spin (1 per row), Total Betting (Bet × 1)
- [ ] Implement pagination iteration - click page 1, 2, 3, etc.
- [ ] Detect last page (when next button disabled or no more pages)
- [ ] Aggregate all rows from all pages at the end
- [ ] Calculate total turnover from all pages
- [ ] Test with real player data (sg218168988 has 112+ pages)
- [ ] Verify total matches manual calculation


## PUSSY888 Time Filtering Fix (Phase 6)
- [ ] Remove custom time picker filling logic (not working with custom UI component)
- [ ] Parse DateTime column from scraped table results
- [ ] Filter games by fromTime-toTime range in backend after scraping
- [ ] Test with sg218168988 player on 15 Feb 23:00-23:59 (should show only 2 games: Dragons and Iceland)
- [ ] Verify total turnover matches manual calculation
- [ ] Create checkpoint


## Date Input Bug Fix (Phase 7)
- [ ] Fix frontend date format - HTML date input expects yyyy-mm-dd not mm/dd/yyyy
- [ ] Verify date is correctly sent to backend in yyyy-mm-dd format
- [ ] Fix scraper date filling - ensure date field is filled with correct value
- [ ] Add logging to show which date is being filled in scraper
- [ ] Test with 15 Feb 2026, time 23:00-23:59 (should show 2 games: Dragons and Iceland)
- [ ] Verify results match manual check


## Calendar Picker Implementation (Phase 8)
- [ ] Implement calendar picker interaction for PUSSY888 date selection
- [ ] Click calendar icon to open date picker popup
- [ ] Navigate to correct month/year
- [ ] Click target date (e.g., 15)
- [ ] Test with 15 Feb 2026, time 23:00-23:59 (should show 2 games)
- [ ] Verify results match manual check
- [ ] Create checkpoint

## UI Loading Indicator Fix (Phase 9)
- [ ] Fix loading indicator not hiding when search completes
- [ ] Ensure loading spinner disappears when job status = "completed"
- [ ] Test with multiple simultaneous searches
- [ ] Create checkpoint

## Date Picker Debug (Phase 10)
- [ ] Add debug logging to show if date input field exists
- [ ] Add screenshot capture after date filling attempt
- [ ] Verify date value is actually set in input field
- [ ] Investigate why scraper is using default date (today) instead of custom date
- [ ] Test with 15 Feb 2026 to verify date is correctly set

## Time Picker Automation (Phase 11)
- [ ] Implement time picker automation for PUSSY888
- [ ] Find Begin Time and End Time input fields
- [ ] Directly inject time values (HH:MM:SS format)
- [ ] Test with 00:00:00 to 00:10:59 time range
- [ ] Verify scraper only scrapes 3 pages instead of 100+ pages
- [ ] Create checkpoint

## Loading Indicator Bug Fix (Phase 12)
- [ ] Fix loading indicator not hiding after search completes
- [ ] Ensure only one loading indicator shows at a time
- [ ] Clear previous job state properly

## Brand List Update (Phase 13)
- [x] Add new brands: WBSG, OK188SG, OXSG, FWSG, M24SG
- [x] Remove brand: Asia
- [x] Update constants file
- [x] Update database seed data if needed

## Remove MBSG Brand (Phase 14)
- [x] Remove MBSG from brand list in routers.ts

## Credential Mapping Verification (Phase 15)
- [x] Verify ABSG mapping: Column C (Username), Column D (Password)
- [x] Verify WBSG mapping: Column E (Username), Column F (Password)
- [x] Verify OK188SG mapping: Column G (Username), Column H (Password)
- [x] Verify OXSG mapping: Column I (Username), Column J (Password)
- [x] Verify FWSG mapping: Column K (Username), Column L (Password)
- [x] Verify M24SG mapping: Column M (Username), Column N (Password)
- [x] Update googleSheets.ts if needed

## Credentials Viewer Feature (Phase 16)
- [x] Create tRPC endpoint to fetch all credentials from Google Sheets
- [x] Create Credentials page UI with table showing provider, brand, username, password, login URL
- [x] Add navigation link to Credentials page in sidebar
- [x] Test credentials display

## Activity Logs Page Error Fix (Phase 17)
- [x] Fix Activity Logs page tRPC errors (HTML instead of JSON, fetch failures)
- [x] Investigate which tRPC endpoint is failing
- [x] Fix endpoint or page implementation
- [x] Test Activity Logs page
- [x] Create checkpoint

## Add New Games to Pussy888 (Phase 18)
- [x] Update gameAliases to map "panda" to "Great China"
- [x] Add "Great China" (50 lines) to pussy888Games master list
- [x] Add "大财神" (15 lines) to pussy888Games master list
- [x] Test game detection in scraper

## Fix LuckyPanda Game Counting (Phase 19)
- [x] Add "luckypanda" alias to gameAliases mapping
- [x] Verify "Lucky Panda" exists in pussy888Games master list
- [x] Test search with LuckyPanda to verify games are counted

## Fix OK188SG Login Timeout (Phase 20)
- [x] Increase login timeout from 30s to 60s for slow brands
- [x] Add retry logic (2-3 attempts) for failed logins
- [x] Test OK188SG search with updated timeout
