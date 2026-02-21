const SPREADSHEET_ID = '13kiyqi8YZGQCyH6cLYcU6ZpUy2njqum02fSrIBGt8D8';

export interface ProviderCredentials {
  provider: string;
  brand: string;
  username: string;
  password: string;
  loginUrl: string;
}

/**
 * Fetch provider credentials from Google Spreadsheet
 * Uses public Google Sheets JSON API (no authentication required for public sheets)
 * 
 * Spreadsheet structure:
 * Column A: Product (Provider name)
 * Column B: Link (Login URL)
 * Column C-D: ABSG (Username, Password)
 * Column E-F: WBSG (Username, Password)
 * Column G-H: OK188SG (Username, Password)
 * Column I-J: OXSG (Username, Password)
 * Column K-L: FWSG (Username, Password)
 * Column M-N: M24SG (Username, Password)
 */
export async function fetchProviderCredentials(): Promise<ProviderCredentials[]> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[GoogleSheets] Fetching credentials (attempt ${attempt}/${maxRetries})...`);
      
      // Use Google Sheets public JSON API
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
      }
      
      const text = await response.text();
      
      // Parse Google Sheets JSON response (it's wrapped in a function call)
      // Format: google.visualization.Query.setResponse({...});
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error('Invalid response format from Google Sheets');
      }
      
      const data = JSON.parse(jsonMatch[1]);
      const rows = data.table.rows;
      
      if (!rows || rows.length === 0) {
        console.log('[GoogleSheets] No rows found in spreadsheet');
        return [];
      }

      const credentials: ProviderCredentials[] = [];
      
      // Skip header row (first row is header)
      // Data starts from row index 1 (2nd row)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row.c) continue;

        const cells = row.c;
        
        // Extract cell values (cells can be null)
        const provider = cells[0]?.v?.trim(); // Column A: Product
        const loginUrl = cells[1]?.v?.trim(); // Column B: Link
        
        // Column C-D: ABSG
        const usernameABSG = cells[2]?.v?.trim();
        const passwordABSG = cells[3]?.v?.trim();
        
        // Column E-F: WBSG
        const usernameWBSG = cells[4]?.v?.trim();
        const passwordWBSG = cells[5]?.v?.trim();
        
        // Column G-H: OK188SG
        const usernameOK188SG = cells[6]?.v?.trim();
        const passwordOK188SG = cells[7]?.v?.trim();
        
        // Column I-J: OXSG
        const usernameOXSG = cells[8]?.v?.trim();
        const passwordOXSG = cells[9]?.v?.trim();
        
        // Column K-L: FWSG
        const usernameFWSG = cells[10]?.v?.trim();
        const passwordFWSG = cells[11]?.v?.trim();
        
        // Column M-N: M24SG
        const usernameM24SG = cells[12]?.v?.trim();
        const passwordM24SG = cells[13]?.v?.trim();
        
        if (!provider || !loginUrl) continue;

        // Add ABSG credentials if username exists
        if (usernameABSG && passwordABSG) {
          credentials.push({
            provider,
            brand: 'ABSG',
            username: usernameABSG,
            password: passwordABSG,
            loginUrl,
          });
        }

        // Add WBSG credentials if username exists
        if (usernameWBSG && passwordWBSG) {
          credentials.push({
            provider,
            brand: 'WBSG',
            username: usernameWBSG,
            password: passwordWBSG,
            loginUrl,
          });
        }
        
        // Add OK188SG credentials if username exists
        if (usernameOK188SG && passwordOK188SG) {
          credentials.push({
            provider,
            brand: 'OK188SG',
            username: usernameOK188SG,
            password: passwordOK188SG,
            loginUrl,
          });
        }
        
        // Add OXSG credentials if username exists
        if (usernameOXSG && passwordOXSG) {
          credentials.push({
            provider,
            brand: 'OXSG',
            username: usernameOXSG,
            password: passwordOXSG,
            loginUrl,
          });
        }
        
        // Add FWSG credentials if username exists
        if (usernameFWSG && passwordFWSG) {
          credentials.push({
            provider,
            brand: 'FWSG',
            username: usernameFWSG,
            password: passwordFWSG,
            loginUrl,
          });
        }
        
        // Add M24SG credentials if username exists
        if (usernameM24SG && passwordM24SG) {
          credentials.push({
            provider,
            brand: 'M24SG',
            username: usernameM24SG,
            password: passwordM24SG,
            loginUrl,
          });
        }
      }

      console.log(`[GoogleSheets] Successfully fetched ${credentials.length} credentials`);
      return credentials;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[GoogleSheets] Attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[GoogleSheets] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('[GoogleSheets] All retry attempts failed');
  throw new Error(`Failed to fetch provider credentials from Google Spreadsheet after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Get specific credential by provider and brand
 */
export async function getCredentialByProviderAndBrand(
  provider: string,
  brand: string
): Promise<ProviderCredentials | null> {
  const credentials = await fetchProviderCredentials();
  return credentials.find(
    c => c.provider.toLowerCase() === provider.toLowerCase() && 
         c.brand.toLowerCase() === brand.toLowerCase()
  ) || null;
}
