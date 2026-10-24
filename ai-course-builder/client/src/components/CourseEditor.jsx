import React, { useState } from 'react';

export default function CourseEditor({ courseData, onSave, onBack }) {
  const [title, setTitle] = useState(courseData.courseTitle);
  const [description, setDescription] = useState(courseData.description);
  const [modules, setModules] = useState(courseData.modules || []);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [saving, setSaving] = useState(false);

    // Add this inside your CourseEditor component:
   // Add this inside your CourseEditor component:
  const [publishing, setPublishing] = useState(false);
  const [publicSlug, setPublicSlug] = useState(courseData.slug || null);

  const handlePublish = async () => {
    setPublishing(true);
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        const response = await fetch(`${API_URL}/api/generate-course`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: courseData.id || courseData.courseId })
       });

        if (!response.ok) throw new Error('Failed to publish course.');
 
        const data = await response.json();
        setPublicSlug(data.slug);
        alert(`Course successfully published! Public link: /course/${data.slug}`);
    
        // Optionally trigger a parent view change to open the reader
        if (onPublish) onPublish(data.slug);
      } catch (err) {
        alert(`Publishing failed: ${err.message}`);
      } finally {
        setPublishing(false);
      }
    };
  // Handle module title/objective updates inline
  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  // Add a new empty module manually
  const handleAddModule = () => {
    const newMod = {
      module_number: modules.length + 1,
      title: 'New Module Title',
      learning_objective: 'Enter module learning objective here...'
    };
    setModules([...modules, newMod]);
  };

  // Remove a module
  const handleRemoveModule = (index) => {
    const updated = modules
      .filter((_, i) => i !== index)
      .map((mod, i) => ({ ...mod, module_number: i + 1 }));
    setModules(updated);
  };

  // Trigger targeted regeneration for a single module using AI
  const handleRegenerateModule = async (index) => {
    setRegeneratingIndex(index);
    try {
      const targetMod = modules[index];
      const response = await fetch('http://localhost:5000/api/regenerate-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleTitle: targetMod.title,
          targetAudience: courseData.target_audience || 'General Learners'
        })
      });

      if (!response.ok) throw new Error('Failed to regenerate module.');

      const data = await response.json();
      const updated = [...modules];
      updated[index] = {
        ...updated[index],
        title: data.title,
        learning_objective: data.learningObjective
      };
      setModules(updated);
    } catch (err) {
      alert(`Regeneration failed: ${err.message}`);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  // Save changes back to database
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave({
          ...courseData,
          courseTitle: title,
          description,
          modules
        });
      }
      alert('Course changes saved successfully!');
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-[#E8E2D9] p-8 rounded-sm shadow-sm font-sans">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9] mb-8">
        <div>
          <button
            onClick={onBack}
            className="text-xs uppercase tracking-widest text-[#7A6E65] hover:text-[#2C2421] mb-2 block font-medium"
          >
            ← Back to Course View
          </button>
          <h2 className="text-2xl font-serif font-bold text-[#2C2421]">Course Editor</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-[#7C2D2B] hover:bg-[#632220] text-[#FFFDF9] px-6 py-2.5 rounded-sm text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
              </div>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="border border-[#7C2D2B] bg-[#7C2D2B] hover:bg-[#632220] text-[#FFFDF9] px-5 py-2.5 rounded-sm text-sm font-medium transition-colors"
          >
            {publishing ? 'Publishing...' : 'Publish Course 🚀'}
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="border border-[#C8C0B5] hover:bg-[#F3EFEA] text-[#2C2421] px-6 py-2.5 rounded-sm text-sm font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>       
        </div>

      {/* Main Metadata Form */}
      <div className="space-y-6 mb-10">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#524842] mb-2">
            Course Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-[#D6CFC7] rounded-sm focus:outline-none focus:border-[#7C2D2B] bg-[#FDFBF7] font-serif text-xl font-semibold text-[#2C2421]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#524842] mb-2">
            Course Description
          </label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-[#D6CFC7] rounded-sm focus:outline-none focus:border-[#7C2D2B] bg-[#FDFBF7] text-sm text-[#524842] leading-relaxed"
          ></textarea>
        </div>
      </div>

      {/* Modules List Editor */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-serif font-bold text-[#2C2421]">Curriculum Modules</h3>
          <button
            onClick={handleAddModule}
            className="border border-[#C8C0B5] hover:bg-[#F3EFEA] text-[#2C2421] px-4 py-1.5 rounded-sm text-xs uppercase tracking-wider font-medium transition-colors"
          >
            + Add Module
          </button>
        </div>

        <div className="space-y-6">
          {modules.map((mod, idx) => (
            <div key={idx} className="border border-[#E8E2D9] bg-[#FDFBF7] p-6 rounded-sm relative group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-serif font-bold text-[#C59B27]">
                  Module {mod.module_number || idx + 1}
                </span>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleRegenerateModule(idx)}
                    disabled={regeneratingIndex === idx}
                    className="text-xs text-[#7C2D2B] hover:underline font-medium disabled:opacity-50"
                  >
                    {regeneratingIndex === idx ? 'Regenerating...' : '✨ Regenerate Section'}
                  </button>
                  <button
                    onClick={() => handleRemoveModule(idx)}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#7A6E65] mb-1 font-semibold">
                    Module Title
                  </label>
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => handleModuleChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-[#D6CFC7] rounded-sm bg-white text-sm font-semibold text-[#2C2421] focus:outline-none focus:border-[#7C2D2B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#7A6E65] mb-1 font-semibold">
                    Learning Objective
                  </label>
                  <textarea
                    rows="2"
                    value={mod.learning_objective || mod.learningObjective || ''}
                    onChange={(e) =>
                      handleModuleChange(
                        idx,
                        mod.learning_objective !== undefined ? 'learning_objective' : 'learningObjective',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-[#D6CFC7] rounded-sm bg-white text-sm text-[#524842] focus:outline-none focus:border-[#7C2D2B]"
                  ></textarea>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Route for single-section module regeneration
app.post('/api/regenerate-module', async (req, res) => {
  try {
    const { moduleTitle, targetAudience } = req.body;
    
    const prompt = `Refine and improve the module titled "${moduleTitle}" for a target audience level of "${targetAudience}". 
    Provide an enhanced, clear module title and a refined learning objective starting with an action verb.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            learningObjective: { type: Type.STRING }
          },
          required: ['title', 'learningObjective']
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to publish a course and generate a public slug
app.post('/api/publish-course', async (req, res) => {
  try {
    const { courseId } = req.body;

    const { data: course, error } = await supabase
      .from('courses')
      .update({ is_published: true })
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      publicUrl: `/course/${course.slug}`,
      slug: course.slug
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch a published course by its slug for the learner view
app.get('/api/public/course/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Fetch course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Published course not found.' });
    }

    // Fetch modules for this course
    const { data: modules, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('module_number', { ascending: true });

    if (moduleError) throw moduleError;

    res.json({ course, modules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

