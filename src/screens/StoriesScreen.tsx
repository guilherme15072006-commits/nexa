import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '../components/ui';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { hapticLight, hapticMedium } from '../services/haptics';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, Story, StorySlide } from '../store/nexaStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_DURATION = 5000;

// ─── Story Circle (bar item) ────────────────────────────────────────────────

interface StoryCircleProps {
  story: Story;
  onPress: () => void;
  isActive: boolean;
}

function StoryCircle({ story, onPress, isActive }: StoryCircleProps) {
  const ringColor = story.viewed ? colors.textMuted : colors.primary;
  return (
    <TapScale onPress={onPress}>
      <View style={styles.circleWrapper}>
        <View
          style={[
            styles.circleRing,
            { borderColor: ringColor },
            isActive && styles.circleRingActive,
          ]}
        >
          <Avatar uri={story.user.avatar} size={56} username={story.user.username} />
        </View>
        <Text style={styles.circleUsername} numberOfLines={1}>
          {story.user.username}
        </Text>
        {story.user.tier && (
          <View style={[styles.tierDot, { backgroundColor: story.user.tier === 'elite' ? colors.primary : colors.gold }]} />
        )}
      </View>
    </TapScale>
  );
}

// ─── Poll Bar ────────────────────────────────────────────────────────────────

interface PollBarProps {
  label: string;
  votes: number;
  totalVotes: number;
  index: number;
}

function PollBar({ label, votes, totalVotes, index }: PollBarProps) {
  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: percentage,
      duration: 800,
      delay: index * 150,
      useNativeDriver: false,
    }).start();
  }, [percentage, index]);

  const animatedWidth = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.pollOption}>
      <View style={styles.pollBarBg}>
        <Animated.View
          style={[
            styles.pollBarFill,
            { width: animatedWidth },
          ]}
        />
        <View style={styles.pollBarContent}>
          <Text style={styles.pollLabel}>{label}</Text>
          <Text style={styles.pollVotes}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Progress Segments ──────────────────────────────────────────────────────

interface ProgressSegmentsProps {
  total: number;
  current: number;
  progress: number; // 0–1 for current segment
}

function ProgressSegments({ total, current, progress }: ProgressSegmentsProps) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: total }).map((_, i) => {
        let fillWidth = '0%';
        if (i < current) fillWidth = '100%';
        else if (i === current) fillWidth = `${progress * 100}%`;
        return (
          <View key={i} style={styles.progressSegment}>
            <View style={[styles.progressFill, { width: fillWidth as any }]} />
          </View>
        );
      })}
    </View>
  );
}

// ─── Slide Content ──────────────────────────────────────────────────────────

interface SlideContentProps {
  slide: StorySlide;
  story: Story;
  onBet: () => void;
}

function SlideContent({ slide, story, onBet }: SlideContentProps) {
  const totalVotes = slide.pollOptions
    ? slide.pollOptions.reduce((sum, o) => sum + o.votes, 0)
    : 0;

  return (
    <View style={[styles.slideContainer, { backgroundColor: slide.backgroundColor }]}>
      {/* Type badge */}
      <View style={styles.slideTypeBadge}>
        <Text style={styles.slideTypeText}>
          {slide.type === 'pick' ? '🎯 Pick' :
           slide.type === 'analysis' ? '📊 Análise' :
           slide.type === 'reaction' ? '🔥 Reação' : '📊 Enquete'}
        </Text>
      </View>

      {/* Content */}
      <Text style={styles.slideContent}>{slide.content}</Text>

      {/* Poll options */}
      {slide.type === 'poll' && slide.pollOptions && (
        <View style={styles.pollContainer}>
          {slide.pollOptions.map((option, i) => (
            <PollBar
              key={option.label}
              label={option.label}
              votes={option.votes}
              totalVotes={totalVotes}
              index={i}
            />
          ))}
          <Text style={styles.pollTotal}>{totalVotes.toLocaleString()} votos</Text>
        </View>
      )}

      {/* Bet button on pick slides */}
      {slide.type === 'pick' && slide.matchId && (
        <TapScale onPress={onBet}>
          <View style={styles.betButton}>
            <Text style={styles.betButtonText}>Apostar agora</Text>
          </View>
        </TapScale>
      )}
    </View>
  );
}

