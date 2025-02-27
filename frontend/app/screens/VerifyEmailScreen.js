import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { supabase } from "../../supabaseClient";

export default function VerifyEmailScreen() {
    const [email, setEmail] = useState("");

    const handleVerifyEmail = async () => {
        const { error } = await supabase.auth.signIn({ email });
      
        if (error) {
          console.error(error.message);
        } else {
          alert("Verification email sent");
        }
      };
      

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Email</Text>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
            <Button title="Verify Email" onPress={handleVerifyEmail} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    input: { width: 250, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
});