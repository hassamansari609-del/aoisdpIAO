export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Viral Zoom</h3>
              <p className="text-gray-400 text-sm">
                Share and save on your favorite subscriptions. Join the community today.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/listings" className="hover:text-white">Browse</a></li>
                <li><a href="/how-it-works" className="hover:text-white">How it works</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                Email: support@viralzoom.com<br />
                WhatsApp: +1234567890
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Viral Zoom. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }
