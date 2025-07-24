# Srija Backend - Vertex AI Imagen Proxy

This backend service handles secure authentication with Google Cloud Vertex AI and proxies image generation requests from the React Native app.

## 🏗️ Architecture

```
React Native App → Backend Service → Vertex AI Imagen → Return Base64 Image
```

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd srija/backend
npm install
```

### 2. Google Cloud Setup

1. **Create/Select Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create or select a project
   - Note your project ID

2. **Enable APIs:**
   - Vertex AI API
   - Imagen API

3. **Set up Authentication:**
   ```bash
   # Install gcloud CLI if not already installed
   # Then authenticate:
   gcloud auth application-default login
   ```

4. **Enable Billing:**
   - Imagen pricing: ~$0.020 per image

### 3. Environment Configuration

Create `.env` file in the backend folder:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id

# Server Configuration (optional)
PORT=3001

# Example:
# GOOGLE_CLOUD_PROJECT=my-ai-project-123456
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 5. Update React Native App

Add to your main `.env` file (in `srija/` folder):

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001
```

Then restart your Expo development server:

```bash
npx expo start --clear
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Authentication Test
```bash
curl -X POST http://localhost:3001/api/test-auth
```

### Status Check
```bash
curl http://localhost:3001/api/status
```

### Generate Layout (Example)
```bash
curl -X POST http://localhost:3001/api/generate-layout \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A 2000 sq ft house with 3 bedrooms, 2 bathrooms, modern kitchen, living room"}'
```

## 📚 API Endpoints

### `GET /health`
Returns backend health status

### `GET /api/status`
Returns detailed service information

### `POST /api/test-auth`
Tests Google Cloud authentication

### `POST /api/generate-layout`
Generates house layout image

**Request:**
```json
{
  "prompt": "Detailed house specifications..."
}
```

**Response:**
```json
{
  "success": true,
  "imageUri": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "model": "imagen-4.0-generate-preview-06-06",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## 🔒 Security Features

- ✅ **Server-side Authentication**: Google Cloud credentials never exposed to client
- ✅ **CORS Protection**: Configured for React Native app
- ✅ **Request Validation**: Input validation and sanitization
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Rate Limiting**: Built-in protection (can be enhanced)

## 🐛 Troubleshooting

### "Error getting access token"
```bash
# Re-authenticate with Google Cloud
gcloud auth application-default login

# Verify authentication
gcloud auth list
```

### "GOOGLE_CLOUD_PROJECT not set"
Make sure your `.env` file is in the `backend/` folder and contains:
```env
GOOGLE_CLOUD_PROJECT=your-actual-project-id
```

### "API not enabled"
Enable required APIs in Google Cloud Console:
- Vertex AI API
- Imagen API

### "Billing not enabled"
Enable billing for your Google Cloud project.

### Backend not reachable from React Native
1. Make sure backend is running: `npm run dev`
2. Check the URL in your main `.env` file
3. For physical device testing, use your computer's IP:
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001
   ```

## 🚀 Production Deployment

### Environment Variables
```env
GOOGLE_CLOUD_PROJECT=your-production-project
PORT=8080
NODE_ENV=production
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### Cloud Run Deployment
```bash
# Build and deploy to Google Cloud Run
gcloud run deploy srija-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📊 Monitoring

The backend includes detailed logging for:
- Request/response tracking
- Authentication status
- Vertex AI API calls
- Error reporting

Logs include timestamps and request IDs for debugging.

## 💰 Cost Optimization

- **Image Generation**: ~$0.020 per image
- **Caching**: Consider implementing Redis for repeated requests
- **Rate Limiting**: Prevent abuse and unexpected charges
- **Monitoring**: Set up billing alerts in Google Cloud

## 📝 Development

### Project Structure
```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env               # Environment variables
├── .env.example       # Environment template
└── README.md          # This file
```

### Adding Features
- Image caching
- User authentication
- Request rate limiting
- Image variants (ultra/fast models)
- Batch processing

---

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify Google Cloud setup
3. Test endpoints individually
4. Check server logs for detailed errors

The backend is designed to be secure, scalable, and production-ready! 🎉 