import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/hooks/useAuth';
import { ProtectedRoute } from '../../lib/components/ProtectedRoute';
import { wireframesApi, Wireframe } from '../../lib/api/wireframesApi';

function WireframeViewer() {
  const router = useRouter();
  const { id } = router.query;
  const { token, user, logout } = useAuth();

  const [wireframe, setWireframe] = useState<Wireframe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState(0);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  // Fetch wireframe details
  useEffect(() => {
    if (!id || !token) return;

    const fetchWireframe = async () => {
      try {
        setIsLoading(true);
        const data = await wireframesApi.getWireframe(id as string, token);
        setWireframe(data);

        // Try to fetch SVG content
        try {
          const svg = await wireframesApi.getSVG(id as string, token);
          setSvgContent(svg);
        } catch (svgError) {
          console.warn('Could not fetch SVG:', svgError);
        }

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load wireframe';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWireframe();
  }, [id, token]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Loading Wireframe - Formative.AI</title>
        </Head>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading wireframe...</p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (error || !wireframe) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Wireframe Not Found - Formative.AI</title>
        </Head>
        <main className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Formative.AI
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-indigo-600">
                Logout
              </button>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Wireframe Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'The wireframe you are looking for does not exist.'}</p>
              <Link href="/research" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
                Back to Research
              </Link>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{wireframe.title} - Formative.AI</title>
        <meta name="description" content={`Wireframe: ${wireframe.title}`} />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Formative.AI
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/research" className="text-gray-700 hover:text-indigo-600">
                Research
              </Link>
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={handleLogout} className="text-gray-700 hover:text-indigo-600">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/research" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
              ← Back to Research
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{wireframe.title}</h1>
            <div className="flex items-center gap-4">
              <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                {wireframe.screenCount} screens
              </span>
              <span className="text-gray-600">
                {wireframe.designType === 'responsive' && '📱 Responsive Design'}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(wireframe.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Screens</h3>
                <div className="space-y-2">
                  {Array.from({ length: wireframe.screenCount }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveScreen(index)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        activeScreen === index
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Screen {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* SVG Preview */}
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Wireframe Preview</h2>
                {svgContent ? (
                  <div
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-auto"
                    style={{ minHeight: '500px' }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center min-h-96 flex items-center justify-center">
                    <p className="text-gray-500">SVG preview not available</p>
                  </div>
                )}
              </div>

              {/* Suggested Components */}
              {wireframe.suggestedComponents && wireframe.suggestedComponents.length > 0 && (
                <div className="bg-white rounded-lg shadow p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">🎨 Suggested Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wireframe.suggestedComponents.map((component) => (
                      <div
                        key={component.id}
                        className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{component.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{component.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {component.tags.map((tag) => (
                            <span key={tag} className="inline-block px-2 py-1 bg-indigo-200 text-indigo-800 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          <strong>Usage:</strong> {component.usage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Suggestions */}
              {wireframe.designSuggestions && wireframe.designSuggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow p-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">💡 Design Suggestions</h3>
                  <div className="space-y-3">
                    {wireframe.designSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-600 font-semibold flex-shrink-0">✓</span>
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-lg shadow p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (wireframe.researchId) {
                        router.push(`/research?id=${wireframe.researchId}`);
                      }
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    View Research
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement Figma export
                      toast.success('Figma export coming soon!');
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Export to Figma
                  </button>
                  <button
                    onClick={() => {
                      if (svgContent) {
                        const element = document.createElement('a');
                        element.setAttribute(
                          'href',
                          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent)
                        );
                        element.setAttribute('download', `${wireframe.title}.svg`);
                        element.style.display = 'none';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        toast.success('SVG downloaded!');
                      }
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Download SVG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default WireframeViewer;
