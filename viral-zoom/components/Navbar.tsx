"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, role, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-600">Viral Zoom</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/listings" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                Browse
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                How it works
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {role === 'seller' && (
                  <Link href="/dashboard/seller" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                    Seller Dashboard
                  </Link>
                )}
                {role === 'admin' && (
                   <Link href="/dashboard/admin" className="text-sm font-medium text-red-600 hover:text-red-800">
                    Admin Panel
                  </Link>
                )}
                <div className="relative group">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                        <User className="h-6 w-6" />
                        <span className="text-sm">{user.email}</span>
                    </button>
                    <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                        <div className="py-1">
                            <Link href="/dashboard/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                             {role === 'seller' && (
                                <Link href="/dashboard/seller/listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Listings</Link>
                             )}
                            <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</button>
                        </div>
                    </div>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/auth/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Log in
                </Link>
                <Link href="/auth/register" className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
       {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <Link href="/listings" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700">Browse</Link>
            {user ? (
                <>
                    {role === 'seller' && <Link href="/dashboard/seller" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700">Seller Dashboard</Link>}
                    {role === 'admin' && <Link href="/dashboard/admin" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-red-600 hover:bg-gray-50">Admin Panel</Link>}
                    <Link href="/dashboard/orders" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700">My Orders</Link>
                    <button onClick={signOut} className="block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700">Sign Out</button>
                </>
            ) : (
                <>
                    <Link href="/auth/login" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700">Log in</Link>
                    <Link href="/auth/register" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-indigo-600 hover:bg-gray-50">Sign up</Link>
                </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
