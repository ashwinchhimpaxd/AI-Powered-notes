import userAuthService from "./auth";

/**
 * Pings Appwrite to keep the project active.
 * 
 * NOTE: Since this is frontend code, it will ONLY run when a user visits the app in their browser.
 * If you do not open the app for 4 days, this code will NOT run. 
 * To truly keep it active automatically, you should set up an external cron job (like cron-job.org) 
 * or an Appwrite Scheduled Function.
 */
export const keepAppwriteActive = async () => {
    try {
        // The most lightweight and safe request is fetching the current user account.
        // Even if the user is not logged in and it throws a 401 Unauthorized, 
        // the request still hits the Appwrite server and registers as activity for your project.
        // It does not change any user data and is very inexpensive.
        await userAuthService.getCurrentUser();
        console.log("Appwrite pinged to keep project active.");
    } catch (error) {
        // We expect a 401 error if there is no active session, which is completely fine.
        console.log("Appwrite pinged (user not logged in, but project is kept active).");
    }
};
