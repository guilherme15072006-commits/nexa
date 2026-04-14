import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { Card, SectionHeader } from '../components/ui';
import { TapScale, SmoothEntry } from '../components/LiveComponents';
import { hapticLight, hapticSuccess } from '../services/haptics';

// ─── Referral Screen ─────────────────────────────────────────────────────────

export default function ReferralScreen() {
  const navigation = useNavigation();
  const referral = useNexaStore((s) => s.referral);

  const handleCopyCode = useCallback(() => {
    hapticSuccess();
    Alert.alert('Copiado!', `Código ${referral.code} copiado para a área de transferência.`);
  }, [referral.code]);

  const handleShareLink = useCallback(() => {
    hapticSuccess();
    Alert.alert('Compartilhar', referral.link);
  }, [referral.link]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            hapticLight();
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Convide Amigos</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <SmoothEntry delay={0}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>{'🎁'}</Text>
            <Text style={styles.heroTitle}>
              Ganhe 200 {'🪙'} por cada amigo que entrar!
            </Text>
            <Text style={styles.heroSubtitle}>
              Convide amigos para o NEXA e ambos recebem recompensas.
            </Text>
          </View>
        </SmoothEntry>

        {/* Referral Code Card */}
        <SmoothEntry delay={100}>
          <Card style={styles.codeCard}>
            <Text style={styles.codeLabel}>Seu codigo de convite</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{referral.code}</Text>
              <TapScale onPress={handleCopyCode}>
                <View style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copiar</Text>
                </View>
              </TapScale>
            </View>
          </Card>
        </SmoothEntry>

        {/* Share Link */}
        <SmoothEntry delay={200}>
          <TapScale onPress={handleShareLink}>
            <View style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Compartilhar link</Text>
            </View>
          </TapScale>
        </SmoothEntry>

        {/* Stats */}
        <SmoothEntry delay={300}>
          <SectionHeader title="Suas estatisticas" />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{referral.invitesSent}</Text>
              <Text style={styles.statLabel}>Convites enviados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{referral.invitesAccepted}</Text>
              <Text style={styles.statLabel}>Aceitos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.gold }]}>
                {referral.bonusEarned}
              </Text>
              <Text style={styles.statLabel}>{'🪙'} Ganhos</Text>
            </View>
          </View>
        </SmoothEntry>

        {/* How It Works */}
        <SmoothEntry delay={400}>
          <SectionHeader title="Como funciona" />
          <Card style={styles.howCard}>
            <View style={styles.stepRow}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Compartilhe</Text>
                <Text style={styles.stepDesc}>
                  Envie seu codigo ou link para amigos
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepRow}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Amigo entra</Text>
                <Text style={styles.stepDesc}>
                  Seu amigo se cadastra usando o codigo
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepRow}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ambos ganham</Text>
                <Text style={styles.stepDesc}>
                  Voce e seu amigo recebem 200 {'🪙'} cada
                </Text>
              </View>
            </View>
          </Card>
        </SmoothEntry>

        {/* Invite History */}
        <SmoothEntry delay={500}>
          <SectionHeader title="Historico de convites" />
          <Card style={styles.historyCard}>
            {referral.invitesAccepted > 0 ? (
              <View style={styles.historyRow}>
                <Text style={styles.historyIcon}>{'✅'}</Text>
                <Text style={styles.historyText}>
                  {referral.invitesAccepted} amigo{referral.invitesAccepted > 1 ? 's' : ''} aceitou{referral.invitesAccepted > 1 ? 'ram' : ''} seu convite
                </Text>
              </View>
            ) : (
              <Text style={styles.emptyHistory}>
                Nenhum convite aceito ainda. Compartilhe seu codigo!
              </Text>
            )}
            {referral.invitesSent > referral.invitesAccepted && (
              <View style={[styles.historyRow, { marginTop: spacing.sm }]}>
                <Text style={styles.historyIcon}>{'⏳'}</Text>
                <Text style={styles.historyText}>
                  {referral.invitesSent - referral.invitesAccepted} convite{referral.invitesSent - referral.invitesAccepted > 1 ? 's' : ''} pendente{referral.invitesSent - referral.invitesAccepted > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </Card>
        </SmoothEntry>

        <View style={{ height: spacing.xl * 2 }} />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.displayMedium,
    fontSize: 18,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },

  // Hero
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    ...typography.displayMedium,
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Code Card
  codeCard: {
    marginBottom: spacing.md,
  },
  codeLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    ...typography.monoBold,
    fontSize: 24,
    color: colors.gold,
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  copyButtonText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Share Button
  shareButton: {
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  shareButtonText: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.displayMedium,
    fontSize: 24,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  // How It Works
  howCard: {
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumber: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  stepDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 17,
    marginVertical: spacing.xs,
  },

  // History
  historyCard: {
    marginBottom: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  historyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptyHistory: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
