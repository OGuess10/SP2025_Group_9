import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Animated, Easing, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const CONFIG = {
  MAX_POINTS: 1000,
  MAX_DEPTH: 5,
  BRANCH_DELTA: 0.2,
  ANIMATION_DURATION: 1000,
  LEAVES_PER_BRANCH: 6,
  LEAF_RADIUS: 6,
  EXPLOSION_COUNT: 8,
  EXPLOSION_DURATION: 1000,
};

export interface GrowingTreeProps {
  seed: number;
  points: number;
  width?: number;
  height?: number;
}

interface Branch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  threshold: number;
  delta: number;
  depth: number;
  children: Branch[];
  id: string;
}

// --- Random Helpers ---
function createSeededRandom(seed: number): () => number {
  let value = seed;
  return function () {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

function getSeededBool(seed: number, input: string): boolean {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ((hash + seed) % 2) === 0;
}

function getDeterministicRandom(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function getRandomGreen(seed: number, tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = 30 + (hash % 40);
  const g = 120 + (hash % 80);
  const b = 30 + ((hash >> 3) % 40);
  return `rgb(${r},${g},${b})`;
}

// --- Branch Generator ---
function generateBranch(
  x1: number,
  y1: number,
  angle: number,
  length: number,
  depth: number,
  maxDepth: number,
  threshold: number,
  rng: () => number,
  id: string = '0'
): Branch {
  const x2 = x1 + length * Math.cos(angle);
  const y2 = y1 + length * Math.sin(angle);
  const branch: Branch = {
    x1,
    y1,
    x2,
    y2,
    threshold,
    delta: CONFIG.BRANCH_DELTA,
    depth,
    children: [],
    id,
  };

  if (depth < maxDepth) {
    for (let i = 0; i < 2; i++) {
      const angleOffset = (15 + rng() * 30) * (Math.PI / 180);
      const childAngle = angle + (i === 0 ? -angleOffset : angleOffset);
      const childLength = length * (0.7 + rng() * 0.2);
      const childThreshold = threshold + branch.delta;
      const childId = `${id}-${i}`;
      const child = generateBranch(x2, y2, childAngle, childLength, depth + 1, maxDepth, childThreshold, rng, childId);
      branch.children.push(child);
    }
  }

  return branch;
}

// --- Leaf Component with Tap + Animation ---
const LeafWithExplosion: React.FC<{
  cx: number;
  cy: number;
  fill: string;
  side: number;
  angleRad: number;
  scale: number;
  onTap: () => void;
}> = ({ cx, cy, fill, side, angleRad, scale, onTap }) => {
  const sway = useRef(new Animated.Value(0)).current;
  const rustle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(sway, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rustle, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const swayDeg = sway.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', `${side * 10}deg`, '0deg'],
  });

  const rustleX = rustle.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.5 * side, 0],
  });

  const baseAngleDeg = ((angleRad + side * Math.PI / 2) * 180) / Math.PI;

  const transform = [
    { translateX: rustleX },
    { rotate: `${baseAngleDeg}deg` },
    { rotate: swayDeg },
    { scale },
  ];

  return (
    <Pressable onPress={onTap}>
      <Animated.View
        style={{
          position: 'absolute',
          left: cx - CONFIG.LEAF_RADIUS,
          top: cy - CONFIG.LEAF_RADIUS,
          width: CONFIG.LEAF_RADIUS * 2,
          height: CONFIG.LEAF_RADIUS * 2,
          transform,
          pointerEvents: 'auto',
        }}
      >
        <Svg width="100%" height="100%" viewBox="0 0 20 20">
          <Path d="M10 0 L20 10 L10 20 L0 10 Z" fill={fill} />
        </Svg>
      </Animated.View>
    </Pressable>
  );
};

// --- Mini Leaf Explosion Animation ---
const LeafExplosion: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => {
  const particles = Array.from({ length: CONFIG.EXPLOSION_COUNT }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / CONFIG.EXPLOSION_COUNT;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: dx * 30,
          duration: CONFIG.EXPLOSION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: dy * 30,
          duration: CONFIG.EXPLOSION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: CONFIG.EXPLOSION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: CONFIG.EXPLOSION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
          width: 10,
          height: 10,
        }}
      >
        <Svg width="100%" height="100%" viewBox="0 0 20 20">
          <Path d="M10 0 L20 10 L10 20 L0 10 Z" fill={color} />
        </Svg>
      </Animated.View>
    );
  });

  return <>{particles}</>;
};

