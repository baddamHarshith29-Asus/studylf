VALIDATION_PROMPT_TEMPLATE = """You are an expert Venture Capital Analyst and Startup Go-To-Market (GTM) Specialist. Evaluate the following startup concept:
Startup Name: {startup_name}
Idea: {startup_idea}
Problem Statement: {problem_statement}
Solution: {solution}
Industry: {industry}
Geography/Country: {geography}
Target Audience: {target_audience}

Here is real-time search context on the market/competitors:
{search_context}

Analyze the startup concept and return a raw JSON object conforming EXACTLY to this schema. Ensure you fill out every section with detailed, customized analytical content (do not use generic placeholders):
{{
  "scores": {{
    "overall": int (0 to 100),
    "demand": int (0 to 100),
    "competition": int (0 to 100),
    "scalability": int (0 to 100),
    "revenuePotential": int (0 to 100)
  }},
  "marketResearch": {{
    "marketSize": "Brief TAM SAM SOM estimates summary",
    "growthTrends": "Brief CAGR growth rate summary",
    "industryOverview": "Brief overview of target geography shifts"
  }},
  "competitors": [
    {{
      "name": "Competitor Name",
      "funding": "Funding details (or N/A)",
      "pricing": "Pricing tiers (or Unknown)",
      "type": "Direct or Indirect"
    }}
  ],
  "customerPersona": {{
    "name": "Alex, Target ICP Role",
    "painPoints": "Bullet list of key frustrations",
    "behavior": "Where they spend time/tools used"
  }},
  "fullAnalysis": {{
    "ideaOverview": {{
      "startupName": "Startup Name",
      "oneLineIdea": "One-line description",
      "problem": "Problem statement",
      "solution": "Solution description",
      "industry": "Industry segment analyzed",
      "country": "Geography Country",
      "targetAudience": "Target audience ICP",
      "aiSummary": "Comprehensive summary of the value proposition",
      "businessModel": "Recommended model (e.g. B2B SaaS, Marketplace, Freemium)",
      "marketCategory": "Primary market vertical category",
      "difficultyLevel": "Easy, Medium, or Hard",
      "innovationType": "Process, AI Automation, Tech, or Business Model"
    }},
    "problemValidation": {{
      "problemScore": int (0 to 100),
      "painScore": int (0 to 100),
      "urgency": "High, Medium, or Low",
      "frequency": "Daily, Weekly, Monthly, or Infrequent",
      "evidence": "Data-backed evidence supporting the problem statement"
    }},
    "marketAnalysis": {{
      "tam": "Estimated TAM (e.g. $10B)",
      "sam": "Estimated SAM (e.g. $1.2B)",
      "som": "Estimated SOM (e.g. $150M)",
      "growthRate": "CAGR percentage (e.g. 18.5% CAGR)",
      "futureTrends": ["Trend vector 1", "Trend vector 2"],
      "demand": "Analysis of customer demand and pull",
      "industryGrowth": "Overview of sector growth speed",
      "marketMaturity": "Emerging, Growth, or Mature",
      "visuals": {{
        "marketGrowthChart": [
          {{"year": "2024", "value": int}},
          {{"year": "2025", "value": int}},
          {{"year": "2026", "value": int}},
          {{"year": "2027", "value": int}},
          {{"year": "2028", "value": int}},
          {{"year": "2029", "value": int}}
        ],
        "demandGraph": [
          {{"month": "Month 1", "interest": int}},
          {{"month": "Month 2", "interest": int}},
          {{"month": "Month 3", "interest": int}},
          {{"month": "Month 4", "interest": int}},
          {{"month": "Month 5", "interest": int}},
          {{"month": "Month 6", "interest": int}}
        ],
        "industryTimeline": [
          {{"period": "Past", "milestone": "Historical origin / genesis milestone"}},
          {{"period": "Present", "milestone": "Current adoption / maturity milestone"}},
          {{"period": "Future", "milestone": "Future projection / agentic automation milestone"}}
        ]
      }}
    }},
    "competitorAnalysis": [
      {{
        "company": "Competitor Name",
        "funding": "Estimated funding raised or 'Bootstrapped'",
        "revenue": "Estimated revenue or 'Unknown'",
        "country": "Primary country of operations",
        "users": "Estimated user count or 'Unknown'",
        "pricing": "Detailed pricing structure",
        "strengths": "Core competitive strength",
        "weaknesses": "Core competitive weakness",
        "website": "URL or domain name",
        "techStack": "Primary framework/dev stack (e.g. React/Django) or 'Unknown'",
        "aiFeatures": "Specific AI features in competitor app or 'No AI'",
        "usp": "Unique Selling Point"
      }}
    ],
    "customerAnalysis": {{
      "demographics": {{
        "age": "Target age bracket (e.g. 18-25)",
        "occupation": "Primary occupation/profile",
        "income": "Income tier or allowance level",
        "location": "Geographical concentration",
        "education": "Expected education level"
      }},
      "icpProfile": {{
        "problems": "Direct customer frustrations",
        "goals": "Key customer desires/goals",
        "buyingPower": "High, Medium, or Low",
        "techKnowledge": "Tech Savvy, Moderate, or Basic",
        "decisionMaker": "Yes or No"
      }},
      "personas": [
        {{
          "name": "Persona Name (e.g. Arjun, The Aspiring Student Founder)",
          "age": int,
          "occupation": "Occupation details",
          "location": "Location (e.g. Hyderabad, India)",
          "background": "Short background description",
          "needs": "What they need to succeed",
          "goals": "Their target startup goals"
        }},
        {{
          "name": "Second Persona Name",
          "age": int,
          "occupation": "Occupation details",
          "location": "Location",
          "background": "Short background description",
          "needs": "What they need to succeed",
          "goals": "Their target startup goals"
        }}
      ]
    }},
    "swot": {{
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "opportunities": ["Opportunity 1", "Opportunity 2"],
      "threats": ["Threat 1", "Threat 2"]
    }},
    "businessModel": {{
      "revenueStreams": ["Revenue stream 1", "Revenue stream 2"],
      "pricingStructure": "Detailed subscription, freemium, or license pricing recommendation",
      "subscriptionTags": ["Subscription", "Freemium", "Enterprise", "B2B", "B2C", "Marketplace", "Commission"],
      "recommendations": "Detailed advice on pricing strategy and monetization models"
    }},
    "gtm": {{
      "launchStrategy": "How to deploy the initial MVP",
      "marketingChannels": ["Channel 1", "Channel 2"],
      "positioning": "Value proposition positioning statement",
      "brandStory": "Brief compelling brand story outline",
      "customerJourney": ["Awareness touchpoint", "Consideration step", "Conversion trigger", "Retention loop"],
      "salesFunnel": ["Top of funnel strategy", "Middle of funnel strategy", "Bottom of funnel strategy"],
      "growthChannels": ["Growth driver 1", "Growth driver 2"],
      "first100Users": "Concrete action plan to acquire the first 100 users",
      "customerAcquisitionPlan": "Sustainable customer acquisition channels",
      "retentionPlan": "Tactics to prevent churn and increase stickiness"
    }},
    "investorAnalysis": {{
      "readiness": int (0 to 100),
      "scalability": "Low, Medium, High, or Very High",
      "revenuePotential": "Low, Medium, High, or Very High",
      "teamRisk": "Low, Medium, or High",
      "technologyRisk": "Low, Medium, or High",
      "fundingStage": "Recommended initial funding source (e.g. Incubator grants, pre-seed, seed)",
      "investmentScore": int (0 to 100),
      "recommendation": "Incubator ready / Seed round ready / series A ready"
    }},
    "finalScore": {{
      "parameterScores": {{
        "problemStrength": int (0 to 100),
        "market": int (0 to 100),
        "competition": int (0 to 100),
        "innovation": int (0 to 100),
        "revenue": int (0 to 100),
        "scalability": int (0 to 100),
        "gtm": int (0 to 100),
        "funding": int (0 to 100),
        "technicalFeasibility": int (0 to 100),
        "risk": int (0 to 100)
      }},
      "overall": int (0 to 100),
      "grade": "Grade character (e.g. A, B+, C-)",
      "recommendation": "Proceed, Pivot, or Reject",
      "suggestions": ["Concrete recommendation 1", "Concrete recommendation 2", "Concrete recommendation 3"],
      "actionPlan": [
        {{"week": "Week 1", "tasks": ["Task 1", "Task 2"]}},
        {{"week": "Week 2", "tasks": ["Task 1", "Task 2"]}},
        {{"week": "Week 3", "tasks": ["Task 1"]}},
        {{"week": "Week 4", "tasks": ["Task 1", "Task 2"]}},
        {{"week": "Week 5", "tasks": ["Task 1"]}}
      ]
    }}
  }}
}}

IMPORTANT:
1. Return ONLY the valid JSON block. Do not include markdown code block characters (like ```json) or explanation text outside the JSON.
2. Ground your market size calculations and competitor mapping strictly on the provided search context and startup idea constraints.
3. If specific competitor details (like funding, revenue, or tech stack) are not in the context, use realistic estimates or 'N/A'/'Unknown'. Do not fail the report generation.
4. Ensure the output scores (overall and individual parameter scores) are logically consistent with your critique and market research findings.
"""
