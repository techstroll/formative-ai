import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/hooks/useAuth';
import { ProtectedRoute } from '../lib/components/ProtectedRoute';
import { researchApi, ResearchResult, ResearchReadiness } from '../lib/api/researchApi';
import { wireframesApi } from '../lib/api/wireframesApi';

function ResearchContent() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [geographicFocus, setGeographicFocus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [researchId, setResearchId] = useState<string | null>(null);
  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [readiness, setReadiness] = useState<ResearchReadiness | null>(null);

  // Poll for research readiness and results
  useEffect(() => {
    if (!researchId || !token) return;

    const interval = setInterval(async () => {
      try {
        // Poll readiness endpoint
        const readinessData = await researchApi.getResearchReadiness(researchId, token);
        setReadiness(readinessData);

        // Also get full research data
        const result = await researchApi.getResearch(researchId, token);
        if (result) {
          setResearch(result);

          if (result.status === 'completed' || result.status === 'error') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error polling research:', error);
        // On error, set research status to error to show error state
        if (research && research.status === 'generating') {
          setResearch(prev => prev ? {
            ...prev,
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to fetch research status'
          } : null);
          clearInterval(interval);
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [researchId, token, research]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error('Please enter a research topic');
      return;
    }

    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    setIsLoading(true);
    try {
      const competitorList = competitors
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const response = await researchApi.createResearch(
        {
          topic,
          targetAudience: targetAudience || 'General audience',
          competitors: competitorList.length > 0 ? competitorList : [],
          geographicFocus: geographicFocus || 'Global',
        },
        token
      );

      setResearchId(response.id);
      setResearch({
        id: response.id,
        status: 'generating',
        executiveSummary: '',
        marketAnalysis: '',
        targetAudience: targetAudience || 'General audience',
        swot: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: [],
        },
        competitorMatrix: {},
        keyInsights: [],
        recommendations: [],
        generatedAt: new Date().toISOString(),
      });

      toast.success('Research generation started. This may take a few minutes...');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create research';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Market Research - Formative.AI</title>
        <meta name="description" content="Generate market research reports" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Formative.AI
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={handleLogout} className="text-gray-700 hover:text-indigo-600">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {!research ? (
            // Research Form
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Market Research</h1>
                <p className="text-gray-600">Generate comprehensive market analysis and insights</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                      Research Topic *
                    </label>
                    <input
                      id="topic"
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., AI-powered customer support tools"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the market or product category you want to research
                    </p>
                  </div>

                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <input
                      id="audience"
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Enterprise software companies"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="competitors" className="block text-sm font-medium text-gray-700 mb-2">
                      Competitors (comma-separated)
                    </label>
                    <textarea
                      id="competitors"
                      value={competitors}
                      onChange={(e) => setCompetitors(e.target.value)}
                      placeholder="e.g., Company A, Company B, Company C"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: List competitors to analyze
                    </p>
                  </div>

                  <div>
                    <label htmlFor="geographic" className="block text-sm font-medium text-gray-700 mb-2">
                      Geographic Focus
                    </label>
                    <input
                      id="geographic"
                      type="text"
                      value={geographicFocus}
                      onChange={(e) => setGeographicFocus(e.target.value)}
                      placeholder="e.g., North America, Europe, Global"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isLoading ? 'Starting Research...' : 'Generate Research Report'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Research Results
            <ResearchResults
              research={research}
              readiness={readiness}
              token={token || undefined}
              router={router}
              onGenerateWireframes={() => {
                toast.success('Wireframes generated! Redirecting...');
              }}
            />
          )}
        </div>
      </main>
    </>
  );
}

function ResearchResults({
  research,
  readiness,
  token,
  router,
  onGenerateWireframes,
}: {
  research: ResearchResult | null;
  readiness: ResearchReadiness | null;
  token?: string;
  router: any;
  onGenerateWireframes?: () => void;
}) {
  const [isGeneratingWireframes, setIsGeneratingWireframes] = useState(false);

  const handleGenerateWireframes = async () => {
    if (!research?.id || !token) {
      toast.error('Missing research ID or authentication');
      return;
    }

    setIsGeneratingWireframes(true);
    try {
      const wireframe = await wireframesApi.generateFromResearch(
        {
          researchId: research.id,
          useAI: true, // Enable AI enhancement
          refinementMode: 'quality', // Use quality mode for best results
        },
        token
      );

      toast.success(`Wireframes generated! Created ${wireframe.screenCount} screens`);
      onGenerateWireframes?.();

      // Navigate to wireframe viewer
      router.push(`/wireframes/${wireframe.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate wireframes';
      toast.error(message);
      console.error('Wireframe generation error:', error);
    } finally {
      setIsGeneratingWireframes(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Research Results</h1>
          {research?.status === 'completed' && (
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/feature-planning?researchId=${research.id}`)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span>📋</span>
                Plan Features
              </button>
              <button
                onClick={handleGenerateWireframes}
                disabled={isGeneratingWireframes}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isGeneratingWireframes ? (
                  <>
                    <span className="inline-block animate-spin">⚙️</span>
                    Generating Wireframes...
                  </>
                ) : (
                  <>
                    <span>🎨</span>
                    Generate Wireframes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              research?.status === 'generating'
                ? 'bg-blue-100 text-blue-800'
                : research?.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {research?.status === 'generating' ? '⏳ Generating...' : research?.status === 'completed' ? '✓ Completed' : '✗ Error'}
          </span>
          {research?.status === 'generating' && readiness && (
            <div className="flex items-center gap-3">
              <div className="w-40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-indigo-600">{readiness.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${readiness.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {research?.status === 'generating' && readiness && readiness.missingFields.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">Generating the following sections:</p>
            <div className="flex flex-wrap gap-2">
              {readiness.missingFields.map((field) => (
                <span key={field} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {research?.status === 'completed' && (
        <div className="space-y-8">
          {/* Executive Summary */}
          {research?.executiveSummary && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
              <p className="text-gray-700 leading-relaxed">{research.executiveSummary}</p>
            </div>
          )}

          {/* Market Analysis */}
          {research?.marketAnalysis && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Market Analysis</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{research.marketAnalysis}</p>
            </div>
          )}

          {/* SWOT Analysis */}
          {research?.swot && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">SWOT Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {(research.swot.strengths || []).map((item, i) => (
                      <li key={i} className="text-sm text-green-800">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Weaknesses</h3>
                  <ul className="space-y-2">
                    {(research.swot.weaknesses || []).map((item, i) => (
                      <li key={i} className="text-sm text-red-800">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Opportunities</h3>
                  <ul className="space-y-2">
                    {(research.swot.opportunities || []).map((item, i) => (
                      <li key={i} className="text-sm text-blue-800">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Threats</h3>
                  <ul className="space-y-2">
                    {(research.swot.threats || []).map((item, i) => (
                      <li key={i} className="text-sm text-yellow-800">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Key Insights */}
          {research?.keyInsights && research.keyInsights.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Insights</h2>
              <ul className="space-y-3">
                {research.keyInsights.map((insight, i) => (
                  <li key={i} className="text-gray-700">
                    <span className="font-semibold text-indigo-600">#{i + 1}</span> {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {research?.recommendations && research.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendations</h2>
              <ul className="space-y-3">
                {research.recommendations.map((rec, i) => (
                  <li key={i} className="text-gray-700 flex gap-3">
                    <span className="text-indigo-600">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {research?.status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Research Generation Failed</h2>
          <p className="text-red-800 mb-4">{research?.error || 'An unexpected error occurred during research generation'}</p>
          <p className="text-sm text-red-700">Please try again with different search parameters or check the backend logs for more details.</p>
        </div>
      )}
    </div>
  );
}

export default function ResearchPage() {
  return (
    <ProtectedRoute>
      <ResearchContent />
    </ProtectedRoute>
  );
}
