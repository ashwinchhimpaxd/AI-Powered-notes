import AppwriteConf from '../appwriteConfigrationKeys/ConfigrationofAppwrite'
import { Client, Account, ID, Functions, OAuthProvider } from 'appwrite'


export class UserAuthentication {

    client = new Client();
    account;
    userid;
    functions;

    constructor() {
        this.client.setEndpoint(AppwriteConf.appwriteUrl)
            .setProject(AppwriteConf.appwriteProjectId);
        this.account = new Account(this.client);
        this.functions = new Functions(this.client)
    }

    // send otp to user email
    async sendOtp(email) {
        try {
            // Appwrite naye user ke liye ID.unique() aur purane ke liye email se handle kar leta hai
            const sessiontoken = await this.account.createEmailToken(
                ID.unique(),
                email,
                false // false = sends a short OTP code to email (not a phrase)
            );

            if (!sessiontoken) return;
            return {
                userId: sessiontoken.userId,
                email
            };
        } catch (error) {
            throw error;
        }
    }

    // 4. PHASE 2: Verify OTP and Login
    async verifyOtp(userId, otp, userName) {
        try {
            // secret hi woh 6-digit OTP hai jo user enter karega
            const usersession = await this.account.createSession(userId, otp);
            if (userName) {
                await this.UpdateUserName(userName)
            }
            return usersession;
        } catch (error) {
            throw error;
        }
    }


    // Send verification email to currently logged-in user's email
    async sendEmailVerification() {
        try {
            return await this.account.createVerification(
                `${window.location.origin}/verify-email`
            );
        } catch (error) {
            throw error;
        }
    }

    // Complete email verification
    async verifyEmail({ userId, secret }) {
        try {
            return await this.account.updateVerification(
                userId,
                secret
            );
        } catch (error) {
            throw error;
        }
    }

    // Check verification status
    async getEmailVerificationStatus() {
        try {
            const user = await this.account.get();
            return user.emailVerification;
        } catch (error) {
            throw error;
        }
    }

    // update the user name
    async UpdateUserName(name) {
        try {
            return await this.account.updateName(name);
            // throw new Error("Error occurs when updaing the user name")
        } catch (error) {
            throw error;
        }
    }
    // 5. Get Current User auth Data
    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            // 401 error is expected if no session exists, so we don't log it as an error
            console.error("GET CURRENT USER ERROR:", error);
            return error;
        }
    }

    // 6. Logout from all the devices where user login
    async logoutFromAlldevices() {
        try {
            await this.account.deleteSessions('all');
            return true;
        } catch (error) {
            return false;
        }
    }

    // 7. logout only from current device 
    async logoutFromCurrentdevice() {
        try {
            await this.account.deleteSession('current');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Naya function: AI ya OCR call karne ke liye
    async triggerFunction(functionId, payload) {
        try {
            const execution = await this.functions.createExecution(
                functionId,
                JSON.stringify(payload)
            );


            if (!execution.responseBody) {
                throw new Error("Function returned empty response!");
            }
            return JSON.parse(execution.responseBody);
        } catch (error) {
            throw error;
        }
    }

    // Login with Google
    async loginWithGoogle() {
        try {
            const success = `${window.location.origin}/oauth-success`;
            const failure = `${window.location.origin}/oauth-failure`;

            // Use createOAuth2Token for Web (Appwrite v14+) which redirects and passes userId/secret to the success URL
            await this.account.createOAuth2Token(
                OAuthProvider.Google,
                success,
                failure
            );
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    }

    // Create Appwrite session after Google OAuth
    async createOAuthSession(userId, secret) {
        try {
            return await this.account.createSession(userId, secret);
        } catch (error) {
            console.error("OAuth Session Error:", error);
            throw error;
        }
    }

}

const userAuthService = new UserAuthentication();
export default userAuthService;