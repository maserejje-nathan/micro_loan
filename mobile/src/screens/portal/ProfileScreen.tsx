import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  fetchPortalProfile,
  updatePortalPassword,
  updatePortalProfile,
} from '../../api/portal';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { DetailField, LoadingState } from '../../components/DetailField';
import { ErrorBanner } from '../../components/ErrorBanner';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { useResource } from '../../hooks/useResource';
import { displayName } from '../../lib/format';
import { colors } from '../../theme/colors';

export function PortalProfileScreen() {
  const { signOut, portalCustomer } = useAuth();
  const loader = useCallback(() => fetchPortalProfile(), []);
  const { data, loading, refreshing, error, refresh, setData } =
    useResource(loader);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const profile = data ?? portalCustomer;

  async function onSaveProfile() {
    setSaving(true);
    setFormError(null);
    setMessage(null);
    try {
      const updated = await updatePortalProfile({
        email: email || profile?.email || undefined,
        address: address || profile?.address || undefined,
      });
      setData(updated);
      setMessage('Profile updated.');
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not update profile.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function onSavePassword() {
    if (!password || password !== passwordConfirmation) {
      setFormError('Passwords must match.');
      return;
    }

    setSaving(true);
    setFormError(null);
    setMessage(null);
    try {
      await updatePortalPassword({
        password,
        password_confirmation: passwordConfirmation,
      });
      setPassword('');
      setPasswordConfirmation('');
      setMessage('Password updated.');
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not update password.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading && !profile) {
    return <LoadingState />;
  }

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <SectionHeader
        title={displayName(profile)}
        subtitle={profile?.organization?.name ?? 'Client portal'}
      />
      <ErrorBanner message={error ?? formError} />
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <Card>
        <View style={styles.grid}>
          <DetailField label="Phone" value={profile?.phone} />
          <DetailField
            label="Reference"
            value={profile?.reference_number}
          />
          <DetailField label="Email" value={profile?.email} />
          <DetailField label="Address" value={profile?.address} />
        </View>
      </Card>

      <Text style={styles.label}>Update email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={profile?.email ?? 'you@example.com'}
        placeholderTextColor="#8B968F"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <Text style={styles.label}>Update address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder={profile?.address ?? 'Address'}
        placeholderTextColor="#8B968F"
        style={styles.input}
      />
      <PrimaryButton
        label="Save profile"
        loading={saving}
        onPress={() => void onSaveProfile()}
      />

      <SectionHeader title="Password" />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="New password"
        placeholderTextColor="#8B968F"
        style={styles.input}
      />
      <TextInput
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
        secureTextEntry
        placeholder="Confirm password"
        placeholderTextColor="#8B968F"
        style={styles.input}
      />
      <PrimaryButton
        label="Update password"
        variant="secondary"
        loading={saving}
        onPress={() => void onSavePassword()}
      />

      <PrimaryButton
        label="Sign out"
        variant="danger"
        onPress={() => void signOut()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
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
  success: {
    color: colors.forestBright,
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
});
