import { Platform } from 'react-native';
import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback', true);

// ─── Sound cache ──────────────────────────────────────────────────────────────

const cache: Record<string, Sound | null> = {};

function load(name: string): Sound | null {
  if (cache[name] !== undefined) return cache[name];

  try {
    const basePath = Platform.OS === 'android' ? name : `${name}.mp3`;
    const s = new Sound(basePath, Sound.MAIN_BUNDLE, (err) => {
      if (err) {
        cache[name] = null;
      }
    });
    s.setVolume(0.6);
    cache[name] = s;
    return s;
  } catch {
    cache[name] = null;
    return null;
  }
}

function play(name: string) {
  const s = load(name);
  if (s) {
    s.stop(() => {
      s.play();
    });
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Short bright tone — XP gain, like, small reward */
export function playXPGain() {
  play('xp_gain');
}

/** Rising chime — level up */
export function playLevelUp() {
  play('level_up');
}

/** Achievement unlock — mission complete, badge earned */
export function playMissionComplete() {
  play('mission_complete');
}

/** Satisfying click — bet placed, confirmed */
export function playBetPlaced() {
  play('bet_placed');
}

/** Social pop — copy bet, follow */
export function playSocialAction() {
  play('social_action');
}

/** Streak fire — streak milestone */
export function playStreakFire() {
  play('streak_fire');
}

/** Check-in chime */
export function playCheckin() {
  play('checkin');
}

/** Confetti celebration — ascending arpeggio */
export function playCelebration() {
  play('celebration');
}

/** Short pop — micro celebration, confetti burst */
export function playCelebrationPop() {
  play('celebration_pop');
}

/** Onboarding complete — triumphant fanfare */
export function playOnboardingComplete() {
  play('onboarding_complete');
}
