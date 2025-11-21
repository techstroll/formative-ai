"""
Google Custom Search integration for market research
"""

import os
import requests
from typing import List, Dict

class SearchService:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_SEARCH_API_KEY')
        self.search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
        self.base_url = 'https://www.googleapis.com/customsearch/v1'
        self.max_results = int(os.getenv('GOOGLE_SEARCH_MAX_RESULTS', '5'))

    def search(self, query: str, num: int = 5) -> List[Dict]:
        """Search Google Custom Search API"""
        if not self.api_key or not self.search_engine_id:
            return []

        params = {
            'q': query,
            'key': self.api_key,
            'cx': self.search_engine_id,
            'num': min(num, self.max_results),
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()

            results = response.json()

            if 'items' not in results:
                return []

            formatted_results = []
            for item in results['items']:
                formatted_results.append({
                    'title': item.get('title', ''),
                    'link': item.get('link', ''),
                    'snippet': item.get('snippet', ''),
                })

            return formatted_results
        except Exception as e:
            print(f"Search error: {e}")
            return []

    def search_market_data(self, topic: str) -> Dict:
        """Search for market data about a topic"""
        queries = [
            f"{topic} market size 2024",
            f"{topic} industry growth trends",
            f"{topic} competitive landscape",
            f"{topic} target audience demographics",
        ]

        all_results = {}
        for query in queries:
            all_results[query] = self.search(query, num=3)

        return all_results

    def search_competitor(self, company: str) -> Dict:
        """Search for competitor information"""
        queries = [
            f"{company} product features pricing",
            f"{company} market position competitors",
            f"{company} customer reviews",
        ]

        all_results = {}
        for query in queries:
            all_results[query] = self.search(query, num=3)

        return all_results

# Global instance
_search_service = None

def get_search_service():
    global _search_service
    if _search_service is None:
        _search_service = SearchService()
    return _search_service
