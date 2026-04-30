# 🚀 Professional Deployment Guide (PRO Version)

This guide provides a comprehensive walkthrough for deploying the **YT Transcript PRO** application to a production environment using industry-standard cloud providers.

## 🏗️ Architecture Overview

The PRO version utilizes a robust, real-time architecture:
- **Frontend**: React.js (High-performance UI hosted on **Vercel**)
- **Backend**: Node.js / Express (Scalable API hosted on **Render** or **Railway**)
- **Real-time**: **Socket.io** for live transcription and dubbing progress
- **Database**: **MongoDB Atlas** for history, user settings, and caching
- **Processing**: **FFmpeg** integration for synchronized AI Dubbing

---

## 1. Environment Configuration

The PRO version requires additional environment variables for advanced features.

### Backend (.env)
| Variable | Description | Recommended Value |
| :--- | :--- | :--- |
| `YOUTUBE_API_KEY` | Google Cloud Console API Key | `AIza...` |
| `OPENAI_API_KEY` | OpenAI Secret Key (for GPT-4 & Whisper) | `sk-...` |
| `FRONTEND_URL` | The URL of your deployed frontend | `https://your-app.vercel.app` |
| `MONGODB_URI` | Connection string for MongoDB | `mongodb+srv://...` |
| `CACHE_ENABLED` | Enable transcript caching | `true` |
| `CACHE_TTL` | Cache duration in seconds | `3600` (1 hour) |
| `MAX_FILE_SIZE` | Max audio upload size (Whisper) | `26214400` (25MB) |
| `PORT` | Backend listener port | `5000` |

### Frontend (.env)
| Variable | Description | Value |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Full URL to your backend API | `https://your-api.onrender.com/api` |

---

## 2. Database Setup (MongoDB Atlas)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free Cluster** (M0).
3. Under **Network Access**, add IP `0.0.0.0/0` (or the specific outbound IPs of your hosting provider).
4. Create a **Database User** with read/write permissions.
5. Get your **Connection String** and update `MONGODB_URI` in your backend environment variables.

---

## 3. Backend Deployment (Render.com)

1. **New Web Service**: Connect your GitHub repository.
2. **Root Directory**: `backend`
3. **Runtime**: `Node`
4. **Build Command**: `npm install`
5. **Start Command**: `node server.js`
6. **Advanced Configuration**:
   - Add all environment variables listed in Section 1.
   - **Disk (Optional)**: If you plan to store dubbing files permanently, attach a 1GB persistent disk at `/uploads`. Otherwise, they will be ephemeral.

---

## 4. Frontend Deployment (Vercel)

1. **Import Project**: Select your repository on Vercel.
2. **Framework**: `Create React App`
3. **Root Directory**: `frontend`
4. **Environment Variables**: Add `REACT_APP_API_URL`.
5. **Deployment**: Vercel automatically handles the `vercel.json` rewrites for React Router.

---

## 🌟 Pro Features & Scaling

### 🎙️ Whisper AI & Dubbing
The PRO version includes native support for OpenAI Whisper. Ensure your `OPENAI_API_KEY` has sufficient credits. The `MAX_FILE_SIZE` should match the Whisper limit (25MB).

### 🚀 Performance Optimization
- **Caching**: The system uses MongoDB to cache transcripts, significantly reducing API costs and latency.
- **FFmpeg**: The backend includes `@ffmpeg-installer/ffmpeg` for automated audio merging during dubbing.

### 🛠️ Troubleshooting
*   **"Socket Connection Failed"**: Ensure your `FRONTEND_URL` in the backend exactly matches your Vercel URL (including `https://` but NO trailing slash).
*   **"Upload Error"**: Check `MAX_FILE_SIZE` in backend env and Ensure Render's "Plan" allows for larger memory usage during processing.
*   **"404 on Refresh"**: Handled by `vercel.json` in the frontend root.

---

## ✅ Post-Deployment Checklist
- [ ] Verify SSL is active on both domains.
- [ ] Test a full YouTube transcript extraction.
- [ ] Test the "Generate Summary" feature (OpenAI integration).
- [ ] Verify "AI Dubbing" progress updates via Socket.io.
- [ ] Check MongoDB Atlas to see if transcripts are being cached.

🎉 **Your YT Transcript PRO instance is now live and ready for production!**
