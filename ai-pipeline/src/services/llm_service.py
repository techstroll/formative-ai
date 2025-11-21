"""
LLM Service wrapper for OpenAI and Anthropic Claude
Provides abstraction layer for multi-LLM support
"""

import os
from typing import Optional
from openai import OpenAI
from anthropic import Anthropic

class LLMService:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.claude_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.openai_model = os.getenv('OPENAI_MODEL', 'gpt-4')
        self.claude_model = os.getenv('ANTHROPIC_MODEL', 'claude-3-opus-20240229')

    def call_openai(self, prompt: str, system: Optional[str] = None, temperature: float = 0.7) -> str:
        """Call OpenAI GPT API"""
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = self.openai_client.chat.completions.create(
            model=self.openai_model,
            messages=messages,
            temperature=temperature,
            max_tokens=2000,
        )
        return response.choices[0].message.content

    def call_claude(self, prompt: str, system: Optional[str] = None, temperature: float = 0.7) -> str:
        """Call Anthropic Claude API"""
        response = self.claude_client.messages.create(
            model=self.claude_model,
            max_tokens=2000,
            temperature=temperature,
            system=system or "",
            messages=[
                {"role": "user", "content": prompt}
            ],
        )
        return response.content[0].text

    def call(self, prompt: str, system: Optional[str] = None, use_claude: bool = False) -> str:
        """Call LLM with fallback to Claude if OpenAI fails"""
        try:
            if use_claude:
                return self.call_claude(prompt, system)
            else:
                return self.call_openai(prompt, system)
        except Exception as e:
            print(f"OpenAI call failed: {e}, trying Claude...")
            try:
                return self.call_claude(prompt, system)
            except Exception as e2:
                raise Exception(f"Both LLM calls failed: OpenAI: {e}, Claude: {e2}")

# Global instance
_llm_service = None

def get_llm_service():
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
