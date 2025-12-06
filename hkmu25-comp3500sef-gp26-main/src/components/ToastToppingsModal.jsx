import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Droplets, Cookie, AlertTriangle } from "lucide-react";

const translations = {
  en: {
    chooseTopping: "Choose Topping",
    selectTopping: "Choose your toast topping:",
    condensedMilk: "Condensed Milk",
    peanutButter: "Peanut Butter",
    allergyWarning: "⚠️ Allergy Warning",
    allergyText: "Contains peanuts. May cause allergic reactions.",
    addToCart: "Add to Cart",
    selectOne: "Please select a topping"
  },
  zh: {
    chooseTopping: "選擇配料",
    selectTopping: "選擇您的多士配料：",
    condensedMilk: "煉奶",
    peanutButter: "花生醬",
    allergyWarning: "⚠️ 過敏警告",
    allergyText: "含有花生。可能引起過敏反應。",
    addToCart: "加入購物車",
    selectOne: "請選擇配料"
  },
  cn: {
    chooseTopping: "选择配料",
    selectTopping: "选择您的多士配料：",
    condensedMilk: "炼奶",
    peanutButter: "花生酱",
    allergyWarning: "⚠️ 过敏警告",
    allergyText: "含有花生。可能引起过敏反应。",
    addToCart: "加入购物车",
    selectOne: "请选择配料"
  }
};

export default function ToastToppingsModal({ item, language, onClose, onConfirm }) {
  const [topping, setTopping] = useState(null);
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
    if (!topping) return;
    onConfirm(item, topping);
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
            {t.chooseTopping}
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
            {t.selectTopping}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setTopping('condensed_milk')}
              className={`p-6 rounded-lg border-2 transition-all ${
                topping === 'condensed_milk'
                  ? "border-blue-600 bg-blue-50"
                  : darkMode
                    ? "border-gray-600 hover:border-blue-300 bg-gray-700"
                    : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <Droplets className={`w-12 h-12 mx-auto mb-3 ${
                topping === 'condensed_milk' ? "text-blue-600" : darkMode ? "text-gray-400" : "text-gray-400"
              }`} />
              <p className={`font-bold text-lg ${
                topping === 'condensed_milk' ? "text-blue-600" : darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {t.condensedMilk}
              </p>
            </button>

            <button
              onClick={() => setTopping('peanut_butter')}
              className={`p-6 rounded-lg border-2 transition-all ${
                topping === 'peanut_butter'
                  ? "border-amber-600 bg-amber-50"
                  : darkMode
                    ? "border-gray-600 hover:border-amber-300 bg-gray-700"
                    : "border-gray-200 hover:border-amber-300"
              }`}
            >
              <Cookie className={`w-12 h-12 mx-auto mb-3 ${
                topping === 'peanut_butter' ? "text-amber-600" : darkMode ? "text-gray-400" : "text-gray-400"
              }`} />
              <p className={`font-bold text-lg ${
                topping === 'peanut_butter' ? "text-amber-600" : darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {t.peanutButter}
              </p>
            </button>
          </div>

          {topping === 'peanut_butter' && (
            <Card className="p-4 mb-6 bg-yellow-50 border-2 border-yellow-400">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-800 mb-1">
                    {t.allergyWarning}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {t.allergyText}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {topping && (
            <Button
              onClick={handleConfirm}
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {t.addToCart}
            </Button>
          )}

          {!topping && (
            <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.selectOne}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}