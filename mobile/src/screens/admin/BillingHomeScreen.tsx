import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { ListRow } from '../../components/ListRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import type { AdminBillingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AdminBillingStackParamList, 'BillingHome'>;

export function BillingHomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <SectionHeader
        title="Billing"
        subtitle="Plans, subscriptions, and invoices"
      />
      <View style={{ gap: 10 }}>
        <ListRow
          title="Plans"
          subtitle="Subscription catalogue"
          onPress={() => navigation.navigate('Plans')}
        />
        <ListRow
          title="Subscriptions"
          subtitle="Activate, renew, or cancel"
          onPress={() => navigation.navigate('Subscriptions')}
        />
        <ListRow
          title="Invoices"
          subtitle="Mark invoices as paid"
          onPress={() => navigation.navigate('Invoices')}
        />
      </View>
    </Screen>
  );
}
