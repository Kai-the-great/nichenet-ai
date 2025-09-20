// src/app/page.tsx

"use client";

import { useState } from 'react';

export default function HomePage() {
  const [features, setFeatures] = useState('');
  const [listing, setListing] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setListing('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        throw new Error(`An error occurred: ${response.statusText}`);
      }

      const data = await response.json();
      setListing(data.listing);

    } catch (err: Error) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          NicheNet AI 🏡
        </h1>
        <p className="text-center text-gray-500 mt-2">
          Real Estate Listing Generator
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex flex-col">
            <label htmlFor="features" className="font-medium text-gray-700">
              Enter property features (e.g., 3 bed, 2 bath, granite countertops, new roof):
            </label>
            <textarea
              id="features"
              rows={4}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="mt-2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 4 bedrooms, 3 bathrooms, ocean view, newly renovated kitchen, 2-car garage..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Listing'}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        
        {listing && (
          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800">Your AI-Generated Listing:</h2>
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{listing}</p>
          </div>
        )}
      </div>
    </main>
  );
}
