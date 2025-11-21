"""
Prompt templates for research agent
"""

MARKET_ANALYSIS_PROMPT = """
Analyze the market for: {topic}

Based on the following market data:
{market_data}

Generate a comprehensive market analysis covering:
1. Market size and growth rate
2. Key trends and drivers
3. Industry segments
4. Market leaders and their positions
5. Emerging technologies and innovations

Provide a 500-word analysis in clear, professional language.
"""

SWOT_ANALYSIS_PROMPT = """
Based on this market analysis for {topic}:

{analysis}

Generate a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis.

Return a JSON object with this structure:
{{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "threats": ["string"]
}}

Each category should have 3-5 items. Provide actionable, specific items.
"""

COMPETITOR_ANALYSIS_PROMPT = """
Analyze these competitors in the {topic} market:
Competitors: {competitors}

Based on this market analysis:
{market_analysis}

Create a competitor comparison matrix.

Return a JSON object with competitor names as keys and this structure for each:
{{
  "company_name": {{
    "market_position": "string",
    "key_strengths": ["string"],
    "key_weaknesses": ["string"],
    "pricing_strategy": "string",
    "target_market": "string",
    "differentiation": "string"
  }}
}}
"""

INSIGHTS_GENERATION_PROMPT = """
Generate key insights from this research data:

Market Analysis:
{analysis}

SWOT Analysis:
{swot}

Competitor Analysis:
{competitors}

Identify the 5 most important business insights that a product manager should know.

Return a JSON array of strings:
["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"]

Insights should be:
- Specific and actionable
- Based on the data provided
- Strategic and important for product decisions
"""

REPORT_COMPILATION_PROMPT = """
Create an executive summary for a product research report on {topic}.

Based on:
- Market Analysis: {market_analysis}
- Target Audience: {target_audience}
- Key Insights: {insights}

Write a 200-word executive summary that:
1. Clearly states the opportunity
2. Highlights the target market
3. Summarizes key findings
4. Recommends next steps

Use professional, concise language suitable for C-level executives.
"""
