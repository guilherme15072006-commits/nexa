import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TapScale, SmoothEntry, GlowPulse } from '../components/LiveComponents';
import { Card, Pill } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, type SubscriptionTier } from '../store/nexaStore';
import { hapticLight, hapticSuccess, hapticError } from '../services/haptics';
import { purchaseSubscription, restorePurchases, isTrialAvailable, getDaysRemaining, PRODUCT_IDS } from '../services/billing';
import { trackSubscriptionFunnel, trackSubscriptionRevenue } from '../services/analytics';
import { TrustBadgeRow } from '../components/MicroInteractions';

// ─── Tier Definitions ────────────────────────────────────────────────────────

interface TierDef {
  tier: SubscriptionTier;
  name: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  borderColor: string;
  glow: boolean;
  features: string[];
}

const TIERS: TierDef[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 'Grátis',
    borderColor: colors.border,
    glow: false,
    features: [
      'Feed personalizado',
      '3 apostas por dia',
      'Rankings básicos',
      'Chat geral',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 'R$ 29,90/mês',
    badge: 'POPULAR',
    badgeColor: colors.primary,
    borderColor: colors.primary,
    glow: true,
    features: [
      'Feed personalizado',
      'Apostas ilimitadas',
      '3 Power-ups/semana',
      'Lives VIP',
      'Creator Studio',
      'Audio Rooms',
      'Suporte prioritário',
    ],
  },
  {
    tier: 'elite',
    name: 'Elite',
    price: 'R$ 79,90/mês',
    badge: 'MELHOR VALOR',
    badgeColor: colors.gold,
    borderColor: colors.gold,
    glow: true,
    features: [
      'Tudo do Pro',
      'Power-ups ilimitados',
      'Torneios exclusivos',
      '5% cashback',
      'Creator Studio avançado',
      'Audio Rooms ilimitados',
      'Suporte VIP 24/7',
      'Badge exclusivo',
    ],
  },
];

// ─── Feature Comparison Table ────────────────────────────────────────────────

interface FeatureRow {
  label: string;
  free: boolean;
  pro: boolean;
  elite: boolean;
}

const FEATURES: FeatureRow[] = [
  { label: 'Feed personalizado',   free: true,  pro: true,  elite: true },
  { label: 'Apostas ilimitadas',   free: false, pro: true,  elite: true },
  { label: 'Power-ups',            free: false, pro: true,  elite: true },
  { label: 'Lives VIP',            free: false, pro: true,  elite: true },
  { label: 'Creator Studio',       free: false, pro: true,  elite: true },
  { label: 'Torneios',             free: false, pro: false, elite: true },
  { label: 'Cashback',             free: false, pro: false, elite: true },
  { label: 'Suporte prioritário',  free: false, pro: true,  elite: true },
];

// ─── Tier Card ───────────────────────────────────────────────────────────────

