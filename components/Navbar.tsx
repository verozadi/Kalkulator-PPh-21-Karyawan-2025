
import * as React from 'react';
import { Profile, User } from '../types';

interface NavbarProps {
    profile: Profile;
    user: User | null;
    onOpenProfileModal: () => void;
    onToggleSidebar: () => void;
    onLogout: () => void;
    isLicenseActivated: boolean;
    onOpenActivation: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ profile, user, onOpenProfileModal, onToggleSidebar, onLogout, isLicenseActivated, onOpenActivation }) => {
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

  // Display logic: Use authenticated user data if available, fallback to profile contact
  const displayName = user?.name || profile.contactName || 'Guest User';
  const displayEmail = user?.email || '';

  return (
    <>
        {!isLicenseActivated && (
            <div className="bg-yellow-600 text-white text-xs font-bold text-center py-1 px-4 shadow-sm z-20">
                ⚠ MODE PREVIEW (READ-ONLY). Anda harus melakukan Aktivasi Produk untuk Menyimpan, Edit, atau Export data.
            </div>
        )}
        <header className="bg-gray-900 border-b border-gray-800 shadow-sm relative z-30">
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
            
            {/* LEFT SIDE: Branding & Toggle */}
            <div className="flex items-center gap-4">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-1.5 rounded-lg shadow-lg shadow-primary-900/50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight hidden sm:block">VerozTax</span>
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-gray-700 mx-2 hidden sm:block"></div>

                {/* Sidebar Toggle Button */}
                <button 
                    onClick={onToggleSidebar} 
                    className="p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none transition-colors"
                    title="Toggle Sidebar"
                >
                    <span className="sr-only">Toggle sidebar</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </button>
            </div>

            {/* RIGHT SIDE: Actions & Profile */}
            <div className="flex items-center space-x-3 sm:space-x-5">
                {/* Activation Button */}
                {!isLicenseActivated && (
                    <button 
                        onClick={onOpenActivation}
                        className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold animate-pulse"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span>Aktivasi</span>
                    </button>
                )}

                {/* Notification Bell */}
                <button className="p-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors relative" title="Notifikasi">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-gray-900 shadow-sm"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setDropdownOpen(prev => !prev)} 
                        className="flex items-center space-x-3 p-1.5 pr-2 sm:pr-4 rounded-full hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-all group"
                    >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-0.5 flex items-center justify-center overflow-hidden shadow-inner group-hover:shadow-primary-500/20">
                             {profile.logoUrl ? (
                                 <img className="h-full w-full rounded-full object-cover" src={profile.logoUrl} alt="User" />
                             ) : (
                                 <span className="text-sm font-bold text-white">{displayName.charAt(0)}</span>
                             )}
                        </div>
                        <div className="hidden md:block text-left">
                            <div className="text-sm font-bold text-gray-200 leading-none group-hover:text-white">{displayName}</div>
                            <div className="text-[11px] font-medium text-gray-500 mt-1 lowercase">{displayEmail}</div>
                        </div>
                        <svg className={`hidden md:block h-4 w-4 text-gray-500 transition-transform duration-200 group-hover:text-gray-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl py-1 z-50 border border-gray-700 animate-fade-in-up origin-top-right ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-3 border-b border-gray-700 md:hidden">
                                <p className="text-sm text-white font-bold">{displayName}</p>
                                <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                            </div>
                            <button
                                onClick={() => { onOpenProfileModal(); setDropdownOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Profil Perusahaan
                            </button>
                            <button
                                onClick={() => { onLogout(); setDropdownOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Keluar (Logout)
                            </button>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
        </header>
    </>
  );
};

export default Navbar;
