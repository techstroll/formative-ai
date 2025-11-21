import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/hooks/useAuth';
import { ProtectedRoute } from '../../lib/components/ProtectedRoute';
import { WireframeViewer } from '../../lib/components/WireframeViewer';
import { projectsApi } from '../../lib/api/projectsApi';
import { researchApi, ResearchResult } from '../../lib/api/researchApi';
import { wireframesApi, Wireframe } from '../../lib/api/wireframesApi';

interface ProjectDetail {
  id: string;
  title: string;
  description?: string;
  category?: string;
  targetMarket?: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

function ProjectContent() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token, logout } = useAuth();

  // State
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [research, setResearch] = useState<ResearchResult[]>([]);
  const [wireframes, setWireframes] = useState<Wireframe[]>([]);
  const [selectedWireframe, setSelectedWireframe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingResearch, setIsGeneratingResearch] = useState(false);
  const [showResearchForm, setShowResearchForm] = useState(false);
  const [currentResearchId, setCurrentResearchId] = useState<string | null>(null);
  const [currentResearchData, setCurrentResearchData] = useState<ResearchResult | null>(null);
  const [researchFormData, setResearchFormData] = useState({
    topic: '',
    targetAudience: '',
    competitors: '',
    geographicFocus: '',
  });

  // Load project and related data
  useEffect(() => {
    if (!id || !token) return;

    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load project
        const proj = (await projectsApi.getProject(id as string, token)) as ProjectDetail;
        setProject(proj);

        // Load wireframes for this project
        const wireframeList = await wireframesApi.listByProject(id as string, token);
        setWireframes(wireframeList);

        // Load all research and filter for this project
        const allResearch = await researchApi.getAllResearch(token);
        setResearch(allResearch.research || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, token]);

  // Polling effect for current research
  useEffect(() => {
    if (!currentResearchId || !token) return;

    const pollResearch = async () => {
      try {
        const result = await researchApi.getResearch(currentResearchId, token);
        if (result) {
          setCurrentResearchData(result);

          // Stop polling when complete or error
          if (result.status === 'completed' || result.status === 'error') {
            setIsGeneratingResearch(false);

            // Update the research list
            const allResearch = await researchApi.getAllResearch(token);
            setResearch(allResearch.research || []);

            toast.success('Research complete!');
          }
        }
      } catch (err) {
        console.error('Error polling research:', err);
      }
    };

    // Poll immediately and then every 3 seconds
    pollResearch();
    const interval = setInterval(pollResearch, 3000);

    return () => clearInterval(interval);
  }, [currentResearchId, token]);

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!researchFormData.topic.trim()) {
      toast.error('Please enter a research topic');
      return;
    }

    if (!token || !id) return;

    setIsGeneratingResearch(true);
    try {
      const competitorList = researchFormData.competitors
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const response = await researchApi.createResearch(
        {
          topic: researchFormData.topic,
          targetAudience: researchFormData.targetAudience || 'General audience',
          competitors: competitorList,
          geographicFocus: researchFormData.geographicFocus || 'Global',
          projectId: id as string,
        },
        token
      );

      toast.success('Research generation started. Watch below for results...');

      // Set current research ID to start polling
      setCurrentResearchId(response.id);
      setCurrentResearchData({
        ...response,
        status: 'generating',
        request: {
          topic: researchFormData.topic,
          targetAudience: researchFormData.targetAudience || 'General audience',
          competitors: competitorList,
          geographicFocus: researchFormData.geographicFocus || 'Global',
          projectId: id as string,
        },
      } as ResearchResult);

      // Close form and clear form data
      setShowResearchForm(false);
      setResearchFormData({
        topic: '',
        targetAudience: '',
        competitors: '',
        geographicFocus: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start research');
      setIsGeneratingResearch(false);
    }
  };

  const handleGenerateWireframes = async (researchId: string) => {
    if (!token || !id) return;

    try {
      toast.loading('Generating wireframes...');
      const newWireframe = await wireframesApi.generateFromResearch(
        {
          researchId,
          projectId: id as string,
          title: `Wireframes for ${project?.title}`,
        },
        token
      );

      setWireframes([...wireframes, newWireframe]);
      setSelectedWireframe(newWireframe.id);
      toast.success('Wireframes generated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate wireframes');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-semibold mb-2">Error Loading Project</p>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project.title} - Formative.AI</title>
        <meta name="description" content={project.description} />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Formative.AI
            </Link>
            <div className="flex gap-4 items-center">
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

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Project Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
                {project.description && (
                  <p className="text-gray-600 mt-2">{project.description}</p>
                )}
                <div className="flex gap-4 mt-4 text-sm text-gray-600">
                  {project.category && <span>Category: {project.category}</span>}
                  {project.targetMarket && <span>Target: {project.targetMarket}</span>}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Research & Wireframes */}
            <div className="lg:col-span-2 space-y-8">
              {/* Selected Wireframe Viewer */}
              {selectedWireframe !== null && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Wireframe Viewer</h2>
                    <button
                      onClick={() => setSelectedWireframe(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  {/* @ts-ignore - selectedWireframe is non-null due to outer condition */}
                  <WireframeViewer wireframeId={selectedWireframe!} token={token} />
                </div>
              )}

              {/* Research Section */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Market Research</h2>
                  {!showResearchForm && (
                    <button
                      onClick={() => setShowResearchForm(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                    >
                      + Start Research
                    </button>
                  )}
                </div>

                {/* Research Form */}
                {showResearchForm && (
                  <form onSubmit={handleStartResearch} className="space-y-4 mb-6 pb-6 border-b">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Research Topic *
                      </label>
                      <input
                        type="text"
                        value={researchFormData.topic}
                        onChange={(e) =>
                          setResearchFormData({ ...researchFormData, topic: e.target.value })
                        }
                        placeholder="e.g., AI-powered customer support"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Audience
                        </label>
                        <input
                          type="text"
                          value={researchFormData.targetAudience}
                          onChange={(e) =>
                            setResearchFormData({
                              ...researchFormData,
                              targetAudience: e.target.value,
                            })
                          }
                          placeholder="e.g., Enterprises"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Geographic Focus
                        </label>
                        <input
                          type="text"
                          value={researchFormData.geographicFocus}
                          onChange={(e) =>
                            setResearchFormData({
                              ...researchFormData,
                              geographicFocus: e.target.value,
                            })
                          }
                          placeholder="e.g., North America"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Competitors (comma-separated)
                      </label>
                      <textarea
                        value={researchFormData.competitors}
                        onChange={(e) =>
                          setResearchFormData({ ...researchFormData, competitors: e.target.value })
                        }
                        placeholder="e.g., Competitor A, Competitor B"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isGeneratingResearch}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                      >
                        {isGeneratingResearch ? 'Starting...' : 'Start Research'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResearchForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Current Research Generating */}
                {currentResearchData && currentResearchData.status === 'generating' && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Generating Research</h3>
                          <p className="text-sm text-gray-600 mt-1">Topic: {currentResearchData.request?.topic}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        In Progress
                      </span>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-3 text-sm text-gray-700">
                      <p className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                        Analyzing market data, generating SWOT analysis, and gathering competitor insights...
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Research Completed */}
                {currentResearchData && currentResearchData.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-green-900">✓ Research Complete</h3>
                        <p className="text-sm text-green-700 mt-1">Topic: {currentResearchData.request?.topic}</p>
                      </div>
                      <button
                        onClick={() => setCurrentResearchId(null)}
                        className="text-green-600 hover:text-green-800 text-2xl"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Research Results */}
                    <div className="space-y-6 mt-6">
                      {currentResearchData.executiveSummary ? (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{currentResearchData.executiveSummary}</p>
                        </div>
                      ) : null}

                      {currentResearchData.marketAnalysis && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Market Analysis</h4>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{currentResearchData.marketAnalysis}</p>
                        </div>
                      )}

                      {currentResearchData.swot && (
                        <div className="grid grid-cols-2 gap-4">
                          {currentResearchData.swot.strengths && currentResearchData.swot.strengths.length > 0 && (
                            <div className="bg-white rounded p-3">
                              <h5 className="font-semibold text-green-700 mb-2">Strengths</h5>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {currentResearchData.swot.strengths.map((item, i) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {currentResearchData.swot.weaknesses && currentResearchData.swot.weaknesses.length > 0 && (
                            <div className="bg-white rounded p-3">
                              <h5 className="font-semibold text-red-700 mb-2">Weaknesses</h5>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {currentResearchData.swot.weaknesses.map((item, i) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {currentResearchData.swot.opportunities && currentResearchData.swot.opportunities.length > 0 && (
                            <div className="bg-white rounded p-3">
                              <h5 className="font-semibold text-blue-700 mb-2">Opportunities</h5>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {currentResearchData.swot.opportunities.map((item, i) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {currentResearchData.swot.threats && currentResearchData.swot.threats.length > 0 && (
                            <div className="bg-white rounded p-3">
                              <h5 className="font-semibold text-yellow-700 mb-2">Threats</h5>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {currentResearchData.swot.threats.map((item, i) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {currentResearchData.keyInsights && currentResearchData.keyInsights.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Insights</h4>
                          <ul className="text-sm text-gray-700 space-y-2">
                            {currentResearchData.keyInsights.map((insight, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-indigo-600 font-bold">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentResearchData.recommendations && currentResearchData.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                          <ul className="text-sm text-gray-700 space-y-2">
                            {currentResearchData.recommendations.map((rec, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-indigo-600 font-bold">→</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentResearchId(null)}
                      className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                    >
                      Done
                    </button>
                  </div>
                )}

                {/* Current Research Error */}
                {currentResearchData && currentResearchData.status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-red-900">✗ Research Failed</h3>
                        <p className="text-sm text-red-700 mt-1">{currentResearchData.error || 'Unknown error occurred'}</p>
                      </div>
                      <button
                        onClick={() => setCurrentResearchId(null)}
                        className="text-red-600 hover:text-red-800 text-2xl"
                      >
                        ✕
                      </button>
                    </div>
                    <button
                      onClick={() => setCurrentResearchId(null)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Research List */}
                {research.length > 0 ? (
                  <div className="space-y-3">
                    {research.map((r) => (
                      <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{r.keyInsights && r.keyInsights.length > 0 ? r.keyInsights[0] : 'Research Session'}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              r.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : r.status === 'generating'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{r.executiveSummary?.substring(0, 100)}...</p>
                        {r.status === 'completed' && (
                          <button
                            onClick={() => handleGenerateWireframes(r.id)}
                            className="text-sm px-3 py-1 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded transition"
                          >
                            Generate Wireframes
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No research yet. Start by creating a research report for this project.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Wireframes List */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Generated Wireframes</h2>
                {wireframes.length > 0 ? (
                  <div className="space-y-3">
                    {wireframes.map((wf) => (
                      <button
                        key={wf.id}
                        onClick={() => setSelectedWireframe(wf.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          selectedWireframe === wf.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900 truncate">{wf.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{wf.screenCount} screens</p>
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-2 ${
                            wf.status === 'generated'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {wf.status}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8 text-sm">
                    No wireframes yet. Generate from research.
                  </p>
                )}
              </div>

              {/* Project Info Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Project Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {project.category && (
                    <div>
                      <p className="text-gray-600">Category</p>
                      <p className="text-gray-900 font-semibold">{project.category}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ProjectPage() {
  return (
    <ProtectedRoute>
      <ProjectContent />
    </ProtectedRoute>
  );
}