// --- Main Component ---
const GrowingTree: React.FC<GrowingTreeProps> = ({
  seed,
  points,
  width = 300,
  height = 400,
}) => {
  const [growth, setGrowth] = useState(0);
  const [explosions, setExplosions] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const nextId = useRef(0);
  const animatedGrowth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const target = Math.min(points / CONFIG.MAX_POINTS, 1);
    Animated.timing(animatedGrowth, {
      toValue: target,
      duration: CONFIG.ANIMATION_DURATION,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    const id = animatedGrowth.addListener(({ value }) => {
      setGrowth(value);
    });
    return () => animatedGrowth.removeListener(id);
  }, [points]);

  const tree = useMemo(() => {
    const rng = createSeededRandom(seed);
    return generateBranch(width / 2, height, -Math.PI / 2, height / 3, 0, CONFIG.MAX_DEPTH, 0, rng);
  }, [seed, width, height]);

  const renderTree = (branch: Branch): {
    branches: JSX.Element[];
    leavesFront: JSX.Element[];
    leavesBehind: JSX.Element[];
  } => {
    const branches: JSX.Element[] = [];
    const leavesFront: JSX.Element[] = [];
    const leavesBehind: JSX.Element[] = [];

    const dx = branch.x2 - branch.x1;
    const dy = branch.y2 - branch.y1;
    const angleRad = Math.atan2(dy, dx);
    const f = Math.max(0, Math.min(1, (growth - branch.threshold) / branch.delta));
    if (f > 0) {
      const x = branch.x1 + dx * f;
      const y = branch.y1 + dy * f;
      branches.push(
        <Path
          key={`branch-${branch.id}`}
          d={`M ${branch.x1} ${branch.y1} L ${x} ${y}`}
          stroke="brown"
          strokeWidth={Math.max(2, (CONFIG.MAX_DEPTH - branch.depth + 1) * 2)}
          strokeLinecap="round"
        />
      );
    }

    if (branch.depth > 0) {
      const rng = createSeededRandom(seed + branch.id.length);
      for (let i = 0; i < CONFIG.LEAVES_PER_BRANCH; i++) {
        const t = rng();
        const appearAt = branch.threshold + branch.delta * t;
        if (growth < appearAt) continue;

        const side = getSeededBool(seed, `${branch.id}-leaf-${i}-side`) ? 1 : -1;
        const isFront = getSeededBool(seed, `${branch.id}-leaf-${i}-layer`);
        const fill = getRandomGreen(seed, `${branch.id}-leaf-${i}`);
        const randOffset = 10 + getDeterministicRandom(`${branch.id}-leaf-${i}-offset`) * 4;
        const cx = branch.x1 + dx * t + (-dy / Math.sqrt(dx * dx + dy * dy)) * randOffset * side;
        const cy = branch.y1 + dy * t + (dx / Math.sqrt(dx * dx + dy * dy)) * randOffset * side;
        const heightFactor = 1 - cy / height;
        const randomScale = 0.8 + getDeterministicRandom(`${branch.id}-leaf-${i}-scale`) * 0.4;
        const scale = randomScale + heightFactor * 0.5;

        const leaf = (
          <LeafWithExplosion
            key={`leaf-${branch.id}-${i}`}
            cx={cx}
            cy={cy}
            fill={fill}
            side={side}
            angleRad={angleRad}
            scale={scale}
            onTap={async () => {
              await Haptics.selectionAsync();
              const id = nextId.current++;
              setExplosions((prev) => [...prev, { id, x: cx, y: cy, color: fill }]);
              setTimeout(() => {
                setExplosions((prev) => prev.filter((e) => e.id !== id));
              }, CONFIG.EXPLOSION_DURATION);
            }}
          />
        );

        (isFront ? leavesFront : leavesBehind).push(leaf);
      }
    }

    for (const child of branch.children) {
      const { branches: b, leavesFront: lf, leavesBehind: lb } = renderTree(child);
      branches.push(...b);
      leavesFront.push(...lf);
      leavesBehind.push(...lb);
    }

    return { branches, leavesFront, leavesBehind };
  };

  const { branches, leavesFront, leavesBehind } = renderTree(tree);

  return (
    <View style={{ position: 'relative', width, height }}>
      {leavesBehind}
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {branches}
      </Svg>
      {leavesFront}
      {explosions.map(({ id, x, y, color }) => (
        <LeafExplosion key={id} x={x} y={y} color={color} />
      ))}
    </View>
  );
};

export default GrowingTree;

