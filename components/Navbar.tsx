
import React from 'react';
import { Profile } from '../types';

interface NavbarProps {
    profile: Profile;
    onOpenProfileModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ profile, onOpenProfileModal }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: App Logo and Name - now handled in Sidebar */}
          <div></div>

          {/* Right side: Profile Section */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-700" title="Notifikasi">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <button onClick={onOpenProfileModal} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                <img className="h-9 w-9 rounded-full object-cover bg-gray-700" src={profile.logoUrl} alt="Company Logo" />
                <div>
                    <div className="text-sm font-semibold text-gray-200 text-left">{profile.contactName}</div>
                    <div className="text-xs text-gray-400 text-left">{profile.companyName}</div>
                </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
