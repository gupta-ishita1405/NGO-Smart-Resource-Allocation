from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import math
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------- Setup ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = 'HS256'
JWT_EXPIRE_HOURS = 24 * 7

app = FastAPI(title='NeedSync API')
api = APIRouter(prefix='/api')
bearer_scheme = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('needsync')

# ---------- Helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def create_token(user_id: str, email: str) -> str:
    payload = {
        'sub': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> dict:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail='Not authenticated')
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')
    user = await db.users.find_one({'id': payload['sub']}, {'_id': 0, 'password_hash': 0})
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    return user

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

URGENCY_RANK = {'high': 3, 'medium': 2, 'low': 1}

# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    city: str
    skills: List[str] = []
    bio: Optional[str] = ''

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(extra='ignore')
    id: str
    name: str
    email: str
    city: str
    skills: List[str] = []
    bio: str = ''
    role: str = 'volunteer'
    trust_score: float = 50.0
    completed_count: int = 0
    accepted_count: int = 0
    created_at: str

class AuthOut(BaseModel):
    user: UserOut
    token: str

class HelpRequestIn(BaseModel):
    category: str  # food, medical, safety, emotional
    title: str
    description: str
    urgency: str  # high, medium, low
    city: str
    area: Optional[str] = ''
    contact_method: Optional[str] = 'in_app'
    contact_value: Optional[str] = ''
    is_anonymous: bool = True
    requester_alias: Optional[str] = 'Anonymous'

class HelpRequestOut(BaseModel):
    model_config = ConfigDict(extra='ignore')
    id: str
    tracking_code: str
    category: str
    title: str
    description: str
    urgency: str
    urgency_score: int
    city: str
    area: str = ''
    contact_method: str = 'in_app'
    contact_value: str = ''
    is_anonymous: bool = True
    requester_alias: str = 'Anonymous'
    status: str  # pending, accepted, completed, cancelled
    accepted_by: Optional[str] = None
    accepted_by_name: Optional[str] = None
    created_at: str
    updated_at: str

class StatusUpdate(BaseModel):
    status: str

