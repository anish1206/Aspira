import React, { useState } from "react";

export default function MindscapeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a feeling or idea.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generateMindscape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: prompt }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate mindscape.');
      }

      setGeneratedImage(data.imageData);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Frontend generation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-900">Create Your Mindscape</h1>
      <p className="mt-2 text-gray-600">Enter a feeling or a simple idea, and let our AI create a personal oasis for you.</p>

      <div className="mt-6">
        <textarea
          className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="e.g., calm ocean at sunset, peaceful forest trail, warm cozy room"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      <div className="mt-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      <div className="mt-8">
        {loading && <div className="text-gray-600">Hold on, crafting your mindscape…</div>}
        {!loading && generatedImage && (
          <div className="image-container">
            <img
              src={`data:image/png;base64,${generatedImage}`}
              alt="Your generated mindscape"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}


