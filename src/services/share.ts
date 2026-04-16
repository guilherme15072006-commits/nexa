/**
 * NEXA — Share Service
 *
 * Share picks, stats, stories and referral links outside the app.
 * Uses React Native's built-in Share API for maximum compatibility.
 *
 * Deep link format: https://nexa.app/{type}/{id}
 * - https://nexa.app/pick/{postId}
 * - https://nexa.app/tipster/{tipsterId}
 * - https://nexa.app/match/{matchId}
 * - https://nexa.app/ref/{referralCode}
 */

import { Share, Platform } from 'react-native';
import { hapticSuccess } from './haptics';

const BASE_URL = 'https://nexa.app';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ShareResult {
  shared: boolean;
  method?: string;
}

// ─── Core Share ─────────────────────────────────────────────────────────────

async function shareContent(title: string, message: string, url?: string): Promise<ShareResult> {
  try {
    hapticSuccess();
    const content: { title: string; message: string; url?: string } = {
      title,
      message: url ? `${message}\n\n${url}` : message,
    };
    // iOS supports separate URL field
    if (Platform.OS === 'ios' && url) {
      content.url = url;
      content.message = message;
    }
    const result = await Share.share(content);
    return {
      shared: result.action === Share.sharedAction,
      method: result.action === Share.sharedAction ? (result as any).activityType : undefined,
    };
  } catch {
    return { shared: false };
  }
}

// ─── Share Pick ─────────────────────────────────────────────────────────────

export async function sharePick(params: {
  postId: string;
  tipsterName: string;
  matchName: string;
  side: string;
  odds: number;
}): Promise<ShareResult> {
  const { tipsterName, matchName, side, odds, postId } = params;
  const sideLabel = side === 'home' ? 'Casa' : side === 'away' ? 'Fora' : 'Empate';
  const url = `${BASE_URL}/pick/${postId}`;

  return shareContent(
    `Pick de ${tipsterName}`,
    `${tipsterName} apostou ${sideLabel} em ${matchName} @ ${odds.toFixed(2)}\n\nVeja no NEXA!`,
    url,
  );
}

// ─── Share Stats ────────────────────────────────────────────────────────────

export async function shareStats(params: {
  username: string;
  level: number;
  winRate: number;
  roi: number;
  streak: number;
  rank: number;
}): Promise<ShareResult> {
  const { username, level, winRate, roi, streak, rank } = params;
  const url = `${BASE_URL}/tipster/${username}`;

  return shareContent(
    `Stats de ${username} no NEXA`,
    [
      `${username} — Level ${level}`,
      `Win Rate: ${Math.round(winRate * 100)}%`,
      `ROI: ${roi >= 0 ? '+' : ''}${Math.round(roi * 100)}%`,
      `Streak: ${streak} dias`,
      `Ranking: #${rank}`,
      '',
      'Confira no NEXA!',
    ].join('\n'),
    url,
  );
}

// ─── Share Match ────────────────────────────────────────────────────────────

export async function shareMatch(params: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  odds: { home: number; draw: number; away: number };
}): Promise<ShareResult> {
  const { matchId, homeTeam, awayTeam, league, odds } = params;
  const url = `${BASE_URL}/match/${matchId}`;

  return shareContent(
    `${homeTeam} vs ${awayTeam}`,
    [
      `${league}`,
      `${homeTeam} vs ${awayTeam}`,
      `Odds: ${odds.home.toFixed(2)} | ${odds.draw.toFixed(2)} | ${odds.away.toFixed(2)}`,
      '',
      'Aposte no NEXA!',
    ].join('\n'),
    url,
  );
}

// ─── Share Referral ─────────────────────────────────────────────────────────

export async function shareReferral(params: {
  code: string;
  username: string;
}): Promise<ShareResult> {
  const { code, username } = params;
  const url = `${BASE_URL}/ref/${code}`;

  return shareContent(
    'Convite NEXA',
    `${username} te convidou pro NEXA! Crie sua conta e ganhe 200 coins de bonus.`,
    url,
  );
}

// ─── Share Story ────────────────────────────────────────────────────────────

export async function shareStory(params: {
  storyId: string;
  tipsterName: string;
  content: string;
}): Promise<ShareResult> {
  const { storyId, tipsterName, content } = params;
  const url = `${BASE_URL}/story/${storyId}`;

  return shareContent(
    `Story de ${tipsterName}`,
    `${tipsterName}: "${content.slice(0, 100)}${content.length > 100 ? '...' : ''}"\n\nVeja no NEXA!`,
    url,
  );
}
