// Firebase Debug Utility
import { storage, auth } from '../../firebaseConfig';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

export const debugFirebaseConfig = () => {
  console.log('=== Firebase Configuration Debug ===');
  
  // Check environment variables
  const requiredEnvVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID'
  ];

  let missingVars: string[] = [];
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'undefined') {
      missingVars.push(varName);
      console.error(`❌ Missing: ${varName}`);
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 15)}...`);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Firebase Configuration Error: Missing environment variables');
    console.error('Create a .env file in your project root with these variables:');
    missingVars.forEach(varName => {
      console.error(`${varName}=your_value_here`);
    });
    return false;
  }

  // Check storage instance
  try {
    if (storage) {
      console.log('✅ Firebase Storage initialized successfully');
      console.log('Storage bucket:', storage.app.options.storageBucket);
      
      // Check auth state
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('✅ User authenticated:', currentUser.uid);
      } else {
        console.log('⚠️ User not authenticated - this might cause permission issues');
      }
      
      return true;
    } else {
      console.error('❌ Firebase Storage not initialized');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Firebase Storage initialization error:', error?.message);
    return false;
  }
};

export const testStorageConnection = async () => {
  try {
    console.log('🔍 Testing Firebase Storage connection...');
    
    // Try to list root directory first
    const rootRef = ref(storage, '/');
    const rootList = await listAll(rootRef);
    console.log('✅ Root storage access successful');
    console.log('📁 Root folders found:', rootList.prefixes.length);
    
    // List root folder names
    if (rootList.prefixes.length > 0) {
      console.log('📁 Root folder names:', rootList.prefixes.map(folder => folder.name));
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Firebase Storage connection failed:', error?.code, error?.message);
    
    // Provide specific error guidance
    if (error?.code === 'storage/unauthorized') {
      console.error('🔐 PERMISSION ISSUE: Firebase Storage rules are blocking access');
      console.error('💡 Solution: Update your Firebase Storage rules:');
      console.error(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Allow all reads (testing only)
      allow write: if request.auth != null;
    }
  }
}
      `);
    } else if (error?.code === 'storage/unknown') {
      console.error('🔧 CONFIGURATION ISSUE: Unknown storage error');
      console.error('💡 Solutions to try:');
      console.error('1. Check your Firebase project is active');
      console.error('2. Verify storage bucket exists');
      console.error('3. Check internet connection');
      console.error('4. Try restarting Expo dev server');
    } else if (error?.code === 'storage/bucket-not-found') {
      console.error('🪣 BUCKET ISSUE: Storage bucket not found');
      console.error('💡 Solution: Check EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET value');
      console.error('Current bucket:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET);
    } else if (error?.code === 'storage/retry-limit-exceeded') {
      console.error('🌐 NETWORK ISSUE: Connection timeout');
      console.error('💡 Solution: Check your internet connection');
    }
    
    return false;
  }
};

export const testSpecificPath = async (path: string) => {
  try {
    console.log(`🔍 Testing specific path: ${path}`);
    
    const pathRef = ref(storage, path);
    const pathList = await listAll(pathRef);
    
    console.log(`✅ Path "${path}" accessible`);
    console.log(`📁 Folders found: ${pathList.prefixes.length}`);
    console.log(`📄 Files found: ${pathList.items.length}`);
    
    if (pathList.prefixes.length > 0) {
      console.log('📁 Subfolders:', pathList.prefixes.map(folder => folder.name));
    }
    
    if (pathList.items.length > 0) {
      console.log('📄 Files:', pathList.items.map(item => item.name));
      
      // Try to get download URL for first file
      try {
        const firstFileUrl = await getDownloadURL(pathList.items[0]);
        console.log('✅ Successfully got download URL for first file');
        console.log('🔗 URL preview:', firstFileUrl.substring(0, 50) + '...');
      } catch (urlError: any) {
        console.error('❌ Failed to get download URL:', urlError?.code, urlError?.message);
      }
    }
    
    return true;
  } catch (error: any) {
    console.error(`❌ Path "${path}" test failed:`, error?.code, error?.message);
    return false;
  }
};

export const runFullDiagnostics = async (testPath?: string) => {
  console.log('🚀 Running Full Firebase Storage Diagnostics...');
  console.log('=====================================');
  
  // Step 1: Check configuration
  const configOk = debugFirebaseConfig();
  
  if (!configOk) {
    console.log('❌ Configuration failed - stopping diagnostics');
    return false;
  }
  
  // Step 2: Test basic connection
  const connectionOk = await testStorageConnection();
  
  if (!connectionOk) {
    console.log('❌ Connection failed - check the solutions above');
    return false;
  }
  
  // Step 3: Test specific path if provided
  if (testPath) {
    await testSpecificPath(testPath);
  }
  
  console.log('🎉 Firebase Storage diagnostics complete!');
  return true;
}; 