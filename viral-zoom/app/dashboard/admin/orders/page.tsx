"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';

export default function AdminOrdersPage() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== 'admin') return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            slots:slot_id (
                id,
                status,
                listings:listing_id (
                    title,
                    seller_id
                )
            )
        `)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [user, role]);

  const handleVerifyOrder = async (orderId: string, action: 'approve' | 'reject') => {
      const order = orders.find(o => o.id === orderId);
      if(!order) return;

      if (action === 'approve') {
          // 1. Update Order Status
          await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);

          // 2. Update Slot Status
          await supabase.from('slots').update({ status: 'sold' }).eq('id', order.slot_id);

          // 3. Create Ledger Entry for Platform (Fee) and Seller (Credit)
          // Simplified: Just credit seller for now.
          const sellerId = order.slots?.listings?.seller_id;
          if (sellerId) {
             const amount = order.amount; // Should deduct fee here
             await supabase.from('ledger_entries').insert({
                 profile_id: sellerId,
                 order_id: orderId,
                 amount: amount,
                 entry_type: 'credit',
                 description: `Sale of ${order.slots?.listings?.title}`
             });

             // Update Cached Balance (Optional, trigger could do this)
             // const { data: profile } = await supabase.from('profiles').select('balance').eq('id', sellerId).single();
             // await supabase.from('profiles').update({ balance: (profile?.balance || 0) + amount }).eq('id', sellerId);
          }

          setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));

      } else {
          // Reject
          await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
          // Release Slot
          await supabase.from('slots').update({ status: 'available', buyer_id: null }).eq('id', order.slot_id);

          setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'failed' } : o));
      }
  };

  if (role !== 'admin') return <div>Access Denied</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold leading-6 text-gray-900">Manage Orders (Admin)</h1>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Item</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Proof</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.slots?.listings?.title || 'Unknown'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{order.amount}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.payment_proof_url ? <a href={order.payment_proof_url} target="_blank" className="text-indigo-600">View Proof</a> : 'None'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          order.status === 'completed' ? 'bg-green-50 text-green-700' :
                          order.status === 'failed' ? 'bg-red-50 text-red-700' :
                          'bg-yellow-50 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 space-x-2">
                          {(order.status === 'pending_proof' || order.status === 'verification') && (
                              <>
                                <button onClick={() => handleVerifyOrder(order.id, 'approve')} className="text-green-600 hover:underline">Approve</button>
                                <button onClick={() => handleVerifyOrder(order.id, 'reject')} className="text-red-600 hover:underline">Reject</button>
                              </>
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
