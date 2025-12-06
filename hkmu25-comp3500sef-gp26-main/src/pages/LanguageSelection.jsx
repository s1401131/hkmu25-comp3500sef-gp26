import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSelection() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const force = params.get("force");
    
    if (!force) {
      const savedLanguage = localStorage.getItem('preferred_language');
      if (savedLanguage) {
        navigate(createPageUrl("Home") + `?lang=${savedLanguage}`);
      }
    }

    // Check dark mode
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    // Listen for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, [navigate]);

  const selectLanguage = (lang) => {
    localStorage.setItem('preferred_language', lang);
    navigate(createPageUrl("Home") + `?lang=${lang}`);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-red-50 via-white to-yellow-50'
    }`}>
      <Card className={`max-w-md w-full p-8 shadow-2xl transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : ''
      }`}>
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
            darkMode ? 'bg-red-700' : 'bg-red-600'
          }`}>
            <Globe className="w-12 h-12 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            HKMU JCC
          </h1>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            港式美食餐廳 • 港式美食餐厅
          </p>
        </div>

        <div className="space-y-4">
          <h2 className={`text-xl font-semibold text-center mb-6 transition-colors duration-300 ${
            darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Choose Your Language<br/>
            選擇您的語言<br/>
            选择您的语言
          </h2>

          <Button
            onClick={() => selectLanguage("en")}
            size="lg"
            className={`w-full text-lg py-6 transition-all ${
              darkMode 
                ? 'bg-red-700 hover:bg-red-600' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            🇬🇧 English
          </Button>

          <Button
            onClick={() => selectLanguage("zh")}
            size="lg"
            className={`w-full text-lg py-6 transition-all ${
              darkMode 
                ? 'bg-red-700 hover:bg-red-600' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            🇭🇰 繁體中文 (Traditional Chinese)
          </Button>

          <Button
            onClick={() => selectLanguage("cn")}
            size="lg"
            className={`w-full text-lg py-6 transition-all ${
              darkMode 
                ? 'bg-red-700 hover:bg-red-600' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            🇨🇳 简体中文 (Simplified Chinese)
          </Button>
        </div>

        <div className={`mt-8 text-center text-sm transition-colors duration-300 ${
          darkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          <p>Welcome • 歡迎 • 欢迎</p>
        </div>
      </Card>
    </div>
  );
}