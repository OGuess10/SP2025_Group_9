import { supabase } from '../../supabaseClient';

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
        type: 'email',  // Ensure you use the email type
    });

    if (error) {
        return { success: false, message: error.message };
    }

    const session = data.session;
    const token = session?.access_token;

    if (token) {
        // Send the token to your Flask backend for profile creation
        const response = await fetch('http://localhost:8081/protected', {
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