import React, { useState } from 'react';

export default function CourseWizard({ onCourseGenerated }) {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [numberOfModules, setNumberOfModules] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        const response = await fetch(`${API_URL}/api/generate-course`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, targetAudience, numberOfModules, userId: null }) // Pass userId if available
        });

      if (!response.ok) throw new Error('Failed to generate course outline.');

      const data = await response.json();
      onCourseGenerated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 border border-[#E8E2D9] shadow-sm rounded-sm">
      <h2 className="text-2xl font-serif font-bold text-[#2C2421] mb-2">Draft a New Curriculum</h2>
      <p className="text-sm font-sans text-[#7A6E65] mb-8">
        Specify your subject matter and audience level to generate a tailored outline.
      </p>

      {error && <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] rounded text-sm font-sans">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#524842] mb-2">
            Course Subject / Topic
          </label>
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Introduction to Neural Networks"
            className="w-full px-4 py-3 border border-[#D6CFC7] rounded-sm focus:outline-none focus:border-[#7C2D2B] bg-[#FDFBF7]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#524842] mb-2">
            Target Audience Level
          </label>
          <input
            type="text"
            required
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Undergraduate Computer Science Students"
            className="w-full px-4 py-3 border border-[#D6CFC7] rounded-sm focus:outline-none focus:border-[#7C2D2B] bg-[#FDFBF7]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#524842] mb-2">
            Number of Modules
          </label>
          <input
            type="number"
            min="2"
            max="6"
            value={numberOfModules}
            onChange={(e) => setNumberOfModules(Number(e.target.value))}
            className="w-full px-4 py-3 border border-[#D6CFC7] rounded-sm focus:outline-none focus:border-[#7C2D2B] bg-[#FDFBF7]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#7C2D2B] hover:bg-[#632220] text-[#FFFDF9] font-medium text-sm tracking-wide rounded-sm transition-colors flex items-center justify-center"
        >
          {loading ? 'Drafting Curriculum with AI...' : 'Generate Course Outline'}
        </button>
      </form>
    </div>
  );
}