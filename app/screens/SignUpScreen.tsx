import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      // First create the user with just email and password
      await signUp.create({
        emailAddress,
        password,
      });

      // Then set the user's name in a separate step
      await signUp.update({
        unsafeMetadata: {
          firstName,
          lastName,
        },
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Sign up error:", JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.replace('/(app)/home');
    } catch (err: any) {
      console.error("Verification error:", JSON.stringify(err, null, 2));
    }
  };

  const onSignInPress = () => {
    router.back();
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/projectwall.png')}
      style={styles.container}
    >
      <View style={styles.backgroundOverlay} />
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.appNameText}>ConneX</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.accountContainer}>
            <Text style={styles.accountText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSignInPress}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.signUpHeaderText}>Sign up</Text>

          {!pendingVerification ? (
            <>
              <Text style={styles.inputLabel}>Enter your first name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.inputLabel}>Enter your last name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.inputLabel}>Enter your email address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={emailAddress}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmailAddress}
                />
              </View>

              <Text style={styles.inputLabel}>Create a password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, !firstName || !lastName || !emailAddress || !password ? styles.buttonDisabled : null]}
                onPress={onSignUpPress}
                disabled={!firstName || !lastName || !emailAddress || !password}
              >
                <Text style={styles.buttonText}>Sign up</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.verificationText}>
                Please check your email for a verification code.
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Verification Code"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />
              </View>
              <TouchableOpacity 
                style={[styles.button, !code ? styles.buttonDisabled : null]}
                onPress={onVerifyPress}
                disabled={!code}
              >
                <Text style={styles.buttonText}>Verify Email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    opacity: 0.4,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  appNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 32,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  accountText: {
    color: '#666',
    fontSize: 14,
  },
  signInLink: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  signUpHeaderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
}); 