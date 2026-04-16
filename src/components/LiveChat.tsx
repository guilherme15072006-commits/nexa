import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { PulsingDot } from './LiveComponents';
import { useNexaStore } from '../store/nexaStore';
import { hapticLight } from '../services/haptics';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LiveChatProps {
  matchId: string;
  expanded: boolean;
  onToggle: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USERNAME_COLORS = [
  '#7C5CFC', '#F5C842', '#00C896', '#FF4D6A', '#FF8C42',
  '#4DC9F6', '#F67280', '#C9B1FF', '#3DDC84', '#FFD93D',
];

function hashUsername(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getUserColor(username: string): string {
  return USERNAME_COLORS[hashUsername(username) % USERNAME_COLORS.length];
}

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ─── LiveChat Component ──────────────────────────────────────────────────────

export default function LiveChat({ matchId, expanded, onToggle }: LiveChatProps) {
  const matchChats = useNexaStore(s => s.matchChats);
  const messages = matchChats[matchId] ?? [];
  const last15 = useMemo(() => messages.slice(-15), [messages]);

  const heightAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Animate expand/collapse
  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [expanded, heightAnim]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (expanded && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, expanded]);

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const opacity = heightAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Collapsed bar */}
      <TouchableOpacity
        style={styles.collapsedBar}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityLabel={expanded ? 'Fechar chat ao vivo' : 'Abrir chat ao vivo'}
      >
        <View style={styles.collapsedLeft}>
          <Text style={styles.chatEmoji}>💬</Text>
          <Text style={styles.collapsedText}>
            Chat ao vivo · {messages.length} mensagens
          </Text>
          <PulsingDot />
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Expanded content */}
      <Animated.View style={[styles.expandedWrap, { maxHeight, opacity }]}>
        {/* Header */}
        <View style={styles.expandedHeader}>
          <Text style={styles.expandedTitle}>Chat ao vivo</Text>
          <Text style={styles.onlineCount}>{messages.length > 0 ? `${Math.min(messages.length * 3 + 12, 99)} no chat` : '0 no chat'}</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {last15.map((msg, idx) => {
            const userColor = getUserColor(msg.user);
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  idx < last15.length - 1 && styles.messageRowBorder,
                ]}
              >
                <View style={[styles.msgAvatar, { backgroundColor: userColor + '30' }]}>
                  <Text style={[styles.msgAvatarText, { color: userColor }]}>
                    {getInitial(msg.user)}
                  </Text>
                </View>
                <View style={styles.msgContent}>
                  <View style={styles.msgNameRow}>
                    <Text style={[styles.msgUsername, { color: userColor }]}>{msg.user}</Text>
                    <Text style={styles.msgTime}>{formatTime(msg.timestamp)}</Text>
                  </View>
                  <Text style={styles.msgText}>{msg.text}</Text>
                </View>
              </View>
            );
          })}
          {last15.length === 0 && (
            <Text style={styles.emptyChat}>Nenhuma mensagem ainda...</Text>
          )}
        </ScrollView>

        {/* Real input bar */}
        <ChatInput matchId={matchId} />
      </Animated.View>
    </View>
  );
}

// ─── Chat Input ─────────────────────────────────────────────────────────────

function ChatInput({ matchId }: { matchId: string }) {
  const [text, setText] = useState('');
  const sendChatMessage = useNexaStore((s) => s.sendChatMessage);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    hapticLight();
    sendChatMessage(matchId, trimmed);
    setText('');
  }, [text, matchId, sendChatMessage]);

  return (
    <View style={styles.chatInputBar}>
      <TextInput
        style={styles.chatInputField}
        value={text}
        onChangeText={setText}
        placeholder="Digite uma mensagem..."
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        maxLength={200}
      />
      <TouchableOpacity
        style={[styles.chatSendBtn, !text.trim() && styles.chatSendBtnDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
        activeOpacity={0.7}
      >
        <Text style={styles.chatSendIcon}>↑</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  // Collapsed bar
  collapsedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chatEmoji: { fontSize: 14 },
  collapsedText: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chevron: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },

  // Expanded
  expandedWrap: {
    overflow: 'hidden',
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm + 2,
    paddingBottom: spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  expandedTitle: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  onlineCount: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },

  // Messages
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingVertical: 4,
  },
  messageRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border + '40',
  },
  msgAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    ...typography.monoBold,
    fontSize: 10,
  },
  msgContent: {
    flex: 1,
    gap: 1,
  },
  msgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  msgUsername: {
    ...typography.bodySemiBold,
    fontSize: 11,
  },
  msgTime: {
    ...typography.mono,
    fontSize: 9,
    color: colors.textMuted,
  },
  msgText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  emptyChat: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },

  // Fake input
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  chatInputField: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
    ...typography.body,
    fontSize: 12,
    color: colors.textPrimary,
  },
  chatSendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnDisabled: {
    backgroundColor: colors.primary + '30',
  },
  chatSendIcon: {
    ...typography.monoBold,
    fontSize: 14,
    color: '#FFF',
  },
});
