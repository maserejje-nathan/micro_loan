import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/Card';
import { DetailField } from '../../components/DetailField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';

export function AdminAccountScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <SectionHeader title="Account" subtitle="Platform administrator" />
      <Card>
        <View style={styles.grid}>
          <DetailField label="Name" value={user?.name} />
          <DetailField label="Email" value={user?.email} />
          <DetailField label="Role" value="Super admin" />
        </View>
      </Card>
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
});
