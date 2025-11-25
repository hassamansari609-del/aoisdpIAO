"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [upsellListing, setUpsellListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availableSlotsCount, setAvailableSlotsCount] = useState(0);

  // Purchase Form State
  const [contactInfo, setContactInfo] = useState({
      name: '',
      email: '',
      whatsapp: '',
      social_media: ''
  });
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  useEffect(() => {
    if(!id) return;

    const fetchData = async () => {
        // Fetch Listing
        const { data: listingData } = await supabase.from('listings').select('*').eq('id', id).single();
        setListing(listingData);

        if(listingData?.upsell_listing_id) {
            const { data: upsellData } = await supabase.from('listings').select('*').eq('id', listingData.upsell_listing_id).single();
            setUpsellListing(upsellData);
        }

        // Fetch Slots Count
        if (listingData) {
            const { count } = await supabase
                .from('slots')
                .select('*', { count: 'exact', head: true })
                .eq('listing_id', listingData.id)
                .eq('status', 'available');
            setAvailableSlotsCount(count || 0);
        }

        // Fetch Payment Methods
        const { data: methods } = await supabase.from('payment_methods').select('*').eq('is_active', true);
        if(methods) setPaymentMethods(methods);

        setLoading(false);
    };

    fetchData();
  }, [id]);

  const handlePurchaseClick = () => {
      if (!user) {
          router.push('/auth/login?redirect=/listings/' + id);
          return;
      }

      // If it's a trial with an upsell, show the modal first!
      if (listing.is_trial && upsellListing && !showUpsellModal) {
          setShowUpsellModal(true);
          return;
      }

      setShowPayment(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      if (!listing) return;
      if (!listing.is_trial && !selectedMethodId) {
          alert("Please select a payment method");
          setIsSubmitting(false);
          return;
      }

      // 1. Reserve a Slot (Find first available)
      const { data: slots, error: slotError } = await supabase
          .from('slots')
          .select('id')
          .eq('listing_id', listing.id)
          .eq('status', 'available')
          .limit(1)
          .single();

      if (slotError || !slots) {
          alert("Sorry, slots might be sold out or unavailable.");
          setIsSubmitting(false);
          return;
      }

      // 2. Lock the Slot (Optimistic Locking)
      const { error: lockError } = await supabase
          .from('slots')
          .update({ status: 'reserved', buyer_id: user?.id })
          .eq('id', slots.id)
          .eq('status', 'available');

      if (lockError) {
          alert("Failed to reserve slot. Please try again.");
          setIsSubmitting(false);
          return;
      }

      // 3. Create Order
      const selectedMethod = paymentMethods.find(p => p.id === selectedMethodId);
      const isFree = listing.is_trial || listing.price_per_slot === 0;

      const { error: orderError } = await supabase.from('orders').insert({
          buyer_id: user?.id,
          slot_id: slots.id,
          amount: listing.price_per_slot,
          status: isFree ? 'completed' : 'pending_proof', // Auto-complete for free trials
          contact_info: contactInfo,
          payment_method_type: isFree ? 'Free Trial' : (selectedMethod?.title || 'Unknown'),
      });

      if (orderError) {
          await supabase.from('slots').update({ status: 'available', buyer_id: null }).eq('id', slots.id);
          alert("Failed to place order: " + orderError.message);
          setIsSubmitting(false);
      } else {
          // If free trial, also mark slot as sold immediately
          if (isFree) {
               await supabase.from('slots').update({ status: 'sold' }).eq('id', slots.id);
          }
          router.push('/dashboard/orders');
      }
  };

  if (loading) return <div>Loading...</div>;
  if (!listing) return <div>Listing not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />

      {/* UPSELL MODAL */}
      {showUpsellModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowUpsellModal(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Wait! Why settle for {listing.duration_days} days?</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Get the full <strong>{upsellListing?.title}</strong> for only <strong>PKR {upsellListing?.price_per_slot}</strong>.
                      </p>
                      <div className="mt-4 p-4 bg-gray-50 rounded text-left border border-gray-200">
                          <p className="text-sm text-gray-700">{upsellListing?.description?.slice(0, 100)}...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:col-start-2 sm:text-sm"
                    onClick={() => router.push(`/listings/${upsellListing.id}`)}
                  >
                    View Premium Offer
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => { setShowUpsellModal(false); setShowPayment(true); }}
                  >
                    No thanks, I'll take the Free Trial
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            {/* Image */}
            <div className="w-full aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden sm:aspect-w-2 sm:aspect-h-3">
                {listing.proof_image_url ? (
                     <img src={listing.proof_image_url} alt={listing.title} className="w-full h-full object-center object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
            </div>

            {/* Info */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    {listing.title}
                    {listing.is_trial && <span className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">FREE TRIAL</span>}
                </h1>
                <div className="mt-3">
                    <h2 className="sr-only">Product information</h2>
                    <p className="text-3xl text-gray-900">
                        {listing.price_per_slot === 0 ? 'FREE' : `PKR ${listing.price_per_slot}`}
                        <span className="text-sm text-gray-500 font-normal"> / slot</span>
                    </p>
                </div>

                <div className="mt-6">
                    <h3 className="sr-only">Description</h3>
                    <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: listing.description || '' }} />
                </div>

                 <div className="mt-6">
                    <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availableSlotsCount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {availableSlotsCount > 0 ? `${availableSlotsCount} slots available` : 'Sold Out'}
                        </span>
                         {listing.expiry_date && <span className="ml-4 text-sm text-gray-500">Expires: {new Date(listing.expiry_date).toLocaleDateString()}</span>}
                    </div>
                </div>

                {!showPayment ? (
                    <div className="mt-10">
                         {user && user.id === listing.seller_id ? (
                              <button disabled className="w-full bg-gray-300 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white cursor-not-allowed">You own this listing</button>
                         ) : (
                            <button
                                onClick={handlePurchaseClick}
                                disabled={availableSlotsCount <= 0}
                                className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {availableSlotsCount > 0 ? (listing.is_trial ? 'Claim Free Trial' : 'Purchase Slot') : 'Sold Out'}
                            </button>
                         )}
                    </div>
                ) : (
                    <div className="mt-10 bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Complete {listing.is_trial ? 'Claim' : 'Purchase'}</h3>
                        <form onSubmit={handleConfirmOrder} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <input type="text" placeholder="Full Name" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" value={contactInfo.name} onChange={e => setContactInfo({...contactInfo, name: e.target.value})} />
                                <input type="email" placeholder="Email Address" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} />
                                <input type="text" placeholder="WhatsApp Number (Optional)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" value={contactInfo.whatsapp} onChange={e => setContactInfo({...contactInfo, whatsapp: e.target.value})} />
                                <input type="text" placeholder="Social Media Link (if no WhatsApp)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" value={contactInfo.social_media} onChange={e => setContactInfo({...contactInfo, social_media: e.target.value})} />
                            </div>

                            {!listing.is_trial && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                                    <div className="space-y-2">
                                        {paymentMethods.map(method => (
                                            <div key={method.id} className="flex items-start">
                                                <input id={method.id} name="payment_method" type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" onChange={() => setSelectedMethodId(method.id)} />
                                                <label htmlFor={method.id} className="ml-3 block text-sm font-medium text-gray-700">
                                                    {method.title} ({method.type})
                                                    <span className="block text-xs text-gray-500">{JSON.stringify(method.details)}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Step 2:</strong> Please make the payment to the selected method above and upload the screenshot later in your order page.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {listing.is_trial && (
                                <div className="mt-4 p-4 bg-green-50 rounded-md">
                                    <p className="text-sm text-green-800">
                                        <strong>No Payment Required!</strong> This is a free trial. Click confirm to receive your credentials instantly (if approved).
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowPayment(false)} className="w-full bg-white border border-gray-300 rounded-md py-3 px-8 text-base font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 text-base font-medium text-white hover:bg-indigo-700">Confirm {listing.is_trial ? 'Claim' : 'Order'}</button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}
