import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Flame, Snowflake } from "lucide-react";

const translations = {
  en: {
    chooseOne: "Choose One",
    howWould: "How would you like your drink?",
    iced: "Iced",
    hot: "Hot",
    addToCart: "Add to Cart",
    selectTemp: "Please select a temperature"
  },
  zh: {
    chooseOne: "選擇一個",
    howWould: "您想要什麼溫度的飲品？",
    iced: "凍飲",
    hot: "熱飲",
    addToCart: "加入購物車",
    selectTemp: "請選擇溫度"
  },
  cn: {
    chooseOne: "选择一个",
    howWould: "您想要什么温度的饮品？",
    iced: "冰饮",
    hot: "热饮",
    addToCart: "加入购物车",
    selectTemp: "请选择温度"
  }
};

export default function TemperatureModal({ item, language, onClose, onConfirm }) {
  const [temperature, setTemperature] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const handleConfirm = () => {
    if (!temperature) return;
    onConfirm(item, temperature);
    onClose();
  };

  const getItemName = () => {
    if (language === "cn") return item.name_cn || item.name_zh;
    if (language === "zh") return item.name_zh;
    return item.name_en;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className={`sticky top-0 border-b p-4 flex justify-between items-center rounded-t-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>
            {t.chooseOne}
          </h2>
          <button onClick={onClose} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <Card className={`p-4 border-gray-200 mb-6 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>
            <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : ''}`}>
              {getItemName()}
            </h3>
            <p className="text-red-600 font-bold">${item.price}</p>
          </Card>

          <p className={`text-center mb-6 ${darkMode ? 'text-gray-300' : ''}`}>
            {t.howWould}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setTemperature('iced')}
              className={`p-6 rounded-lg border-2 transition-all ${
                temperature === 'iced'
                  ? "border-blue-600 bg-blue-50"
                  : darkMode
                    ? "border-gray-600 hover:border-blue-300 bg-gray-700"
                    : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <Snowflake className={`w-12 h-12 mx-auto mb-3 ${
                temperature === 'iced' ? "text-blue-600" : darkMode ? "text-gray-400" : "text-gray-400"
              }`} />
              <p className={`font-bold text-lg ${
                temperature === 'iced' ? "text-blue-600" : darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {t.iced}
              </p>
            </button>

            <button
              onClick={() => setTemperature('hot')}
              className={`p-6 rounded-lg border-2 transition-all ${
                temperature === 'hot'
                  ? "border-red-600 bg-red-50"
                  : darkMode
                    ? "border-gray-600 hover:border-red-300 bg-gray-700"
                    : "border-gray-200 hover:border-red-300"
              }`}
            >
              <Flame className={`w-12 h-12 mx-auto mb-3 ${
                temperature === 'hot' ? "text-red-600" : darkMode ? "text-gray-400" : "text-gray-400"
              }`} />
              <p className={`font-bold text-lg ${
                temperature === 'hot' ? "text-red-600" : darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {t.hot}
              </p>
            </button>
          </div>

          {temperature && (
            <Button
              onClick={handleConfirm}
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {t.addToCart}
            </Button>
          )}

          {!temperature && (
            <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.selectTemp}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}