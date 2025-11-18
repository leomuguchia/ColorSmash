import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Animated 
} from 'react-native';
import * as Haptics from 'expo-haptics';

const COLOR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function ColorSmash() {
  const [colors, setColors] = useState<string[]>([]);
  const [targetColor, setTargetColor] = useState<string>('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [scaleAnims] = useState(() => 
    Array(9).fill(0).map(() => new Animated.Value(1))
  );

  const startGame = () => {
    generateNewRound();
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setGameActive(true);
  };

  const generateNewRound = () => {
    const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
    const roundColors = shuffled.slice(0, 9);
    const target = roundColors[Math.floor(Math.random() * roundColors.length)];
    
    setColors(roundColors);
    setTargetColor(target);
  };

  const smashAnimation = (index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleColorTap = (color: string, index: number) => {
    if (!gameActive) return;

    smashAnimation(index);

    if (color === targetColor) {
      // CORRECT - Satisfying feedback!
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const comboBonus = combo * 2;
      const points = 10 + comboBonus;
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      generateNewRound();
      
      // Reset all animations for next round
      scaleAnims.forEach(anim => anim.setValue(1));
    } else {
      // WRONG - Punishing feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScore(prev => Math.max(0, prev - 5));
      setCombo(0);
    }
  };

  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          Alert.alert('Game Over!', `Final Score: ${score}\nMax Combo: ${combo}x`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, score]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎨ColorSmash !</Text>
        <View style={styles.stats}>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.timer}>Time: {timeLeft}s</Text>
          {combo > 1 && <Text style={styles.combo}>{combo}x COMBO!</Text>}
        </View>
      </View>

      {/* Target Color */}
      <View style={styles.targetSection}>
        <Text style={styles.targetText}>SMASH THIS COLOR:</Text>
        <View style={[styles.targetColor, { backgroundColor: targetColor }]} />
      </View>

      {/* Color Grid */}
      <View style={styles.grid}>
        {colors.map((color, index) => (
          <Animated.View
            key={index}
            style={{ transform: [{ scale: scaleAnims[index] }] }}
          >
            <TouchableOpacity
              style={[styles.colorTile, { backgroundColor: color }]}
              onPress={() => handleColorTap(color, index)}
              activeOpacity={0.9}
            />
          </Animated.View>
        ))}
      </View>

      {/* Combo Display */}
      {combo > 2 && (
        <View style={styles.comboDisplay}>
          <Text style={styles.comboText}>🔥 {combo}x COMBO! +{combo * 2} bonus!</Text>
        </View>
      )}

      {/* Controls */}
      <TouchableOpacity 
        style={[styles.button, !gameActive && styles.buttonActive]}
        onPress={startGame}
        disabled={gameActive}
      >
        <Text style={styles.buttonText}>
          {gameActive ? '🔥 SMASHING!' : 'START SMASHING!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  stats: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  score: {
    fontSize: 18,
    color: '#4ECDC4',
    fontWeight: '700',
  },
  timer: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '700',
  },
  combo: {
    fontSize: 14,
    color: '#FFD93D',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 217, 61, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  targetSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  targetText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  targetColor: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  colorTile: {
    width: 100,
    height: 100,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  comboDisplay: {
    alignItems: 'center',
    marginBottom: 15,
  },
  comboText: {
    fontSize: 18,
    color: '#FFD93D',
    fontWeight: '800',
    textShadowColor: 'rgba(255, 217, 61, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  button: {
    backgroundColor: '#333',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonActive: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});