import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';


/** CONFIGURABLE CONSTANTS **/
const CONFIG = {
  MAX_POINTS: 1000,           // Points required for full global growth.
  MAX_DEPTH: 5,               // Maximum branch recursion depth.
  BRANCH_DELTA: 0.2,          // Fractional growth duration for each branch.
  ANIMATION_DURATION: 1000,   // Global growth animation duration (ms).
  EXTRA_GROWTH_SCALE: 0.2,    // How much extra growth (above branch full growth)
                              // is needed for the bush to reach full density.
  LEAF: {
    baseLeafRadius: 10,       // Base leaf radius (at full density).
    maxBushLeaves: 10,        // Maximum leaves per ring.
    minRingLeaves: 4,         // Minimum leaves per ring.
    ringSpacing: 8,           // Spacing between successive rings (in pixels).
    ringCountFactor: 1,       // Multiplier for number of rings: rings = depth * factor.
  },
};


/** THEME TYPE **/
export type TreeTheme = {
  leafColors: string[];       // Array of available leaf colors.
  baseLeafRadius?: number;    // Overrides CONFIG.LEAF.baseLeafRadius.
  maxBushLeaves?: number;     // Overrides CONFIG.LEAF.maxBushLeaves.
  minRingLeaves?: number;     // Overrides CONFIG.LEAF.minRingLeaves.
  ringSpacing?: number;       // Overrides CONFIG.LEAF.ringSpacing.
  ringCountFactor?: number;   // Overrides CONFIG.LEAF.ringCountFactor.
};


/** PROPS **/
export interface GrowingTreeProps {
  seed: number;       // Unique seed for deterministic tree shape/colors.
  points: number;     // Global points driving growth (0 to MAX_POINTS).
  width?: number;
  height?: number;
  theme?: TreeTheme;
}


/** INTERNAL BRANCH TYPE **/
interface Branch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  threshold: number; // Global growth value when this branch starts.
  delta: number;     // How long (in global growth fraction) for this branch to fully appear.
  depth: number;     // Depth (used for styling and for determining ring count).
  children: Branch[];
}


/** HELPER: Seeded Random Generator **/
function createSeededRandom(seed: number): () => number {
  let value = seed;
  return function () {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}


/** RECURSIVELY GENERATE THE TREE STRUCTURE **/
function generateBranch(
  x1: number,
  y1: number,
  angle: number,
  length: number,
  depth: number,
  maxDepth: number,
  threshold: number,
  rng: () => number
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
  };


  if (depth < maxDepth) {
    const numChildren = 2;
    for (let i = 0; i < numChildren; i++) {
      const angleOffset = (15 + rng() * 30) * (Math.PI / 180);
      const childAngle = angle + (i === 0 ? -angleOffset : angleOffset);
      const childLength = length * (0.7 + rng() * 0.2);
      const childThreshold = threshold + branch.delta;
      const child = generateBranch(x2, y2, childAngle, childLength, depth + 1, maxDepth, childThreshold, rng);
      branch.children.push(child);
    }
  }
  return branch;
}


/** HELPER: Deterministic Random Number (0–1) from a String **/
function getDeterministicRandom(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 1000) / 1000;
}


/** HELPER: Pick a Leaf Color Deterministically **/
function getLeafColor(seed: number, identifier: string, theme: TreeTheme): string {
  const input = `${seed}-${identifier}-color`;
  const rand = getDeterministicRandom(input);
  const colors = theme.leafColors;
  const index = Math.floor(rand * colors.length);
  return colors[index];
}


/** ANIMATED LEAF COMPONENT **/
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
interface AnimatedLeafProps {
  cx: number;
  cy: number;
  radius: number;
  fill: string;
}
const AnimatedLeaf: React.FC<AnimatedLeafProps> = ({ cx, cy, radius, fill }) => {
  const radiusAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(radiusAnim, {
      toValue: radius,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // SVG attributes cannot be natively animated.
    }).start();
  }, [radius, radiusAnim]);
  return <AnimatedCircle cx={cx} cy={cy} r={radiusAnim} fill={fill} />;
};


/** TYPES FOR COLLECTING LEAF GROUPS **/
interface LeafGroups {
  behind: JSX.Element[]; // Rendered behind branches.
  front: JSX.Element[];  // Rendered in front (only the first ring).
}


