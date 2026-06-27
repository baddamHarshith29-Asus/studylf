import os
from typing import List, Dict, Any, Optional
from backend.ai.chains.validation_chain import ValidationChain
from backend.core.logger import logger
from backend.core.config import settings

class RAGPipeline:
    @staticmethod
    def run_web_search(query: str) -> List[Dict[str, Any]]:
        """Executes a real-time search using Tavily API if key is present, else returns mock web insights."""
        api_key = settings.TAVILY_API_KEY
        if not api_key or api_key.startswith("your_"):
            logger.info("TAVILY_API_KEY is not set or placeholder. Simulating search results.")
            return [
                {
                    "title": f"Recent trends in {query}",
                    "url": "https://techcrunch.com/trends",
                    "snippet": f"Market dynamics indicate strong growth for products solving {query}. Early-stage companies are capturing market share by focusing on user workflows and rapid API integration."
                },
                {
                    "title": f"Competitors and market sizing in {query}",
                    "url": "https://www.gartner.com/reports",
                    "snippet": "CAGR ranges from 12% to 22% in related sectors. Small startups face indirect competition from established platforms but can leverage lower pricing and customized regional features."
                }
            ]
            
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=api_key)
            response = client.search(query=query, max_results=3)
            results = []
            for r in response.get("results", []):
                results.append({
                    "title": r.get("title", "Search Result"),
                    "url": r.get("url", "#"),
                    "snippet": r.get("content", "")
                })
            return results
        except Exception as e:
            logger.error(f"Error calling Tavily Search API: {str(e)}")
            return [
                {
                    "title": "Fallback Web Search Item",
                    "url": "#",
                    "snippet": f"Encountered Tavily Search API error. Falling back to local data matching for query: '{query}'."
                }
            ]

    @classmethod
    async def generate_idea_validation(
        cls, 
        startup_idea: str, 
        problem_statement: Optional[str] = None, 
        customer_segment: Optional[str] = None, 
        geography: Optional[str] = None,
        startup_name: Optional[str] = None,
        solution: Optional[str] = None,
        industry: Optional[str] = None,
        target_audience: Optional[str] = None
    ) -> Dict[str, Any]:
        """Orchestrates Tavily Search + ValidationChain LLM query to validate a concept."""
        search_query = f"{startup_idea} market size competition"
        search_results = cls.run_web_search(search_query)
        
        search_context = "\n".join([
            f"Source: {res['title']} ({res['url']})\nSnippet: {res['snippet']}\n"
            for res in search_results
        ])
        
        return await ValidationChain.run(
            startup_idea=startup_idea,
            problem_statement=problem_statement,
            customer_segment=customer_segment,
            geography=geography,
            search_context=search_context,
            startup_name=startup_name,
            solution=solution,
            industry=industry,
            target_audience=target_audience
        )
