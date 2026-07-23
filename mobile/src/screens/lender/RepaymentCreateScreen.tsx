import { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createRepayment,
  fetchRepaymentCreateMeta,
} from '../../api/repayments';
import { ApiError } from '../../api/client';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney } from '../../lib/format';
import { colors } from '../../theme/colors';
import type { LenderMoreStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  LenderMoreStackParamList,
  'RepaymentCreate'
>;

export function RepaymentCreateScreen({ navigation }: Props) {
  const loader = useCallback(() => fetchRepaymentCreateMeta(), []);
  const { data, loading, error } = useResource(loader);
  const [loanId, setLoanId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [channel, setChannel] = useState('cash');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loans = data?.loans ?? [];
  const channelValues =
    data?.payment_channels ??
    data?.channels?.map((item) => item.value) ??
    ['cash', 'mobile_money', 'bank'];
  const channels = channelValues.map((value) => ({
    value,
    label: value.replaceAll('_', ' '),
  }));
  const currency = data?.currency ?? 'UGX';

  async function onSubmit() {
    if (!loanId || !amount) {
      setFormError('Select a loan and enter an amount.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await createRepayment({
        loan_id: loanId,
        amount: Number(amount),
        channel,
      });
      navigation.goBack();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not record repayment.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !data) {
    return <LoadingState />;
  }

  return (
    <Screen>
      <SectionHeader
        title="Record repayment"
        subtitle="Pick a loan and enter the amount collected"
      />
      <ErrorBanner message={error ?? formError} />

      <Text style={styles.label}>Loan</Text>
      <View style={styles.chips}>
        {loans.length === 0 ? (
          <Text style={styles.hint}>No active loans available.</Text>
        ) : (
          loans.map((loan) => (
            <Pressable
              key={loan.id}
              style={[styles.chip, loanId === loan.id && styles.chipActive]}
              onPress={() => setLoanId(loan.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  loanId === loan.id && styles.chipTextActive,
                ]}
              >
                {loan.reference_number ?? `#${loan.id}`} ·{' '}
                {formatMoney(loan.outstanding_balance, currency)}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#8B968F"
        style={styles.input}
      />

      <Text style={styles.label}>Channel</Text>
      <View style={styles.chips}>
        {channels.map((item) => (
          <Pressable
            key={item.value}
            style={[styles.chip, channel === item.value && styles.chipActive]}
            onPress={() => setChannel(item.value)}
          >
            <Text
              style={[
                styles.chipText,
                channel === item.value && styles.chipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <PrimaryButton
        label="Save repayment"
        loading={submitting}
        onPress={() => void onSubmit()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.ink,
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: colors.forestBright,
    backgroundColor: '#E8F4EF',
  },
  chipText: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.forestBright,
  },
  hint: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
});
