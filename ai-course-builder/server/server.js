import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateCourseOutline } from './services/gemini.js';
import { supabase } from './services/supabase.js';

dotenv.config();

const app = express();
app.use(cors( {
  origin: process.env.CLIENT_URL || '*', 
  credentials: true
})); // Adjust the origin as needed
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test route
app.get('/', (req, res) => {
  res.send('AI Course Builder API is running');
});

// Outline Generation Route (Phase 2 preview)
app.post('/api/generate-course', async (req, res) => {
  try {
    const { topic, targetAudience, numberOfModules } = req.body;
    const outline = await generateCourseOutline(topic, targetAudience, numberOfModules);
    res.json(outline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import { generateCourseOutline, generateLessonContent } from './services/gemini.js';

// Lesson Generation Route
app.post('/api/generate-lesson', async (req, res) => {
  try {
    const { moduleTitle, learningObjective, targetAudience } = req.body;
    const lessonData = await generateLessonContent(moduleTitle, learningObjective, targetAudience);
    res.json(lessonData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-course', async (req, res) => {
  try {
    const { topic, targetAudience, numberOfModules, userId } = req.body;
    
    // 1. Generate outline via Gemini
    const outline = await generateCourseOutline(topic, targetAudience, numberOfModules);

    // 2. Save course to Supabase with author_id if provided
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert([
        {
          title: outline.courseTitle,
          description: outline.description,
          topic: topic,
          target_audience: targetAudience,
          author_id: userId || null, // Links course to the authenticated user
          is_published: false,
          slug: outline.courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }
      ])
      .select()
      .single();

    if (courseError) throw courseError;

    // 3. Save modules to Supabase
    const modulesToInsert = outline.modules.map((mod) => ({
      course_id: course.id,
      module_number: mod.moduleNumber,
      title: mod.title,
      learning_objective: mod.learningObjective
    }));

    const { data: modules, error: moduleError } = await supabase
      .from('modules')
      .insert(modulesToInsert)
      .select();

    if (moduleError) throw moduleError;

    res.json({
      courseId: course.id,
      courseTitle: course.title,
      description: course.description,
      modules: modules
    });

  } catch (error) {
    console.error('Error in course generation pipeline:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all courses created by a specific user
app.get('/api/user-courses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*, modules(count)')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});