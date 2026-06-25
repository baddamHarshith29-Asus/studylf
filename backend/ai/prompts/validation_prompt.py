VALIDATION_PROMPT_TEMPLATE = """You are an expert Venture Capital Analyst. Evaluate the following startup concept:
Idea: {startup_idea}
Problem Statement: {problem_statement}
Customer Segment: {customer_segment}
Geography: {geography}

Here is real-time search context on the market/competitors:
{search_context}

Analyze the startup viability and return a raw JSON object conforming EXACTLY to this schema:
{{
  "scores": {{
    "overall": int (0 to 100),
    "demand": int (0 to 100),
    "competition": int (0 to 100),
    "scalability": int (0 to 100),
    "revenuePotential": int (0 to 100)
  }},
  "marketResearch": {{
    "marketSize": "TAM SAM SOM estimates and short reasoning",
    "growthTrends": "CAGR and industry growth vectors",
    "industryOverview": "Brief overview of current shifts in target geography"
  }},
  "competitors": [
    {{"name": "Competitor Name", "funding": "$xxM or N/A", "pricing": "pricing details or unknown", "type": "Direct or Indirect"}}
  ],
  "customerPersona": {{
    "name": "Typical ICP Name/Role",
    "painPoints": "Key frustrations and time sinks",
    "behavior": "Where they spend time/tools they use"
  }}
}}
Do not include any explanation markdown outside the JSON block. Return ONLY the raw JSON."""
