// Vertex AI Imagen Service for Layout Generation
// This file handles the integration with Google's Vertex AI Imagen models via backend proxy

// Configuration for Backend API
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Interface for layout generation options
 */
interface LayoutGenerationOptions {
  prompt: string;
}

/**
 * Interface for layout generation result
 */
interface LayoutGenerationResult {
  success: boolean;
  imageUri?: string;
  error?: string;
  note?: string;
}

/**
 * Generate house layout using backend proxy to Vertex AI Imagen
 * @param options - Layout generation options containing the prompt
 * @returns Promise<LayoutGenerationResult>
 */
export const generateHouseLayout = async (options: LayoutGenerationOptions): Promise<LayoutGenerationResult> => {
  try {
    console.log('🏠 Starting layout generation via backend...');
    console.log('📝 Prompt length:', options.prompt.length);
    
    if (!validatePrompt(options.prompt)) {
      return {
        success: false,
        error: 'Invalid prompt provided'
      };
    }

    console.log('🔗 Connecting to backend at:', BACKEND_URL);

    // Make request to backend service
    const response = await fetch(`${BACKEND_URL}/api/generate-layout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: options.prompt
      })
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Backend request failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse error response, use default message
      }

      // If backend is not reachable, show fallback
      if (response.status === 0 || !response.status) {
        console.log('🔄 Backend not reachable - using fallback');
        return await getFallbackResult(options.prompt, 'Backend service not available');
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('📦 Received response from backend');

    if (result.success && result.imageUri) {
      console.log('✅ Layout generated successfully via backend!');
      return {
        success: true,
        imageUri: result.imageUri,
        note: `Generated with ${result.model || 'Vertex AI Imagen'} via backend proxy`
      };
    } else {
      return {
        success: false,
        error: result.error || 'Unknown error from backend'
      };
    }

  } catch (error: any) {
    console.error('❌ Error generating layout:', error);
    
    // Check if it's a network error (backend not running)
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      console.log('🔄 Backend not available - using fallback');
      return await getFallbackResult(options.prompt, 'Backend service not running. Start backend to enable AI generation.');
    }
    
    // Return fallback result with error details
    return await getFallbackResult(options.prompt, error.message);
  }
};

/**
 * Check backend health and authentication status
 */
export const checkBackendStatus = async (): Promise<{ available: boolean, authenticated?: boolean, error?: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      // Check if authentication works
      const authResponse = await fetch(`${BACKEND_URL}/api/test-auth`, { method: 'POST' });
      const authData = await authResponse.json();
      
      return {
        available: true,
        authenticated: authData.success,
        error: authData.success ? undefined : authData.error
      };
    }
    return { available: false, error: 'Backend not responding' };
  } catch (error: any) {
    return { available: false, error: error.message };
  }
};

/**
 * Get fallback result with sample architectural images
 */
const getFallbackResult = async (prompt: string, errorMessage?: string): Promise<LayoutGenerationResult> => {
  console.log('🔄 Using development fallback with sample images');
  
  const architecturalSamples = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600564195980-a3b0f4c04e88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
  ];
  
  const imageIndex = Math.abs(prompt.length) % architecturalSamples.length;
  const selectedImage = architecturalSamples[imageIndex];
  
  const note = errorMessage 
    ? `Development mode: ${errorMessage}`
    : 'Development mode: Using sample floor plan.';
  
  return {
    success: true,
    imageUri: selectedImage,
    note: note
  };
};

/**
 * Validate the layout generation prompt
 * @param prompt - The prompt to validate
 * @returns boolean indicating if prompt is valid
 */
export const validatePrompt = (prompt: string): boolean => {
  if (!prompt || prompt.trim().length === 0) {
    return false;
  }
  
  // Check for minimum required information
  const requiredFields = [
    'Plot Area',
    'Plot Dimensions', 
    'Room'
  ];
  
  const hasRequiredInfo = requiredFields.some(field => 
    prompt.toLowerCase().includes(field.toLowerCase())
  );
  
  return hasRequiredInfo && prompt.length >= 50;
};

/**
 * Get complete setup instructions for backend proxy
 * @returns string with detailed setup instructions
 */
export const getInstallationInstructions = (): string => {
  return `
🚀 BACKEND PROXY SETUP FOR VERTEX AI IMAGEN

📋 CURRENT ARCHITECTURE:
React Native App → Backend Service → Vertex AI Imagen → Return Image

🏗️ BACKEND SETUP:

1. 📁 Navigate to backend folder:
   cd srija/backend

2. 📦 Install dependencies:
   npm install

3. 🔐 Set up Google Cloud authentication:
   gcloud auth application-default login

4. ⚙️ Create .env file in backend folder:
   GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
   PORT=3001

5. 🚀 Start backend server:
   npm run dev

📱 REACT NATIVE SETUP:

1. ⚙️ Add to your main .env file:
   EXPO_PUBLIC_BACKEND_URL=http://localhost:3001

2. 🔄 Restart Expo dev server:
   npx expo start --clear

🌐 GOOGLE CLOUD SETUP:

1. 🌍 Create/select project at console.cloud.google.com
2. 🔧 Enable APIs:
   - Vertex AI API
   - Imagen API
3. 💰 Enable billing (~$0.020 per image)

🧪 TESTING:

1. ✅ Health check: http://localhost:3001/health
2. 🔐 Auth test: http://localhost:3001/api/test-auth
3. ⚙️ Status: http://localhost:3001/api/status

🎯 CURRENT STATUS:
✅ Backend service created
✅ Proxy architecture implemented  
✅ Fallback system working
🔄 Waiting for backend setup

📚 BACKEND ENDPOINTS:
- POST /api/generate-layout - Generate house layout
- POST /api/test-auth - Test Google Cloud auth
- GET /health - Health check
- GET /api/status - Service status

🔒 SECURITY BENEFITS:
✅ API keys secured server-side
✅ CORS protection
✅ Request validation  
✅ Error handling
✅ No client-side auth complexity

Backend URL: ${BACKEND_URL}
`;
};

// Export the model name for consistency
export const GEMINI_MODEL_NAME = 'imagen-4.0-generate-preview-06-06'; // Via Backend Proxy 