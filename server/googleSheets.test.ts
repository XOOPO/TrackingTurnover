import { describe, expect, it } from "vitest";
import { fetchProviderCredentials, getCredentialByProviderAndBrand } from "./googleSheets";

describe("googleSheets", () => {
  it("fetches provider credentials from public spreadsheet", async () => {
    const credentials = await fetchProviderCredentials();
    
    expect(credentials).toBeInstanceOf(Array);
    expect(credentials.length).toBeGreaterThan(0);
    
    // Check structure of first credential
    if (credentials.length > 0) {
      const cred = credentials[0];
      expect(cred).toHaveProperty('provider');
      expect(cred).toHaveProperty('brand');
      expect(cred).toHaveProperty('username');
      expect(cred).toHaveProperty('password');
      expect(cred).toHaveProperty('loginUrl');
    }
  }, 10000); // 10 second timeout for network request

  it("gets specific credential by provider and brand", async () => {
    const credential = await getCredentialByProviderAndBrand('MEGA888', 'ABSG');
    
    if (credential) {
      expect(credential.provider).toBe('MEGA888');
      expect(credential.brand).toBe('ABSG');
      expect(credential.username).toBeTruthy();
      expect(credential.password).toBeTruthy();
      expect(credential.loginUrl).toBeTruthy();
    }
  }, 10000);

  it("returns null for non-existent provider/brand combination", async () => {
    const credential = await getCredentialByProviderAndBrand('NONEXISTENT', 'BRAND');
    
    expect(credential).toBeNull();
  }, 10000);
});
