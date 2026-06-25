from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional, Any

# Authentication
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProfileResponse(BaseModel):
    registered: bool
    email: str
    name: str
    startupName: str
    description: str
    industry: str
    country: str
    stage: str
    avatar: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

    class Config:
        from_attributes = True

class OnboardingRequest(BaseModel):
    name: str
    email: EmailStr
    startupName: str
    description: str
    industry: str
    country: str
    stage: str


# AI Validation
class ValidateRequest(BaseModel):
    startupIdea: str
    problemStatement: Optional[str] = None
    customerSegment: Optional[str] = None
    geography: Optional[str] = None

class CompetitorInfo(BaseModel):
    name: str
    funding: str
    pricing: str
    type: str

class CustomerPersonaInfo(BaseModel):
    name: str
    painPoints: str
    behavior: str

class MarketResearchInfo(BaseModel):
    marketSize: str
    growthTrends: str
    industryOverview: str

class ScoresInfo(BaseModel):
    overall: int
    demand: int
    competition: int
    scalability: int
    revenuePotential: int

class ValidationReportResponse(BaseModel):
    id: str
    startupIdea: str
    problemStatement: Optional[str] = None
    customerSegment: Optional[str] = None
    geography: Optional[str] = None
    date: str
    scores: ScoresInfo
    marketResearch: MarketResearchInfo
    competitors: List[CompetitorInfo]
    customerPersona: CustomerPersonaInfo

    class Config:
        from_attributes = True

class ValidateResponse(BaseModel):
    success: bool
    report: ValidationReportResponse


# Roadmap
class TaskInfo(BaseModel):
    id: str
    text: str
    completed: bool
    category: str
    guideId: Optional[str] = None

    class Config:
        from_attributes = True

class RoadmapResponse(BaseModel):
    stage: str
    tasks: List[TaskInfo]

class ToggleTaskRequest(BaseModel):
    id: str

class ToggleTaskResponse(BaseModel):
    success: bool

class SlideInfo(BaseModel):
    id: int
    title: str
    guidance: str
    placeholder: str

class StoryboardResponse(BaseModel):
    success: bool
    storyboard: List[SlideInfo]

class StoryboardSaveRequest(BaseModel):
    storyboard: List[SlideInfo]


# Funding
class SchemeResponse(BaseModel):
    id: str
    name: str
    provider: str
    type: str
    description: str
    amount: str
    equity: str
    deadline: str
    applyLink: str
    stages: List[str]
    countries: List[str]
    industries: List[str]
    criteria: Dict[str, Any]
    lastVerified: str

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: str
    schemeId: str
    status: str
    appliedDate: str
    notes: Optional[str] = None
    scheme: Optional[SchemeResponse] = None

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    schemeId: str
    notes: Optional[str] = None

class ApplicationUpdateStatus(BaseModel):
    id: str
    status: str
    notes: Optional[str] = None

class RadarResponse(BaseModel):
    id: str
    title: str
    type: str
    desc: str
    date: str
    tag: str

    class Config:
        from_attributes = True


# Network
class InvestorResponse(BaseModel):
    id: str
    name: str
    type: str
    ticketSize: str
    stages: List[str]
    sectors: List[str]
    geography: str
    readinessScore: int
    matchReason: str
    contactEmail: str

    class Config:
        from_attributes = True

class MentorResponse(BaseModel):
    id: str
    name: str
    role: str
    expertise: List[str]
    availability: str
    experience: str
    geography: str
    stages: List[str]
    image: str

    class Config:
        from_attributes = True

class RelationshipPathRequest(BaseModel):
    contactName: str
    targetEntity: str

class PathNode(BaseModel):
    name: str
    type: str

class RelationshipPathResponse(BaseModel):
    success: bool
    path: List[PathNode]
    strength: str
    advice: str

class MeetingBookingRequest(BaseModel):
    mentorId: str
    date: str
    time: str


# Copilot & Chat
class SourceItem(BaseModel):
    title: str
    type: str
    link: Optional[str] = None
    id: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str
    sources: Optional[List[SourceItem]] = None

class ChatRequest(BaseModel):
    message: str
    chatHistory: List[ChatMessage]

class ChatResponse(BaseModel):
    success: bool
    message: ChatMessage

class PitchEvaluationRequest(BaseModel):
    question: str
    answer: str

class PitchEvaluationResponse(BaseModel):
    success: bool
    score: int
    critique: str
    tips: str

class ResourceResponse(BaseModel):
    id: str
    title: str
    category: str
    desc: str
    fileType: str
    size: str
    downloads: int

    class Config:
        from_attributes = True


# Admin
class AdminGrantCreate(BaseModel):
    name: str
    provider: str
    type: str
    description: str
    amount: str
    equity: str
    deadline: str
    applyLink: str
    stages: List[str]
    countries: List[str]
    industries: List[str]

class AdminInvestorCreate(BaseModel):
    name: str
    type: str
    ticketSize: str
    sectors: List[str]
    geography: str
    readinessScore: int
    contactEmail: str

class AdminMentorCreate(BaseModel):
    name: str
    role: str
    expertise: List[str]
    availability: str
    experience: str
    geography: str


# Stats & Activity
class StatsResponse(BaseModel):
    overallHealth: int
    validationScore: int
    roadmapScore: int
    networkScore: int
    fundingScore: int
    totalReports: int
    totalApplications: int
    acceptedApplications: int
    totalTasksCompleted: int
    totalTasksCount: int
    investorsMatched: int
    mentorsAvailable: int
    resourcesCount: int
    currentStage: str
    startupName: str

class ActivityCreate(BaseModel):
    action: str
    detail: Optional[str] = None

class ActivityLogResponse(BaseModel):
    id: str
    action: str
    detail: Optional[str] = None
    timestamp: str

    class Config:
        from_attributes = True
