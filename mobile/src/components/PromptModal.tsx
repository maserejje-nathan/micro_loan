import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  visible: boolean;
  title: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  loading?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
};

export function PromptModal({
  visible,
  title,
  placeholder,
  value,
  onChangeText,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  loading = false,
  multiline = false,
  keyboardType = 'default',
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#8B968F"
            style={[styles.input, multiline && styles.multiline]}
            multiline={multiline}
            keyboardType={keyboardType}
            autoFocus
          />
          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <PrimaryButton
              label={confirmLabel}
              onPress={onConfirm}
              loading={loading}
              style={styles.confirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 22, 18, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.sandSoft,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  title: {
    color: colors.ink,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
    fontFamily: 'DMSans_400Regular',
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  cancel: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cancelText: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
  confirm: {
    flex: 1,
  },
});
