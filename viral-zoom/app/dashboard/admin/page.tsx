"use client";

import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, role } = useAuth();

  if (role !== 'admin') {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p>You must be an admin to view this page.</p>
                </div>
            </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Management</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link href="/dashboard/admin/listings" className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="mt-2 block text-sm font-semibold text-gray-900">Manage Listings</span>
                </Link>
                <Link href="/dashboard/admin/payments" className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="mt-2 block text-sm font-semibold text-gray-900">Payment Methods</span>
                </Link>
                 <Link href="/dashboard/orders" className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="mt-2 block text-sm font-semibold text-gray-900">All Orders</span>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
