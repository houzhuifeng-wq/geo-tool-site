// app/cases/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface CaseItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
}

const getCases = async (): Promise<CaseItem[]> => {
  try {
    const response = await fetch('/api/cases');
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching cases:', error);
    return [
      { id: '1', title: '企业GEO优化方案', excerpt: '方案介绍...', date: '2024-04-01', category: '企业方案', content: '内容...' },
      { id: '2', title: '本地商家SEO方案', excerpt: '本地优化...', date: '2024-03-25', category: '本地方案', content: '内容...' }
    ];
  }
};

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCases().then(items => {
      setCases(items);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">客户方案</h1>
          <p className="text-lg">成功案例和解决方案</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <span className="inline-block px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mb-3">{item.category}</span>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{item.date}</span>
                <button className="text-purple-600 hover:text-purple-800">阅读更多 →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}