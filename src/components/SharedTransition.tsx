/**
 * SharedTransition — Hero animations between screens
 *
 * Uses Reanimated's sharedTransitionTag to animate elements
 * between source screen (card) and destination screen (detail).
 *
 * Usage:
 *   Source:  <SharedView tag="avatar-tipster-1"><Avatar /></SharedView>
 *   Target:  <SharedView tag="avatar-tipster-1"><Avatar /></SharedView>
 *
 * The tag MUST be identical on both screens for the animation to work.
 *
 * REFERENCE: Apple's hero transitions, Linear's card-to-detail
 */

import React from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import Reanimated, { SharedTransition } from 'react-native-reanimated';

// ─── Transition config (smooth spring) ───────────────────────────────────────

const heroTransition = SharedTransition.duration(350).springify().damping(18).stiffness(120);

// ─── SharedView — wrapper for shared elements ────────────────────────────────

interface SharedViewProps {
  tag: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SharedView({ tag, children, style }: SharedViewProps) {
  return (
    <Reanimated.View
      sharedTransitionTag={tag}
      sharedTransitionStyle={heroTransition}
      style={style}
    >
      {children}
    </Reanimated.View>
  );
}

// ─── SharedText — for animated text elements ─────────────────────────────────

interface SharedTextProps {
  tag: string;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export function SharedText({ tag, children, style, numberOfLines }: SharedTextProps) {
  return (
    <Reanimated.Text
      sharedTransitionTag={tag}
      sharedTransitionStyle={heroTransition}
      style={style}
      numberOfLines={numberOfLines}
    >
      {children}
    </Reanimated.Text>
  );
}

// ─── Tag helpers (consistent naming) ─────────────────────────────────────────

export const sharedTags = {
  tipsterAvatar: (id: string) => `tipster-avatar-${id}`,
  tipsterName: (id: string) => `tipster-name-${id}`,
  tipsterTier: (id: string) => `tipster-tier-${id}`,
  clanBadge: (id: string) => `clan-badge-${id}`,
  clanName: (id: string) => `clan-name-${id}`,
  matchCard: (id: string) => `match-card-${id}`,
};
