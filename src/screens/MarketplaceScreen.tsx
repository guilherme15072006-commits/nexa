import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useNexaStore, type MarketplaceItem, type MarketplaceReview, type TipsterTier, MARKETPLACE_COMMISSION } from '../store/nexaStore';
import { Card, SectionHeader, Avatar, Pill } from '../components/ui';
import { SkeletonList } from '../components/SkeletonLoader';
import { EmptyState, EMPTY_PRESETS } from '../components/EmptyState';
import { TapScale, SmoothEntry } from '../components/LiveComponents';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';
import { trackMarketplaceRevenue } from '../services/analytics';

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
  onReview,
  userCoins,
  userId,
}: {
  item: MarketplaceItem;
  index: number;
  onPurchase: (id: string) => void;
  onReview: (id: string) => void;
  userCoins: number;
  userId: string;
}) {
  const [showReviews, setShowReviews] = useState(false);
  const typeColor = TYPE_COLORS[item.type] || colors.primary;
  const tierColor = TIER_COLORS[item.seller.tier];
  const canAfford = userCoins >= item.price;
  const hasReviewed = item.reviewList.some(r => r.userId === userId);
  const commission = Math.round(item.price * MARKETPLACE_COMMISSION);

  return (
    <SmoothEntry delay={index * 80}>
      <Card style={styles.itemCard}>
        {/* Top row: type pill + bestseller + sales */}
        <View style={styles.itemTopRow}>
          <Pill label={TYPE_LABELS[item.type]} color={typeColor} />
          {item.isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
          )}
          <Text style={styles.salesCount}>{item.salesCount} vendas</Text>
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

        {/* Rating — tappable to expand reviews */}
        <TouchableOpacity onPress={() => { hapticLight(); setShowReviews(!showReviews); }}>
          <RatingDisplay rating={item.rating} reviews={item.reviews} />
        </TouchableOpacity>

        {/* Reviews list (expanded) */}
        {showReviews && item.reviewList.length > 0 && (
          <View style={styles.reviewList}>
            {item.reviewList.slice(0, 5).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.username}</Text>
                  <View style={styles.reviewRatingMini}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <View key={i} style={[styles.ratingDotMini, { backgroundColor: i < review.rating ? colors.gold : colors.border }]} />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>{review.createdAt}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price + buy/review row */}
        <View style={styles.priceRow}>
          <View>
            <View style={styles.priceTag}>
              <Text style={styles.priceIcon}>🪙</Text>
              <Text style={styles.priceValue}>{item.price}</Text>
            </View>
            {!item.purchased && (
              <Text style={styles.commissionNote}>Taxa: {commission} coins ({Math.round(MARKETPLACE_COMMISSION * 100)}%)</Text>
            )}
          </View>

          {item.purchased ? (
            <View style={styles.purchasedActions}>
              <View style={styles.purchasedBadge}>
                <Text style={styles.purchasedText}>Adquirido</Text>
              </View>
              {!hasReviewed && (
                <TapScale onPress={() => onReview(item.id)}>
                  <View style={styles.reviewBtn}>
                    <Text style={styles.reviewBtnText}>Avaliar</Text>
                  </View>
                </TapScale>
              )}
            </View>
          ) : (
            <TapScale onPress={() => onPurchase(item.id)}>
              <View style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}>
                <Text style={[styles.buyBtnText, !canAfford && styles.buyBtnTextDisabled]}>
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

function SellerCTA({ onCreateListing }: { onCreateListing: () => void }) {
  const user = useNexaStore(s => s.user);
  const items = useNexaStore(s => s.marketplaceItems);
  const myItems = items.filter(i => i.seller.id === user.id);
  const totalEarnings = myItems.reduce((sum, i) => sum + i.sellerEarnings, 0);
  const totalSales = myItems.reduce((sum, i) => sum + i.salesCount, 0);

  return (
    <SmoothEntry delay={500}>
      <Card style={styles.ctaCard}>
        <Text style={styles.ctaIcon}>🏪</Text>
        <Text style={styles.ctaTitle}>Venda suas estrategias</Text>
        <Text style={styles.ctaDesc}>
          Crie analises ou packs de tips e ganhe 80% do valor em NEXA coins. Taxa de {Math.round(MARKETPLACE_COMMISSION * 100)}% para a plataforma.
        </Text>
        {myItems.length > 0 && (
          <View style={styles.earningsRow}>
            <View style={styles.earningStat}>
              <Text style={styles.earningValue}>{totalSales}</Text>
              <Text style={styles.earningLabel}>Vendas</Text>
            </View>
            <View style={styles.earningStat}>
              <Text style={styles.earningValue}>{totalEarnings.toLocaleString()}</Text>
              <Text style={styles.earningLabel}>Coins ganhos</Text>
            </View>
            <View style={styles.earningStat}>
              <Text style={styles.earningValue}>{myItems.length}</Text>
              <Text style={styles.earningLabel}>Listados</Text>
            </View>
          </View>
        )}
        <TapScale onPress={onCreateListing}>
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Criar listagem</Text>
          </View>
        </TapScale>
      </Card>
    </SmoothEntry>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MarketplaceScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const isLoading = useNexaStore((s) => s.isLoading);
  const user = useNexaStore((s) => s.user);
  const items = useNexaStore((s) => s.marketplaceItems);
  const purchaseItem = useNexaStore((s) => s.purchaseItem);
  const submitReview = useNexaStore((s) => s.submitReview);
  const createListing = useNexaStore((s) => s.createListing);

  // Review modal state
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Create listing modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState<MarketplaceItem['type']>('strategy');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const filtered =
    filter === 'all' ? items : items.filter((i) => i.type === filter);

  const handlePurchase = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      if (user.coins < item.price) {
        hapticLight();
        Alert.alert('Coins insuficientes', 'Voce nao tem coins suficientes para esta compra.');
        return;
      }
      const commission = Math.round(item.price * MARKETPLACE_COMMISSION);
      Alert.alert(
        'Confirmar compra',
        `${item.title}\n\nPreco: ${item.price} coins\nTaxa plataforma: ${commission} coins\nVendedor recebe: ${item.price - commission} coins`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Comprar', onPress: () => { hapticSuccess(); purchaseItem(itemId); trackMarketplaceRevenue(item.price, commission); } },
        ],
      );
    },
    [items, user.coins, purchaseItem],
  );

  const handleSubmitReview = useCallback(() => {
    if (!reviewingItemId || !reviewComment.trim()) return;
    hapticSuccess();
    submitReview(reviewingItemId, reviewRating, reviewComment.trim());
    setReviewingItemId(null);
    setReviewComment('');
    setReviewRating(5);
  }, [reviewingItemId, reviewRating, reviewComment, submitReview]);

  const handleCreateListing = useCallback(() => {
    if (!newTitle.trim() || !newDesc.trim() || !newPrice.trim()) return;
    const price = parseInt(newPrice, 10);
    if (isNaN(price) || price < 50) {
      Alert.alert('Preco invalido', 'O preco minimo e 50 coins.');
      return;
    }
    hapticSuccess();
    createListing({ type: newType, title: newTitle.trim(), description: newDesc.trim(), price });
    setShowCreate(false);
    setNewTitle('');
    setNewDesc('');
    setNewPrice('');
  }, [newType, newTitle, newDesc, newPrice, createListing]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { hapticLight(); navigation.goBack(); }} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Marketplace</Text>
            <View style={styles.coinsDisplay}>
              <Text style={styles.coinsIcon}>🪙</Text>
              <Text style={styles.coinsValue}>{user.coins.toLocaleString()}</Text>
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
        {isLoading ? (
          <SkeletonList count={3} type="card" />
        ) : filtered.length === 0 ? (
          <EmptyState {...EMPTY_PRESETS.marketplace} />
        ) : (
          filtered.map((item, i) => (
            <ItemCard
              key={item.id}
              item={item}
              index={i}
              onPurchase={handlePurchase}
              onReview={(id) => { hapticLight(); setReviewingItemId(id); }}
              userCoins={user.coins}
              userId={user.id}
            />
          ))
        )}

        {/* Seller CTA */}
        {!isLoading && <SellerCTA onCreateListing={() => { hapticMedium(); setShowCreate(true); }} />}

        {/* Review Modal */}
        {reviewingItemId && (
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Avaliar compra</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => { hapticLight(); setReviewRating(star); }}>
                  <View style={[styles.ratingStar, star <= reviewRating && styles.ratingStarActive]}>
                    <Text style={styles.ratingStarText}>{star <= reviewRating ? '★' : '☆'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Sua avaliacao..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={300}
            />
            <View style={styles.modalActions}>
              <TapScale onPress={() => { setReviewingItemId(null); setReviewComment(''); }}>
                <View style={styles.modalCancel}><Text style={styles.modalCancelText}>Cancelar</Text></View>
              </TapScale>
              <TapScale onPress={handleSubmitReview}>
                <View style={styles.modalConfirm}><Text style={styles.modalConfirmText}>Enviar</Text></View>
              </TapScale>
            </View>
          </Card>
        )}

        {/* Create Listing Modal */}
        {showCreate && (
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Criar listagem</Text>
            <View style={styles.createTypeRow}>
              {(['strategy', 'analysis', 'vip_tips'] as const).map((t) => (
                <TapScale key={t} onPress={() => { hapticLight(); setNewType(t); }}>
                  <View style={[styles.createTypeBtn, newType === t && styles.createTypeBtnActive]}>
                    <Text style={[styles.createTypeText, newType === t && styles.createTypeTextActive]}>
                      {TYPE_LABELS[t]}
                    </Text>
                  </View>
                </TapScale>
              ))}
            </View>
            <TextInput style={styles.createInput} value={newTitle} onChangeText={setNewTitle} placeholder="Titulo" placeholderTextColor={colors.textMuted} maxLength={80} />
            <TextInput style={[styles.createInput, styles.createInputMulti]} value={newDesc} onChangeText={setNewDesc} placeholder="Descricao" placeholderTextColor={colors.textMuted} multiline maxLength={300} />
            <View style={styles.createPriceRow}>
              <Text style={styles.createPriceLabel}>🪙</Text>
              <TextInput style={styles.createPriceInput} value={newPrice} onChangeText={setNewPrice} placeholder="Preco (min. 50)" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
              {newPrice && !isNaN(parseInt(newPrice, 10)) && (
                <Text style={styles.createPayoutHint}>Voce recebe: {Math.round(parseInt(newPrice, 10) * (1 - MARKETPLACE_COMMISSION))} coins</Text>
              )}
            </View>
            <View style={styles.modalActions}>
              <TapScale onPress={() => setShowCreate(false)}>
                <View style={styles.modalCancel}><Text style={styles.modalCancelText}>Cancelar</Text></View>
              </TapScale>
              <TapScale onPress={handleCreateListing}>
                <View style={styles.modalConfirm}><Text style={styles.modalConfirmText}>Publicar</Text></View>
              </TapScale>
            </View>
          </Card>
        )}

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
  backBtn: {
    padding: spacing.xs,
  },
  backBtnText: {
    fontSize: 22,
    color: colors.textPrimary,
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

  // Sales count
  salesCount: { ...typography.mono, fontSize: 11, color: colors.textMuted },

  // Commission note
  commissionNote: { ...typography.mono, fontSize: 10, color: colors.textMuted, marginTop: 2 },

  // Review button on purchased items
  purchasedActions: { alignItems: 'flex-end' as const, gap: spacing.xs },
  reviewBtn: { backgroundColor: colors.primary + '15', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 0.5, borderColor: colors.primary + '30' },
  reviewBtnText: { ...typography.bodySemiBold, fontSize: 11, color: colors.primary },

  // Review list
  reviewList: { gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 0.5, borderTopColor: colors.border },
  reviewItem: { gap: spacing.xs },
  reviewHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm },
  reviewUser: { ...typography.bodySemiBold, fontSize: 12, color: colors.textPrimary },
  reviewRatingMini: { flexDirection: 'row' as const, gap: 2 },
  ratingDotMini: { width: 6, height: 6, borderRadius: 3 },
  reviewDate: { ...typography.mono, fontSize: 10, color: colors.textMuted },
  reviewComment: { ...typography.body, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  // Seller earnings
  earningsRow: { flexDirection: 'row' as const, justifyContent: 'space-around' as const, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 0.5, borderTopColor: colors.border },
  earningStat: { alignItems: 'center' as const, gap: spacing.xs },
  earningValue: { ...typography.monoBold, fontSize: 16, color: colors.textPrimary },
  earningLabel: { ...typography.body, fontSize: 11, color: colors.textMuted },

  // Modal (review + create)
  modalCard: { padding: spacing.lg, marginTop: spacing.md, gap: spacing.md, borderWidth: 1, borderColor: colors.primary + '30' },
  modalTitle: { ...typography.display, fontSize: 18, color: colors.textPrimary },
  modalActions: { flexDirection: 'row' as const, gap: spacing.md, marginTop: spacing.sm },
  modalCancel: { flex: 1, backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' as const, borderWidth: 0.5, borderColor: colors.border },
  modalCancelText: { ...typography.bodySemiBold, fontSize: 13, color: colors.textMuted },
  modalConfirm: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' as const },
  modalConfirmText: { ...typography.bodySemiBold, fontSize: 13, color: '#FFF' },

  // Rating selector
  ratingSelector: { flexDirection: 'row' as const, gap: spacing.sm, justifyContent: 'center' as const },
  ratingStar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bgElevated, alignItems: 'center' as const, justifyContent: 'center' as const, borderWidth: 0.5, borderColor: colors.border },
  ratingStarActive: { backgroundColor: colors.gold + '20', borderColor: colors.gold + '40' },
  ratingStarText: { fontSize: 20, color: colors.gold },
  reviewInput: { backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, padding: spacing.md, ...typography.body, fontSize: 13, color: colors.textPrimary, minHeight: 80, textAlignVertical: 'top' as const },

  // Create listing
  createTypeRow: { flexDirection: 'row' as const, gap: spacing.xs },
  createTypeBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bgElevated, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center' as const },
  createTypeBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' },
  createTypeText: { ...typography.bodySemiBold, fontSize: 11, color: colors.textMuted },
  createTypeTextActive: { color: colors.primary },
  createInput: { backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, ...typography.body, fontSize: 14, color: colors.textPrimary },
  createInputMulti: { minHeight: 80, textAlignVertical: 'top' as const },
  createPriceRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm },
  createPriceLabel: { fontSize: 20 },
  createPriceInput: { flex: 1, backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, ...typography.monoBold, fontSize: 16, color: colors.textPrimary },
  createPayoutHint: { ...typography.mono, fontSize: 11, color: colors.green },
});
