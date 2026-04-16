/**
 * NEXA Media System
 *
 * Dominio independente. Sons, haptics, imagens, sharing.
 *
 * Modulos internos:
 * - hapticEngine  → 7 tipos de feedback tatil
 * - soundEngine   → 10 sound effects com caching
 * - imageCache    → FastImage wrapper + preload
 * - shareService  → Share externo (picks, stats, referral)
 *
 * Uso: import { mediaSystem } from './services/media';
 */

// ─── Re-export existing services ────────────────────────────

export { hapticLight, hapticMedium, hapticHeavy, hapticSuccess, hapticWarning, hapticError, hapticSelection } from '../haptics';
export { sharePick, shareStats, shareMatch, shareReferral, shareStory } from '../share';
export { CachedImage, preloadImages, clearImageCache } from '../../components/CachedImage';

// ─── Types ──────────────────────────────────────────────────

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';
export type SoundType = 'xp_gain' | 'level_up' | 'bet_placed' | 'social_action' | 'streak_fire' | 'checkin' | 'celebration' | 'celebration_pop' | 'onboarding_complete' | 'mission_complete';

// ─── Orchestrator ───────────────────────────────────────────

class MediaSystem {
  /** Play haptic by type */
  haptic(type: HapticType): void {
    const { hapticLight, hapticMedium, hapticHeavy, hapticSuccess, hapticWarning, hapticError, hapticSelection } = require('../haptics');
    const map: Record<HapticType, () => void> = {
      light: hapticLight, medium: hapticMedium, heavy: hapticHeavy,
      success: hapticSuccess, warning: hapticWarning, error: hapticError, selection: hapticSelection,
    };
    map[type]?.();
  }

  /** Play sound by type */
  sound(type: SoundType): void {
    try {
      const sounds = require('../sounds');
      const map: Record<string, () => void> = {
        xp_gain: sounds.playXPGain,
        level_up: sounds.playLevelUp,
        bet_placed: sounds.playBet,
        social_action: sounds.playSocialAction,
        checkin: sounds.playCheckin,
        celebration: sounds.playCelebrationPop,
        celebration_pop: sounds.playCelebrationPop,
        onboarding_complete: sounds.playOnboardingComplete,
      };
      map[type]?.();
    } catch { /* sound not available */ }
  }

  /** Share content externally */
  async share(type: 'pick' | 'stats' | 'match' | 'referral' | 'story', params: any): Promise<boolean> {
    try {
      const shareModule = require('../share');
      const map: Record<string, (p: any) => Promise<{ shared: boolean }>> = {
        pick: shareModule.sharePick,
        stats: shareModule.shareStats,
        match: shareModule.shareMatch,
        referral: shareModule.shareReferral,
        story: shareModule.shareStory,
      };
      const result = await map[type]?.(params);
      return result?.shared ?? false;
    } catch {
      return false;
    }
  }
}

export const mediaSystem = new MediaSystem();