function TierCard({
  def,
  isCurrent,
  onSubscribe,
  index,
}: {
  def: TierDef;
  isCurrent: boolean;
  onSubscribe: () => void;
  index: number;
}) {
  const cardContent = (
    <View
      style={[
        styles.tierCard,
        { borderColor: def.borderColor },
        isCurrent && styles.tierCardCurrent,
      ]}
    >
      {/* Badge */}
      {def.badge && !isCurrent && (
        <View
          style={[
            styles.tierBadge,
            { backgroundColor: def.badgeColor },
          ]}
        >
          <Text style={styles.tierBadgeText}>{def.badge}</Text>
        </View>
      )}
      {isCurrent && (
        <View style={[styles.tierBadge, { backgroundColor: colors.green }]}>
          <Text style={styles.tierBadgeText}>ATUAL</Text>
        </View>
      )}

      <Text style={[styles.tierName, { color: def.borderColor === colors.border ? colors.textPrimary : def.borderColor }]}>
        {def.name}
      </Text>
      <Text style={styles.tierPrice}>{def.price}</Text>

      {/* Features */}
      <View style={styles.tierFeatures}>
        {def.features.map((feat, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{feat}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      {!isCurrent ? (
        <TapScale onPress={onSubscribe} accessibilityLabel={`Assinar ${def.name}`}>
          <View
            style={[
              styles.subscribeButton,
              { backgroundColor: def.borderColor === colors.border ? colors.bgElevated : def.borderColor },
            ]}
          >
            <Text style={styles.subscribeButtonText}>Assinar</Text>
          </View>
        </TapScale>
      ) : (
        <View style={styles.currentButton}>
          <Text style={styles.currentButtonText}>Plano Atual</Text>
        </View>
      )}
    </View>
  );

  if (def.glow && !isCurrent) {
    return (
      <SmoothEntry delay={index * 100}>
        <GlowPulse color={def.borderColor} intensity={0.3}>
          {cardContent}
        </GlowPulse>
      </SmoothEntry>
    );
  }

  return (
    <SmoothEntry delay={index * 100}>
      {cardContent}
    </SmoothEntry>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const currentSubscription = useNexaStore(s => s.currentSubscription);
  const userSubscription = useNexaStore(s => s.userSubscription);
  const startTrial = useNexaStore(s => s.startTrial);
  const cancelSubscription = useNexaStore(s => s.cancelSubscription);

  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const trialAvailable = isTrialAvailable();
  const daysRemaining = getDaysRemaining();

  const handleBack = useCallback(() => {
    hapticLight();
    navigation.goBack();
  }, [navigation]);

  const handleSubscribe = useCallback(async (tier: SubscriptionTier) => {
    hapticSuccess();
    setPurchasing(true);
    setMessage(null);
    trackSubscriptionFunnel('purchase_initiated', 1, tier);
    const productId = tier === 'elite' ? PRODUCT_IDS.elite : PRODUCT_IDS.pro;
    const result = await purchaseSubscription(productId);
    setPurchasing(false);
    if (result.success) {
      trackSubscriptionFunnel('purchased', 2, tier);
      trackSubscriptionRevenue(tier === 'elite' ? 79.90 : 29.90, tier);
    } else if (result.error) {
      hapticError();
      setMessage(result.error);
    }
  }, []);

  const handleStartTrial = useCallback(async () => {
    hapticSuccess();
    setPurchasing(true);
    setMessage(null);
    trackSubscriptionFunnel('trial_started', 1, 'pro');
    const result = await purchaseSubscription(PRODUCT_IDS.proTrial);
    setPurchasing(false);
    if (result.success) {
      trackSubscriptionFunnel('trial_activated', 2, 'pro');
    } else if (result.error) {
      hapticError();
      setMessage(result.error);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    hapticLight();
    setRestoring(true);
    setMessage(null);
    const result = await restorePurchases();
    setRestoring(false);
    if (result.success) {
      setMessage('Assinatura restaurada com sucesso!');
    } else {
      setMessage(result.error ?? 'Nenhuma assinatura encontrada');
    }
  }, []);

  const handleCancel = useCallback(() => {
    hapticLight();
    cancelSubscription();
    setShowCancel(false);
    setMessage('Auto-renovacao desativada. Acesso continua ate o fim do periodo.');
  }, [cancelSubscription]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TapScale onPress={handleBack} accessibilityLabel="Voltar">
          <Text style={styles.backButton}>←</Text>
        </TapScale>
        <Text style={styles.headerTitle}>NEXA Pro</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Tier */}
        <SmoothEntry delay={0}>
          <View style={styles.currentTierBanner}>
            <Text style={styles.currentTierLabel}>Seu plano atual</Text>
            <Pill
              label={currentSubscription?.toUpperCase() ?? 'FREE'}
              color={
                currentSubscription === 'elite'
                  ? colors.gold
                  : currentSubscription === 'pro'
                  ? colors.primary
                  : colors.textSecondary
              }
            />
          </View>
        </SmoothEntry>

        {/* Tier Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tierCardsScroll}
          snapToInterval={260}
          decelerationRate="fast"
        >
          {TIERS.map((def, i) => (
            <TierCard
              key={def.tier}
              def={def}
              isCurrent={currentSubscription === def.tier}
              onSubscribe={() => handleSubscribe(def.tier)}
              index={i}
            />
          ))}
        </ScrollView>

        {/* Feature Comparison Table */}
        <SmoothEntry delay={400}>
          <Text style={styles.comparisonTitle}>Comparação de Recursos</Text>
          <Card>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableFeatureCol}>
                <Text style={styles.tableHeaderText}>Recurso</Text>
              </View>
              <View style={styles.tableTierCol}>
                <Text style={styles.tableHeaderText}>Free</Text>
              </View>
              <View style={styles.tableTierCol}>
                <Text style={[styles.tableHeaderText, { color: colors.primary }]}>Pro</Text>
              </View>
              <View style={styles.tableTierCol}>
                <Text style={[styles.tableHeaderText, { color: colors.gold }]}>Elite</Text>
              </View>
            </View>

            {/* Table Rows */}
            {FEATURES.map((feat, i) => (
              <View
                key={i}
                style={[
                  styles.tableRow,
                  i % 2 === 0 && styles.tableRowAlt,
                ]}
              >
                <View style={styles.tableFeatureCol}>
                  <Text style={styles.tableFeatureText}>{feat.label}</Text>
                </View>
                <View style={styles.tableTierCol}>
                  <Text style={feat.free ? styles.tableCheck : styles.tableCross}>
                    {feat.free ? '✓' : '—'}
                  </Text>
                </View>
                <View style={styles.tableTierCol}>
                  <Text style={feat.pro ? styles.tableCheck : styles.tableCross}>
                    {feat.pro ? '✓' : '—'}
                  </Text>
                </View>
                <View style={styles.tableTierCol}>
                  <Text style={feat.elite ? styles.tableCheck : styles.tableCross}>
                    {feat.elite ? '✓' : '—'}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </SmoothEntry>

        {/* Active Subscription Info */}
        {currentSubscription !== 'free' && (
          <SmoothEntry delay={500}>
            <Card style={styles.activeSubCard}>
              <View style={styles.activeSubHeader}>
                <Text style={styles.activeSubTitle}>
                  {userSubscription.isTrialing ? 'Trial Pro ativo' : `Plano ${currentSubscription.charAt(0).toUpperCase() + currentSubscription.slice(1)}`}
                </Text>
                {userSubscription.isTrialing && (
                  <View style={styles.trialActiveBadge}>
                    <Text style={styles.trialActiveBadgeText}>TRIAL</Text>
                  </View>
                )}
              </View>
              {daysRemaining > 0 && (
                <Text style={styles.activeSubExpiry}>
                  {userSubscription.isTrialing ? 'Trial expira' : 'Renova'} em {daysRemaining} dias
                  {userSubscription.autoRenew ? '' : ' (nao renova)'}
                </Text>
              )}
              {userSubscription.autoRenew && (
                <TapScale onPress={() => { hapticLight(); setShowCancel(true); }}>
                  <Text style={styles.cancelLink}>Cancelar renovacao automatica</Text>
                </TapScale>
              )}
              {showCancel && (
                <View style={styles.cancelConfirm}>
                  <Text style={styles.cancelConfirmText}>
                    Deseja desativar a renovacao? Voce continuara com acesso ate o fim do periodo.
                  </Text>
                  <View style={styles.cancelConfirmRow}>
                    <TapScale onPress={handleCancel}>
                      <View style={styles.cancelConfirmYes}>
                        <Text style={styles.cancelConfirmYesText}>Desativar</Text>
                      </View>
                    </TapScale>
                    <TapScale onPress={() => setShowCancel(false)}>
                      <View style={styles.cancelConfirmNo}>
                        <Text style={styles.cancelConfirmNoText}>Manter</Text>
                      </View>
                    </TapScale>
                  </View>
                </View>
              )}
            </Card>
          </SmoothEntry>
        )}

        {/* Free Trial Banner */}
        {currentSubscription === 'free' && trialAvailable && (
          <SmoothEntry delay={500}>
            <TapScale onPress={handleStartTrial} accessibilityLabel="Iniciar teste gratis do Pro">
              <View style={styles.trialBanner}>
                <Text style={styles.trialTitle}>7 dias gratis de Pro</Text>
                <Text style={styles.trialText}>
                  Apostas ilimitadas, Power-ups, Lives VIP e Creator Studio. Cancele quando quiser.
                </Text>
                <View style={styles.trialButton}>
                  <Text style={styles.trialButtonText}>Comecar trial gratis</Text>
                </View>
              </View>
            </TapScale>
          </SmoothEntry>
        )}

        {/* Message banner */}
        {message && (
          <View style={styles.messageBanner}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {/* Restore + Footer */}
        <SmoothEntry delay={600}>
          <TapScale onPress={handleRestore} disabled={restoring}>
            <View style={styles.restoreBtn}>
              {restoring ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <Text style={styles.restoreText}>Restaurar compras</Text>
              )}
            </View>
          </TapScale>
        </SmoothEntry>

        <TrustBadgeRow />

        {/* Purchasing overlay */}
        {purchasing && (
          <View style={styles.purchasingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.purchasingText}>Processando...</Text>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    paddingRight: spacing.sm,
  },
  headerTitle: {
    ...typography.displayMedium,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
  },
  headerSpacer: {
    width: 30,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },

  // Current Tier Banner
  currentTierBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  currentTierLabel: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Tier Cards
  tierCardsScroll: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  tierCard: {
    width: 244,
    backgroundColor: colors.bgCard,
    borderWidth: 1.5,
    borderRadius: radius.xl,
    padding: spacing.lg,
    position: 'relative',
  },
  tierCardCurrent: {
    opacity: 0.85,
  },
  tierBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -40,
    width: 80,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  tierBadgeText: {
    ...typography.bodySemiBold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  tierName: {
    ...typography.display,
    fontSize: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  tierPrice: {
    ...typography.monoBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tierFeatures: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureCheck: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.green,
  },
  featureText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  subscribeButton: {
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  subscribeButtonText: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  currentButton: {
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  currentButtonText: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },

  // Comparison Table
  comparisonTitle: {
    ...typography.displayMedium,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  tableHeaderText: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tableFeatureCol: {
    flex: 2,
  },
  tableTierCol: {
    flex: 1,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tableRowAlt: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tableFeatureText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textPrimary,
  },
  tableCheck: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.green,
  },
  tableCross: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },

  // Trial Banner
  trialBanner: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  trialTitle: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  trialText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  trialButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  trialButtonText: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  // Active sub
  activeSubCard: { padding: spacing.lg, gap: spacing.sm },
  activeSubHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm },
  activeSubTitle: { ...typography.bodySemiBold, fontSize: 16, color: colors.textPrimary },
  trialActiveBadge: { backgroundColor: colors.green + '20', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  trialActiveBadgeText: { ...typography.monoBold, fontSize: 10, color: colors.green, letterSpacing: 1 },
  activeSubExpiry: { ...typography.mono, fontSize: 12, color: colors.textSecondary },
  cancelLink: { ...typography.body, fontSize: 13, color: colors.red, marginTop: spacing.xs },

  // Cancel confirm
  cancelConfirm: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm, gap: spacing.sm },
  cancelConfirmText: { ...typography.body, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  cancelConfirmRow: { flexDirection: 'row' as const, gap: spacing.md },
  cancelConfirmYes: { flex: 1, backgroundColor: colors.red + '15', borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' as const, borderWidth: 0.5, borderColor: colors.red + '30' },
  cancelConfirmYesText: { ...typography.bodySemiBold, fontSize: 13, color: colors.red },
  cancelConfirmNo: { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' as const, borderWidth: 0.5, borderColor: colors.border },
  cancelConfirmNoText: { ...typography.bodySemiBold, fontSize: 13, color: colors.textPrimary },

  // Message
  messageBanner: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  messageText: { ...typography.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center' as const },

  // Restore
  restoreBtn: { alignItems: 'center' as const, paddingVertical: spacing.lg },
  restoreText: { ...typography.body, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' as const },

  // Purchasing overlay
  purchasingOverlay: { alignItems: 'center' as const, paddingVertical: spacing.xl, gap: spacing.md },
  purchasingText: { ...typography.body, fontSize: 14, color: colors.textSecondary },
});
