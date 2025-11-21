import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/hooks/useAuth';
import { ProtectedRoute } from '../lib/components/ProtectedRoute';
import { featurePlanningApi, FeaturePlanResult, Feature, ScreenMapping } from '../lib/api/featurePlanningApi';
import { researchApi, ResearchResult } from '../lib/api/researchApi';
import { wireframesApi } from '../lib/api/wireframesApi';

function FeaturePlanningContent() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const { researchId } = router.query;

  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [featurePlan, setFeaturePlan] = useState<FeaturePlanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDescription, setNewFeatureDescription] = useState('');
  const [newFeatureCategory, setNewFeatureCategory] = useState<'core' | 'secondary' | 'nice-to-have'>('secondary');
  const [newFeaturePriority, setNewFeaturePriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Load research and feature plan data
  useEffect(() => {
    if (!researchId || !token) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load research data
        const researchData = await researchApi.getResearch(researchId as string, token);
        setResearch(researchData);

        // Try to load existing feature plan
        try {
          const plan = await featurePlanningApi.getFeaturePlanByResearchId(researchId as string, token);
          setFeaturePlan(plan);
        } catch (error) {
          // Feature plan doesn't exist yet, which is normal
          console.log('No existing feature plan found');
        }
      } catch (error) {
        toast.error('Failed to load research data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [researchId, token]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateFeaturePlan = async () => {
    if (!researchId || !token) {
      toast.error('Missing research ID or authentication');
      return;
    }

    setIsCreatingPlan(true);
    try {
      const plan = await featurePlanningApi.createFeaturePlan(
        researchId as string,
        undefined,
        token
      );
      setFeaturePlan(plan);
      toast.success('Feature plan created with AI suggestions!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create feature plan';
      toast.error(message);
      console.error(error);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleAddFeature = async () => {
    if (!featurePlan || !token) {
      toast.error('Missing feature plan or authentication');
      return;
    }

    if (!newFeatureName.trim() || !newFeatureDescription.trim()) {
      toast.error('Please enter both feature name and description');
      return;
    }

    try {
      const updated = await featurePlanningApi.addFeature(
        featurePlan.id,
        {
          name: newFeatureName,
          description: newFeatureDescription,
          category: newFeatureCategory,
          priority: newFeaturePriority,
        },
        token
      );
      setFeaturePlan(updated);
      setNewFeatureName('');
      setNewFeatureDescription('');
      setNewFeatureCategory('secondary');
      setNewFeaturePriority('medium');
      toast.success('Feature added!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add feature';
      toast.error(message);
      console.error(error);
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    if (!featurePlan || !token) {
      toast.error('Missing feature plan or authentication');
      return;
    }

    try {
      const updated = await featurePlanningApi.removeFeature(featurePlan.id, featureId, token);
      setFeaturePlan(updated);
      toast.success('Feature removed!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove feature';
      toast.error(message);
      console.error(error);
    }
  };

  const handleConfirmFeaturePlan = async () => {
    if (!featurePlan || !token) {
      toast.error('Missing feature plan or authentication');
      return;
    }

    setIsCreatingPlan(true);
    try {
      const confirmed = await featurePlanningApi.confirmFeaturePlan(featurePlan.id, token);
      setFeaturePlan(confirmed);
      toast.success('Feature plan confirmed! Ready to generate wireframes.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm feature plan';
      toast.error(message);
      console.error(error);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleGenerateWireframes = async () => {
    if (!featurePlan || !token) {
      toast.error('Missing feature plan or authentication');
      return;
    }

    setIsCreatingPlan(true);
    try {
      const wireframe = await wireframesApi.generateFromResearch(
        {
          researchId: featurePlan.researchId,
          useAI: true,
          refinementMode: 'quality',
        },
        token
      );

      // Lock the feature plan
      await featurePlanningApi.lockFeaturePlan(featurePlan.id, wireframe.id, token);

      toast.success(`Wireframes generated! Created ${wireframe.screenCount} screens`);
      router.push(`/wireframes/${wireframe.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate wireframes';
      toast.error(message);
      console.error(error);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  return (
    <>
      <Head>
        <title>Feature Planning - Formative.AI</title>
        <meta name="description" content="Plan features for your product" />
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
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading feature planning data...</p>
            </div>
          ) : !research ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Research data not found</p>
            </div>
          ) : !featurePlan ? (
            // Feature Plan Creation Step
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Plan Features</h1>
                <p className="text-gray-600">Analyze your research and plan the features for your product</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Research Topic</h3>
                  <p className="text-blue-800">{research.request?.topic}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Step</h3>
                  <p className="text-gray-600 mb-4">
                    Let AI analyze your research and suggest features, product type, and screen mappings for your product.
                  </p>
                  <button
                    onClick={handleCreateFeaturePlan}
                    disabled={isCreatingPlan}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isCreatingPlan ? 'Creating Feature Plan...' : 'Generate Feature Plan with AI'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Feature Plan Review and Customization
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">📋 Feature Plan</h1>
                  <p className="text-gray-600 mt-2">{research.request?.topic}</p>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-lg font-semibold ${
                    featurePlan.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {featurePlan.status === 'confirmed' ? '✓ Confirmed' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Type & Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Type</h3>
                  <p className="text-2xl font-bold text-indigo-600 mb-4">{featurePlan.productType}</p>
                  <p className="text-gray-600 text-sm">{featurePlan.reasoning}</p>
                </div>

                {/* Screen Count */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Screens</h3>
                  <p className="text-2xl font-bold text-indigo-600 mb-2">{featurePlan.screenCount} screens</p>
                  <p className="text-gray-600 text-sm">Organized across {featurePlan.screenMappings.length} key screens</p>
                </div>
              </div>

              {/* Features List */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features ({featurePlan.features.length})</h3>

                <div className="space-y-3 mb-6">
                  {featurePlan.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            feature.category === 'core'
                              ? 'bg-red-100 text-red-700'
                              : feature.category === 'secondary'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {feature.category}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            feature.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : feature.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {feature.priority}
                          </span>
                        </div>
                      </div>
                      {featurePlan.status !== 'locked' && (
                        <button
                          onClick={() => handleRemoveFeature(feature.id)}
                          className="text-red-600 hover:text-red-700 ml-4"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Feature */}
                {featurePlan.status !== 'locked' && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Add Custom Feature</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Feature name"
                        value={newFeatureName}
                        onChange={(e) => setNewFeatureName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <textarea
                        placeholder="Feature description"
                        value={newFeatureDescription}
                        onChange={(e) => setNewFeatureDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={newFeatureCategory}
                          onChange={(e) => setNewFeatureCategory(e.target.value as any)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="core">Core</option>
                          <option value="secondary">Secondary</option>
                          <option value="nice-to-have">Nice to Have</option>
                        </select>
                        <select
                          value={newFeaturePriority}
                          onChange={(e) => setNewFeaturePriority(e.target.value as any)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <button
                        onClick={handleAddFeature}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        Add Feature
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Screen Mappings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Screen Mappings</h3>
                <div className="space-y-3">
                  {featurePlan.screenMappings.map((screen) => (
                    <div key={screen.screenNumber} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">
                        Screen {screen.screenNumber}: {screen.screenTitle}
                      </h4>
                      {screen.description && (
                        <p className="text-sm text-gray-600 mt-1">{screen.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {screen.features.map((featureId) => {
                          const feature = featurePlan.features.find((f) => f.id === featureId);
                          return feature ? (
                            <span
                              key={featureId}
                              className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                            >
                              {feature.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {featurePlan.status !== 'locked' && (
                  <>
                    <button
                      onClick={handleConfirmFeaturePlan}
                      disabled={isCreatingPlan}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isCreatingPlan ? 'Confirming...' : 'Confirm Feature Plan'}
                    </button>
                  </>
                )}
                {featurePlan.status === 'confirmed' && (
                  <button
                    onClick={handleGenerateWireframes}
                    disabled={isCreatingPlan}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isCreatingPlan ? 'Generating Wireframes...' : '✨ Generate Wireframes'}
                  </button>
                )}
                {featurePlan.status === 'locked' && (
                  <button
                    onClick={() => router.push(`/wireframes/${featurePlan.wireframeId}`)}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                  >
                    View Wireframes
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function FeaturePlanningPage() {
  return (
    <ProtectedRoute>
      <FeaturePlanningContent />
    </ProtectedRoute>
  );
}
