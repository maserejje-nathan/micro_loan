import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../lib/config';
import { colors } from '../theme/colors';
import type { AuthMode } from '../types';

const { height: screenHeight } = Dimensions.get('window');

export function LoginScreen() {
  const { signIn, signInPortal, signingIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('staff');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslate = useRef(new Animated.Value(18)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(new Animated.Value(36)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(heroTranslate, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslate, {
          toValue: 0,
          duration: 480,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [heroOpacity, heroTranslate, sheetOpacity, sheetTranslate]);

  const canSubmit =
    mode === 'staff'
      ? Boolean(email && password)
      : Boolean(organizationSlug && phone && password);

  async function onSubmit() {
    setError(null);

    try {
      if (mode === 'staff') {
        await signIn(email, password);
      } else {
        await signInPortal(phone, password, organizationSlug);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        return;
      }

      setError('Something went wrong. Please try again.');
    }
  }

  function pressIn() {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  }

  function pressOut() {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.forestDeep, colors.forest, colors.forestMid]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={`h-${index}`}
            style={[styles.gridLineHorizontal, { top: 70 + index * 54 }]}
          />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={`v-${index}`}
            style={[styles.gridLineVertical, { left: 28 + index * 72 }]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.hero,
              {
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslate }],
              },
            ]}
          >
            <Text style={styles.mark}>AVANGO</Text>
            <Text style={styles.product}>Credit Platform</Text>
            <Text style={styles.tagline}>
              Lender workspace, platform admin, and client portal — one app.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              {
                opacity: sheetOpacity,
                transform: [{ translateY: sheetTranslate }],
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Welcome back</Text>
            <Text style={styles.sheetSubtitle}>
              {mode === 'staff'
                ? 'Sign in with your lender or platform admin account.'
                : 'Sign in with your lender code, phone, and portal password.'}
            </Text>

            <View style={styles.segment}>
              <Pressable
                style={[
                  styles.segmentItem,
                  mode === 'staff' && styles.segmentItemActive,
                ]}
                onPress={() => {
                  setMode('staff');
                  setError(null);
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'staff' && styles.segmentTextActive,
                  ]}
                >
                  Staff
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentItem,
                  mode === 'portal' && styles.segmentItemActive,
                ]}
                onPress={() => {
                  setMode('portal');
                  setError(null);
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'portal' && styles.segmentTextActive,
                  ]}
                >
                  Client portal
                </Text>
              </Pressable>
            </View>

            {mode === 'staff' ? (
              <View style={styles.field}>
                <Text style={styles.label}>Work email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="username"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@company.com"
                  placeholderTextColor="#8B968F"
                  style={[
                    styles.input,
                    focusedField === 'email' && styles.inputFocused,
                  ]}
                />
              </View>
            ) : (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Lender code</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={organizationSlug}
                    onChangeText={setOrganizationSlug}
                    onFocus={() => setFocusedField('slug')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="your-lender-slug"
                    placeholderTextColor="#8B968F"
                    style={[
                      styles.input,
                      focusedField === 'slug' && styles.inputFocused,
                    ]}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="07xxxxxxxx"
                    placeholderTextColor="#8B968F"
                    style={[
                      styles.input,
                      focusedField === 'phone' && styles.inputFocused,
                    ]}
                  />
                </View>
              </>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.passwordRow,
                  focusedField === 'password' && styles.inputFocused,
                ]}
              >
                <TextInput
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  placeholderTextColor="#8B968F"
                  style={styles.passwordInput}
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={8}
                  style={styles.showToggle}
                >
                  <Text style={styles.showToggleText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable
                style={[styles.button, signingIn && styles.buttonDisabled]}
                disabled={signingIn || !canSubmit}
                onPress={() => void onSubmit()}
                onPressIn={pressIn}
                onPressOut={pressOut}
              >
                {signingIn ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Sign in</Text>
                )}
              </Pressable>
            </Animated.View>

            <Text style={styles.footerNote}>
              {mode === 'staff'
                ? 'Protected access for lending teams and platform administrators.'
                : 'Use the phone and password set up by your lender for portal access.'}
            </Text>

            {__DEV__ ? (
              <Text style={styles.devHint}>Dev API · {API_BASE_URL}</Text>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.forestDeep,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    minHeight: screenHeight,
  },
  glowOrbTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.forestBright,
    opacity: 0.18,
  },
  glowOrbBottom: {
    position: 'absolute',
    top: 180,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.forestGlow,
    opacity: 0.12,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.08,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.leaf,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: '45%',
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.leaf,
  },
  hero: {
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 84 : 56,
    paddingBottom: 28,
    gap: 10,
  },
  mark: {
    color: colors.white,
    fontFamily: 'Fraunces_700Bold',
    fontSize: 44,
    letterSpacing: 1.2,
    lineHeight: 48,
  },
  product: {
    color: colors.leaf,
    fontFamily: 'DMSans_500Medium',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: 8,
    color: 'rgba(243, 238, 230, 0.78)',
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  sheet: {
    backgroundColor: colors.sandSoft,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D2D8D3',
    marginBottom: 6,
  },
  sheetTitle: {
    color: colors.ink,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
  },
  sheetSubtitle: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#E8EEEA',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: colors.white,
  },
  segmentText: {
    color: colors.inkMuted,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  segmentTextActive: {
    color: colors.forestBright,
  },
  field: {
    gap: 8,
  },
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
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    fontSize: 16,
    color: colors.ink,
    fontFamily: 'DMSans_400Regular',
  },
  passwordRow: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 8,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    fontSize: 16,
    color: colors.ink,
    fontFamily: 'DMSans_400Regular',
  },
  inputFocused: {
    borderColor: colors.forestBright,
    backgroundColor: '#FFFFFF',
  },
  showToggle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  showToggleText: {
    color: colors.forestBright,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#FCEBEA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F3C6C2',
  },
  error: {
    color: colors.danger,
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 4,
    backgroundColor: colors.forestBright,
    borderRadius: 14,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.white,
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  footerNote: {
    textAlign: 'center',
    color: colors.inkMuted,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  devHint: {
    textAlign: 'center',
    color: '#9AA59E',
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
  },
});
