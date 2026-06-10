import React from 'react';
import { Network, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Network size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-bold">PeerLink</h1>
                <p className="text-blue-100 text-sm">P2P File Sharing Network</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-blue-100 transition-colors font-semibold">
              My Uploads
            </Link>
            <Link href="/download-by-port" className="hover:text-blue-100 transition-colors font-semibold">
              Download
            </Link>
            <div className="hidden md:flex items-center gap-2 text-blue-100 ml-4 pl-4 border-l border-blue-300">
              <Shield size={20} />
              <span className="text-sm">Decentralized & Secure</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
