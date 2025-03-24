import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Image } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
      router.replace('/(app)/home');
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  const onGooglePress = async () => {
    try {
      const result = await startOAuthFlow();
      if (result?.createdSessionId && result?.setActive) {
        await result.setActive({ session: result.createdSessionId });
        router.replace('/(app)/home');
      }
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  const onSignUpPress = () => {
    router.push('/screens/SignUpScreen');
  };

  const onForgotPasswordPress = () => {
    router.push('/screens/ForgotPasswordScreen');
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
          <View style={styles.noAccountContainer}>
            <Text style={styles.noAccountText}>No account? </Text>
            <TouchableOpacity onPress={onSignUpPress}>
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.loginText}>Login</Text>

          <Text style={styles.inputLabel}>Enter your username or email address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="email id"
              placeholderTextColor="#999"
              value={emailAddress}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmailAddress}
            />
          </View>

          <Text style={styles.inputLabel}>Enter your Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="password"
              placeholderTextColor="#999"
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
            style={styles.forgotPasswordButton} 
            onPress={onForgotPasswordPress}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, !emailAddress || !password ? styles.loginButtonDisabled : null]}
            onPress={onSignInPress}
            disabled={!emailAddress || !password}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Sign in with</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={onGooglePress}>
            <Image 
              source={require('../../assets/images/google.png')} 
              style={styles.googleIcon}
            />
          </TouchableOpacity>
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
  noAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  noAccountText: {
    color: '#666',
    fontSize: 14,
  },
  signUpText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  loginText: {
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#333',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    alignSelf: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  googleIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
}); 