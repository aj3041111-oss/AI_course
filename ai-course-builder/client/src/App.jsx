import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import CourseWizard from './components/CourseWizard';
import CourseEditor from './components/CourseEditor';
import CourseReader from './components/CourseReader';
import AuthModal from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard' | 'wizard' | 'editor' | 'reader'
  const [activeCourse, setActiveCourse] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  // Handle Supabase Auth Session Management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView('dashboard'); // Automatically take user to dashboard if logged in
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('landing');
  };

  const handleSelectModule = async (mod, courseData) => {
    setLessonLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/generate-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleTitle: mod.title,
          learningObjective: mod.learning_objective || mod.learningObjective,
          targetAudience: courseData?.target_audience || 'Beginners'
        })
      });
      if (!response.ok) throw new Error('Failed to load lesson content.');
      const data = await response.json();
      setActiveLesson(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLessonLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2421] font-serif antialiased selection:bg-[#7C2D2B] selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setView(user ? 'dashboard' : 'landing')}
          >
            <span className="text-2xl font-bold tracking-tight text-[#2C2421] group-hover:text-[#7C2D2B] transition-colors">
              Syllabus
            </span>
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-[#7A6E65] border-l border-[#D6CFC7] pl-3 font-sans font-medium">
              AI Course Builder
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4 font-sans text-sm">
                <span className="text-xs text-[#7A6E65] hidden md:inline">{user.email}</span>
                <button
                  onClick={() => setView('dashboard')}
                  className="text-xs font-medium text-[#2C2421] hover:text-[#7C2D2B]"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  className="border border-[#C8C0B5] hover:bg-[#F3EFEA] text-[#2C2421] px-4 py-2 rounded-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 font-sans">
                {view === 'landing' && (
                  <button
                    onClick={() => setView('wizard')}
                    className="bg-[#7C2D2B] hover:bg-[#632220] text-[#FFFDF9] px-5 py-2.5 rounded-sm text-sm font-medium shadow-sm transition-all"
                  >
                    Build a Course
                  </button>
                )}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="border border-[#C8C0B5] hover:border-[#2C2421] hover:bg-[#F3EFEA] text-[#2C2421] px-4 py-2.5 rounded-sm text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* View 1: Editorial Landing Page */}
        {view === 'landing' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#F3EFEA] border border-[#E2DBD1] rounded-sm mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C2D2B]"></span>
                  <span className="text-[11px] tracking-widest uppercase text-[#7A6E65] font-sans font-medium">
                    Vol. I · Intelligent Curriculum Design
                  </span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] mb-6">
                  From a single topic to a <span className="italic text-[#7C2D2B]">complete course.</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-[#524842] leading-relaxed mb-10 max-w-xl font-sans font-light">
                  Syllabus drafts your curriculum, objectives, lessons, and quizzes in minutes — then gives you full editorial control to refine every page.
                </p>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 font-sans">
                  <button
                    onClick={() => setView('wizard')}
                    className="bg-[#7C2D2B] hover:bg-[#632220] text-[#FFFDF9] px-8 py-4 rounded-sm text-base font-medium shadow-sm transition-all text-center"
                  >
                    Build your first course
                  </button>
                  <button 
                    onClick={() => setView('wizard')}
                    className="border border-[#C8C0B5] hover:bg-[#F3EFEA] text-[#2C2421] px-8 py-4 rounded-sm text-base font-medium transition-colors text-center"
                  >
                    Explore demo
                  </button>
                </div>
              </div>

              {/* Visual Plate Card */}
              <div className="lg:col-span-5">
                <div className="relative border border-[#E2DBD1] bg-white p-3 shadow-lg rounded-sm">
                  <img
                    src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80"
                    alt="The Scholar's Desk"
                    className="w-full h-[400px] object-cover rounded-sm filter brightness-95 contrast-105"
                  />
                </div>
                <p className="text-xs tracking-widest uppercase text-[#7A6E65] font-sans text-center mt-4">
                  PLATE 1. THE SCHOLAR'S DESK
                </p>
              </div>
            </div>

            {/* Feature Grid Section */}
            <div className="pt-20 border-t border-[#E8E2D9] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 bg-white/50 border border-[#EFECE6] rounded-sm">
                <span className="text-2xl font-serif text-[#C59B27] block mb-3 font-bold">I.</span>
                <h3 className="text-xl font-semibold mb-2">Curriculum</h3>
                <p className="text-sm text-[#524842] leading-relaxed font-sans">
                  A logically sequenced set of modules and lessons, shaped precisely to your audience and level.
                </p>
              </div>

              <div className="p-6 bg-white/50 border border-[#EFECE6] rounded-sm">
                <span className="text-2xl font-serif text-[#C59B27] block mb-3 font-bold">II.</span>
                <h3 className="text-xl font-semibold mb-2">Objectives</h3>
                <p className="text-sm text-[#524842] leading-relaxed font-sans">
                  Measurable learning outcomes for every module, formulated with clear academic action verbs.
                </p>
              </div>

              <div className="p-6 bg-white/50 border border-[#EFECE6] rounded-sm">
                <span className="text-2xl font-serif text-[#C59B27] block mb-3 font-bold">III.</span>
                <h3 className="text-xl font-semibold mb-2">Lessons</h3>
                <p className="text-sm text-[#524842] leading-relaxed font-sans">
                  Full written lesson text complete with contextual examples and key takeaways — ready to teach.
                </p>
              </div>

              <div className="p-6 bg-white/50 border border-[#EFECE6] rounded-sm">
                <span className="text-2xl font-serif text-[#C59B27] block mb-3 font-bold">IV.</span>
                <h3 className="text-xl font-semibold mb-2">Assessment</h3>
                <p className="text-sm text-[#524842] leading-relaxed font-sans">
                  Rigorous multiple-choice quizzes with correct answers and explanations for each module.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Dashboard View */}
        {view === 'dashboard' && (
          <Dashboard
            user={user}
            onCreateNew={() => setView('wizard')}
            onSelectCourse={(course) => {
              setActiveCourse(course);
              setView('editor');
            }}
          />
        )}

        {/* View 3: Course Wizard Setup Form */}
        {view === 'wizard' && (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setView(user ? 'dashboard' : 'landing')}
              className="text-xs font-sans uppercase tracking-widest text-[#7A6E65] hover:text-[#2C2421] mb-6 block font-medium"
            >
              ← Back
            </button>
            <CourseWizard
              user={user}
              onCourseGenerated={(data) => {
                setActiveCourse(data);
                setView('editor');
              }}
            />
          </div>
        )}

        {/* View 4: Course Editor */}
        {view === 'editor' && activeCourse && (
          <div className="max-w-4xl mx-auto">
            <CourseEditor
              courseData={activeCourse}
              onBack={() => setView('dashboard')}
              onPublish={(slug) => {
                setActiveCourse({ ...activeCourse, slug, is_published: true });
              }}
            />
          </div>
        )}

        {/* View 5: Course Reader */}
        {view === 'reader' && activeCourse && (
          <CourseReader
            slug={activeCourse.slug}
            onBack={() => setView('dashboard')}
          />
        )}
      </main>

      {/* Auth Modal Popup */}
      {showAuthModal && (
        <AuthModal
          onAuthSuccess={(loggedUser) => {
            setUser(loggedUser);
            setShowAuthModal(false);
            setView('dashboard');
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] py-10 text-center text-xs tracking-widest uppercase text-[#7A6E65] font-sans">
        SYLLABUS · AI COURSE BUILDER
      </footer>
    </div>
  );
}