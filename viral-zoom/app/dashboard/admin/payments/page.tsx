"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

export default function PaymentMethodsPage() {
  const { user, role } = useAuth();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('bank');
  const [details, setDetails] = useState(''); // JSON string for simplicity in this demo

  useEffect(() => {
    if (!user || role !== 'admin') return;

    const fetchMethods = async () => {
      const { data, error } = await supabase.from('payment_methods').select('*');
      if (data) setMethods(data);
      setLoading(false);
    };

    fetchMethods();
  }, [user, role]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const detailsJson = JSON.parse(details);
          const { data, error } = await supabase.from('payment_methods').insert({
              title,
              type,
              details: detailsJson
          }).select();

          if(data) {
              setMethods([...methods, data[0]]);
              setTitle('');
              setDetails('');
          }
      } catch (err) {
          alert("Invalid JSON in details");
      }
  }

  const handleDelete = async (id: string) => {
       const { error } = await supabase.from('payment_methods').delete().eq('id', id);
       if(!error) {
           setMethods(methods.filter(m => m.id !== id));
       }
  }

  if (role !== 'admin') return <div>Access Denied</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold leading-6 text-gray-900">Manage Payment Methods</h1>

        <div className="mt-8 bg-white p-6 rounded shadow">
            <h2 className="text-lg font-medium">Add New Method</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. Bank Transfer (HBL)" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="bank">Bank</option>
                        <option value="crypto">Crypto</option>
                        <option value="wallet">Wallet (Easypaisa/Jazzcash)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Details (JSON)</label>
                    <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder='{"account_number": "1234", "bank_name": "HBL", "account_title": "John Doe"}' required />
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Method</button>
            </form>
        </div>

        <div className="mt-8">
            <h2 className="text-lg font-medium">Existing Methods</h2>
            <ul className="mt-4 space-y-4">
                {methods.map(method => (
                    <li key={method.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{method.title} <span className="text-xs text-gray-500 uppercase">({method.type})</span></h3>
                            <pre className="text-xs text-gray-600 mt-1">{JSON.stringify(method.details, null, 2)}</pre>
                        </div>
                        <button onClick={() => handleDelete(method.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}
