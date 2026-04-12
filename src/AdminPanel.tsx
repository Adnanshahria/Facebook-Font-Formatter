import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Users, FileText, Lock } from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const SECRET_CODE = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === SECRET_CODE) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('Invalid access code');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const visitorsSnapshot = await getDocs(query(collection(db, 'visitors'), orderBy('visitedAt', 'desc')));
      setVisitors(visitorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const contentsSnapshot = await getDocs(query(collection(db, 'user_contents'), orderBy('createdAt', 'desc')));
      setContents(contentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter Secret Code"
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Lock className="w-8 h-8 text-blue-600" />
          Admin Dashboard
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Visitors Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Unique Visitors ({visitors.length})
            </h2>
            <div className="overflow-y-auto max-h-96">
              {loading ? <p>Loading...</p> : (
                <ul className="space-y-3">
                  {visitors.map((v, i) => (
                    <li key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <span className="font-mono text-gray-500">{v.id}</span>
                      <br />
                      <span className="text-gray-400 text-xs">{new Date(v.visitedAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* User Contents Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Saved Contents ({contents.length})
            </h2>
            <div className="overflow-y-auto max-h-96">
              {loading ? <p>Loading...</p> : (
                <ul className="space-y-4">
                  {contents.map((c, i) => (
                    <li key={i} className="p-4 bg-gray-50 rounded-lg text-sm border border-gray-100">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-blue-600">{c.email}</span>
                        <span className="text-xs text-gray-400">#{c.serialNumber}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-gray-400 block mb-1">Original:</span>
                        <p className="text-gray-600 bg-white p-2 rounded border border-gray-100">{c.originalText}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block mb-1">Formatted:</span>
                        <p className="text-gray-800 bg-white p-2 rounded border border-gray-100 font-medium">{c.formattedText}</p>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
