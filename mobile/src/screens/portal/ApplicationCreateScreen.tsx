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
  createPortalApplication,
  fetchPortalProducts,
} from '../../api/portal';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/DetailField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { formatMoney } from '../../lib/format';
import { colors } from '../../theme/colors';
import type { PortalApplicationsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  PortalApplicationsStackParamList,
  'PortalApplicationCreate'
>;

export function PortalApplicationCreateScreen({ navigation }: Props) {
  const { portalCustomer } = useAuth();
  const currency = portalCustomer?.organization?.currency ?? 'UGX';
  const loader = useCallback(() => fetchPortalProducts(), []);
  const { data: products, loading, error } = useResource(loader);
  const [productId, setProductId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [termDays, setTermDays] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit() {
    if (!productId || !amount || !termDays) {
      setFormError('Product, amount, and term are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createPortalApplication({
        loan_product_id: productId,
        product_id: productId,
        requested_amount: Number(amount),
        term_days: Number(termDays),
        purpose: purpose || undefined,
      });
      navigation.replace('PortalApplicationDetail', { id: created.id });
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Could not create application.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !products) {
    return <LoadingState />;
  }

  return (
    <Screen>
      <SectionHeader
        title="New application"
        subtitle="Choose a product and request an amount"
      />
      <ErrorBanner message={error ?? formError} />

      <Text style={styles.label}>Product</Text>
      <View style={styles.chips}>
        {(products ?? []).length === 0 ? (
          <Text style={styles.hint}>
            No products returned. Enter a product ID if you know it.
          </Text>
        ) : (
          products?.map((product) => (
            <Pressable
              key={product.id}
              style={[
                styles.chip,
                productId === product.id && styles.chipActive,
              ]}
              onPress={() => setProductId(product.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  productId === product.id && styles.chipTextActive,
                ]}
              >
                {product.name}
                {product.max_amount != null
                  ? ` · up to ${formatMoney(product.max_amount, currency)}`
                  : ''}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      {(products ?? []).length === 0 ? (
        <>
          <Text style={styles.label}>Product ID</Text>
          <TextInput
            value={productId != null ? String(productId) : ''}
            onChangeText={(value) =>
              setProductId(value ? Number(value) : null)
            }
            keyboardType="number-pad"
            placeholder="e.g. 1"
            placeholderTextColor="#8B968F"
            style={styles.input}
          />
        </>
      ) : null}

      <Text style={styles.label}>Requested amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#8B968F"
        style={styles.input}
      />

      <Text style={styles.label}>Term (days)</Text>
      <TextInput
        value={termDays}
        onChangeText={setTermDays}
        keyboardType="number-pad"
        placeholder="30"
        placeholderTextColor="#8B968F"
        style={styles.input}
      />

      <Text style={styles.label}>Purpose (optional)</Text>
      <TextInput
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Working capital"
        placeholderTextColor="#8B968F"
        style={styles.input}
      />

      <PrimaryButton
        label="Create draft"
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