/** COLLECT LEAVES FOR A TERMINAL (ENDPOINT) BRANCH.
 *  - Skips if this is the first endpoint (key === "0").
 *  - Always renders one central leaf (behind) at the endpoint.
 *  - Then generates additional rings (number of rings = branch.depth * factor).
 *    The first ring is rendered in front; subsequent rings behind.
 *  - Leaf density (and size) is scaled by extra growth above the branch’s full growth.
 */
function collectEndpointLeaves(
  branch: Branch,
  key: string,
  growth: number,
  seed: number,
  theme: TreeTheme
): LeafGroups {
  const groups: LeafGroups = { behind: [], front: [] };


  // Only generate leaves if the branch is fully grown
  // (i.e. if global growth exceeds branch.threshold + branch.delta).
  if (growth < branch.threshold + branch.delta) return groups;


  const baseLeafRadius = theme.baseLeafRadius || CONFIG.LEAF.baseLeafRadius;
  const maxBushLeaves = theme.maxBushLeaves || CONFIG.LEAF.maxBushLeaves;
  const minRingLeaves = theme.minRingLeaves || CONFIG.LEAF.minRingLeaves;
  const ringSpacing = theme.ringSpacing || CONFIG.LEAF.ringSpacing;
  const ringCountFactor = theme.ringCountFactor || CONFIG.LEAF.ringCountFactor;
  // Number of rings based on branch depth.
  const ringCount = branch.depth * ringCountFactor;


  // Always render a central leaf at the endpoint (behind).
  groups.behind.push(
    <AnimatedLeaf
      key={`central-${key}`}
      cx={branch.x2}
      cy={branch.y2}
      radius={baseLeafRadius}
      fill={getLeafColor(seed, `${key}-central`, theme)}
    />
  );


  // Determine extra growth beyond branch full growth.
  // This extra growth (scaled by EXTRA_GROWTH_SCALE) drives the bush density.
  const extraGrowth = growth - (branch.threshold + branch.delta);
  let leafDensity = extraGrowth / CONFIG.EXTRA_GROWTH_SCALE;
  leafDensity = Math.max(0, Math.min(1, leafDensity)); // Clamp between 0 and 1.


  // Determine the number of leaves per ring.
  const ringLeavesCount = Math.floor(minRingLeaves + leafDensity * (maxBushLeaves - minRingLeaves));


  // Generate rings (from 1 to ringCount).
  for (let ring = 1; ring <= ringCount; ring++) {
    const ringElements: JSX.Element[] = [];
    const ringRadius = ring * ringSpacing;
    for (let i = 0; i < ringLeavesCount; i++) {
      const baseAngle = (2 * Math.PI * i) / ringLeavesCount;
      const randomOffset = (getDeterministicRandom(`${seed}-${key}-ring${ring}-leaf${i}-angle`) - 0.5) * (Math.PI / 8);
      const angle = baseAngle + randomOffset;
      const leafCx = branch.x2 + ringRadius * Math.cos(angle);
      const leafCy = branch.y2 + ringRadius * Math.sin(angle);
      const randomScale = 0.8 + getDeterministicRandom(`${seed}-${key}-ring${ring}-leaf${i}-scale`) * 0.4;
      const leafRadius = baseLeafRadius * randomScale * leafDensity;
      const color = getLeafColor(seed, `${key}-ring${ring}-leaf${i}`, theme);
      const leafElement = (
        <AnimatedLeaf
          key={`leaf-${key}-ring${ring}-leaf${i}`}
          cx={leafCx}
          cy={leafCy}
          radius={leafRadius}
          fill={color}
        />
      );
      // First ring goes in front; subsequent rings behind.
      if (ring === 1) {
        groups.front.push(leafElement);
      } else {
        groups.behind.push(leafElement);
      }
    }
  }
  return groups;
}


/** RECURSIVE FUNCTION TO COLLECT TREE ELEMENTS.
 *  Returns three arrays:
 *    • branchElements: SVG Paths for branches.
 *    • leavesBehind: Leaves to render behind branches.
 *    • leavesFront: Leaves to render in front.
 */
