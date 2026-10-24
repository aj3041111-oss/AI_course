import React, { useEffect, useState } from 'react';

export default function Dashboard({ user, onSelectCourse, onCreateNew }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserCourses();
    }
  }, [user]);

  const fetchUserCourses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-courses/${user.id}`);
      if (!response.ok) throw new Error('Failed to load courses.');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#E8E2D9]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#7A6E65] font-semibold block mb-1">
            Instructor Portal
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#2C2421]">My Generated Courses</h1>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-[#7C2D2B] hover:bg-[#632220] text-white px-6 py-2.5 rounded-sm text-sm font-medium transition-colors"
        >
          + Create New Course
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#7A6E65]">Loading your course library...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E8E2D9] rounded-sm p-8">
          <p className="text-[#524842] mb-4">You haven't generated any courses yet.</p>
          <button
            onClick={onCreateNew}
            className="border border-[#7C2D2B] text-[#7C2D2B] px-5 py-2 rounded-sm text-sm font-medium hover:bg-[#7C2D2B] hover:text-white transition-colors"
          >
            Start Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-[#E8E2D9] p-6 rounded-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                      course.is_published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-xs text-[#7A6E65]">
                    {course.modules?.[0]?.count || 0} Modules
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#2C2421] mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-[#524842] line-clamp-3 mb-6 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8E2D9] flex justify-between items-center">
                <button
                  onClick={() => onSelectCourse(course)}
                  className="text-xs font-semibold text-[#7C2D2B] hover:underline"
                >
                  Manage / Edit →
                </button>
                {course.is_published && (
                  <a
                    href={`/course/${course.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#7A6E65] hover:text-[#2C2421] font-medium"
                  >
                    View Live ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}