// ─── Story Viewer (full screen) ─────────────────────────────────────────────

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [storyIndex, setStoryIndex] = useState(initialIndex);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewStory = useNexaStore((s) => s.viewStory);
  const trackEvent = useNexaStore((s) => s.trackEvent);
  const navigation = useNavigation<any>();

  const currentStory = stories[storyIndex];
  const currentSlide = currentStory?.slides[slideIndex];

  // Mark viewed on mount and story change
  useEffect(() => {
    if (currentStory) {
      viewStory(currentStory.id);
      trackEvent('story_view', { storyId: currentStory.id, userId: currentStory.user.id });
    }
  }, [storyIndex]);

  // Auto-advance timer
  useEffect(() => {
    if (!currentStory) return;
    setSlideProgress(0);
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SLIDE_DURATION, 1);
      setSlideProgress(progress);

      if (progress >= 1) {
        goNextSlide();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [storyIndex, slideIndex]);

  const animateTransition = useCallback((callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  const goNextSlide = useCallback(() => {
    if (!currentStory) return;
    if (slideIndex < currentStory.slides.length - 1) {
      animateTransition(() => setSlideIndex((prev) => prev + 1));
    } else if (storyIndex < stories.length - 1) {
      animateTransition(() => {
        setStoryIndex((prev) => prev + 1);
        setSlideIndex(0);
      });
    } else {
      onClose();
    }
    hapticLight();
    trackEvent('story_next_slide');
  }, [currentStory, slideIndex, storyIndex, stories.length]);

  const goPrevSlide = useCallback(() => {
    if (slideIndex > 0) {
      animateTransition(() => setSlideIndex((prev) => prev - 1));
    } else if (storyIndex > 0) {
      animateTransition(() => {
        setStoryIndex((prev) => prev - 1);
        setSlideIndex(0);
      });
    }
    hapticLight();
    trackEvent('story_prev_slide');
  }, [slideIndex, storyIndex]);

  // Swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 20 && gesture.dy > 0,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) {
          onClose();
        }
      },
    }),
  ).current;

  const handleTap = useCallback(
    (evt: any) => {
      const x = evt.nativeEvent.locationX;
      if (x < SCREEN_WIDTH * 0.35) {
        goPrevSlide();
      } else {
        goNextSlide();
      }
    },
    [goPrevSlide, goNextSlide],
  );

  const handleBet = useCallback(() => {
    hapticMedium();
    trackEvent('story_bet_tap', { matchId: currentSlide?.matchId || '' });
    onClose();
    // navigate to match in apostas
  }, [currentSlide]);

  if (!currentStory || !currentSlide) return null;

  return (
    <View style={styles.viewerContainer} {...panResponder.panHandlers}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleTap}
        style={StyleSheet.absoluteFill}
      >
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <SlideContent slide={currentSlide} story={currentStory} onBet={handleBet} />
        </Animated.View>
      </TouchableOpacity>

      {/* Progress bar */}
      <SafeAreaView edges={['top']} style={styles.viewerTopBar}>
        <ProgressSegments
          total={currentStory.slides.length}
          current={slideIndex}
          progress={slideProgress}
        />

        {/* User info + close */}
        <View style={styles.viewerUserRow}>
          <Avatar uri={currentStory.user.avatar} size={32} username={currentStory.user.username} />
          <Text style={styles.viewerUsername}>{currentStory.user.username}</Text>
          {currentStory.user.tier && (
            <View style={[styles.viewerTierBadge, {
              backgroundColor: currentStory.user.tier === 'elite' ? colors.primary : colors.gold,
            }]}>
              <Text style={styles.viewerTierText}>{currentStory.user.tier.toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom: reactions */}
      <SafeAreaView edges={['bottom']} style={styles.viewerBottom}>
        <View style={styles.reactionRow}>
          <TouchableOpacity style={styles.reactionBtn} onPress={() => { hapticLight(); trackEvent('story_reaction', { type: 'fire' }); }}>
            <Text style={styles.reactionEmoji}>🔥</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionBtn} onPress={() => { hapticLight(); trackEvent('story_reaction', { type: 'clap' }); }}>
            <Text style={styles.reactionEmoji}>👏</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionBtn} onPress={() => { hapticLight(); trackEvent('story_reaction', { type: 'money' }); }}>
            <Text style={styles.reactionEmoji}>💰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionBtn} onPress={() => { hapticLight(); trackEvent('story_reaction', { type: 'think' }); }}>
            <Text style={styles.reactionEmoji}>🤔</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Stories Screen ─────────────────────────────────────────────────────────

