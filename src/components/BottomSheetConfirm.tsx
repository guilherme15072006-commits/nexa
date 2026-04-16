/**
 * NEXA — Bottom Sheet Confirmation
 *
 * Bet365/Stake pattern: ações importantes confirmam via bottom sheet,
 * não via Alert.alert. Mais premium, gesturável, animado.
 *
 * Usa @gorhom/bottom-sheet com gesture handler.
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { TapScale } from './LiveComponents';
import { hapticLight, hapticMedium } from '../services/haptics';

let BottomSheetLib: any = null;
let BottomSheetViewLib: any = null;
try {
  BottomSheetLib = require('@gorhom/bottom-sheet').default;
  BottomSheetViewLib = require('@gorhom/bottom-sheet').BottomSheetView;
} catch {}

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  confirmColor = colors.primary,
  onConfirm,
  onCancel,
  children,
}: ConfirmSheetProps) {
  const bottomSheetRef = useRef<any>(null);
  const snapPoints = useMemo(() => ['35%'], []);

  const handleConfirm = useCallback(() => {
    hapticMedium();
    bottomSheetRef.current?.close();
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    hapticLight();
    bottomSheetRef.current?.close();
    onCancel();
  }, [onCancel]);

  if (!BottomSheetLib || !visible) return null;

  return (
    <BottomSheetLib
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={onCancel}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      {BottomSheetViewLib ? (
        <BottomSheetViewLib style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {children}
          <View style={styles.actions}>
            <TapScale onPress={handleCancel} style={styles.btnWrap}>
              <View style={styles.cancelBtn}>
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </View>
            </TapScale>
            <TapScale onPress={handleConfirm} style={styles.btnWrap}>
              <View style={[styles.confirmBtn, { backgroundColor: confirmColor }]}>
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </View>
            </TapScale>
          </View>
        </BottomSheetViewLib>
      ) : null}
    </BottomSheetLib>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: colors.bgCard, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: colors.border, width: 40 },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.display, fontSize: 20, color: colors.textPrimary },
  message: { ...typography.body, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  btnWrap: { flex: 1 },
  cancelBtn: { backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center', borderWidth: 0.5, borderColor: colors.border },
  cancelText: { ...typography.bodySemiBold, fontSize: 15, color: colors.textMuted },
  confirmBtn: { borderRadius: radius.md, paddingVertical: spacing.sm + 4, alignItems: 'center' },
  confirmText: { ...typography.bodySemiBold, fontSize: 15, color: '#FFF' },
});
