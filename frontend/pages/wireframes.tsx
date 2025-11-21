import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/hooks/useAuth';
import { ProtectedRoute } from '../lib/components/ProtectedRoute';
import { WireframeViewer } from '../lib/components/WireframeViewer';
import toast from 'react-hot-toast';

interface ResearchItem {
  id: string;
  status: string;
  request: {
    topic: string;
  };
  generatedAt?: string;
}

const WireframesPage: React.FC = () => {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [researchList, setResearchList] = useState<ResearchItem[]>([]);
  const [selectedResearchId, setSelectedResearchId] = useState<string>('');
  const [generatedWireframeId, setGeneratedWireframeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingWireframe, setGeneratingWireframe] = useState(false);
  const loadingToastIdRef = useRef<string | undefined>();
  const generatingRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchResearch();
    }
  }, [isAuthenticated, token]);

  const fetchResearch = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/research', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch research');
      }

      const data = await response.json();
      // Filter only completed research
      const completed = data.research.filter((r: ResearchItem) => r.status === 'completed');
      setResearchList(completed);

      if (completed.length > 0) {
        setSelectedResearchId(completed[0].id);
      }
    } catch (error) {
      toast.error('Failed to load research');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWireframe = async () => {
    if (!selectedResearchId) {
      toast.error('Please select research first');
      return;
    }

    // Prevent simultaneous requests using ref for better reliability
    if (generatingRef.current) {
      console.warn('Wireframe generation already in progress');
      return;
    }

    generatingRef.current = true;
    setGeneratingWireframe(true);

    try {
      // Dismiss any existing loading toasts first
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
      }

      // Show a single loading toast
      loadingToastIdRef.current = toast.loading('Generating wireframes from research...');

      const response = await fetch('/api/v1/wireframes/generate-from-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          researchId: selectedResearchId,
          projectId: 'default',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate wireframe');
      }

      const data = await response.json();
      setGeneratedWireframeId(data.id);

      // Dismiss loading toast and show success
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = undefined;
      }
      toast.success(`Wireframe generated with ${data.screenCount} screens!`);
    } catch (error) {
      // Dismiss loading toast and show error
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = undefined;
      }
      toast.error(error instanceof Error ? error.message : 'Failed to generate wireframe');
      console.error('Wireframe generation error:', error);
    } finally {
      generatingRef.current = false;
      setGeneratingWireframe(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Wireframes</h1>
          <p className="text-gray-600">Generate interactive wireframes from your market research</p>
        </div>

        {generatedWireframeId ? (
          // Wireframe Viewer
          <div>
            <button
              onClick={() => {
                setGeneratedWireframeId(null);
                fetchResearch();
              }}
              className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Generation
            </button>
            {/* @ts-ignore - generatedWireframeId is non-null due to outer condition */}
            <WireframeViewer wireframeId={generatedWireframeId!} token={token} />
          </div>
        ) : (
          // Generation Interface
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Research Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Select Research</h2>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading research...</p>
                  </div>
                ) : researchList.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700 text-sm">
                      No completed research found. Please generate research first.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                      {researchList.map((research) => (
                        <label
                          key={research.id}
                          className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                        >
                          <input
                            type="radio"
                            name="research"
                            value={research.id}
                            checked={selectedResearchId === research.id}
                            onChange={(e) => setSelectedResearchId(e.target.value)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {research.request.topic}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(research.generatedAt || '').toLocaleDateString()}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handleGenerateWireframe}
                      disabled={generatingWireframe || !selectedResearchId}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      {generatingWireframe ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          Generating...
                        </>
                      ) : (
                        'Generate Wireframe'
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-medium text-blue-900 mb-2">How it Works</h3>
                <ul className="text-blue-700 text-sm space-y-2">
                  <li>✓ Analyzes your research data</li>
                  <li>✓ Generates multi-screen layouts</li>
                  <li>✓ Creates interactive SVG wireframes</li>
                  <li>✓ Download for design tools</li>
                </ul>
              </div>
            </div>

            {/* Preview Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Wireframe Features</h2>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-gray-900">6 Auto-Generated Screens</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Hero page, market overview, SWOT analysis, competitive landscape, key insights,
                      and recommendations
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-medium text-gray-900">Layout Blocks</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Headers, hero sections, cards, grids, lists, charts, and call-to-action buttons
                      with precise positioning
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-medium text-gray-900">Interactive Navigation</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Navigate between screens with previous/next controls and detailed block information
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-medium text-gray-900">SVG Export</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Download wireframes as scalable SVG files compatible with design tools like Figma
                      and Sketch
                    </p>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-4">
                    <h3 className="font-medium text-gray-900">Data-Driven Design</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      All wireframe content is automatically populated from your research findings
                    </p>
                  </div>
                </div>
              </div>

              {/* Example Layout */}
              <div className="bg-gray-50 rounded-lg p-6 mt-6 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Generated Layout Example</h3>
                <div className="bg-white rounded border border-gray-300 p-4 space-y-3 text-sm">
                  <div className="h-12 bg-gray-800 rounded flex items-center text-white px-3">
                    Navigation Bar
                  </div>
                  <div className="h-32 bg-blue-400 rounded flex items-center justify-center text-white font-medium">
                    Hero Section with Research Topic
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 bg-gray-300 rounded flex items-center justify-center">
                      Block 1
                    </div>
                    <div className="h-24 bg-gray-300 rounded flex items-center justify-center">
                      Block 2
                    </div>
                  </div>
                  <div className="h-16 bg-green-400 rounded flex items-center justify-center text-white font-medium">
                    Call-to-Action
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default WireframesPage;
