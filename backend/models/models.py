from typing import Optional, List, Dict, Any
from datetime import datetime

class MongoObject:
    def __init__(self, doc: dict, db=None):
        self._doc = doc if doc is not None else {}
        self._db = db

    def __getattr__(self, name: str) -> Any:
        if name in self._doc:
            return self._doc[name]
        return None

    def __setattr__(self, name: str, value: Any):
        if name in ("_doc", "_db"):
            super().__setattr__(name, value)
        else:
            self._doc[name] = value

    @property
    def id(self) -> str:
        val = self._doc.get("_id") or self._doc.get("id")
        return str(val) if val else ""

class User(MongoObject):
    @property
    def profile(self) -> Optional['Profile']:
        if not self._db:
            return None
        prof_doc = self._db.profiles.find_one({"user_id": self.id})
        if prof_doc:
            return Profile(prof_doc, self._db)
        return None

class Profile(MongoObject):
    pass

class ValidationReport(MongoObject):
    @property
    def startupIdea(self) -> str:
        return self._doc.get("startup_idea") or self._doc.get("startupIdea") or ""

    @property
    def problemStatement(self) -> Optional[str]:
        return self._doc.get("problem_statement") or self._doc.get("problemStatement")

    @property
    def customerSegment(self) -> Optional[str]:
        return self._doc.get("customer_segment") or self._doc.get("customerSegment")

    @property
    def marketResearch(self) -> Dict[str, Any]:
        return self._doc.get("market_research") or self._doc.get("marketResearch") or {}

    @property
    def customerPersona(self) -> Dict[str, Any]:
        return self._doc.get("customer_persona") or self._doc.get("customerPersona") or {}

    @property
    def fullAnalysis(self) -> Optional[Dict[str, Any]]:
        return self._doc.get("full_analysis") or self._doc.get("fullAnalysis")

class RoadmapTask(MongoObject):
    pass

class SavedStoryboard(MongoObject):
    pass

class FundingScheme(MongoObject):
    pass

class Application(MongoObject):
    @property
    def scheme(self) -> Optional[FundingScheme]:
        if not self._db or not self._doc.get("scheme_id"):
            return None
        scheme_doc = self._db.funding_schemes.find_one({"id": self.scheme_id})
        if scheme_doc:
            return FundingScheme(scheme_doc, self._db)
        return None

class RadarItem(MongoObject):
    pass

class Investor(MongoObject):
    pass

class Mentor(MongoObject):
    pass

class Contact(MongoObject):
    pass

class Resource(MongoObject):
    pass

class ChatHistory(MongoObject):
    pass

class ActivityLog(MongoObject):
    pass

class JobOpportunity(MongoObject):
    @property
    def startup(self) -> Optional[Profile]:
        if not self._db or not self._doc.get("startup_id"):
            return None
        startup_doc = self._db.profiles.find_one({"id": self.startup_id})
        if startup_doc:
            return Profile(startup_doc, self._db)
        return None

class JobApplication(MongoObject):
    @property
    def opportunity(self) -> Optional[JobOpportunity]:
        if not self._db or not self._doc.get("opportunity_id"):
            return None
        opp_doc = self._db.job_opportunities.find_one({"id": self.opportunity_id})
        if opp_doc:
            return JobOpportunity(opp_doc, self._db)
        return None

    @property
    def user(self) -> Optional[User]:
        if not self._db or not self._doc.get("user_id"):
            return None
        from bson import ObjectId
        try:
            uid = ObjectId(self.user_id)
        except Exception:
            uid = self.user_id
        user_doc = self._db.users.find_one({"_id": uid})
        if user_doc:
            return User(user_doc, self._db)
        return None
