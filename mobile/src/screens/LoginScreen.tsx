import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../lib/config';

export function LoginScreen() {
  const { signIn, signingIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }

      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>Avango Credit Platform</Text>
        <Text style={styles.title}>Lender sign in</Text>
        <Text style={styles.subtitle}>
          Access your lending workspace from your phone.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Work email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            placeholderTextColor="#8A97A8"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            secureTextEntry
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#8A97A8"
            style={styles.input}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, signingIn && styles.buttonDisabled]}
          disabled={signingIn}
          onPress={onSubmit}
        >
          {signingIn ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </Pressable>

        <Text style={styles.hint}>API: {API_BASE_URL}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F2A24',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#F7F4EF',
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  brand: {
    color: '#1F6B57',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#14201C',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#5B6B63',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  field: {
    gap: 6,
  },
  label: {
    color: '#24342E',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7DFD9',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#14201C',
  },
  error: {
    color: '#B42318',
    fontSize: 14,
  },
  button: {
    marginTop: 4,
    backgroundColor: '#1F6B57',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: 4,
    color: '#7A8A82',
    fontSize: 12,
  },
});
