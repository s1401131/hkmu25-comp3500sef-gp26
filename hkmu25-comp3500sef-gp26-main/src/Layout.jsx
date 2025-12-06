import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Utensils, ShoppingBag, ChefHat, Moon, Sun } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem('dark_mode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    
    fetchUser();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('dark_mode', newMode.toString());
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Hide layout for LanguageSelection page
  if (currentPageName === "LanguageSelection") {
    return <div className="min-h-screen">{children}</div>;
  }

  const isAdmin = user && user.role === 'admin';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-red-50 via-white to-yellow-50'}`}>
      <header className={`shadow-lg sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gradient-to-r from-red-600 to-red-700 text-white'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={createPageUrl("Home") + `?lang=${localStorage.getItem('preferred_language') || 'en'}`} 
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <Utensils className={`w-7 h-7 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">HKMU JCC</h1>
                <p className={`text-xs transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-red-100'}`}>港式美食餐廳</p>
              </div>
            </Link>
            <nav className="flex gap-2">
              <Link to={createPageUrl("Home") + `?lang=${localStorage.getItem('preferred_language') || 'en'}`}>
                <button 
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    currentPageName === "Home" 
                      ? darkMode 
                        ? "bg-gray-700 text-white shadow-md" 
                        : "bg-white text-red-600 shadow-md"
                      : darkMode
                        ? "bg-gray-600 hover:bg-gray-500 text-white"
                        : "bg-red-500 hover:bg-red-400 text-white"
                  }`}
                  aria-label="Home - Order Food"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Order</span>
                </button>
              </Link>
              
              {/* Only show Kitchen button if user is admin */}
              {!isLoadingAuth && isAdmin && (
                <Link to={createPageUrl("Restaurant")}>
                  <button 
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      currentPageName === "Restaurant" 
                        ? darkMode 
                          ? "bg-gray-700 text-white shadow-md" 
                          : "bg-white text-red-600 shadow-md"
                        : darkMode
                          ? "bg-gray-600 hover:bg-gray-500 text-white"
                          : "bg-red-500 hover:bg-red-400 text-white"
                    }`}
                    aria-label="Restaurant Dashboard"
                  >
                    <ChefHat className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Kitchen</span>
                  </button>
                </Link>
              )}
              
              <button
                onClick={toggleDarkMode}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  darkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-red-500 hover:bg-red-400 text-white"
                }`}
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Dark</span>
                  </>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-80px)]">
        {children}
      </main>
      <footer className={`py-6 mt-8 transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-800 text-white'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2024 HKMU JCC Restaurant. All rights reserved.</p>
          <p className={`text-xs mt-1 transition-colors duration-300 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>港式美食餐廳 • Hong Kong Style Restaurant</p>
        </div>
      </footer>
    </div>
  );
}