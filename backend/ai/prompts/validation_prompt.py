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
IMPORTANT:
1. Ground your market size calculations and competitor mapping strictly on the provided real-time search context.
2. Avoid arbitrary projections. If competitor funding or pricing is not present in the search context, use 'N/A' or 'Unknown' rather than inventing fictional data.
3. Ensure the output scores are logically consistent with your critique and market research findings.
Do not include any explanation markdown outside the JSON block. Return ONLY the raw JSON."""
