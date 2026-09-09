import AppwriteConf from '../appwriteConfigrationKeys/ConfigrationofAppwrite'
import { Client, Account, ID, Functions } from 'appwrite'

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
            console.error("Appwrite service :: sendOtp :: error", error);
            throw error;
        } finally {
            console.log("system of otp sender if finiced successfully")
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
            console.error(error);
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
            console.error("Send verification email failed", error);
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
            console.error("Email verification failed", error);
            throw error;
        }
    }

    // Check verification status
    async getEmailVerificationStatus() {
        try {
            const user = await this.account.get();
            return user.emailVerification;
        } catch (error) {
            console.error("Get verification status failed", error);
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
            if (error.code !== 401) {
                console.error("Appwrite service :: getCurrentUser :: error", error);
            }
            return null;
        }
    }

    // 6. Logout from all the devices where user login
    async logoutFromAlldevices() {
        try {
            await this.account.deleteSessions('all');
            return true;
        } catch (error) {
            console.error("Appwrite service :: logout From All devices :: error", error);
            return false;
        }
    }

    // 7. logout only from current device 
    async logoutFromCurrentdevice() {
        try {
            await this.account.deleteSession('current');
            return true;
        } catch (error) {
            console.error("Appwrite service :: logout From Current device :: error", error);
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

    // Auth.js mein ye change karke dekho
    // async AiResponse_triggerFunction(functionId, payload) {
    //     const execution = await this.functions.createExecution(
    //         functionId,
    //         JSON.stringify(payload),
    //         false // path undefined hai, par ye check kar lo
    //     );

    //     // console.log("Status Code:", execution);
    //     console.log("Status Code:", execution.responseStatusCode);
    //     console.log("Response Body:", execution.responseBody);


    //     return JSON.parse(execution.responseBody);
    // }
}

const userAuthService = new UserAuthentication();
export default userAuthService;