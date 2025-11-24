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
  const [loading, setLoading] = useState(true);

  // Purchase Form State
  const [contactInfo, setContactInfo] = useState({
      name: '',
      email: '',
      whatsapp: '',
      social_media: ''
  });
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentProofUrl, setPaymentProofUrl] = useState(''); // Would typically be file upload
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if(!id) return;
    const fetchListing = async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).single();
      setListing(data);
      setLoading(false);
    };
    fetchListing();

    const fetchPaymentMethods = async () => {
        const { data } = await supabase.from('payment_methods').select('*').eq('is_active', true);
        if(data) setPaymentMethods(data);
    }
    fetchPaymentMethods();
  }, [id]);

  const handlePurchaseClick = () => {
      if (!user) {
          router.push('/auth/login?redirect=/listings/' + id);
          return;
      }
      setShowPayment(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      if (!listing) return;
      if (!selectedMethod) {
          alert("Please select a payment method");
          setIsSubmitting(false);
          return;
      }

      // Create Order
      const { error } = await supabase.from('orders').insert({
          buyer_id: user?.id,
          listing_id: listing.id,
          amount: listing.price,
          status: 'pending_payment',
          contact_info: contactInfo,
          // In a real app we'd save the payment method details snapshot
      });

      if (error) {
          alert("Failed to place order: " + error.message);
          setIsSubmitting(false);
      } else {
          // Send user to success page or order details page
          router.push('/dashboard/orders');
      }
  };

  if (loading) return <div>Loading...</div>;
  if (!listing) return <div>Listing not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            {/* Image */}
            <div className="w-full aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden sm:aspect-w-2 sm:aspect-h-3">
                {listing.image_url ? (
                     <img src={listing.image_url} alt={listing.title} className="w-full h-full object-center object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
            </div>

            {/* Info */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{listing.title}</h1>
                <div className="mt-3">
                    <h2 className="sr-only">Product information</h2>
                    <p className="text-3xl text-gray-900">${listing.price} <span className="text-sm text-gray-500 font-normal">/ slot</span></p>
                </div>

                <div className="mt-6">
                    <h3 className="sr-only">Description</h3>
                    <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: listing.description }} />
                </div>

                 <div className="mt-6">
                    <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${listing.slots_available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {listing.slots_available > 0 ? `${listing.slots_available} slots available` : 'Sold Out'}
                        </span>
                         <span className="ml-4 text-sm text-gray-500">Expires: {new Date(listing.expires_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {!showPayment ? (
                    <div className="mt-10">
                         {user && user.id === listing.seller_id ? (
                              <button disabled className="w-full bg-gray-300 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white cursor-not-allowed">You own this listing</button>
                         ) : (
                            <button
                                onClick={handlePurchaseClick}
                                disabled={listing.slots_available <= 0}
                                className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {listing.slots_available > 0 ? 'Purchase Slot' : 'Sold Out'}
                            </button>
                         )}
                    </div>
                ) : (
                    <div className="mt-10 bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Purchase</h3>
                        <form onSubmit={handleConfirmOrder} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <input type="text" placeholder="Full Name" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" value={contactInfo.name} onChange={e => setContactInfo({...contactInfo, name: e.target.value})} />
                                <input type="email" placeholder="Email Address" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} />
                                <input type="text" placeholder="WhatsApp Number (Optional)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" value={contactInfo.whatsapp} onChange={e => setContactInfo({...contactInfo, whatsapp: e.target.value})} />
                                <input type="text" placeholder="Social Media Link (if no WhatsApp)" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" value={contactInfo.social_media} onChange={e => setContactInfo({...contactInfo, social_media: e.target.value})} />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                                <div className="space-y-2">
                                    {paymentMethods.map(method => (
                                        <div key={method.id} className="flex items-start">
                                            <input id={method.id} name="payment_method" type="radio" className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" onChange={() => setSelectedMethod(method.id)} />
                                            <label htmlFor={method.id} className="ml-3 block text-sm font-medium text-gray-700">
                                                {method.title} ({method.type})
                                                <span className="block text-xs text-gray-500">{JSON.stringify(method.details)}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                                <p className="text-sm text-yellow-800">
                                    <strong>Step 2:</strong> Please make the payment to the selected method above and upload the screenshot later in your order page.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowPayment(false)} className="w-full bg-white border border-gray-300 rounded-md py-3 px-8 text-base font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 text-base font-medium text-white hover:bg-indigo-700">Confirm Order</button>
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
