import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ onAuthSuccess, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link, or log in if email confirmation is disabled!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 font-sans">
      <div className="bg-white p-8 rounded-sm max-w-md w-full border border-[#E8E2D9] shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[#2C2421]">✕</button>
        <h2 className="text-2xl font-serif font-bold text-[#2C2421] mb-2">{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
        <p className="text-xs text-[#7A6E65] mb-6">Manage your generated courses and curriculum drafts.</p>

        {error && <div className="mb-4 p-3 bg-[#FDF2F2] text-[#9B1C1C] text-xs rounded border border-[#F8B4B4]">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#524842] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#D6CFC7] rounded-sm text-sm focus:outline-none focus:border-[#7C2D2B]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#524842] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#D6CFC7] rounded-sm text-sm focus:outline-none focus:border-[#7C2D2B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#7C2D2B] hover:bg-[#632220] text-white text-sm font-medium rounded-sm transition-colors"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[#7A6E65] hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}