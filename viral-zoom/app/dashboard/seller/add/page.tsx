"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

export default function AddListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Streaming',
    price: '',
    slots_total: '1',
    duration_days: '30',
    expires_at: '',
    image_url: '', // For now text, later file upload
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        slots_total: parseInt(formData.slots_total),
        slots_available: parseInt(formData.slots_total),
        duration_days: parseInt(formData.duration_days),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        image_url: formData.image_url,
        status: 'pending', // Requires admin approval
      });

    if (error) {
      alert('Error creating listing: ' + error.message);
    } else {
      router.push('/dashboard/seller/listings');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Subscription Listing</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Subscription Name</label>
                <div className="mt-2">
                  <input type="text" name="title" id="title" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.title} onChange={handleChange} placeholder="e.g. Netflix Premium 4K" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">Category</label>
                <div className="mt-2">
                  <select id="category" name="category" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.category} onChange={handleChange}>
                    <option>Streaming</option>
                    <option>VPN</option>
                    <option>Music</option>
                    <option>Education</option>
                    <option>Software</option>
                    <option>Gaming</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                <div className="mt-2">
                  <textarea id="description" name="description" rows={3} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.description} onChange={handleChange} placeholder="Describe features, limitations, etc." />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">Price per slot</label>
                <div className="mt-2">
                  <input type="number" name="price" id="price" required min="0" step="0.01" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.price} onChange={handleChange} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="slots_total" className="block text-sm font-medium leading-6 text-gray-900">Total Slots</label>
                <div className="mt-2">
                  <input type="number" name="slots_total" id="slots_total" required min="1" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.slots_total} onChange={handleChange} />
                </div>
              </div>

               <div className="sm:col-span-2">
                <label htmlFor="duration_days" className="block text-sm font-medium leading-6 text-gray-900">Duration (Days)</label>
                <div className="mt-2">
                  <input type="number" name="duration_days" id="duration_days" required min="1" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.duration_days} onChange={handleChange} />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="expires_at" className="block text-sm font-medium leading-6 text-gray-900">Expiration Date</label>
                <div className="mt-2">
                  <input type="date" name="expires_at" id="expires_at" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.expires_at} onChange={handleChange} />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="image_url" className="block text-sm font-medium leading-6 text-gray-900">Image URL</label>
                <div className="mt-2">
                  <input type="text" name="image_url" id="image_url" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                </div>
              </div>

            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button type="button" className="text-sm font-semibold leading-6 text-gray-900" onClick={() => router.back()}>Cancel</button>
            <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
