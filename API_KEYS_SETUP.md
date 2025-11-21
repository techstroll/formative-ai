# API Keys Setup Guide

This guide explains which API keys are required for full functionality of the Formative.AI platform and how to configure them.

## Quick Summary

The system has been configured to use **Claude (Anthropic)** as the primary LLM since you have a Claude subscription. OpenAI is available as a fallback.

### Required API Keys (To Get Working Now)
1. **Anthropic Claude API Key** ✅ HIGH PRIORITY - You have a subscription
2. Database & Redis - Already configured locally

### Optional API Keys (Nice-to-Have)
1. **OpenAI API Key** - Optional fallback
2. **Google Custom Search API** - For web search in research
3. **Pinecone** - For advanced RAG (vector search)
4. **AWS** - For file storage
5. **SendGrid** - For email notifications

---

## 1. Claude API Key (PRIMARY - REQUIRED FOR REAL AI)

### Why You Need It
Your research generation currently uses mock data. To get real AI-powered research analysis, you need to provide your Claude API key.

### How to Get Your Claude API Key

1. **Sign in to Anthropic Console**
   - Go to https://console.anthropic.com
   - Sign in with your Claude subscription account

2. **Create API Key**
   - Click "API Keys" in the left sidebar
   - Click "Create Key"
   - Give it a name like "Formative-AI"
   - Copy the key (it will start with `sk-ant-`)

3. **Keep it Secure**
   - Do NOT commit this to version control
   - The `.env` files are already in `.gitignore`
   - Treat it like a password

### Configuration

#### For AI Pipeline (FastAPI Service)
Edit `/Users/nick/Development/formative-ai/ai-pipeline/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_API_KEY_HERE
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

#### For Backend (Optional - Currently Only AI Pipeline Uses It)
Edit `/Users/nick/Development/formative-ai/backend/.env`:
```bash
CLAUDE_API_KEY=sk-ant-YOUR_ACTUAL_API_KEY_HERE
```

### Verify It Works
After setting your Claude API key:
1. Restart the development servers
2. Try generating a research report from the UI
3. Check the browser console and terminal for any errors
4. The research should complete with real AI analysis instead of mock data

---

## 2. OpenAI API Key (OPTIONAL - Fallback)

### Why You Need It
If Claude API fails, the system will automatically fall back to OpenAI. If you don't provide an OpenAI key, the system will still work fine (just relies on Claude).

### How to Get Your OpenAI API Key

1. **Sign in to OpenAI Platform**
   - Go to https://platform.openai.com
   - Sign in with your account

2. **Create API Key**
   - Click "API Keys" in the left sidebar
   - Click "Create new secret key"
   - Copy the key (it will start with `sk-`)

3. **Configuration**
Edit `/Users/nick/Development/formative-ai/ai-pipeline/.env`:
```bash
OPENAI_API_KEY=sk-YOUR_ACTUAL_API_KEY_HERE
OPENAI_MODEL=gpt-4
```

---

## 3. Google Custom Search API (OPTIONAL - For Web Search)

### Why You Need It
Currently disabled in mock data mode. If enabled, it would allow the research agent to search the web for market data and competitor information.

### How to Set Up

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create a new project

2. **Enable Custom Search API**
   - Search for "Custom Search API"
   - Click "Enable"

3. **Create Credentials**
   - Go to "Credentials"
   - Create an "API Key"
   - Copy it

4. **Set Up Custom Search Engine**
   - Go to https://programmablesearchengine.google.com
   - Create a new search engine
   - Get the Search Engine ID

5. **Configuration**
Edit `/Users/nick/Development/formative-ai/ai-pipeline/.env`:
```bash
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

---

## 4. Pinecone (OPTIONAL - For RAG Vector Search)

### Why You Need It
Enables Retrieval Augmented Generation (RAG) - allows the AI to search a knowledge base of documents for relevant context before generating responses. Currently disabled.

### How to Set Up

1. **Sign Up for Pinecone**
   - Go to https://www.pinecone.io
   - Create a free account

2. **Create API Key**
   - Go to "API Keys"
   - Create a new key
   - Copy it

3. **Create Index**
   - Create a new index named `formative-research`
   - Set dimension to `1536` (for OpenAI embeddings)
   - Note your environment (e.g., `us-east-1-aws`)

4. **Configuration**
Edit `/Users/nick/Development/formative-ai/ai-pipeline/.env`:
```bash
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=formative-ai-embeddings
ENABLE_RAG_RETRIEVAL=true
```

---

## 5. AWS S3 (OPTIONAL - For File Storage)

