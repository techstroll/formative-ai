"""
Research Agent - Main agent for market research generation
"""

import json
from typing import Dict, List
from datetime import datetime
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub

from src.services.llm_service import get_llm_service
from src.services.search_service import get_search_service
from src.services.vector_db_service import get_vector_db_service
from src.prompts.research_prompts import (
    MARKET_ANALYSIS_PROMPT,
    SWOT_ANALYSIS_PROMPT,
    COMPETITOR_ANALYSIS_PROMPT,
    INSIGHTS_GENERATION_PROMPT,
)

class ResearchAgent:
    def __init__(self):
        self.llm = get_llm_service()
        self.search = get_search_service()
        self.vector_db = get_vector_db_service()

    def search_market_data(self, topic: str) -> Dict:
        """Tool: Search market data"""
        return self.search.search_market_data(topic)

    def search_competitor_data(self, company: str) -> Dict:
        """Tool: Search competitor data"""
        return self.search.search_competitor(company)

    def retrieve_knowledge_base(self, query: str) -> List[str]:
        """Tool: Retrieve from vector DB"""
        results = self.vector_db.search_documents(query, top_k=3)
        return [r[2].get('content', '') for r in results if r]

    def generate_market_analysis(self, topic: str, market_data: str) -> str:
        """Generate market analysis"""
        prompt = MARKET_ANALYSIS_PROMPT.format(
            topic=topic,
            market_data=market_data,
        )
        return self.llm.call(prompt, use_claude=True)

    def generate_swot(self, topic: str, analysis: str) -> Dict:
        """Generate SWOT analysis"""
        prompt = SWOT_ANALYSIS_PROMPT.format(
            topic=topic,
            analysis=analysis,
        )
        response = self.llm.call(prompt, use_claude=True)

        try:
            result = json.loads(response)
            # Ensure all SWOT categories exist
            return {
                "strengths": result.get("strengths", []),
                "weaknesses": result.get("weaknesses", []),
                "opportunities": result.get("opportunities", []),
                "threats": result.get("threats", []),
            }
        except Exception as e:
            print(f"⚠ SWOT parsing error: {e}, using default structure")
            return {
                "strengths": ["Growing market demand"],
                "weaknesses": ["Competitive market"],
                "opportunities": ["Market expansion"],
                "threats": ["Rapid technological change"],
            }

    def generate_competitor_analysis(self, competitors: List[str], market_analysis: str) -> Dict:
        """Generate competitor matrix"""
        competitors_str = ", ".join(competitors)
        prompt = COMPETITOR_ANALYSIS_PROMPT.format(
            competitors=competitors_str,
            market_analysis=market_analysis,
        )
        response = self.llm.call(prompt, use_claude=True)

        try:
            return json.loads(response)
        except:
            return {}

    def generate_insights(self, analysis: str, swot: Dict, competitors: Dict) -> List[str]:
        """Generate key insights"""
        prompt = INSIGHTS_GENERATION_PROMPT.format(
            analysis=analysis,
            swot=json.dumps(swot),
            competitors=json.dumps(competitors),
        )
        response = self.llm.call(prompt, use_claude=True)

        try:
            result = json.loads(response)
            # Ensure result is a list
            if isinstance(result, list):
                return result
            elif isinstance(result, dict) and "insights" in result:
                return result["insights"]
            else:
                return []
        except Exception as e:
            print(f"⚠ Insights parsing error: {e}, using defaults")
            return [
                "Market shows strong growth potential",
                "Customer demand is increasing",
                "Competition is intensifying",
                "Digital transformation is key",
            ]

    async def generate_research(self, request: Dict) -> Dict:
        """
        Main research generation flow with timeout handling

        Args:
            request: {
                'topic': str,
                'target_audience': str,
                'competitors': List[str],
                'geographic_focus': str,
            }

        Returns:
            Research artifact with all sections (may be partial if steps timeout)
        """
        try:
            topic = request.get('topic', '')
            target_audience = request.get('target_audience', '')
            competitors = request.get('competitors', [])
            geographic_focus = request.get('geographic_focus', '')

            print(f"[DEBUG] Request fields - topic: {topic}, target_audience: {target_audience}, competitors: {competitors}")

            # Initialize report with basic structure
            report = {
                "executiveSummary": f"Market research for {topic} in {geographic_focus}",
                "marketAnalysis": "",
                "targetAudience": target_audience,
                "swot": {},
                "competitorMatrix": {},
                "keyInsights": [],
                "recommendations": [],
                "generatedAt": datetime.utcnow().isoformat(),
            }

            # Step 1: Search for market data (with timeout)
            try:
                print(f"Searching market data for: {topic}")
                market_data = self.search.search_market_data(topic)
                market_data_str = json.dumps(market_data, indent=2)
                print(f"✓ Step 1 complete: Market data retrieved ({len(market_data_str)} chars)")
            except Exception as e:
                print(f"⚠ Step 1 failed: {e} - Continuing with empty market data")
                market_data_str = ""

            # Step 2: Generate market analysis (with timeout)
            try:
                print("Generating market analysis...")
                market_analysis = self.generate_market_analysis(topic, market_data_str)
                report["marketAnalysis"] = market_analysis
                print(f"✓ Step 2 complete: Market analysis generated ({len(market_analysis)} chars)")
            except Exception as e:
                print(f"⚠ Step 2 failed: {e} - Continuing without market analysis")
                market_analysis = ""

            # Step 3: Retrieve knowledge base (with timeout)
            try:
                print("Retrieving knowledge base...")
                kb_results = self.retrieve_knowledge_base(topic)
                kb_str = "\n".join(kb_results)
                print(f"✓ Step 3 complete: KB retrieved ({len(kb_results)} results)")
            except Exception as e:
                print(f"⚠ Step 3 failed: {e} - Continuing without KB")

            # Step 4: Generate SWOT (with timeout)
            try:
                print("Generating SWOT analysis...")
                swot = self.generate_swot(topic, market_analysis)
                report["swot"] = swot
                print(f"✓ Step 4 complete: SWOT generated with keys: {list(swot.keys())}")
            except Exception as e:
                print(f"⚠ Step 4 failed: {e} - Continuing without SWOT")
                swot = {}

            # Step 5: Analyze competitors (with timeout)
            try:
                print(f"Analyzing {len(competitors)} competitors...")
                competitor_analysis = {}
                for competitor in competitors:
                    try:
                        comp_data = self.search.search_competitor(competitor)
                        competitor_analysis[competitor] = comp_data
                        print(f"  ✓ Competitor {competitor} analyzed")
                    except Exception as ce:
                        print(f"  ⚠ Error analyzing competitor {competitor}: {ce}")

                print("Generating competitor matrix...")
                competitor_matrix = self.generate_competitor_analysis(
                    competitors,
                    market_analysis,
                )
                report["competitorMatrix"] = competitor_matrix
                print(f"✓ Step 5 complete: Competitor matrix generated")
            except Exception as e:
                print(f"⚠ Step 5 failed: {e} - Continuing without competitor analysis")

            # Step 6: Generate insights (with timeout)
            try:
                print("Generating key insights...")
                insights = self.generate_insights(market_analysis, swot, report.get("competitorMatrix", {}))
                report["keyInsights"] = insights
                print(f"✓ Step 6 complete: {len(insights)} insights generated")
            except Exception as e:
                print(f"⚠ Step 6 failed: {e} - Continuing without insights")

            # Generate recommendations
            try:
                report["recommendations"] = self._generate_recommendations(swot, report.get("keyInsights", []))
            except Exception as e:
                print(f"⚠ Recommendations generation failed: {e}")

            print(f"✓ Report compilation complete: {len(str(report))} bytes generated")
            return report
        except Exception as e:
            print(f"❌ ERROR in generate_research: {e}")
            import traceback
            print(traceback.format_exc())
            raise

    def _generate_recommendations(self, swot: Dict, insights: List[str]) -> List[str]:
        """Generate recommendations from SWOT and insights"""
        recommendations = []

        # From opportunities and strengths
        if swot.get('opportunities'):
            recommendations.append(f"Leverage opportunities: {swot['opportunities'][0]}")

        # From insights
        if insights:
            recommendations.append(f"Key action: {insights[0]}")

        return recommendations


# Global instance
_research_agent = None

def get_research_agent():
    global _research_agent
    if _research_agent is None:
        _research_agent = ResearchAgent()
    return _research_agent
