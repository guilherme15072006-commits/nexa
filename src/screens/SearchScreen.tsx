import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, SearchResult } from '../store/nexaStore';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { Card } from '../components/ui';
import { SkeletonList } from '../components/SkeletonLoader';
import { SharedView, SharedText, sharedTags } from '../components/SharedTransition';
import { hapticLight } from '../services/haptics';

// ─── Constants ──────────────────────────────────────────────────────────────

const RESULT_TYPE_LABELS: Record<SearchResult['type'], string> = {
  match: 'Partidas',
  tipster: 'Tipsters',
  user: 'Usuarios',
  clan: 'Clas',
};

const RESULT_TYPE_ORDER: SearchResult['type'][] = ['match', 'tipster', 'clan', 'user'];

// ─── Component ──────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);

  const isLoading = useNexaStore((s) => s.isLoading);
  const searchQuery = useNexaStore((s) => s.searchQuery);
  const searchResults = useNexaStore((s) => s.searchResults);
  const trendingSearches = useNexaStore((s) => s.trendingSearches);
  const tipsters = useNexaStore((s) => s.tipsters);
  const search = useNexaStore((s) => s.search);
  const clearSearch = useNexaStore((s) => s.clearSearch);

  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Suggested tipsters (not following)
  const suggestedTipsters = useMemo(
    () => tipsters.filter((t) => !t.isFollowing).slice(0, 4),
    [tipsters],
  );

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    searchResults.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [searchResults]);

  const handleSearch = useCallback(
    (text: string) => {
      setLocalQuery(text);
      search(text);
    },
    [search],
  );

  const handleTrendingPress = useCallback(
    (term: string) => {
      hapticLight();
      setLocalQuery(term);
      search(term);
    },
    [search],
  );

  const handleClear = useCallback(() => {
    hapticLight();
    setLocalQuery('');
    clearSearch();
    inputRef.current?.focus();
  }, [clearSearch]);

  const handleGoBack = useCallback(() => {
    hapticLight();
    clearSearch();
    navigation.goBack();
  }, [navigation, clearSearch]);

  const handleResultPress = useCallback(
    (result: SearchResult) => {
      hapticLight();
      if (result.type === 'tipster') {
        navigation.navigate('TipsterProfile', { tipsterId: result.id });
      } else if (result.type === 'clan') {
        navigation.navigate('ClanDetail', { clanId: result.id });
      }
      // match/user — could navigate to match detail in the future
    },
    [navigation],
  );

  const handleSuggestedPress = useCallback(
    (tipsterId: string) => {
      hapticLight();
      navigation.navigate('TipsterProfile', { tipsterId });
    },
    [navigation],
  );

  const hasResults = searchResults.length > 0;
  const hasQuery = localQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header + Search Input */}
      <SmoothEntry delay={0}>
        <View style={styles.header}>
          <TapScale onPress={handleGoBack}>
            <View style={styles.backButton}>
              <Text style={styles.backIcon}>{'<'}</Text>
            </View>
          </TapScale>
          <View style={styles.searchInputWrap}>
            <Text style={styles.searchIcon}>{'O'}</Text>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              value={localQuery}
              onChangeText={handleSearch}
              placeholder="Buscar partidas, tipsters, clas..."
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {hasQuery && (
              <TapScale onPress={handleClear}>
                <Text style={styles.clearIcon}>X</Text>
              </TapScale>
            )}
          </View>
        </View>
      </SmoothEntry>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
          <View>
            {/* Loading skeleton */}
            {isLoading && <SkeletonList count={4} type="card" />}

            {/* Trending Searches (show when no query) */}
            {!isLoading && !hasQuery && (
              <SmoothEntry delay={100}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Em Alta</Text>
                  <View style={styles.pillsWrap}>
                    {trendingSearches.map((term) => (
                      <TapScale key={term} onPress={() => handleTrendingPress(term)}>
                        <View style={styles.pill}>
                          <Text style={styles.pillText}>{term}</Text>
                        </View>
                      </TapScale>
                    ))}
                  </View>
                </View>
              </SmoothEntry>
            )}

            {/* Search Results */}
            {hasQuery && hasResults && (
              <>
                {RESULT_TYPE_ORDER.map((type) => {
                  const items = groupedResults[type];
                  if (!items || items.length === 0) return null;
                  return (
                    <SmoothEntry key={type} delay={150}>
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          {RESULT_TYPE_LABELS[type]}
                        </Text>
                        {items.map((result, ri) => (
                          <Reanimated.View
                            key={result.id}
                            entering={FadeInDown.delay(ri * 50).duration(250).springify()}
                          >
                          <TapScale
                            onPress={() => handleResultPress(result)}
                          >
                            <View style={styles.resultRow}>
                              <View style={styles.resultIcon}>
                                <Text style={styles.resultIconText}>{result.icon}</Text>
                              </View>
                              <View style={styles.resultInfo}>
                                <Text style={styles.resultTitle}>{result.title}</Text>
                                <Text style={styles.resultSubtitle}>
                                  {result.subtitle}
                                </Text>
                              </View>
                              <Text style={styles.chevron}>{'>'}</Text>
                            </View>
                          </TapScale>
                          </Reanimated.View>
                        ))}
                      </View>
                    </SmoothEntry>
                  );
                })}
              </>
            )}

            {/* Empty State */}
            {hasQuery && !hasResults && (
              <SmoothEntry delay={100}>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>O</Text>
                  <Text style={styles.emptyTitle}>Nenhum resultado</Text>
                  <Text style={styles.emptySubtitle}>
                    Tente buscar por outro termo
                  </Text>
                </View>
              </SmoothEntry>
            )}

            {/* Default Empty State */}
            {!hasQuery && (
              <SmoothEntry delay={200}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Pessoas que voce pode conhecer</Text>
                  {suggestedTipsters.map((tipster) => (
                    <TapScale
                      key={tipster.id}
                      onPress={() => handleSuggestedPress(tipster.id)}
                    >
                      <View style={styles.resultRow}>
                        <SharedView tag={sharedTags.tipsterAvatar(tipster.id)} style={styles.suggestedAvatar}>
                          <Text style={styles.suggestedAvatarText}>
                            {tipster.username.charAt(0)}
                          </Text>
                        </SharedView>
                        <View style={styles.resultInfo}>
                          <SharedText tag={sharedTags.tipsterName(tipster.id)} style={styles.resultTitle}>{tipster.username}</SharedText>
                          <Text style={styles.resultSubtitle}>
                            {(tipster.winRate * 100).toFixed(0)}% WR
                            {' · '}
                            {tipster.followers >= 1000
                              ? `${(tipster.followers / 1000).toFixed(1)}k`
                              : tipster.followers}{' '}
                            seguidores
                          </Text>
                        </View>
                        <View style={styles.followPill}>
                          <Text style={styles.followPillText}>Seguir</Text>
                        </View>
                      </View>
                    </TapScale>
                  ))}
                </View>
              </SmoothEntry>
            )}

            {/* Bottom initial hint */}
            {!hasQuery && (
              <SmoothEntry delay={300}>
                <View style={styles.hintBox}>
                  <Text style={styles.hintText}>
                    Busque por partidas, tipsters ou clas
                  </Text>
                </View>
              </SmoothEntry>
            )}
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    ...typography.bodySemiBold,
    color: colors.textMuted,
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
    padding: 0,
  },
  clearIcon: {
    ...typography.bodySemiBold,
    color: colors.textMuted,
    fontSize: 14,
    padding: spacing.xs,
  },

  // Section
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
  },

  // Trending Pills
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },

  // Result Row
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  resultIconText: {
    fontSize: 18,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  resultSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    ...typography.bodySemiBold,
    color: colors.textMuted,
    fontSize: 16,
    marginLeft: spacing.sm,
  },

  // Suggested
  suggestedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  suggestedAvatarText: {
    ...typography.display,
    color: colors.primary,
    fontSize: 16,
  },
  followPill: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  followPillText: {
    ...typography.bodySemiBold,
    color: '#fff',
    fontSize: 12,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    ...typography.display,
    color: colors.textMuted,
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 14,
  },

  // Hint
  hintBox: {
    marginTop: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  hintText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