export default function StoriesScreen() {
  const stories = useNexaStore((s) => s.stories);
  const activeStoryIndex = useNexaStore((s) => s.activeStoryIndex);
  const trackEvent = useNexaStore((s) => s.trackEvent);
  const navigation = useNavigation<any>();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Sort: unviewed first, then by recency
  const sortedStories = [...stories].sort((a, b) => {
    if (a.viewed !== b.viewed) return a.viewed ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  const handleOpenStory = useCallback((index: number) => {
    hapticLight();
    setViewerInitialIndex(index);
    setViewerOpen(true);
    trackEvent('story_open', { storyId: sortedStories[index]?.id || '' });
  }, [sortedStories]);

  const handleCloseViewer = useCallback(() => {
    setViewerOpen(false);
  }, []);

  // If navigated with activeStoryIndex, auto-open
  useEffect(() => {
    if (activeStoryIndex !== null) {
      setViewerInitialIndex(activeStoryIndex);
      setViewerOpen(true);
    }
  }, [activeStoryIndex]);

  if (viewerOpen) {
    return (
      <StoryViewer
        stories={sortedStories}
        initialIndex={viewerInitialIndex}
        onClose={handleCloseViewer}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtn}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stories</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Stories bar */}
      <SmoothEntry delay={0}>
        <View style={styles.storiesBarWrap}>
          <Text style={styles.sectionLabel}>Novos</Text>
          <View style={styles.storiesBar}>
            {sortedStories.filter((s) => !s.viewed).map((story, i) => (
              <StoryCircle
                key={story.id}
                story={story}
                isActive={false}
                onPress={() => handleOpenStory(sortedStories.indexOf(story))}
              />
            ))}
          </View>
        </View>
      </SmoothEntry>

      <SmoothEntry delay={100}>
        <View style={styles.storiesBarWrap}>
          <Text style={styles.sectionLabel}>Vistos</Text>
          <View style={styles.storiesBar}>
            {sortedStories.filter((s) => s.viewed).map((story, i) => (
              <StoryCircle
                key={story.id}
                story={story}
                isActive={false}
                onPress={() => handleOpenStory(sortedStories.indexOf(story))}
              />
            ))}
          </View>
        </View>
      </SmoothEntry>

      {/* Quick info */}
      <SmoothEntry delay={200}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como funciona</Text>
          <Text style={styles.infoText}>
            Stories expiram em 24h. Tipsters Elite e Gold compartilham picks, análises e reações ao vivo. Toque para navegar entre slides.
          </Text>
        </View>
      </SmoothEntry>

      {/* Recent stories grid */}
      <SmoothEntry delay={300}>
        <View style={styles.gridSection}>
          <Text style={styles.sectionLabel}>Destaques recentes</Text>
          <View style={styles.grid}>
            {sortedStories.slice(0, 4).map((story) => (
              <TapScale
                key={story.id}
                onPress={() => handleOpenStory(sortedStories.indexOf(story))}
                style={styles.gridItem}
              >
                <View style={[styles.gridCard, { backgroundColor: story.slides[0]?.backgroundColor || colors.bgCard }]}>
                  <Text style={styles.gridCardType}>
                    {story.slides[0]?.type === 'pick' ? '🎯' :
                     story.slides[0]?.type === 'analysis' ? '📊' :
                     story.slides[0]?.type === 'reaction' ? '🔥' : '📊'}
                  </Text>
                  <Text style={styles.gridCardText} numberOfLines={2}>
                    {story.slides[0]?.content || ''}
                  </Text>
                  <View style={styles.gridCardFooter}>
                    <Avatar uri={story.user.avatar} size={20} username={story.user.username} />
                    <Text style={styles.gridCardUser} numberOfLines={1}>{story.user.username}</Text>
                  </View>
                </View>
              </TapScale>
            ))}
          </View>
        </View>
      </SmoothEntry>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 22,
  },
  headerTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 18,
  },

  // Stories bar
  storiesBarWrap: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionLabel: {
    ...typography.bodySemiBold,
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  storiesBar: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  circleWrapper: {
    alignItems: 'center',
    width: 72,
    position: 'relative',
  },
  circleRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleRingActive: {
    borderWidth: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  circleUsername: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  tierDot: {
    position: 'absolute',
    top: 0,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.bg,
  },

  // Info card
  infoCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  // Grid
  gridSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2,
  },
  gridCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    height: 140,
    justifyContent: 'space-between',
  },
  gridCardType: {
    fontSize: 24,
  },
  gridCardText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  gridCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridCardUser: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },

  // ─── Viewer ──────────────────────────────────────────────────────────────

  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewerTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  viewerUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  viewerUsername: {
    ...typography.bodySemiBold,
    color: '#fff',
    fontSize: 14,
  },
  viewerTierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  viewerTierText: {
    ...typography.monoBold,
    color: '#fff',
    fontSize: 9,
  },
  closeBtn: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  viewerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  reactionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  reactionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 22,
  },

  // ─── Progress ────────────────────────────────────────────────────────────

  progressContainer: {
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.xs,
  },
  progressSegment: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },

  // ─── Slide ───────────────────────────────────────────────────────────────

  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 100,
    paddingBottom: 100,
  },
  slideTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  slideTypeText: {
    ...typography.bodySemiBold,
    color: '#fff',
    fontSize: 12,
  },
  slideContent: {
    ...typography.display,
    color: '#fff',
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 36,
  },

  // ─── Poll ────────────────────────────────────────────────────────────────

  pollContainer: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  pollOption: {
    width: '100%',
  },
  pollBarBg: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 44,
    overflow: 'hidden',
    position: 'relative',
  },
  pollBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(124,92,252,0.5)',
    borderRadius: radius.md,
  },
  pollBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 44,
  },
  pollLabel: {
    ...typography.bodySemiBold,
    color: '#fff',
    fontSize: 14,
  },
  pollVotes: {
    ...typography.monoBold,
    color: '#fff',
    fontSize: 14,
  },
  pollTotal: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // ─── Bet Button ──────────────────────────────────────────────────────────

  betButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  betButtonText: {
    ...typography.displayMedium,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
