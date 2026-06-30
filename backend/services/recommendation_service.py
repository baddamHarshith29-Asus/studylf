import math
import httpx
import re
from typing import List, Dict, Any, Optional
from backend.core.config import settings
from backend.core.logger import logger

class RecommendationService:
    @staticmethod
    def _tokenize(text: str) -> List[str]:
        """Simple tokenizer that removes stop words and special characters."""
        if not text:
            return []
        text = text.lower()
        words = re.findall(r'[a-z0-9]+', text)
        stopwords = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
            "can", "cannot", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for",
            "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
            "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more", "most",
            "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "our", "ours",
            "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that",
            "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those",
            "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
            "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
        }
        return [w for w in words if w not in stopwords]

    @classmethod
    def _get_fallback_vector(cls, text: str, vocabulary: List[str]) -> List[float]:
        """Generates a term frequency vector based on vocabulary."""
        tokens = cls._tokenize(text)
        vector = [0.0] * len(vocabulary)
        for t in tokens:
            if t in vocabulary:
                idx = vocabulary.index(t)
                vector[idx] += 1.0
        return vector

    @staticmethod
    def _cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Computes cosine similarity between two float vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(v1, v2))
        magnitude_v1 = math.sqrt(sum(a * a for a in v1))
        magnitude_v2 = math.sqrt(sum(b * b for b in v2))
        
        if magnitude_v1 == 0.0 or magnitude_v2 == 0.0:
            return 0.0
        return dot_product / (magnitude_v1 * magnitude_v2)

    @classmethod
    async def get_embedding(cls, text: str) -> List[float]:
        """Gets embedding vector from Gemini if API Key is set, else returns a tokenized representation."""
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            # Return pseudo-random but deterministic floats from term hashing for mock vector
            logger.debug("No Gemini API key. Pseudo-random mock vector will be used.")
            tokens = cls._tokenize(text)
            vector = [0.0] * 128
            for t in tokens:
                # Simple hash code mapping to index
                h = sum(ord(c) for c in t) % 128
                vector[h] += 1.0
            return vector

        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "model": "models/text-embedding-004",
            "content": {
                "parts": [{"text": text}]
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return data["embedding"]["values"]
        except Exception as e:
            logger.error(f"Error fetching Gemini embedding: {str(e)}")
            
        # Fallback to pseudo-random mock vector
        tokens = cls._tokenize(text)
        vector = [0.0] * 128
        for t in tokens:
            h = sum(ord(c) for c in t) % 128
            vector[h] += 1.0
        return vector

    @classmethod
    def rank_by_similarity(cls, query: str, documents: List[Dict[str, Any]], text_field: str = "text") -> List[Dict[str, Any]]:
        """Ranks list of dicts based on word overlap cosine similarity (no API dependency)."""
        if not documents:
            return []
            
        # 1. Build local vocabulary
        all_text = query + " " + " ".join(doc.get(text_field, "") for doc in documents)
        vocabulary = list(set(cls._tokenize(all_text)))
        if not vocabulary:
            return documents
            
        # 2. Vectorize query
        q_vec = cls._get_fallback_vector(query, vocabulary)
        
        # 3. Calculate scores
        ranked = []
        for doc in documents:
            doc_text = doc.get(text_field, "")
            d_vec = cls._get_fallback_vector(doc_text, vocabulary)
            score = cls._cosine_similarity(q_vec, d_vec)
            ranked.append({**doc, "_score": score})
            
        # 4. Sort descending
        return sorted(ranked, key=lambda x: x.get("_score", 0.0), reverse=True)

    @classmethod
    def match_investors(cls, profile: Dict[str, Any], investors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Calculates matchmaking scores for investors based on venture profile stage, industry, and geography."""
        matched = []
        profile_stage = profile.get("stage", "Idea")
        profile_industry = profile.get("industry", "AI & SaaS").lower()
        profile_country = profile.get("country", "India").lower()
        
        # Calculate base startup readiness scores independent of specific VCs
        team_score = 50
        if profile.get("startupName") and profile.get("description"):
            team_score += 15
        if profile.get("legalEntityType") and profile.get("legalEntityType") != "Unincorporated / Individual":
            team_score += 15
        if profile.get("stage") in ["MVP", "Revenue", "Fundraising"]:
            team_score += 20
        team_score = min(100, team_score)

        product_score = 40
        if profile.get("description"):
            product_score += 15
        if profile.get("has_validation"):
            product_score += 25
        if profile.get("stage") in ["MVP", "Revenue", "Fundraising"]:
            product_score += 20
        product_score = min(100, product_score)

        traction_score = 30
        stg = profile.get("stage", "Idea")
        if stg == "MVP":
            traction_score += 20
        elif stg == "Revenue":
            traction_score += 30
        elif stg == "Fundraising":
            traction_score += 40
        if profile.get("has_applications"):
            traction_score += 20
        if profile.get("annualRevenue") and profile.get("annualRevenue") != "Pre-revenue":
            traction_score += 10
        traction_score = min(100, traction_score)
        
        for inv in investors:
            # 1. Calculate market score (fits custom sector alignment with this specific VC)
            market_score = 50
            if profile.get("has_validation"):
                market_score += 20
            
            sectors = [s.lower() for s in inv.get("sectors", [])]
            sector_match = False
            for sec in sectors:
                if sec in profile_industry or profile_industry in sec:
                    sector_match = True
                    break
            if sector_match:
                market_score += 30
            market_score = min(100, market_score)
            
            # 2. Calculate VC preferences fit score
            fit_score = 100
            stages = [s.lower() for s in inv.get("stages", [])]
            if profile_stage.lower() not in stages:
                fit_score -= 20
            if not sector_match:
                fit_score -= 15
            geo = inv.get("geography", "").lower()
            if geo != "any" and geo != "global" and profile_country not in geo:
                fit_score -= 5
            fit_score = max(40, min(100, fit_score))
            
            # 3. Combine startup general readiness & specific VC fit score
            overall_readiness = int((team_score + product_score + market_score + traction_score) / 4)
            match_rate = int((overall_readiness * 0.6) + (fit_score * 0.4))
            match_rate = max(40, min(100, match_rate))
            
            # Map Pydantic model naming
            matched.append({
                "id": inv.get("id"),
                "name": inv.get("name"),
                "type": inv.get("type"),
                "ticketSize": inv.get("ticket_size", inv.get("ticketSize", "$100K")),
                "stages": inv.get("stages", []),
                "sectors": inv.get("sectors", []),
                "geography": inv.get("geography"),
                "readinessScore": match_rate,
                "matchReason": inv.get("match_reason", inv.get("matchReason", "Matches industry segment.")),
                "contactEmail": inv.get("contact_email", inv.get("contactEmail", "")),
                "readinessBreakdown": {
                    "team": team_score,
                    "product": product_score,
                    "market": market_score,
                    "traction": traction_score
                }
            })
            
        return sorted(matched, key=lambda x: x["readinessScore"], reverse=True)

    @classmethod
    def match_mentors(cls, profile: Dict[str, Any], mentors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Matches mentors based on stages and expertise alignment."""
        profile_stage = profile.get("stage", "Idea").lower()
        matched = []
        
        for m in mentors:
            stages = [s.lower() for s in m.get("stages", [])]
            fit_multiplier = 1.0 if profile_stage in stages else 0.7
            
            # Simple sorting rank
            matched.append({
                **m,
                "_fit": fit_multiplier
            })
            
        return sorted(matched, key=lambda x: x["_fit"], reverse=True)