### Why You Need It
For storing generated documents, wireframes, and research artifacts in cloud storage instead of locally.

### Configuration
Edit `/Users/nick/Development/formative-ai/backend/.env`:
```bash
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET=formative-ai-dev
```

---

## 6. SendGrid (OPTIONAL - For Email Notifications)

### Why You Need It
To send email notifications when research is complete or for user invitations.

### Configuration
Edit `/Users/nick/Development/formative-ai/backend/.env`:
```bash
SENDGRID_API_KEY=your_sendgrid_key_here
SENDGRID_FROM_EMAIL=your-email@formative-ai.com
```

---

## Environment Variable Reference

### Backend (`backend/.env`)
```env
# REQUIRED
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://formative_user:formative_password@localhost:5432/formative_ai
REDIS_URL=redis://localhost:6379

# OPTIONAL BUT RECOMMENDED FOR REAL AI
CLAUDE_API_KEY=sk-ant-YOUR_API_KEY
OPENAI_API_KEY=sk-YOUR_API_KEY (optional fallback)

# OPTIONAL
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h
AI_SERVICE_URL=http://localhost:8000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@formative-ai.com
```

### AI Pipeline (`ai-pipeline/.env`)
```env
# REQUIRED FOR REAL AI
ANTHROPIC_API_KEY=sk-ant-YOUR_API_KEY
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# OPTIONAL FALLBACK
OPENAI_API_KEY=sk-YOUR_API_KEY
OPENAI_MODEL=gpt-4

# OPTIONAL
GOOGLE_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX=formative-ai-embeddings

# LOCAL SERVICES (Already configured)
DATABASE_URL=postgresql://formative_user:formative_password@localhost:5432/formative_ai
REDIS_URL=redis://localhost:6379
BACKEND_API_URL=http://localhost:3001
```

---

## Step-by-Step: Getting Real Research Working

### 1. Get Claude API Key (5 minutes)
```bash
# Go to https://console.anthropic.com
# Create an API key
# Copy the key starting with sk-ant-
```

### 2. Update AI Pipeline Configuration
```bash
# Edit ai-pipeline/.env and replace:
# ANTHROPIC_API_KEY=your_claude_api_key_here
# With your actual key
```

### 3. Restart Services
```bash
# Kill existing processes
pkill -f "npm run dev"
pkill -f "python"

# From project root, run:
bash start-dev.sh
```

### 4. Test It
1. Open http://localhost:3000
2. Create or select a project
3. Go to the Research tab
4. Enter a topic (e.g., "AI Customer Support")
5. Click "Generate Research"
6. Watch for real AI-powered results instead of mock data

---

## Monitoring API Calls

### View Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# AI Pipeline logs - will show which LLM is being used
# Check terminal where start-dev.sh was run
```

### Verify Claude is Being Used
Look for log messages like:
```
Using real research agent for [research_id]
Claude call succeeded
```

---

## Troubleshooting

### Error: "ANTHROPIC_API_KEY not found"
- Ensure `.env` file exists in `ai-pipeline/` directory
- Verify the key is correctly set
- Restart the AI pipeline service

### Error: "Invalid authentication credentials"
- Double-check your API key - make sure there are no extra spaces
- Verify the key is valid in the Anthropic console
- Regenerate the key if needed

### Still Getting Mock Data
- Check that `ENABLE_RAG_RETRIEVAL=false` in `.env` (RAG is currently disabled)
- Verify both `ANTHROPIC_API_KEY` and fallback `OPENAI_API_KEY` are missing (should trigger mock data)
- Check terminal logs during research generation

### API Rate Limits
If you hit Claude API rate limits:
- Reduce the number of concurrent research requests
- Add delays between requests
- Upgrade your Anthropic plan if needed

---

## Security Checklist

- [ ] API keys are in `.env` files (not in git)
- [ ] `.env` files are in `.gitignore`
- [ ] Never commit API keys to version control
- [ ] Rotate keys regularly
- [ ] Use environment-specific keys (dev, staging, prod)
- [ ] Monitor API usage in your provider consoles

---

## Next Steps

1. **Immediate**: Add your Claude API key to `ai-pipeline/.env`
2. **Test**: Generate research to verify real AI is working
3. **Optional**: Add OpenAI as fallback for redundancy
4. **Future**: Add Google Search API for web research
5. **Advanced**: Set up Pinecone for RAG capabilities

---

## Support

For API key issues:
- **Claude**: https://console.anthropic.com
- **OpenAI**: https://platform.openai.com
- **Google**: https://console.cloud.google.com
- **Pinecone**: https://www.pinecone.io

For application issues, check the logs and error messages in the terminal.
