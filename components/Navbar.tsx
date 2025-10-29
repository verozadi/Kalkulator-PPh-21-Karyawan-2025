
import * as React from 'react';
import { Profile } from '../types';

interface NavbarProps {
    profile: Profile;
    onOpenProfileModal: () => void;
    onToggleSidebar: () => void;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ profile, onOpenProfileModal, onToggleSidebar, onLogout }) => {
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <button onClick={onToggleSidebar} className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="sr-only">Toggle sidebar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-700" title="Notifikasi">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(prev => !prev)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700">
                  <img className="h-9 w-9 rounded-full object-cover bg-gray-700" src={profile.logoUrl} alt="Company Logo" />
                  <div>
                      <div className="text-sm font-semibold text-gray-200 text-left">{profile.contactName}</div>
                      <div className="text-xs text-gray-400 text-left">{profile.companyName}</div>
                  </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-600">
                  <button
                    onClick={() => { onOpenProfileModal(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                  >
                    Profil
                  </button>
                  <button
                    onClick={() => { onLogout(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
