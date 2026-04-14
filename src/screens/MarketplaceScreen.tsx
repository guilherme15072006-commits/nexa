import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { useNexaStore, type MarketplaceItem, type TipsterTier } from '../store/nexaStore';
import { Card, SectionHeader, Avatar, Pill } from '../components/ui';
import { TapScale, SmoothEntry } from '../components/LiveComponents';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';

// ─── Constants ────────────────────────────────────────────────────────────────

type CategoryFilter = 'all' | 'strategy' | 'analysis' | 'vip_tips';

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'strategy', label: 'Estratégias' },
  { key: 'analysis', label: 'Análises' },
  { key: 'vip_tips', label: 'VIP Tips' },
];

const TYPE_COLORS: Record<string, string> = {
  strategy: colors.primary,
  analysis: '#4A90D9',
  vip_tips: colors.gold,
};

const TYPE_LABELS: Record<string, string> = {
  strategy: 'Estratégia',
  analysis: 'Análise',
  vip_tips: 'VIP Tips',
};

const TIER_COLORS: Record<TipsterTier, string> = {
  elite: colors.gold,
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

// ─── Rating Stars ─────────────────────────────────────────────────────────────

function RatingDisplay({ rating, reviews }: { rating: number; reviews: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <View style={styles.ratingRow}>
      <View style={styles.ratingDots}>
        {Array.from({ length: 5 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.ratingDot,
              {
                backgroundColor:
                  i < full
                    ? colors.gold
                    : i === full && hasHalf
                    ? colors.gold
                    : colors.border,
                opacity: i === full && hasHalf ? 0.5 : 1,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      <Text style={styles.reviewCount}>({reviews})</Text>
    </View>
  );
}

// ─── Marketplace Item Card ────────────────────────────────────────────────────

function ItemCard({
  item,
  index,
  onPurchase,
  userCoins,
}: {
  item: MarketplaceItem;
  index: number;
  onPurchase: (id: string) => void;
  userCoins: number;
}) {
  const typeColor = TYPE_COLORS[item.type] || colors.primary;
  const tierColor = TIER_COLORS[item.seller.tier];
  const canAfford = userCoins >= item.price;

  return (
    <SmoothEntry delay={index * 80}>
      <Card style={styles.itemCard}>
        {/* Top row: type pill + bestseller */}
        <View style={styles.itemTopRow}>
          <Pill label={TYPE_LABELS[item.type]} color={typeColor} />
          {item.isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
          )}
        </View>

        {/* Title + description */}
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Seller row */}
        <View style={styles.sellerRow}>
          <View style={[styles.sellerAvatarRing, { borderColor: tierColor }]}>
            <Avatar username={item.seller.username} size={28} />
          </View>
          <Text style={styles.sellerName}>{item.seller.username}</Text>
          <Pill
            label={item.seller.tier.toUpperCase()}
            color={tierColor}
            style={styles.sellerTierPill}
          />
        </View>

        {/* Rating */}
        <RatingDisplay rating={item.rating} reviews={item.reviews} />

        {/* Price + buy row */}
        <View style={styles.priceRow}>
          <View style={styles.priceTag}>
            <Text style={styles.priceIcon}>🪙</Text>
            <Text style={styles.priceValue}>{item.price}</Text>
          </View>

          {item.purchased ? (
            <View style={styles.purchasedBadge}>
              <Text style={styles.purchasedText}>Adquirido</Text>
            </View>
          ) : (
            <TapScale onPress={() => onPurchase(item.id)}>
              <View
                style={[
                  styles.buyBtn,
                  !canAfford && styles.buyBtnDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.buyBtnText,
                    !canAfford && styles.buyBtnTextDisabled,
                  ]}
                >
                  Comprar
                </Text>
              </View>
            </TapScale>
          )}
        </View>
      </Card>
    </SmoothEntry>
  );
}

// ─── Seller CTA ───────────────────────────────────────────────────────────────

function SellerCTA() {
  return (
    <SmoothEntry delay={500}>
      <Card style={styles.ctaCard}>
        <Text style={styles.ctaIcon}>🏪</Text>
        <Text style={styles.ctaTitle}>Você também pode vender</Text>
        <Text style={styles.ctaDesc}>
          Crie estratégias, análises ou packs de tips e ganhe NEXA coins com cada venda
        </Text>
        <TapScale onPress={() => hapticLight()}>
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Saber mais</Text>
          </View>
        </TapScale>
      </Card>
    </SmoothEntry>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MarketplaceScreen() {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const userCoins = useNexaStore((s) => s.user.coins);
  const items = useNexaStore((s) => s.marketplaceItems);
  const purchaseItem = useNexaStore((s) => s.purchaseItem);

  const filtered =
    filter === 'all' ? items : items.filter((i) => i.type === filter);

  const handlePurchase = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      if (userCoins < item.price) {
        hapticLight();
        Alert.alert('Coins insuficientes', 'Você não tem coins suficientes para esta compra.');
        return;
      }
      hapticSuccess();
      purchaseItem(itemId);
    },
    [items, userCoins, purchaseItem],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Marketplace</Text>
            <View style={styles.coinsDisplay}>
              <Text style={styles.coinsIcon}>🪙</Text>
              <Text style={styles.coinsValue}>{userCoins.toLocaleString()}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Estratégias, análises e tips dos melhores
          </Text>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((cat) => {
            const active = filter === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => {
                  hapticLight();
                  setFilter(cat.key);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    active && styles.filterPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Items */}
        {filtered.map((item, i) => (
          <ItemCard
            key={item.id}
            item={item}
            index={i}
            onPurchase={handlePurchase}
            userCoins={userCoins}
          />
        ))}

        {/* Seller CTA */}
        <SellerCTA />

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.display,
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  coinsIcon: {
    fontSize: 16,
  },
  coinsValue: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.gold,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // Item Card
  itemCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  bestsellerBadge: {
    backgroundColor: 'rgba(245,200,66,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  bestsellerText: {
    ...typography.monoBold,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  itemTitle: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },

  // Seller row
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sellerAvatarRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  sellerTierPill: {
    // extra style slot for Pill
  },

  // Rating
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ratingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  ratingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ratingText: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.gold,
    marginLeft: spacing.xs,
  },
  reviewCount: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Price row
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceIcon: {
    fontSize: 16,
  },
  priceValue: {
    ...typography.monoBold,
    fontSize: 16,
    color: colors.gold,
  },
  buyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  buyBtnDisabled: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buyBtnText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  buyBtnTextDisabled: {
    color: colors.textMuted,
  },
  purchasedBadge: {
    backgroundColor: 'rgba(0,200,150,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  purchasedText: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.green,
  },

  // CTA
  ctaCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  ctaIcon: {
    fontSize: 36,
    marginBottom: spacing.md,
  },
  ctaTitle: {
    ...typography.displayMedium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  ctaDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  ctaBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  ctaBtnText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
});
