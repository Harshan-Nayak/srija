import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

export default function ForgotPasswordScreen() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stage, setStage] = useState<'email' | 'code' | 'newPassword'>('email');
  
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const onRequestReset = async () => {
    if (!emailAddress) return;

    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setStage('code');
      setSuccessMessage('Check your email for the reset code');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to send reset code. Please try again.');
      console.error("Reset password error:", err);
    }
  };

  const onVerifyCode = async () => {
    if (!code) return;

    try {
      await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });
      setStage('newPassword');
      setSuccessMessage('Enter your new password');
    } catch (err) {
      Alert.alert('Error', 'Invalid code. Please try again.');
      console.error("Code verification error:", err);
    }
  };

  const onResetPassword = async () => {
    if (!password) return;

    try {
      await signIn?.resetPassword({
        password,
      });
      const createdSessionId = signIn?.createdSessionId;
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace('/(app)/home');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
      console.error("Password reset error:", err);
    }
  };

  const onBackToSignIn = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Reset Password</Text>
        {successMessage ? (
          <Text style={styles.successMessage}>{successMessage}</Text>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        {stage === 'email' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={emailAddress}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity 
              style={[styles.button, !emailAddress ? styles.buttonDisabled : null]}
              onPress={onRequestReset}
              disabled={!emailAddress}
            >
              <Text style={styles.buttonText}>Send Reset Code</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === 'code' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Reset Code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            <TouchableOpacity 
              style={[styles.button, !code ? styles.buttonDisabled : null]}
              onPress={onVerifyCode}
              disabled={!code}
            >
              <Text style={styles.buttonText}>Verify Code</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === 'newPassword' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              style={[styles.button, !password ? styles.buttonDisabled : null]}
              onPress={onResetPassword}
              disabled={!password}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackToSignIn}
        >
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  successMessage: {
    color: '#4CAF50',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  inputContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
}); 