# ---------- Auth Endpoints ----------
@api.post('/auth/register', response_model=AuthOut)
async def register(body: RegisterIn):
    email = body.email.lower().strip()
    existing = await db.users.find_one({'email': email})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    user_id = str(uuid.uuid4())
    doc = {
        'id': user_id,
        'name': body.name.strip(),
        'email': email,
        'password_hash': hash_password(body.password),
        'city': body.city.strip(),
        'skills': [s.strip().lower() for s in body.skills if s.strip()],
        'bio': body.bio or '',
        'role': 'volunteer',
        'trust_score': 50.0,
        'completed_count': 0,
        'accepted_count': 0,
        'created_at': now_iso(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email)
    user_out = {k: v for k, v in doc.items() if k not in ('password_hash', '_id')}
    return {'user': user_out, 'token': token}

@api.post('/auth/login', response_model=AuthOut)
async def login(body: LoginIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({'email': email})
    if not user or not verify_password(body.password, user.get('password_hash', '')):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    token = create_token(user['id'], email)
    user.pop('_id', None)
    user.pop('password_hash', None)
    return {'user': user, 'token': token}

@api.get('/auth/me', response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user

# ---------- Help Requests ----------
@api.post('/requests', response_model=HelpRequestOut)
async def create_request(body: HelpRequestIn):
    if body.urgency not in URGENCY_RANK:
        raise HTTPException(status_code=400, detail='Invalid urgency')
    if body.category not in ('food', 'medical', 'safety', 'emotional'):
        raise HTTPException(status_code=400, detail='Invalid category')
    rid = str(uuid.uuid4())
    code = 'NS-' + rid.split('-')[0].upper()
    doc = {
        'id': rid,
        'tracking_code': code,
        'category': body.category,
        'title': body.title.strip(),
        'description': body.description.strip(),
        'urgency': body.urgency,
        'urgency_score': URGENCY_RANK[body.urgency],
        'city': body.city.strip(),
        'area': body.area or '',
        'contact_method': body.contact_method or 'in_app',
        'contact_value': body.contact_value or '',
        'is_anonymous': body.is_anonymous,
        'requester_alias': (body.requester_alias or 'Anonymous').strip() or 'Anonymous',
        'status': 'pending',
        'accepted_by': None,
        'accepted_by_name': None,
        'created_at': now_iso(),
        'updated_at': now_iso(),
    }
    await db.requests.insert_one(doc)
    doc.pop('_id', None)
    return doc

@api.get('/requests', response_model=List[HelpRequestOut])
async def list_requests(
    status_f: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    urgency: Optional[str] = None,
):
    q = {}
    if status_f:
        q['status'] = status_f
    if category:
        q['category'] = category
    if city:
        q['city'] = {'$regex': f'^{city}$', '$options': 'i'}
    if urgency:
        q['urgency'] = urgency
    items = await db.requests.find(q, {'_id': 0}).sort([('urgency_score', -1), ('created_at', -1)]).to_list(500)
    return items

@api.get('/requests/track/{code}', response_model=HelpRequestOut)
async def track(code: str):
    item = await db.requests.find_one({'tracking_code': code.upper()}, {'_id': 0})
    if not item:
        raise HTTPException(status_code=404, detail='Request not found')
    return item

@api.get('/requests/{rid}', response_model=HelpRequestOut)
async def get_request(rid: str):
    item = await db.requests.find_one({'id': rid}, {'_id': 0})
    if not item:
        raise HTTPException(status_code=404, detail='Request not found')
    return item

@api.post('/requests/{rid}/accept', response_model=HelpRequestOut)
async def accept_request(rid: str, user=Depends(get_current_user)):
    item = await db.requests.find_one({'id': rid}, {'_id': 0})
    if not item:
        raise HTTPException(status_code=404, detail='Request not found')
    if item['status'] != 'pending':
        raise HTTPException(status_code=400, detail=f"Request already {item['status']}")
    await db.requests.update_one(
        {'id': rid},
        {'$set': {
            'status': 'accepted',
            'accepted_by': user['id'],
            'accepted_by_name': user['name'],
            'updated_at': now_iso(),
        }}
    )
    await db.users.update_one({'id': user['id']}, {'$inc': {'accepted_count': 1}})
    item = await db.requests.find_one({'id': rid}, {'_id': 0})
    return item

@api.post('/requests/{rid}/complete', response_model=HelpRequestOut)
async def complete_request(rid: str, user=Depends(get_current_user)):
    item = await db.requests.find_one({'id': rid}, {'_id': 0})
    if not item:
        raise HTTPException(status_code=404, detail='Request not found')
    if item.get('accepted_by') != user['id']:
        raise HTTPException(status_code=403, detail='Only the assigned volunteer can complete')
    if item['status'] != 'accepted':
        raise HTTPException(status_code=400, detail='Request not in accepted state')
    await db.requests.update_one(
        {'id': rid},
        {'$set': {'status': 'completed', 'updated_at': now_iso()}}
    )
    # Bump trust score (capped at 100)
    new_trust = min(100.0, float(user.get('trust_score', 50)) + 5.0)
    await db.users.update_one(
        {'id': user['id']},
        {'$set': {'trust_score': new_trust}, '$inc': {'completed_count': 1}}
    )
    item = await db.requests.find_one({'id': rid}, {'_id': 0})
    return item

@api.post('/requests/{rid}/cancel', response_model=HelpRequestOut)
async def cancel_request(rid: str, user=Depends(get_current_user)):
    item = await db.requests.find_one({'id': rid}, {'_id': 0})
    if not item:
        raise HTTPException(status_code=404, detail='Request not found')
    if item.get('accepted_by') != user['id']:
        raise HTTPException(status_code=403, detail='Not your request')
    if item['status'] != 'accepted':
        raise HTTPException(status_code=400, detail='Cannot cancel')
    await db.requests.update_one(
        {'id': rid},
        {'$set': {'status': 'pending', 'accepted_by': None, 'accepted_by_name': None, 'updated_at': now_iso()}}
    )
    item = await db.requests.find_one({'id': rid}, {'_id': 0})
    return item

# ---------- Smart Matching ----------
CATEGORY_SKILL_MAP = {
    'medical': ['doctor', 'nurse', 'medical', 'first-aid', 'pharmacy'],
    'food': ['cooking', 'driver', 'logistics', 'delivery'],
    'safety': ['security', 'legal', 'counsellor', 'police'],
    'emotional': ['counsellor', 'therapy', 'listener', 'psychology', 'social-work'],
}

@api.get('/match/{rid}')
async def match_volunteers(rid: str):
    req = await db.requests.find_one({'id': rid}, {'_id': 0})
    if not req:
        raise HTTPException(status_code=404, detail='Request not found')
    relevant_skills = set(CATEGORY_SKILL_MAP.get(req['category'], []))
    volunteers = await db.users.find({'role': 'volunteer'}, {'_id': 0, 'password_hash': 0}).to_list(1000)
    scored = []
    for v in volunteers:
        score = 0
        # Location match
        if v.get('city', '').lower() == req.get('city', '').lower():
            score += 40
        # Skills overlap
        v_skills = set(v.get('skills', []))
        overlap = len(v_skills & relevant_skills)
        score += overlap * 15
        # Trust score weight
        score += float(v.get('trust_score', 50)) * 0.3
        # Urgency boost
        if req['urgency'] == 'high':
            score += 10
        scored.append({'volunteer': v, 'match_score': round(score, 1)})
    scored.sort(key=lambda x: x['match_score'], reverse=True)
    return {'request_id': rid, 'matches': scored[:5]}

# ---------- Volunteer Dashboard ----------
@api.get('/volunteer/dashboard')
async def dashboard(user=Depends(get_current_user)):
    accepted = await db.requests.find(
        {'accepted_by': user['id'], 'status': 'accepted'}, {'_id': 0}
    ).sort('updated_at', -1).to_list(100)
    completed = await db.requests.find(
        {'accepted_by': user['id'], 'status': 'completed'}, {'_id': 0}
    ).sort('updated_at', -1).to_list(100)
    pending_nearby = await db.requests.find(
        {'status': 'pending', 'city': {'$regex': f"^{user['city']}$", '$options': 'i'}},
        {'_id': 0},
    ).sort([('urgency_score', -1), ('created_at', -1)]).to_list(100)
    return {
        'user': user,
        'stats': {
            'accepted_count': len(accepted),
            'completed_count': len(completed),
            'nearby_pending': len(pending_nearby),
            'trust_score': user.get('trust_score', 50),
        },
        'accepted': accepted,
        'completed': completed,
        'nearby_pending': pending_nearby,
    }

# ---------- Public Stats (Landing) ----------
@api.get('/stats/public')
async def public_stats():
    total_requests = await db.requests.count_documents({})
    completed = await db.requests.count_documents({'status': 'completed'})
    pending = await db.requests.count_documents({'status': 'pending'})
    volunteers = await db.users.count_documents({'role': 'volunteer'})
    return {
        'total_requests': total_requests,
        'completed': completed,
        'pending': pending,
        'volunteers': volunteers,
    }

@api.get('/')
async def root():
    return {'app': 'NeedSync', 'status': 'ok'}

# ---------- Startup ----------
@app.on_event('startup')
async def on_startup():
    await db.users.create_index('email', unique=True)
    await db.users.create_index('id', unique=True)
    await db.requests.create_index('id', unique=True)
    await db.requests.create_index('tracking_code', unique=True)
    await db.requests.create_index([('status', 1), ('urgency_score', -1)])
    # Seed admin/demo users
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@needsync.org').lower()
    admin_pw = os.environ.get('ADMIN_PASSWORD', 'Admin@123')
    if not await db.users.find_one({'email': admin_email}):
        await db.users.insert_one({
            'id': str(uuid.uuid4()),
            'name': 'NeedSync Admin',
            'email': admin_email,
            'password_hash': hash_password(admin_pw),
            'city': 'Mumbai',
            'skills': ['logistics', 'counsellor', 'medical'],
            'bio': 'Platform admin & coordinator.',
            'role': 'admin',
            'trust_score': 95.0,
            'completed_count': 0,
            'accepted_count': 0,
            'created_at': now_iso(),
        })
    # Demo volunteer
    demo_email = 'demo@needsync.org'
    if not await db.users.find_one({'email': demo_email}):
        await db.users.insert_one({
            'id': str(uuid.uuid4()),
            'name': 'Priya Sharma',
            'email': demo_email,
            'password_hash': hash_password('Demo@123'),
            'city': 'Mumbai',
            'skills': ['doctor', 'first-aid'],
            'bio': 'Doctor — happy to help nearby medical needs.',
            'role': 'volunteer',
            'trust_score': 78.0,
            'completed_count': 4,
            'accepted_count': 5,
            'created_at': now_iso(),
        })
    logger.info('NeedSync startup complete.')

@app.on_event('shutdown')
async def on_shutdown():
    client.close()

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=['*'],
    allow_headers=['*'],
)
