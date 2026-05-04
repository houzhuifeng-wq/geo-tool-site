// app/qa/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface QAItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  answer: string;
}

const getQAItems = async (): Promise<QAItem[]> => {
  try {
    const response = await fetch('/api/qa');
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching QA:', error);
    return [
      { id: '1', title: '什么是GEO优化?', excerpt: 'GEO优化是...', date: '2024-04-01', category: '基础问题', answer: '内容...' },
      { id: '2', title: '如何提升本地搜索排名?', excerpt: '本地搜索排名...', date: '2024-03-25', category: '本地SEO', answer: '内容...' }
    ];
  }
};

export default function QAPage() {
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQAItems().then(items => {
      setQaItems(items);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">常见问题解答</h1>
          <p className="text-lg">解答您关于GEO优化的疑问</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qaItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <span className="inline-block px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full mb-3">{item.category}</span>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{item.date}</span>
                <button className="text-green-600 hover:text-green-800">阅读更多 →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}