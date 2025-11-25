"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

export default function AddListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Existing listings for upsell dropdown
  const [myListings, setMyListings] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_slot: '',
    total_slots: '1',
    duration_days: '30',
    expiry_date: '',
    proof_image_url: '',
    credentials_vault: '',
    is_trial: false, // New Field
    upsell_listing_id: '', // New Field
  });

  useEffect(() => {
    if(!user) return;
    const fetchListings = async () => {
        // Fetch seller's other active listings to populate the upsell dropdown
        const { data } = await supabase
            .from('listings')
            .select('id, title')
            .eq('seller_id', user.id)
            .eq('status', 'active'); // Only active listings
        if(data) setMyListings(data);
    };
    fetchListings();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // Trial Logic Enforcements
    let finalPrice = parseFloat(formData.price_per_slot);
    let finalDuration = parseInt(formData.duration_days);

    if (formData.is_trial) {
        finalPrice = 0; // Force free
        if (finalDuration > 7) finalDuration = 2; // Default to 2 days if user tried to set long duration for trial
    }

    // 1. Create the Listing
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        price_per_slot: finalPrice,
        total_slots: parseInt(formData.total_slots),
        duration_days: finalDuration,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        proof_image_url: formData.proof_image_url,
        credentials_vault: formData.credentials_vault,
        status: 'pending_approval',
        is_trial: formData.is_trial,
        upsell_listing_id: formData.upsell_listing_id || null,
      })
      .select()
      .single();

    if (listingError) {
      alert('Error creating listing: ' + listingError.message);
      setLoading(false);
      return;
    }

    if (listingData) {
      // 2. Create the Slots
      const slotsCount = parseInt(formData.total_slots);
      const slotsArray = Array.from({ length: slotsCount }).map(() => ({
        listing_id: listingData.id,
        status: 'available',
      }));

      const { error: slotsError } = await supabase
        .from('slots')
        .insert(slotsArray);

      if (slotsError) {
        alert('Listing created but failed to generate slots: ' + slotsError.message);
      } else {
        router.push('/dashboard/seller/listings');
      }
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

              {/* Free Trial Toggle */}
              <div className="col-span-full">
                  <div className="relative flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="is_trial"
                        name="is_trial"
                        type="checkbox"
                        checked={formData.is_trial}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label htmlFor="is_trial" className="font-medium text-gray-900">Is this a Free Trial / Giveaway?</label>
                      <p className="text-gray-500">If checked, price will be 0 and duration limited. Used to attract leads.</p>
                    </div>
                  </div>
              </div>

              {formData.is_trial && (
                   <div className="sm:col-span-3">
                    <label htmlFor="upsell_listing_id" className="block text-sm font-medium leading-6 text-gray-900">Upsell Linked Listing</label>
                    <div className="mt-2">
                      <select
                        id="upsell_listing_id"
                        name="upsell_listing_id"
                        value={formData.upsell_listing_id}
                        onChange={handleChange}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                      >
                        <option value="">Select a paid listing to recommend...</option>
                        {myListings.map(l => (
                            <option key={l.id} value={l.id}>{l.title}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">When users view this free trial, we will recommend this paid listing.</p>
                    </div>
                  </div>
              )}

              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Subscription Name</label>
                <div className="mt-2">
                  <input type="text" name="title" id="title" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.title} onChange={handleChange} placeholder="e.g. Netflix Premium 4K" />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                <div className="mt-2">
                  <textarea id="description" name="description" rows={3} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.description} onChange={handleChange} placeholder="Describe features, limitations, etc." />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="price_per_slot" className="block text-sm font-medium leading-6 text-gray-900">Price per slot (PKR)</label>
                <div className="mt-2">
                  <input
                    type="number"
                    name="price_per_slot"
                    id="price_per_slot"
                    required
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:bg-gray-100 disabled:text-gray-500"
                    value={formData.is_trial ? 0 : formData.price_per_slot}
                    onChange={handleChange}
                    disabled={formData.is_trial}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="total_slots" className="block text-sm font-medium leading-6 text-gray-900">Total Slots</label>
                <div className="mt-2">
                  <input type="number" name="total_slots" id="total_slots" required min="1" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.total_slots} onChange={handleChange} />
                </div>
              </div>

               <div className="sm:col-span-2">
                <label htmlFor="duration_days" className="block text-sm font-medium leading-6 text-gray-900">Duration (Days)</label>
                <div className="mt-2">
                  <input type="number" name="duration_days" id="duration_days" required min="1" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.duration_days} onChange={handleChange} />
                  {formData.is_trial && <p className="text-xs text-orange-500">Trial duration usually 1-3 days.</p>}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="expiry_date" className="block text-sm font-medium leading-6 text-gray-900">Expiration Date</label>
                <div className="mt-2">
                  <input type="date" name="expiry_date" id="expiry_date" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.expiry_date} onChange={handleChange} />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="proof_image_url" className="block text-sm font-medium leading-6 text-gray-900">Proof Image URL</label>
                <div className="mt-2">
                  <input type="text" name="proof_image_url" id="proof_image_url" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.proof_image_url} onChange={handleChange} placeholder="https://example.com/screenshot.jpg" />
                  <p className="mt-1 text-xs text-gray-500">Upload a screenshot proving you own this subscription.</p>
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="credentials_vault" className="block text-sm font-medium leading-6 text-gray-900">Account Credentials</label>
                <div className="mt-2">
                  <textarea id="credentials_vault" name="credentials_vault" required rows={3} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" value={formData.credentials_vault} onChange={handleChange} placeholder="Email: ... Password: ... (This will be encrypted)" />
                  <p className="mt-1 text-xs text-red-500">These details will only be visible to buyers after purchase.</p>
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
