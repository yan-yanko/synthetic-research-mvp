import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen text-textPrimary font-sans">
      <header className="py-4 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center">
          <img src="/assets/peach-logo.png" alt="Peach Mascot Logo" className="h-10 w-10 mr-3" /> {/* Adjusted size slightly */}
          <span className="font-semibold text-xl text-textPrimary">Synthetic Peach</span> {/* Example App Name */}
          {/* Navigation links can go here */}
        </div>
      </header>
      {/* ToastContainer is now rendered by ToastProvider, so it's not needed here */}
      <main className="max-w-7xl mx-auto p-6">{children}</main>
      <footer className="py-6 text-center border-t border-border mt-auto">
        <p className="text-sm text-textSecondary">
          &copy; {new Date().getFullYear()} Synthetic Peach Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
} 