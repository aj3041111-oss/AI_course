import React, { useState, useEffect } from 'react';

export default function CourseReader({ slug, onBack }) {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function fetchPublicCourse() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/public/course/${slug}`);
        if (!response.ok) throw new Error('Course not found or unpublished.');
        const data = await response.json();
        setCourse(data.course);
        setModules(data.modules);
        if (data.modules.length > 0) {
          handleSelectModule(data.modules[0]);
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicCourse();
  }, [slug]);

  const handleSelectModule = async (mod) => {
    setSelectedModule(mod);
    setLessonLoading(true);
    setSelectedAnswers({});
    setShowResults(false);

    try {
      const response = await fetch('http://localhost:5000/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleTitle: mod.title,
          learningObjective: mod.learning_objective || mod.learningObjective,
          targetAudience: course?.target_audience || 'General Learners'
        })
      });
      if (!response.ok) throw new Error('Failed to load lesson content.');
      const data = await response.json();
      setLessonData(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleOptionSelect = (qIdx, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: option });
  };

  if (loading) {
    return <div className="text-center py-20 font-sans text-[#7A6E65]">Loading published course...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 font-sans text-red-600">Course not found or unavailable.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans">
      <button
        onClick={onBack}
        className="text-xs uppercase tracking-widest text-[#7A6E65] hover:text-[#2C2421] mb-8 block font-medium"
      >
        ← Back to Overview
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Module Navigation */}
        <div className="lg:col-span-4 border-r border-[#E8E2D9] pr-6">
          <span className="text-xs uppercase tracking-widest text-[#C59B27] font-semibold block mb-2">
            Curriculum
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#2C2421] mb-6">{course.title}</h1>

          <div className="space-y-2">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod)}
                className={`w-full text-left p-4 rounded-sm transition-colors border ${
                  selectedModule?.id === mod.id
                    ? 'bg-[#7C2D2B] text-white border-[#7C2D2B]'
                    : 'bg-white hover:bg-[#F3EFEA] border-[#E8E2D9] text-[#2C2421]'
                }`}
              >
                <div className="text-xs opacity-75 uppercase tracking-wider mb-1 font-semibold">
                  Module {mod.module_number}
                </div>
                <div className="text-sm font-medium">{mod.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Lesson Reader Content Area */}
        <div className="lg:col-span-8 bg-white border border-[#E8E2D9] p-8 rounded-sm shadow-sm">
          {lessonLoading ? (
            <div className="py-20 text-center text-[#7A6E65]">Generating & loading lesson content...</div>
          ) : lessonData ? (
            <div>
              <span className="text-xs uppercase tracking-widest text-[#7A6E65] font-semibold block mb-2">
                {selectedModule?.title}
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#2C2421] mb-6">{lessonData.lessonTitle}</h2>

              {/* Markdown Content Representation */}
              <div className="prose max-w-none text-[#524842] leading-relaxed font-serif mb-12 whitespace-pre-line border-b border-[#E8E2D9] pb-8">
                {lessonData.markdownContent}
              </div>

              {/* Interactive Assessment Quiz */}
              {lessonData.quiz && lessonData.quiz.length > 0 && (
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#2C2421] mb-6">Module Assessment</h3>
                  <div className="space-y-6">
                    {lessonData.quiz.map((q, qIdx) => (
                      <div key={qIdx} className="p-6 bg-[#FDFBF7] border border-[#E8E2D9] rounded-sm">
                        <p className="font-semibold text-[#2C2421] mb-4 text-sm">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[qIdx] === opt;
                            const isCorrect = showResults && opt === q.correctAnswer;
                            const isWrong = showResults && isSelected && opt !== q.correctAnswer;

                            let optionStyle = 'border-[#D6CFC7] bg-white text-[#524842]';
                            if (isSelected) optionStyle = 'border-[#7C2D2B] bg-[#FDF2F2] text-[#7C2D2B] font-medium';
                            if (isCorrect) optionStyle = 'border-green-600 bg-green-50 text-green-800 font-medium';
                            if (isWrong) optionStyle = 'border-red-600 bg-red-50 text-red-800 font-medium';

                            return (
                              <button
                                key={optIdx}
                                onClick={() => !showResults && handleOptionSelect(qIdx, opt)}
                                className={`w-full text-left px-4 py-3 border rounded-sm text-sm transition-colors ${optionStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    {!showResults ? (
                      <button
                        onClick={() => setShowResults(true)}
                        className="bg-[#7C2D2B] hover:bg-[#632220] text-white px-6 py-2.5 rounded-sm text-sm font-medium transition-colors"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowResults(false)}
                        className="border border-[#C8C0B5] hover:bg-[#F3EFEA] text-[#2C2421] px-6 py-2.5 rounded-sm text-sm font-medium transition-colors"
                      >
                        Reset Quiz
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-[#7A6E65]">Select a module from the left to begin reading.</div>
          )}
        </div>
      </div>
    </div>
  );
}