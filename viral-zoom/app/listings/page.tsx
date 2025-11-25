"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function BrowseListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active') // Only active listings
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      // Note: text search would ideally use Supabase Text Search, but doing simple client side or simple ilike for now
      if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (data) setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [searchTerm, category]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Browse Subscriptions</h1>
            <div className="flex gap-4 w-full md:w-auto">
                 <select
                    className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="Streaming">Streaming</option>
                    <option value="VPN">VPN</option>
                    <option value="Music">Music</option>
                    <option value="Education">Education</option>
                    <option value="Software">Software</option>
                    <option value="Gaming">Gaming</option>
                </select>
                <div className="relative w-full md:w-64">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {loading ? (
             <div className="text-center py-20">Loading listings...</div>
        ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {listings.map((listing) => (
                <div key={listing.id} className="group relative bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-40 flex items-center justify-center">
                    {listing.image_url ? (
                        <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                        />
                    ) : (
                        <span className="text-gray-400">No Image</span>
                    )}
                </div>
                <div className="mt-4 flex justify-between">
                    <div>
                    <h3 className="text-sm text-gray-700">
                        <Link href={`/listings/${listing.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {listing.title}
                        </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{listing.category}</p>
                    <p className="text-xs text-green-600 mt-1">{listing.slots_available} slots left</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${listing.price}</p>
                </div>
                </div>
            ))}
            {listings.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500">
                    No listings found.
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
}
