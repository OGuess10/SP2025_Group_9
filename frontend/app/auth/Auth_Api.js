import { supabase } from '../../supabaseClient';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

export const sendOtp = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
        console.error("Error sending OTP:", error.message);
        throw new Error("Failed to send OTP. Try again.");
    } else {
        console.log("OTP sent! Check your email.");
    }
};

export const verifyOtp = async (email, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
    });

    if (error) {
        console.error("Error verifying OTP:", error.message);
        return { success: false, message: error.message };
    }

    console.log("OTP verification data:", data);

    const session = data.session;

    if (session) {
        const token = session?.access_token;
        console.log(`Auth_API: ${BACKEND_URL}`);
        const response = await fetch(`${BACKEND_URL}/protected`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const backendData = await response.json();
        if (!response.ok) {
            return { success: false, message: backendData.error || "Authentication failed" };
        }

        return { success: true, message: "Login successful!", userId: backendData.user_id };
    }

    return { success: false, message: 'Invalid OTP or expired' };
};

export default {
    sendOtp,
    verifyOtp,
};