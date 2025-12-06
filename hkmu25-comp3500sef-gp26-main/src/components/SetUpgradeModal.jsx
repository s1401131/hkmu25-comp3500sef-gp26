import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Sparkles, Snowflake, Flame } from "lucide-react";

const translations = {
  en: {
    upgrade: "Upgrade to Set Meal?",
    yourSelection: "Your Selection:",
    yesUpgrade: "Yes, Upgrade!",
    noThanks: "No, Thanks",
    chooseDrink: "Choose Your Drink",
    chooseTemp: "Choose:",
    iced: "Iced",
    hot: "Hot",
    yourSetMeal: "Your Set Meal",
    setTotal: "Set Total",
    addToCart: "Add Set to Cart",
    selectTemp: "Please select a temperature",
    back: "← Back"
  },
  zh: {
    upgrade: "升級為套餐？",
    yourSelection: "您的選擇：",
    yesUpgrade: "好的，升級！",
    noThanks: "不用，謝謝",
    chooseDrink: "選擇您的飲品",
    chooseTemp: "選擇溫度",
    iced: "凍飲",
    hot: "熱飲",
    yourSetMeal: "您的套餐",
    setTotal: "套餐總價",
    addToCart: "加入購物車",
    selectTemp: "請選擇溫度",
    back: "← 返回"
  },
  cn: {
    upgrade: "升级为套餐？",
    yourSelection: "您的选择：",
    yesUpgrade: "好的，升级！",
    noThanks: "不用，谢谢",
    chooseDrink: "选择您的饮品",
    chooseTemp: "选择温度",
    iced: "冰饮",
    hot: "热饮",
    yourSetMeal: "您的套餐",
    setTotal: "套餐总价",
    addToCart: "加入购物车",
    selectTemp: "请选择温度",
    back: "← 返回"
  }
};

