import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GrowingTree from '../../components/GrowingTree';


const HomeScreen = () => {
  const [points, setPoints] = useState(0);
  const addPoints = () => setPoints(prev => Math.min(prev + 100, 1000));
  const subPoints = () => setPoints(prev => Math.max(prev - 100, 0));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tree</Text>
      <View style={styles.treeContainer}>
        <GrowingTree seed={12345} points={points} width={300} height={400} />
      </View>
      <Text style={styles.pointsText}>Points: {points}</Text>
      <TouchableOpacity style={styles.button} onPress={addPoints}>
        <Text style={styles.buttonText}>Add Points</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={subPoints}>
        <Text style={styles.buttonText}>Sub Points</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center',},
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  treeContainer: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  pointsText: { fontSize: 20, marginTop: 20, },
  button: { marginTop: 20, backgroundColor: '#00796b', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default HomeScreen;
