"""
Pinecone Vector Database Service for RAG
Handles embeddings and semantic search
"""

import os
from typing import List, Dict, Tuple
from pinecone import Pinecone
from openai import OpenAI

class VectorDBService:
    def __init__(self):
        self.api_key = os.getenv('PINECONE_API_KEY')
        self.environment = os.getenv('PINECONE_ENVIRONMENT', 'us-east-1-aws')
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'formative-research')
        self.dimension = int(os.getenv('PINECONE_DIMENSION', '1536'))

        if self.api_key:
            pc = Pinecone(api_key=self.api_key)
            self.index = pc.Index(self.index_name)
        else:
            self.index = None

        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding error: {e}")
            return []

    def index_document(self, doc_id: str, text: str, metadata: Dict = None) -> bool:
        """Add document to vector DB"""
        if not self.index:
            return False

        try:
            embedding = self.get_embedding(text)
            if not embedding:
                return False

            self.index.upsert(
                vectors=[
                    {
                        "id": doc_id,
                        "values": embedding,
                        "metadata": metadata or {},
                    }
                ]
            )
            return True
        except Exception as e:
            print(f"Indexing error: {e}")
            return False

    def search_documents(self, query: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """Search for relevant documents"""
        if not self.index:
            return []

        try:
            query_embedding = self.get_embedding(query)
            if not query_embedding:
                return []

            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
            )

            documents = []
            for match in results['matches']:
                documents.append((
                    match['id'],
                    match['score'],
                    match.get('metadata', {}),
                ))

            return documents
        except Exception as e:
            print(f"Search error: {e}")
            return []

    def delete_document(self, doc_id: str) -> bool:
        """Delete document from vector DB"""
        if not self.index:
            return False

        try:
            self.index.delete(ids=[doc_id])
            return True
        except Exception as e:
            print(f"Delete error: {e}")
            return False

# Global instance
_vector_db_service = None

def get_vector_db_service():
    global _vector_db_service
    if _vector_db_service is None:
        _vector_db_service = VectorDBService()
    return _vector_db_service
