import os
import logging
from datetime import datetime, UTC, timedelta
from typing import Optional
from bson import ObjectId
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "rankllms")
JWT_SECRET = os.environ.get("JWT_SECRET", "rankllms-jwt-secret-2026")
JWT_ALGORITHM = "HS256"

app = FastAPI(title="RankLLMs API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class LoginRequest(BaseModel):
    email: str
    password: str


def create_token(email: str) -> str:
    expire = datetime.now(UTC) + timedelta(hours=24)
    return jwt.encode({"sub": email, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def doc_to_dict(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


async def get_admin(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


LLM_MODELS = [
    {"name": "o3", "provider": "OpenAI", "slug": "o3", "context_window": 200000,
     "input_cost": 10.0, "output_cost": 40.0, "speed": 25, "latency": 3.5,
     "release_date": "Apr 2025", "description": "OpenAI's most powerful reasoning model",
     "scores": {"coding": 96, "reasoning": 98, "math": 97, "multilingual": 85, "visual": 88, "overall": 96}},
    {"name": "Claude Opus 4.5", "provider": "Anthropic", "slug": "claude-opus-4-5",
     "context_window": 200000, "input_cost": 15.0, "output_cost": 75.0, "speed": 40, "latency": 1.2,
     "release_date": "Jun 2025", "description": "Anthropic's most capable model for complex tasks",
     "scores": {"coding": 92, "reasoning": 95, "math": 90, "multilingual": 88, "visual": 85, "overall": 93}},
    {"name": "GPT-4.1", "provider": "OpenAI", "slug": "gpt-4-1", "context_window": 1000000,
     "input_cost": 2.0, "output_cost": 8.0, "speed": 120, "latency": 0.6,
     "release_date": "Apr 2025", "description": "Improved coding and instruction-following over GPT-4o",
     "scores": {"coding": 92, "reasoning": 89, "math": 87, "multilingual": 88, "visual": 90, "overall": 91}},
    {"name": "Gemini 2.5 Pro", "provider": "Google", "slug": "gemini-2-5-pro",
     "context_window": 1000000, "input_cost": 1.25, "output_cost": 10.0, "speed": 95, "latency": 0.9,
     "release_date": "Mar 2025", "description": "Google's most capable model with massive context",
     "scores": {"coding": 88, "reasoning": 91, "math": 89, "multilingual": 92, "visual": 91, "overall": 91}},
    {"name": "Claude Sonnet 4.5", "provider": "Anthropic", "slug": "claude-sonnet-4-5",
     "context_window": 200000, "input_cost": 3.0, "output_cost": 15.0, "speed": 80, "latency": 0.8,
     "release_date": "Jun 2025", "description": "Best balance of intelligence and speed from Anthropic",
     "scores": {"coding": 88, "reasoning": 89, "math": 85, "multilingual": 86, "visual": 82, "overall": 88}},
    {"name": "GPT-4o", "provider": "OpenAI", "slug": "gpt-4o", "context_window": 128000,
     "input_cost": 2.5, "output_cost": 10.0, "speed": 110, "latency": 0.7,
     "release_date": "May 2024", "description": "OpenAI's flagship multimodal model",
     "scores": {"coding": 87, "reasoning": 88, "math": 86, "multilingual": 89, "visual": 92, "overall": 90}},
    {"name": "Grok 3", "provider": "xAI", "slug": "grok-3", "context_window": 131072,
     "input_cost": 3.0, "output_cost": 15.0, "speed": 65, "latency": 1.5,
     "release_date": "Feb 2025", "description": "xAI's flagship model with real-time web access",
     "scores": {"coding": 85, "reasoning": 88, "math": 87, "multilingual": 78, "visual": 75, "overall": 86}},
    {"name": "DeepSeek R1", "provider": "DeepSeek", "slug": "deepseek-r1", "context_window": 128000,
     "input_cost": 0.55, "output_cost": 2.19, "speed": 45, "latency": 4.0,
     "release_date": "Jan 2025", "description": "Open-source reasoning powerhouse",
     "scores": {"coding": 91, "reasoning": 94, "math": 96, "multilingual": 78, "visual": 0, "overall": 90}},
    {"name": "o4-mini", "provider": "OpenAI", "slug": "o4-mini", "context_window": 128000,
     "input_cost": 1.1, "output_cost": 4.4, "speed": 90, "latency": 1.0,
     "release_date": "Apr 2025", "description": "Fast, efficient reasoning model from OpenAI",
     "scores": {"coding": 90, "reasoning": 92, "math": 94, "multilingual": 82, "visual": 80, "overall": 89}},
    {"name": "DeepSeek V3", "provider": "DeepSeek", "slug": "deepseek-v3", "context_window": 128000,
     "input_cost": 0.27, "output_cost": 1.1, "speed": 70, "latency": 2.0,
     "release_date": "Jan 2025", "description": "Extremely cost-effective general purpose model",
     "scores": {"coding": 86, "reasoning": 84, "math": 82, "multilingual": 80, "visual": 0, "overall": 85}},
    {"name": "Gemini 2.5 Flash", "provider": "Google", "slug": "gemini-2-5-flash",
     "context_window": 1000000, "input_cost": 0.075, "output_cost": 0.3, "speed": 200, "latency": 0.4,
     "release_date": "May 2025", "description": "Ultra-fast model with massive context window",
     "scores": {"coding": 80, "reasoning": 82, "math": 80, "multilingual": 84, "visual": 85, "overall": 82}},
    {"name": "Mistral Large 2", "provider": "Mistral", "slug": "mistral-large-2",
     "context_window": 128000, "input_cost": 2.0, "output_cost": 6.0, "speed": 100, "latency": 0.7,
     "release_date": "Jul 2024", "description": "European frontier model with strong multilingual support",
     "scores": {"coding": 82, "reasoning": 81, "math": 79, "multilingual": 90, "visual": 0, "overall": 82}},
    {"name": "Llama 4 Scout", "provider": "Meta", "slug": "llama-4-scout",
     "context_window": 10000000, "input_cost": 0.17, "output_cost": 0.17, "speed": 150, "latency": 0.5,
     "release_date": "Apr 2025", "description": "Meta's efficient multimodal model with 10M context",
     "scores": {"coding": 82, "reasoning": 80, "math": 78, "multilingual": 81, "visual": 80, "overall": 81}},
    {"name": "Claude Haiku 4.5", "provider": "Anthropic", "slug": "claude-haiku-4-5",
     "context_window": 200000, "input_cost": 0.8, "output_cost": 4.0, "speed": 180, "latency": 0.3,
     "release_date": "Jun 2025", "description": "Fastest and most compact Anthropic model",
     "scores": {"coding": 78, "reasoning": 78, "math": 72, "multilingual": 80, "visual": 70, "overall": 78}},
    {"name": "Llama 3.3 70B", "provider": "Meta", "slug": "llama-3-3-70b",
     "context_window": 128000, "input_cost": 0.59, "output_cost": 0.79, "speed": 85, "latency": 0.6,
     "release_date": "Dec 2024", "description": "Best open-source model for its size class",
     "scores": {"coding": 80, "reasoning": 79, "math": 77, "multilingual": 75, "visual": 0, "overall": 79}},
]

BLOG_POSTS = [
    {
        "title": "GPT-4.1 vs Claude Sonnet 4.5: The 2025 Developer Comparison",
        "slug": "gpt-4-1-vs-claude-sonnet-4-5",
        "excerpt": "We ran 500+ benchmarks comparing OpenAI's GPT-4.1 against Anthropic's Claude Sonnet 4.5 across coding, reasoning, and creative tasks.",
        "content": """<h2>Overview</h2>
<p>With GPT-4.1 and Claude Sonnet 4.5 both released in early 2025, developers face a tough choice. We ran over 500 benchmarks to give you a definitive comparison.</p>
<h2>Coding Performance</h2>
<p>GPT-4.1 takes the lead in coding tasks, scoring 92/100 compared to Claude Sonnet 4.5's 88/100. GPT-4.1 shows particular strength in debugging complex code and working with large codebases. Claude Sonnet 4.5 excels at code explanation and documentation.</p>
<h2>Reasoning &amp; Analysis</h2>
<p>Claude Sonnet 4.5 edges ahead in deep reasoning (89/100 vs 89/100 — essentially tied), with both models showing impressive performance on logical puzzles and multi-step problems.</p>
<h2>Pricing Comparison</h2>
<p>GPT-4.1 is priced at $2/1M input tokens and $8/1M output. Claude Sonnet 4.5 costs $3/$15 — making GPT-4.1 significantly more affordable for high-volume applications.</p>
<h2>Verdict</h2>
<p>For coding-heavy workloads and budget-conscious teams, GPT-4.1 wins. For nuanced analysis and extended multi-turn conversations, Claude Sonnet 4.5 is the better choice.</p>""",
        "image_url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
        "category": "Comparisons", "author": "RankLLMs Team", "read_time": 8,
        "published_at": "2026-02-10", "is_published": True
    },
    {
        "title": "DeepSeek R1 vs o3: Battle of the Reasoning Models",
        "slug": "deepseek-r1-vs-o3-reasoning-battle",
        "excerpt": "OpenAI's o3 and DeepSeek R1 represent the pinnacle of AI reasoning. Which one wins — and is the 18x price difference worth it?",
        "content": """<h2>The Reasoning Revolution</h2>
<p>2025 has been the year of reasoning models. DeepSeek R1 is available at a fraction of o3's price, challenging OpenAI's dominance in the reasoning space.</p>
<h2>Math Performance</h2>
<p>On AIME 2025, o3 scores 97/100 while DeepSeek R1 achieves 96/100. The gap is negligible in pure mathematics.</p>
<h2>Coding Tasks</h2>
<p>o3 pulls ahead on SWE-bench with a 96/100 score versus DeepSeek R1's 91/100. For complex software engineering, o3 remains superior.</p>
<h2>The Price Question</h2>
<p>o3 costs $10/1M input and $40/1M output. DeepSeek R1 is priced at $0.55/$2.19 — roughly 18x cheaper. For budget-conscious teams, DeepSeek R1 offers extraordinary value.</p>
<h2>Conclusion</h2>
<p>o3 wins on raw performance. DeepSeek R1 wins on value. Unless you need the absolute best reasoning, DeepSeek R1 is the clear choice for most teams.</p>""",
        "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
        "category": "Comparisons", "author": "RankLLMs Team", "read_time": 10,
        "published_at": "2026-02-05", "is_published": True
    },
    {
        "title": "Gemini 2.5 Pro: The 1M Token Context Monster",
        "slug": "gemini-2-5-pro-million-token-context",
        "excerpt": "Google's Gemini 2.5 Pro offers a 1 million token context window at competitive prices. Everything you need to know.",
        "content": """<h2>A New Era of Context</h2>
<p>Gemini 2.5 Pro's 1 million token context window changes what's possible with AI. Imagine feeding an entire codebase, months of emails, or a full book series into a single prompt.</p>
<h2>What 1M Tokens Actually Means</h2>
<p>1 million tokens is approximately 750,000 words — enough for roughly 3,000 pages of text. For developers, this means including your entire project without chunking.</p>
<h2>Performance vs. Cost</h2>
<p>At $1.25/1M input tokens, Gemini 2.5 Pro is competitively priced against Claude and GPT-4o. Its overall score of 91/100 puts it firmly in the top tier.</p>
<h2>Use Cases</h2>
<p>Legal document review, codebase analysis, long-form content generation, and multi-document research are where Gemini 2.5 Pro truly shines.</p>""",
        "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        "category": "News", "author": "RankLLMs Team", "read_time": 6,
        "published_at": "2026-01-28", "is_published": True
    },
    {
        "title": "The Complete Guide to LLM Benchmarks in 2026",
        "slug": "complete-guide-llm-benchmarks-2026",
        "excerpt": "MMLU, GPQA, HumanEval, SWE-bench — what do all these benchmarks actually measure, and which ones matter for your use case?",
        "content": """<h2>Why Benchmarks Matter</h2>
<p>As AI capabilities grow, evaluating models objectively becomes critical. Benchmarks provide standardized tests for apples-to-apples comparisons.</p>
<h2>GPQA Diamond</h2>
<p>Graduate-level scientific reasoning test with 198 questions from physics, chemistry, and biology. Scores above 80% are considered expert-level. Useful for: scientific research tools, medical AI.</p>
<h2>AIME 2025</h2>
<p>The American Invitational Mathematics Examination — problems require multi-step mathematical reasoning. The gold standard for evaluating mathematical ability.</p>
<h2>SWE-bench Verified</h2>
<p>Real GitHub issues that require writing code to resolve. The gold standard for evaluating coding ability. Most useful for developer tools and coding assistants.</p>
<h2>MMLU</h2>
<p>Massive Multitask Language Understanding — 57 academic subjects. Good general knowledge baseline but increasingly saturated by frontier models.</p>
<h2>Which Benchmarks to Trust</h2>
<p>Focus on GPQA Diamond and SWE-bench for frontier model comparisons. For reasoning, AIME 2025 provides the best discrimination. Avoid over-relying on saturated benchmarks like MMLU.</p>""",
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        "category": "Guides", "author": "RankLLMs Team", "read_time": 12,
        "published_at": "2026-01-20", "is_published": True
    },
    {
        "title": "How to Choose the Right LLM for Your Product in 2026",
        "slug": "how-to-choose-right-llm-2026",
        "excerpt": "With 15+ frontier models available, picking the right LLM has never been harder. Here's a systematic framework to decide.",
        "content": """<h2>The Decision Framework</h2>
<p>Choosing an LLM isn't about finding the "best" model — it's about finding the best model for your specific requirements: task complexity, latency, cost budget, context requirements, and multimodal needs.</p>
<h2>Step 1: Define Your Task Category</h2>
<p><strong>Reasoning-heavy tasks</strong> (analysis, planning): Consider o3, Claude Opus 4.5, or Gemini 2.5 Pro.</p>
<p><strong>Coding tasks</strong> (generation, debugging): GPT-4.1 or o3 for best results; DeepSeek V3 for cost efficiency.</p>
<p><strong>High-volume, latency-sensitive</strong>: Gemini 2.5 Flash or Claude Haiku 4.5.</p>
<h2>Step 2: Set Your Budget</h2>
<p>At $0.10/1M, you're looking at DeepSeek and Gemini Flash. At $1-5/1M, GPT-4.1 and Claude Sonnet enter the picture. Above $10/1M, o3 and Claude Opus become viable.</p>
<h2>The Golden Rules</h2>
<p>1. Never pick a model without testing on your actual data.<br>2. Always have a fallback model.<br>3. Monitor performance in production — models change with updates.</p>""",
        "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
        "category": "Guides", "author": "RankLLMs Team", "read_time": 9,
        "published_at": "2026-01-10", "is_published": True
    },
    {
        "title": "Llama 4 Scout: Meta's Open-Source Comeback",
        "slug": "llama-4-scout-meta-open-source",
        "excerpt": "Meta's Llama 4 Scout brings a 10M token context window to open-source AI at near-zero cost. Is this the end of closed-source models?",
        "content": """<h2>Open Source Catches Up</h2>
<p>Llama 4 Scout represents a significant leap in Meta's open-source efforts. With a 10 million token context window and multimodal capabilities, it challenges even frontier closed-source models at a fraction of the cost.</p>
<h2>The 10M Token Context</h2>
<p>Llama 4 Scout offers the longest context window of any available model — 10x more than Gemini 2.5 Pro. For self-hosted deployments with massive document needs, this is unprecedented.</p>
<h2>Cost Analysis</h2>
<p>At $0.17/1M tokens for both input and output, Llama 4 Scout is essentially free compared to GPT-4o or Claude. Self-hosting eliminates costs entirely.</p>
<h2>Should You Use It?</h2>
<p>For document processing, RAG applications, and cost-sensitive deployments, Llama 4 Scout is excellent. For frontier reasoning or coding tasks, closed-source models still lead.</p>""",
        "image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
        "category": "News", "author": "RankLLMs Team", "read_time": 7,
        "published_at": "2026-01-15", "is_published": True
    },
    {
        "title": "Understanding Token Costs: A Developer's Guide",
        "slug": "understanding-token-costs-guide",
        "excerpt": "Token pricing confuses many developers. This guide breaks down exactly what you're paying for and how to estimate costs.",
        "content": """<h2>What is a Token?</h2>
<p>A token is roughly 4 characters or 0.75 words in English. "Hello, world!" is about 4 tokens. The exact tokenization varies by model family.</p>
<h2>Input vs Output Tokens</h2>
<p>Models charge separately for input (prompt) and output (completion) tokens. Output tokens are typically 3-5x more expensive because generation is computationally intensive.</p>
<h2>Cost Estimation Formula</h2>
<p>Monthly Cost = (Avg Prompt Length × Input Rate + Avg Response Length × Output Rate) × Daily Requests × 30 / 1,000,000</p>
<h2>Cost Optimization Tips</h2>
<p>1. Cache common prompts and responses.<br>2. Use smaller models for simple tasks.<br>3. Compress your system prompts.<br>4. Set max_tokens limits to prevent runaway outputs.</p>""",
        "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
        "category": "LLM Basics", "author": "RankLLMs Team", "read_time": 7,
        "published_at": "2025-12-28", "is_published": True
    },
    {
        "title": "Top 10 Open Source LLMs to Watch in 2026",
        "slug": "top-10-open-source-llms-2026",
        "excerpt": "The open-source LLM ecosystem is thriving. From Meta's Llama to DeepSeek, here are the 10 most promising models.",
        "content": """<h2>Why Open Source LLMs Matter</h2>
<p>Open-source LLMs offer privacy, customizability, and cost advantages. In 2026, the gap between open and closed source has narrowed dramatically.</p>
<h2>1. Llama 4 Scout (Meta)</h2>
<p>The current leader in open-source frontier models. 10M context, multimodal, available for commercial use. Best for: RAG applications, document processing.</p>
<h2>2. DeepSeek V3 (DeepSeek)</h2>
<p>Exceptional coding and reasoning at near-commercial closed-source quality. Extremely affordable via API. Best for: coding assistants, general-purpose apps.</p>
<h2>3. Llama 3.3 70B (Meta)</h2>
<p>The most widely deployed open-source model. Excellent community support and extensive fine-tuning ecosystem.</p>
<h2>Choosing Open vs Closed</h2>
<p>Choose open source when: data privacy is critical, you need customization, or cost at scale is the primary concern. Choose closed source when you need frontier performance without infrastructure overhead.</p>""",
        "image_url": "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=800&q=80",
        "category": "Guides", "author": "RankLLMs Team", "read_time": 11,
        "published_at": "2025-12-20", "is_published": True
    },
    {
        "title": "The State of Multimodal AI in 2026",
        "slug": "state-of-multimodal-ai-2026",
        "excerpt": "From image understanding to video generation, multimodal AI has exploded. Here's a comprehensive overview.",
        "content": """<h2>What is Multimodal AI?</h2>
<p>Multimodal AI refers to models that can process multiple types of data: text, images, audio, video, and code. In 2026, nearly every frontier model offers multimodal capabilities.</p>
<h2>Leaders in Visual Understanding</h2>
<p>GPT-4o leads vision tasks with a 92/100 visual score, followed closely by Gemini 2.5 Pro (91/100). Both can analyze charts, diagrams, screenshots, and photographs.</p>
<h2>The Video Generation Frontier</h2>
<p>2025 saw the emergence of serious video generation capabilities. Integration with text LLMs is creating powerful multimedia pipelines.</p>
<h2>What's Coming Next</h2>
<p>Expect native video understanding in all frontier models by end of 2026. Real-time multimodal interactions — where AI can see, hear, and respond simultaneously — will become standard.</p>""",
        "image_url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
        "category": "News", "author": "RankLLMs Team", "read_time": 8,
        "published_at": "2026-01-05", "is_published": True
    },
]


async def seed_models():
    await db.models.insert_many(LLM_MODELS)
    logger.info(f"Seeded {len(LLM_MODELS)} LLM models")


async def seed_blog():
    await db.blog.insert_many(BLOG_POSTS)
    logger.info(f"Seeded {len(BLOG_POSTS)} blog posts")


@app.on_event("startup")
async def startup():
    if not await db.admins.find_one({"email": "admin@rankllms.com"}):
        await db.admins.insert_one({
            "email": "admin@rankllms.com",
            "hashed_password": pwd_context.hash("Admin123!")
        })
        logger.info("Admin user created")
    if await db.models.count_documents({}) == 0:
        await seed_models()
    if await db.blog.count_documents({}) == 0:
        await seed_blog()


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "RankLLMs API"}


@app.post("/api/auth/login")
async def login(req: LoginRequest):
    admin = await db.admins.find_one({"email": req.email})
    if not admin or not pwd_context.verify(req.password, admin["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": create_token(req.email), "token_type": "bearer"}


@app.get("/api/auth/me")
async def me(email: str = Depends(get_admin)):
    return {"email": email}


@app.get("/api/models")
async def get_models():
    models = []
    async for doc in db.models.find({}).sort("scores.overall", -1):
        models.append(doc_to_dict(doc))
    return models


@app.get("/api/models/{slug}")
async def get_model(slug: str):
    doc = await db.models.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Model not found")
    return doc_to_dict(doc)


@app.post("/api/admin/models", status_code=201)
async def create_model(data: dict, email: str = Depends(get_admin)):
    data.pop("id", None)
    data.pop("_id", None)
    result = await db.models.insert_one(data)
    return {"id": str(result.inserted_id)}


@app.put("/api/admin/models/{model_id}")
async def update_model(model_id: str, data: dict, email: str = Depends(get_admin)):
    data.pop("id", None)
    data.pop("_id", None)
    result = await db.models.update_one({"_id": ObjectId(model_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"success": True}


@app.delete("/api/admin/models/{model_id}")
async def delete_model(model_id: str, email: str = Depends(get_admin)):
    result = await db.models.delete_one({"_id": ObjectId(model_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"success": True}


@app.get("/api/blog")
async def get_blog(category: Optional[str] = None):
    query: dict = {"is_published": True}
    if category and category != "All":
        query["category"] = category
    posts = []
    async for doc in db.blog.find(query).sort("published_at", -1):
        doc_out = doc_to_dict(doc)
        doc_out.pop("content", None)
        posts.append(doc_out)
    return posts


@app.get("/api/blog/{slug}")
async def get_blog_post(slug: str):
    doc = await db.blog.find_one({"slug": slug, "is_published": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    return doc_to_dict(doc)


@app.get("/api/admin/blog")
async def admin_get_blog(email: str = Depends(get_admin)):
    posts = []
    async for doc in db.blog.find({}).sort("published_at", -1):
        posts.append(doc_to_dict(doc))
    return posts


@app.post("/api/admin/blog", status_code=201)
async def create_blog(data: dict, email: str = Depends(get_admin)):
    data.pop("id", None)
    data.pop("_id", None)
    result = await db.blog.insert_one(data)
    return {"id": str(result.inserted_id)}


@app.put("/api/admin/blog/{post_id}")
async def update_blog(post_id: str, data: dict, email: str = Depends(get_admin)):
    data.pop("id", None)
    data.pop("_id", None)
    result = await db.blog.update_one({"_id": ObjectId(post_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}


@app.delete("/api/admin/blog/{post_id}")
async def delete_blog(post_id: str, email: str = Depends(get_admin)):
    result = await db.blog.delete_one({"_id": ObjectId(post_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}
