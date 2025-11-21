import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Formative.AI - AI Product Lifecycle Intelligence</title>
        <meta name="description" content="AI-powered platform for automating product development" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Formative.AI</h1>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Sign Up
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-5xl font-bold text-center mb-6 text-gray-900">
            Automate Your Product Development
          </h2>
          <p className="text-xl text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            From research to PRD in minutes. Powered by AI agents that understand your product.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: 'Research', description: 'Market analysis in <3 minutes' },
              { title: 'Wireframes', description: 'Auto-generated designs in <90 seconds' },
              { title: 'Prototype', description: 'Interactive mockups for validation' },
              { title: 'PRD', description: 'Complete documents in <5 minutes' },
            ].map((module) => (
              <div key={module.title} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600">{module.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="bg-white mt-20 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Why Formative.AI?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: '80% Faster',
                  description: 'Complete product lifecycle 80% faster than manual processes',
                },
                {
                  title: 'AI-Powered',
                  description: 'Multi-agent AI orchestration for intelligent decision making',
                },
                {
                  title: 'Enterprise Ready',
                  description: 'Security, compliance, and audit trails built in',
                },
              ].map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
