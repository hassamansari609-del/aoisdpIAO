"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

export default function OrdersPage() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      let query = supabase
        .from('orders')
        .select(`
            *,
            listing:listings(title, image_url)
        `)
        .order('created_at', { ascending: false });

      if (role === 'buyer') {
          query = query.eq('buyer_id', user.id);
      } else if (role === 'seller') {
           // This is tricky with simple query, ideally we filter by listing's seller_id
           // For simplicity in this mockup, we might need a join or two queries.
           // Supabase allows filtering on foreign tables!
           // query = query.filter('listing.seller_id', 'eq', user.id); // This syntax depends on Supabase JS version
           // Let's do client side filtering for the mock if needed, or assume seller sees orders of their items

           // Actually, let's just fetch all and filter in memory for this MVP if RLS allows it
           // But RLS says "Sellers see orders for their listings".
           // So a simple select * should work if RLS is enforced correctly.
      }

      const { data, error } = await query;
      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [user, role]);

  const handleUploadScreenshot = async (orderId: string) => {
      const url = prompt("Enter screenshot URL (in real app, this is file upload)");
      if(url) {
          const { error } = await supabase.from('orders').update({ payment_proof_url: url, status: 'checking_payment' }).eq('id', orderId);
          if(!error) {
              setOrders(orders.map(o => o.id === orderId ? { ...o, payment_proof_url: url, status: 'checking_payment' } : o));
          }
      }
  }

  const handleMarkDelivered = async (orderId: string) => {
       const creds = prompt("Enter credentials to send to buyer:");
       if(creds) {
           const { error } = await supabase.from('orders').update({ status: 'delivered', delivered_credentials: creds }).eq('id', orderId);
            if(!error) {
              setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'delivered', delivered_credentials: creds } : o));
          }
       }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            {role === 'buyer' ? 'My Purchases' : 'Order Management'}
        </h1>

        <div className="mt-8 space-y-6">
            {orders.map(order => (
                <div key={order.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {order.listing?.image_url && <img src={order.listing.image_url} alt="" className="h-16 w-16 object-cover rounded" />}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{order.listing?.title || 'Unknown Listing'}</h3>
                                <p className="text-sm text-gray-500">Order ID: {order.id.slice(0, 8)}</p>
                                <p className="text-sm text-gray-500">Amount: ${order.amount}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                order.status === 'delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                order.status === 'checking_payment' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                            }`}>
                                {order.status.replace('_', ' ')}
                            </span>
                            <div className="mt-2 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="mt-4 border-t pt-4">
                        {/* Buyer Actions */}
                        {role === 'buyer' && order.status === 'pending_payment' && (
                             <button onClick={() => handleUploadScreenshot(order.id)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Upload Payment Proof</button>
                        )}
                        {role === 'buyer' && order.status === 'delivered' && (
                            <div className="bg-green-50 p-2 rounded text-sm text-green-800">
                                <strong>Credentials:</strong> {order.delivered_credentials}
                            </div>
                        )}

                        {/* Admin/Seller Actions */}
                        {(role === 'admin' || role === 'seller') && (
                            <div className="mt-2">
                                <p className="text-sm"><strong>Contact:</strong> {JSON.stringify(order.contact_info)}</p>
                                {order.payment_proof_url && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">Payment Proof:</p>
                                        <a href={order.payment_proof_url} target="_blank" className="text-indigo-600 text-sm truncate block max-w-xs">{order.payment_proof_url}</a>
                                    </div>
                                )}
                                <div className="mt-4 flex gap-2">
                                    {order.status !== 'delivered' && (
                                        <button onClick={() => handleMarkDelivered(order.id)} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Mark Delivered & Send Credentials</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {orders.length === 0 && <p className="text-center text-gray-500">No orders found.</p>}
        </div>
      </div>
    </div>
  );
}
