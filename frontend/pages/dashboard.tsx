import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/hooks/useAuth';
import { useProjects } from '../lib/hooks/useProjects';
import { ProtectedRoute } from '../lib/components/ProtectedRoute';

function DashboardContent() {
  const router = useRouter();
  const { user, logout, token } = useAuth();
  const { projects, loading, error, deleteProject } = useProjects(token);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(projectId);
    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Formative.AI</title>
        <meta name="description" content="Your product development dashboard" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Formative.AI
            </Link>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Link href="/settings" className="text-gray-700 hover:text-indigo-600">
                Settings
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-indigo-600">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-8 flex gap-4">
            <Link
              href="/research"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold transition"
            >
              + New Research
            </Link>
            <Link
              href="/projects/new"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold transition"
            >
              + New Project
            </Link>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                {project.description && (
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                )}
                <p className="text-xs text-gray-500 mb-4">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex-1 text-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2 rounded font-semibold transition"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold transition disabled:opacity-50"
                  >
                    {deletingId === project.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to get started</p>
              <Link
                href="/projects/new"
                className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
              >
                Create Project
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
