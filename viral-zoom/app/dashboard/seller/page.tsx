"use client";

import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SellerDashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
      totalListings: 0,
      activeListings: 0,
      totalSales: 0,
      earnings: 0
  });

  useEffect(() => {
      if(!user) return;

      const fetchStats = async () => {
          // Mocking stats for now or doing basic count queries
          const { count: totalListings } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', user.id);
          const { count: activeListings } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', user.id).eq('status', 'active');

          // For earnings we would join orders but let's keep it simple
          setStats({
              totalListings: totalListings || 0,
              activeListings: activeListings || 0,
              totalSales: 0,
              earnings: 0
          })
      }
      fetchStats();
  }, [user]);

  if (role !== 'seller') {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p>You must be a seller to view this page.</p>
                    <Link href="/dashboard/register-seller" className="text-indigo-600 hover:underline">Register as Seller</Link>
                </div>
            </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seller Dashboard</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Listings</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalListings}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Listings</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeListings}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalSales}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${stats.earnings}</dd>
            </div>
          </div>
        </div>

        <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link href="/dashboard/seller/add" className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="mt-2 block text-sm font-semibold text-gray-900">Create a new listing</span>
                </Link>
                <Link href="/dashboard/seller/listings" className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="mt-2 block text-sm font-semibold text-gray-900">Manage Listings</span>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
