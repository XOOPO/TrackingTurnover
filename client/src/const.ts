export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Get the login URL for the application.
 * Now points to our server-side route which handles the Google OAuth redirect.
 */
export const getLoginUrl = () => {
  return "/api/oauth/login";
};
