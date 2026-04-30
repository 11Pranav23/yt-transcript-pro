# Deployment Guide

Complete guide for deploying the YouTube Transcript Generator to production.

## Prerequisites

- GitHub repository
- Heroku account (for backend) OR Railway/Render
- Vercel account (for frontend) OR Netlify
- Valid API keys (YouTube, OpenAI)

## Backend Deployment Options

### Option 1: Railway (Recommended)

Railway is simple, reliable, and has great free tier.

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**:
   ```bash
   npm install -g @railway/cli
   railway login
   cd backend
   railway up
   ```

3. **Set Environment Variables**:
   - Go to Railway Dashboard
   - Select your project
   - Go to Variables tab
   - Add:
     - `YOUTUBE_API_KEY`
     - `OPENAI_API_KEY`
     - `FRONTEND_URL` (your Vercel/Netlify URL)
     - `NODE_ENV=production`

4. **Get Your Backend URL**:
   - In Railway, go to Deployments
   - Copy the URL (e.g., `https://your-project-railway.up.railway.app`)

### Option 2: Heroku

1. **Create Heroku Account**:
   - Go to [heroku.com](https://heroku.com)
   - Sign up

2. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   heroku login
   ```

3. **Deploy**:
   ```bash
   cd backend
   heroku create your-app-name
   heroku buildpacks:add heroku/nodejs
   git push heroku main
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set YOUTUBE_API_KEY=your_key
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set FRONTEND_URL=your_frontend_url
   ```

5. **Get Your Backend URL**:
   ```bash
   heroku apps:info
   ```
   URL will be: `https://your-app-name.herokuapp.com`

### Option 3: Render

1. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**:
   - Select your repository
   - Set name, region
   - Environment: Node
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`

3. **Add Environment Variables**:
   - `YOUTUBE_API_KEY`
   - `OPENAI_API_KEY`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

Vercel is optimized for Next.js but works great with Create React App.

1. **Create Vercel Account**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**:
   - Import your repository
   - Select `frontend` folder as root
   - Add environment variables:
     - `REACT_APP_API_URL=https://your-backend-url.com/api`
   - Deploy

3. **Your Frontend URL**:
   - Provided by Vercel (e.g., `https://your-project.vercel.app`)

### Option 2: Netlify

1. **Create Netlify Account**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy Frontend**:
   - Connect your repository
   - Set base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
   - Add environment variables:
     - `REACT_APP_API_URL=https://your-backend-url.com/api`
   - Deploy

### Option 3: GitHub Pages

1. **Add to package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo",
   }
   ```

2. **Install gh-pages**:
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

3. **Update package.json scripts**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

## Complete Deployment Workflow

### Step 1: Deploy Backend First
- Push backend code
- Deploy to Railway/Heroku/Render
- Get backend URL
- Test health endpoint: `https://your-backend.com/api/health`

### Step 2: Update Frontend
- Update `REACT_APP_API_URL` with your backend URL
- Commit changes

### Step 3: Deploy Frontend
- Deploy to Vercel/Netlify
- Test API calls work

### Step 4: Verify
- Test transcript generation
- Test AI features
- Test export functionality

## Environment Variables Checklist

**Backend (.env)**:
- [ ] `YOUTUBE_API_KEY` - Valid API key
- [ ] `OPENAI_API_KEY` - Valid API key
- [ ] `FRONTEND_URL` - Your deployed frontend URL
- [ ] `PORT` - Usually 5000
- [ ] `NODE_ENV` - Set to "production"

**Frontend (.env)**:
- [ ] `REACT_APP_API_URL` - Your deployed backend URL

## Post-Deployment Testing

1. **Test Health Check**:
   ```bash
   curl https://your-backend-url/api/health
   ```

2. **Test Frontend Loads**:
   - Open https://your-frontend-url
   - Should load without errors

3. **Test API Connection**:
   - Paste YouTube URL
   - Click generate
   - Should fetch transcript

4. **Test AI Features** (if API keys valid):
   - Try generating summary
   - Try key points extraction

## Monitoring and Logs

### Railway
- Dashboard automatically shows logs
- Click "Logs" tab in deployment

### Heroku
```bash
heroku logs --tail
```

### Render
- Go to Logs tab in dashboard

### Vercel
- Go to Deployments → Logs

## Scaling Tips

1. **Database** (Optional):
   - Add MongoDB for storing history
   - Use env var for connection string

2. **Caching**:
   - Enable Redis for transcript caching
   - Reduces API calls and costs

3. **Rate Limiting**:
   - Add rate limiting middleware
   - Protect against abuse

4. **CDN**:
   - Serve frontend via CDN
   - Faster global access

## Cost Optimization

1. **Free Tiers**:
   - Railway: 5GB/month free
   - Vercel: Free tier sufficient
   - Heroku: $7+/month
   - Render: Free tier with sleep

2. **API Costs**:
   - YouTube API: Free with quotas
   - OpenAI: Pay per token ($0.0005/1K tokens)
   - Monitor usage: https://platform.openai.com/account/billing/overview

3. **Reduce Costs**:
   - Cache transcripts
   - Limit AI feature usage
   - Use free tier APIs when possible

## Troubleshooting

### "Cannot connect to API"
- Check backend URL in frontend .env
- Verify backend is running
- Check CORS configuration

### "Blank page on frontend"
- Check browser console (F12)
- Check build succeeded
- Verify index.html exists in static files

### "API returns 500 error"
- Check backend logs
- Verify environment variables set
- Check API key quotas

### "High API costs"
- Check OpenAI usage
- Implement caching
- Limit AI features or metered access

## Rollback Procedure

### If something breaks:

**Railway**:
- Redeploy previous version in Dashboard

**Heroku**:
```bash
heroku releases
heroku rollback v<number>
```

**Vercel/Netlify**:
- See Deployments tab
- Revert to previous version

## Security Checklist

- [ ] API keys not in code
- [ ] Environment variables set in production
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] CORS configured correctly
- [ ] Input validation present
- [ ] Error messages don't expose secrets

## Maintenance

1. **Weekly**:
   - Monitor error logs
   - Check API quotas
   - Monitor costs

2. **Monthly**:
   - Update dependencies
   - Review performance metrics
   - Check security advisories

3. **Quarterly**:
   - Major version updates
   - Infrastructure review
   - Capacity planning

---

**Deployed successfully? Congratulations! 🎉**
