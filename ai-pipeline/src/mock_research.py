"""
Mock Research Agent - Returns realistic mock data for testing
Useful when API keys are not available
"""

import asyncio
from typing import Dict, Any
from datetime import datetime

async def generate_mock_research(request: Dict[str, Any]) -> Dict[str, Any]:
    """Generate mock research data based on topic"""

    topic = request.get('topic', 'Unknown Market')
    target_audience = request.get('target_audience', 'General audience')
    competitors = request.get('competitors', [])
    geographic_focus = request.get('geographic_focus', 'Global')

    # Simulate processing delay
    await asyncio.sleep(2)

    return {
        "executiveSummary": f"""
The {topic} market in {geographic_focus} represents a significant opportunity with
strong growth potential. Based on current market trends and analysis, we project
a compound annual growth rate of 15-20% over the next five years. The primary
drivers include increasing digital adoption, changing consumer preferences, and
technological innovation.

Key recommendations include:
1. Focus on customer experience and retention
2. Invest in technology and automation
3. Develop strategic partnerships
4. Build strong brand presence in target markets

Target audience ({target_audience}) shows high propensity for adoption,
particularly in segments that value innovation and convenience.
        """,

        "marketAnalysis": """
Market Overview:
- Current market size: $2.5B - $3.2B
- Historical growth rate: 12-15% annually
- Key market segments: Enterprise (45%), Mid-market (35%), SMB (20%)
- Geographic distribution: North America (40%), Europe (35%), APAC (20%), Other (5%)

Market Drivers:
1. Digital transformation initiatives across industries
2. Increasing demand for automation and efficiency
3. Rising customer expectations for personalization
4. Regulatory changes promoting standardization
5. Economic factors supporting business investment

Competitive Landscape:
- 15+ major players competing in the market
- 4 dominant leaders controlling ~60% market share
- Numerous emerging players with innovative solutions
- Consolidation trend with several recent acquisitions

Key Trends:
- AI and machine learning integration
- Cloud-based solutions gaining prominence
- Subscription models replacing perpetual licenses
- Integration with existing enterprise systems
- Focus on security and compliance
        """,

        "swot": {
            "strengths": [
                "Growing market demand and adoption",
                "Strong technology foundation and innovation",
                "Expanding customer base and network effects",
                "Multiple revenue streams and business models",
                "Significant partnership ecosystem"
            ],
            "weaknesses": [
                "High customer acquisition costs",
                "Complex integration requirements",
                "Intense competition from established players",
                "Skills shortage for specialized roles",
                "Dependency on third-party vendors"
            ],
            "opportunities": [
                "Expansion into adjacent markets",
                "International market penetration",
                "Strategic acquisitions and partnerships",
                "New product development and innovation",
                "Vertical and horizontal market consolidation"
            ],
            "threats": [
                "Rapid technological disruption",
                "Economic downturn affecting enterprise spending",
                "New competitive entrants with disruptive models",
                "Regulatory compliance requirements and restrictions",
                "Cybersecurity and data privacy incidents"
            ]
        },

        "competitorMatrix": {
            competitor: {
                "marketPosition": "Strong" if i == 0 else "Growing" if i == 1 else "Emerging",
                "keyStrengths": [
                    "Brand recognition",
                    "Established customer base",
                    "Strong R&D capabilities"
                ] if i < 2 else [
                    "Innovative features",
                    "Competitive pricing",
                    "Niche focus"
                ],
                "keyWeaknesses": [
                    "Legacy technology",
                    "Limited scalability"
                ] if i == 0 else [
                    "Limited market presence",
                    "Resource constraints"
                ],
                "pricingStrategy": "Premium" if i == 0 else "Competitive" if i == 1 else "Aggressive",
                "targetMarket": "Enterprise" if i == 0 else "Mid-market" if i == 1 else "SMB",
                "differentiation": "Market leadership and brand" if i == 0 else "Innovation and features" if i == 1 else "Price and accessibility"
            }
            for i, competitor in enumerate(competitors[:3])  # Mock top 3 competitors
        },

        "keyInsights": [
            f"The {topic} market is experiencing rapid consolidation with M&A activity expected to increase 25% YoY",
            "Customer acquisition costs are rising while switching costs remain low, indicating intense price competition",
            "Integration capabilities and API-first design are becoming key differentiators in the market",
            f"{target_audience} segment shows highest adoption rates and ROI realization among all customer segments",
            "Regulatory compliance and data security are becoming primary purchase decision factors, not secondary features"
        ],

        "recommendations": [
            f"Develop comprehensive go-to-market strategy targeting {target_audience} segment",
            "Invest in product innovation with focus on AI/ML capabilities and integration ecosystem",
            "Build strategic partnerships with complementary solution providers",
            "Establish thought leadership through content marketing and industry participation",
            f"Expand geographic presence starting with high-growth regions in {geographic_focus}"
        ],

        "generatedAt": datetime.utcnow().isoformat()
    }
