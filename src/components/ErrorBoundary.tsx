import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { recordError } from '../services/firebaseAnalytics';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('ErrorBoundary caught:', error, info);
    recordError(error, `ErrorBoundary: ${info.componentStack?.slice(0, 200)}`);
  }

  handleRetry = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>
              {this.props.fallbackMessage || 'Algo deu errado'}
            </Text>
            <Text style={styles.message}>
              {this.state.error?.message || 'Erro inesperado. Tente novamente.'}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
});