export default function SetUpgradeModal({ mainItem, drinks, language, onClose, onConfirm }) {
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [upgradeChoice, setUpgradeChoice] = useState(null);
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

  const needsTemperatureSelection = (drink) => {
    if (!drink) return false;
    const itemName = drink.name_en.toLowerCase();
    return itemName.includes('milk tea') || itemName.includes('lemon tea');
  };

  const handleNoThanks = () => {
    onConfirm(mainItem, null);
    onClose();
  };

  const handleConfirmSet = () => {
    if (!selectedDrink) return;
    
    let drinkToAdd = selectedDrink;
    
    if (needsTemperatureSelection(selectedDrink) && temperature) {
      const tempLabels = {
        iced: { en: "Iced", zh: "凍", cn: "冰" },
        hot: { en: "Hot", zh: "熱", cn: "热" }
      };
      const tempLabel = tempLabels[temperature][language] || tempLabels[temperature].en;
      
      drinkToAdd = {
        ...selectedDrink,
        id: `${selectedDrink.id}_${temperature}_${Date.now()}`,
        name_en: `${tempLabel} ${selectedDrink.name_en}`,
        name_zh: `${tempLabel}${selectedDrink.name_zh}`,
        name_cn: `${tempLabel}${selectedDrink.name_cn || selectedDrink.name_zh}`,
        temperature: temperature
      };
    }
    
    onConfirm(mainItem, drinkToAdd);
    onClose();
  };

  const handleDrinkSelect = (drink) => {
    setSelectedDrink(drink);
    setTemperature(null);
  };

  const drinkPrice = selectedDrink ? Math.max(0, selectedDrink.price - 5) : 0;
  const setTotal = mainItem.price + drinkPrice;
  
  const canConfirm = selectedDrink && (!needsTemperatureSelection(selectedDrink) || temperature);

  const getItemName = (item) => {
    if (language === "cn") return item.name_cn || item.name_zh;
    if (language === "zh") return item.name_zh;
    return item.name_en;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <Card className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className={`sticky top-0 border-b p-4 flex justify-between items-center rounded-t-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-lg md:text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
              {t.upgrade}
            </h2>
            <button onClick={onClose} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="p-4 md:p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <Card className={`p-3 md:p-4 border-red-200 mb-4 md:mb-6 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-red-50'}`}>
              <h3 className={`font-bold text-base md:text-lg mb-2 ${darkMode ? 'text-white' : ''}`}>
                {t.yourSelection}
              </h3>
              <div className="flex justify-between items-center">
                <span className={`font-semibold text-sm md:text-base ${darkMode ? 'text-gray-200' : ''}`}>
                  {getItemName(mainItem)}
                </span>
                <span className="text-red-600 font-bold text-sm md:text-base">${mainItem.price}</span>
              </div>
            </Card>

            {upgradeChoice === null ? (
              <div className="space-y-4">
                <p className={`text-center text-base md:text-lg mb-4 md:mb-6 ${darkMode ? 'text-gray-300' : ''}`}>
                  {language === "en" 
                    ? "Would you like to upgrade to a set meal? Add a drink for just $5!" 
                    : language === "zh"
                    ? "要升級為套餐嗎？只需$5即可添加飲品！"
                    : "要升级为套餐吗？只需$5即可添加饮品！"}
                </p>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <Button
                    onClick={() => setUpgradeChoice('yes')}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 h-16 md:h-20 text-base md:text-lg px-2 md:px-4"
                  >
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 flex-shrink-0" />
                    <span className="leading-tight">
                      {t.yesUpgrade}
                    </span>
                  </Button>
                  
                  <Button
                    onClick={handleNoThanks}
                    size="lg"
                    variant="outline"
                    className={`h-16 md:h-20 text-base md:text-lg px-2 md:px-4 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
                  >
                    <span className="leading-tight">
                      {t.noThanks}
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
                  <span className="bg-green-600 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base">✓</span>
                  {t.chooseDrink}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                  {drinks.map(drink => {
                    const discountedPrice = Math.max(0, drink.price - 5);
                    return (
                      <Card
                        key={drink.id}
                        onClick={() => handleDrinkSelect(drink)}
                        className={`p-3 md:p-4 cursor-pointer transition-all ${
                          selectedDrink?.id === drink.id
                            ? darkMode 
                              ? "ring-2 ring-green-600 bg-gray-700"
                              : "ring-2 ring-green-600 bg-green-50"
                            : darkMode
                              ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                              : "hover:shadow-lg"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-bold text-sm md:text-base ${darkMode ? 'text-white' : ''}`}>
                              {getItemName(drink)}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs md:text-sm line-through ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                ${drink.price}
                              </span>
                              <Badge className="bg-green-500 text-white text-xs">
                                -$5
                              </Badge>
                            </div>
                            <p className="text-green-600 font-bold mt-1 text-sm md:text-base">
                              ${discountedPrice}
                            </p>
                          </div>
                          {selectedDrink?.id === drink.id && (
                            <div className="bg-green-600 text-white rounded-full p-1">
                              <Check className="w-3 h-3 md:w-4 md:h-4" />
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {selectedDrink && needsTemperatureSelection(selectedDrink) && (
                  <Card className={`p-4 md:p-6 border-2 mb-4 md:mb-6 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                    <h3 className={`text-base md:text-lg font-bold mb-3 md:mb-4 ${darkMode ? 'text-white' : ''}`}>
                      {t.chooseTemp}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <button
                        onClick={() => setTemperature('iced')}
                        className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                          temperature === 'iced'
                            ? "border-blue-600 bg-blue-100"
                            : darkMode
                              ? "border-gray-600 hover:border-blue-300 bg-gray-600"
                              : "border-gray-200 hover:border-blue-300 bg-white"
                        }`}
                      >
                        <Snowflake className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                          temperature === 'iced' ? "text-blue-600" : darkMode ? "text-gray-400" : "text-gray-400"
                        }`} />
                        <p className={`font-bold text-sm md:text-base ${
                          temperature === 'iced' ? "text-blue-600" : darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {t.iced}
                        </p>
                      </button>

                      <button
                        onClick={() => setTemperature('hot')}
                        className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                          temperature === 'hot'
                            ? "border-red-600 bg-red-100"
                            : darkMode
                              ? "border-gray-600 hover:border-red-300 bg-gray-600"
                              : "border-gray-200 hover:border-red-300 bg-white"
                        }`}
                      >
                        <Flame className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                          temperature === 'hot' ? "text-red-600" : darkMode ? "text-gray-400" : "text-gray-400"
                        }`} />
                        <p className={`font-bold text-sm md:text-base ${
                          temperature === 'hot' ? "text-red-600" : darkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {t.hot}
                        </p>
                      </button>
                    </div>
                  </Card>
                )}

                {selectedDrink && canConfirm && (
                  <Card className={`p-4 md:p-6 border-2 mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-400'}`}>
                    <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${darkMode ? 'text-white' : ''}`}>
                      {t.yourSetMeal}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className={`flex justify-between text-sm md:text-base ${darkMode ? 'text-gray-300' : ''}`}>
                        <span>{getItemName(mainItem)}</span>
                        <span>${mainItem.price}</span>
                      </div>
                      <div className="flex justify-between text-green-600 text-sm md:text-base">
                        <span>
                          {needsTemperatureSelection(selectedDrink) && temperature
                            ? `${temperature === 'iced' ? t.iced : t.hot} `
                            : ""}
                          {getItemName(selectedDrink)}
                        </span>
                        <span>+${drinkPrice}</span>
                      </div>
                      <div className={`border-t pt-2 flex justify-between items-center font-bold text-base md:text-lg ${darkMode ? 'border-gray-600' : ''}`}>
                        <span className={darkMode ? 'text-white' : ''}>{t.setTotal}</span>
                        <span className="text-red-600">${setTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleConfirmSet}
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700 h-12  text-sm md:text-base"
                    >
                      {t.addToCart}
                    </Button>
                  </Card>
                )}

                {selectedDrink && !canConfirm && needsTemperatureSelection(selectedDrink) && (
                  <p className={`text-center text-xs md:text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t.selectTemp}
                  </p>
                )}

                <Button
                  onClick={() => setUpgradeChoice(null)}
                  variant="outline"
                  className={`w-full h-12 md:h-auto text-sm md:text-base ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
                >
                  {t.back}
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}