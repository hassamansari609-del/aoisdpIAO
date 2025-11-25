"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

export default function AdminListingsPage() {
  const { user, role } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== 'admin') return; // Should redirect ideally

    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [user, role]);

  const handleStatusChange = async (id: string, newStatus: string) => {
      const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', id);
      if(!error) {
          setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
      }
  }

  if (role !== 'admin') return <div>Access Denied</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold leading-6 text-gray-900">Manage Listings (Admin)</h1>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Title</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Seller ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{listing.title}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{listing.seller_id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          listing.status === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          listing.status === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                          'bg-red-50 text-red-700 ring-red-600/20'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 space-x-2">
                        {listing.status === 'pending' && (
                            <>
                            <button onClick={() => handleStatusChange(listing.id, 'active')} className="text-green-600 hover:text-green-900">Approve</button>
                            <button onClick={() => handleStatusChange(listing.id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                            </>
                        )}
                        {listing.status === 'active' && (
                            <button onClick={() => handleStatusChange(listing.id, 'rejected')} className="text-red-600 hover:text-red-900">Suspend</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
