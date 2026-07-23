import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { DetailField } from '../../components/DetailField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { colors } from '../../theme/colors';

export function LenderProfileScreen() {
  const { user, permissions, signOut } = useAuth();

  return (
    <Screen>
      <SectionHeader title="Profile" subtitle="Your lender account" />
      <Card>
        <View style={styles.grid}>
          <DetailField label="Name" value={user?.name} />
          <DetailField label="Email" value={user?.email} />
          <DetailField
            label="Organization"
            value={user?.organization?.name}
          />
          <DetailField
            label="Currency"
            value={user?.organization?.currency}
          />
          <DetailField
            label="Permissions"
            value={
              permissions.includes('*')
                ? 'All (*)'
                : `${permissions.length} granted`
            }
          />
        </View>
      </Card>
      <PrimaryButton
        label="Sign out"
        variant="danger"
        onPress={() => void signOut()}
      />
      <Text style={styles.hint}>
        Password and security settings are managed on the web app.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 14 },
  hint: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
});
