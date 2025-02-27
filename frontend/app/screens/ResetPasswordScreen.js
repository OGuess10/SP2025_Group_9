import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { supabase } from "../../supabaseClient";

export default function ResetPasswordScreen() {
    const [email, setEmail] = useState("");

    const handleResetPassword = async () => {
        const { error } = await supabase.auth.api.resetPasswordForEmail(email);
        if (error) {
            console.error(error.message);
        } else {
            alert("Password reset email sent");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
            <Button title="Reset Password" onPress={handleResetPassword} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    input: { width: 250, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
});