interface TreeRenderResult {
  branchElements: JSX.Element[];
  leavesBehind: JSX.Element[];
  leavesFront: JSX.Element[];
}


function renderTreeElements(
  branch: Branch,
  key: string,
  growth: number,
  seed: number,
  theme: TreeTheme
): TreeRenderResult {
  const result: TreeRenderResult = { branchElements: [], leavesBehind: [], leavesFront: [] };


  // Compute growth fraction for this branch.
  const f = Math.max(0, Math.min(1, (growth - branch.threshold) / branch.delta));
  if (f <= 0) return result; // Not visible yet.


  // Interpolate the current endpoint of this branch.
  const currentX = branch.x1 + (branch.x2 - branch.x1) * f;
  const currentY = branch.y1 + (branch.y2 - branch.y1) * f;
  const strokeWidth = Math.max(2, (CONFIG.MAX_DEPTH - branch.depth + 1) * 2);
  const branchElement = (
    <Path
      key={`branch-${key}`}
      d={`M ${branch.x1} ${branch.y1} L ${currentX} ${currentY}`}
      stroke="brown"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
  result.branchElements.push(branchElement);


  // Only process children (or terminal leaves) when the branch is fully grown.
  if (growth >= branch.threshold + branch.delta - 0.001) {
    if (branch.children.length > 0) {
      branch.children.forEach((child, index) => {
        const childKey = `${key}-${index}`;
        const childResult = renderTreeElements(child, childKey, growth, seed, theme);
        result.branchElements.push(...childResult.branchElements);
        result.leavesBehind.push(...childResult.leavesBehind);
        result.leavesFront.push(...childResult.leavesFront);
      });
    } else {
      // Terminal branch: if not the first endpoint (key "0"), generate leaves.
      if (key !== "0") {
        const leafGroups = collectEndpointLeaves(branch, key, growth, seed, theme);
        result.leavesBehind.push(...leafGroups.behind);
        result.leavesFront.push(...leafGroups.front);
      }
    }
  }
  return result;
}


/** MAIN COMPONENT **/
const GrowingTree: React.FC<GrowingTreeProps> = ({
  seed,
  points,
  width = 300,
  height = 400,
  theme,
}) => {
  // Merge default theme values with any provided overrides.
  const defaultTheme: TreeTheme = {
    leafColors: ['#4CAF50', '#8BC34A', '#CDDC39'],
    baseLeafRadius: CONFIG.LEAF.baseLeafRadius,
    maxBushLeaves: CONFIG.LEAF.maxBushLeaves,
    minRingLeaves: CONFIG.LEAF.minRingLeaves,
    ringSpacing: CONFIG.LEAF.ringSpacing,
    ringCountFactor: CONFIG.LEAF.ringCountFactor,
  };
  const treeTheme: TreeTheme = theme ? { ...defaultTheme, ...theme } : defaultTheme;


  // Global growth value (0–1) animated from the points.
  const [growth, setGrowth] = useState(0);
  const animatedGrowth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const newGrowth = Math.min(points / CONFIG.MAX_POINTS, 1);
    Animated.timing(animatedGrowth, {
      toValue: newGrowth,
      duration: CONFIG.ANIMATION_DURATION,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    const listenerId = animatedGrowth.addListener(({ value }) => {
      setGrowth(value);
    });
    return () => {
      animatedGrowth.removeListener(listenerId);
    };
  }, [points, animatedGrowth]);


  // Build the tree structure.
  const trunkLength = height / 3;
  const tree = useMemo(() => {
    const rng = createSeededRandom(seed);
    // Start at the bottom center and grow upward (angle = -90°).
    return generateBranch(width / 2, height, -Math.PI / 2, trunkLength, 0, CONFIG.MAX_DEPTH, 0, rng);
  }, [seed, width, height, trunkLength]);


  // Collect tree elements recursively.
  const treeRender = renderTreeElements(tree, "0", growth, seed, treeTheme);


  return (
    <View>
      <Svg width={width} height={height}>
        {/* Leaves behind branches */}
        {treeRender.leavesBehind}
        {/* Branch paths */}
        {treeRender.branchElements}
        {/* Leaves in front (only the first ring) */}
        {treeRender.leavesFront}
      </Svg>
    </View>
  );
};


export default GrowingTree;

