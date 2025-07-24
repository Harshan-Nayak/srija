const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = 'us-central1';
const IMAGEN_MODEL = 'imagen-4.0-generate-preview-06-06';

/**
 * Get Google Cloud access token using gcloud CLI with improved error handling
 */
const getGoogleCloudAccessToken = () => {
  return new Promise((resolve, reject) => {
    exec('gcloud auth print-access-token', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error executing gcloud command:', error);
        reject(error);
        return;
      }
      if (stderr) {
        console.error('⚠️ gcloud stderr:', stderr);
        // Consider rejecting if stderr contains actual errors
      }
      const token = stdout.trim();
      if (!token) {
        reject(new Error("Empty access token received from gcloud"));
        return;
      }
      console.log('✅ Fresh access token obtained');
      resolve(token);
    });
  });
};

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Srija Backend',
    vertexAI: 'ready',
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate house layout using Vertex AI Imagen
 */
app.post('/api/generate-layout', async (req, res) => {
  try {
    console.log('🏠 Received layout generation request');
    
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    if (!GOOGLE_CLOUD_PROJECT) {
      return res.status(500).json({
        success: false,
        error: 'GOOGLE_CLOUD_PROJECT environment variable not set'
      });
    }

    // Get a fresh access token right before making the API call
    console.log('🔐 Getting fresh Google Cloud access token...');
    let accessToken;
    try {
      accessToken = await getGoogleCloudAccessToken();
    } catch (tokenError) {
      console.error('❌ Failed to obtain access token:', tokenError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to obtain access token',
        details: tokenError.message
      });
    }
    
    // Create architectural floor plan prompt for Imagen
    const architecturalPrompt = `Generate a detailed architectural floor plan drawing, top-down view, showing an open-concept layout design: ${prompt}. 

STYLE REQUIREMENTS:
- Top-down architectural floor plan view (NOT exterior house view)
- Open-concept layout with flowing spaces between living, dining, and kitchen areas
- Professional technical blueprint style with clean lines
- White background with black line drawings
- Room boundaries clearly defined with walls shown as thick black lines
- All doors and windows marked with standard architectural symbols

ROOM LAYOUT:
- Open-concept design connecting living room, dining area, and kitchen
- Clear room labels inside each space (Living, Dining, Kitchen, Master Bedroom, etc.)
- Room dimensions shown in feet (e.g., "12x14 ft")
- Furniture placement indicated with simple outlines
- Doorways and openings clearly marked
- Flow between spaces optimized for open living

TECHNICAL DETAILS:
- Architectural symbols for fixtures (toilets, sinks, appliances)
- Wall thickness appropriate for scale
- Door swing directions indicated
- Window placements marked
- Electrical symbols if applicable
- Scale and dimension annotations
- Professional architectural drawing standards

Create an open-floor plan layout that shows the internal room arrangement from above, similar to architectural blueprints used for construction.`;

    console.log('🤖 Sending request to Vertex AI Imagen...');
    
    // Make request to Vertex AI Imagen API
    const apiUrl = `https://${GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT}/locations/${GOOGLE_CLOUD_LOCATION}/publishers/google/models/${IMAGEN_MODEL}:predict`;
    
    const requestBody = {
      instances: [
        {
          prompt: architecturalPrompt
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        outputOptions: {
          mimeType: "image/jpeg"
        }
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI API error:', response.status, errorText);
      
      return res.status(response.status).json({
        success: false,
        error: `Vertex AI API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    const result = await response.json();
    console.log('📦 Received response from Vertex AI');

    // Process the response
    if (result.predictions && result.predictions.length > 0) {
      const prediction = result.predictions[0];
      
      if (prediction.bytesBase64Encoded) {
        const imageUri = `data:image/jpeg;base64,${prediction.bytesBase64Encoded}`;
        
        console.log('✅ Layout generated successfully!');
        
        return res.json({
          success: true,
          imageUri: imageUri,
          model: IMAGEN_MODEL,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Unexpected response format
    console.log('⚠️ Unexpected API response format');
    return res.status(500).json({
      success: false,
      error: 'Unexpected response format from Vertex AI'
    });

  } catch (error) {
    console.error('❌ Error in layout generation:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Test endpoint for debugging authentication
 */
app.post('/api/test-auth', async (req, res) => {
  try {
    console.log('🧪 Testing fresh token acquisition...');
    const token = await getGoogleCloudAccessToken();
    console.log('✅ Token test successful');
    
    res.json({
      success: true,
      hasToken: !!token,
      tokenLength: token.length,
      project: GOOGLE_CLOUD_PROJECT,
      timestamp: new Date().toISOString(),
      message: 'Fresh token acquired successfully'
    });
  } catch (error) {
    console.error('❌ Token test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      suggestion: 'Run: gcloud auth application-default login',
      troubleshooting: [
        '1. Ensure gcloud CLI is installed',
        '2. Run: gcloud auth application-default login',
        '3. Verify project access permissions'
      ]
    });
  }
});

/**
 * Get server status and configuration
 */
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Srija Backend',
    status: 'running',
    port: PORT,
    model: IMAGEN_MODEL,
    project: GOOGLE_CLOUD_PROJECT || 'NOT_SET',
    location: GOOGLE_CLOUD_LOCATION,
    endpoints: {
      health: '/health',
      generateLayout: '/api/generate-layout',
      testAuth: '/api/test-auth',
      status: '/api/status'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Srija Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`⚙️ Status: http://localhost:${PORT}/api/status`);
  console.log(`🎨 Generate layout: http://localhost:${PORT}/api/generate-layout`);
  
  if (!GOOGLE_CLOUD_PROJECT) {
    console.warn('⚠️ GOOGLE_CLOUD_PROJECT not set - add to .env file');
  }
}); 