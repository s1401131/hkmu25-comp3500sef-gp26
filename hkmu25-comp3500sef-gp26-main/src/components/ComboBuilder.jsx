import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";

export default function ComboBuilder({ menuItems, language, onClose, onAddToCart }) {
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedDrink, setSelectedDrink] = useState(null);

  const mainDishes = menuItems.filter(item => 
    item.category === "lunch" || item.category === "dinner"
  );
  const drinks = menuItems.filter(item => item.category === "drinks");

  const comboPrice = selectedMain && selectedDrink 
    ? (selectedMain.price + selectedDrink.price) * 0.9 // 10% discount
    : 0;

  const handleAddCombo = () => {
    if (!selectedMain || !selectedDrink) return;

    const combo = {
      id: `combo_${Date.now()}`,
      name_en: `${selectedMain.name_en} + ${selectedDrink.name_en}`,
      name_zh: `${selectedMain.name_zh} + ${selectedDrink.name_zh}`,
      price: parseFloat(comboPrice.toFixed(2)),
      category: "combo",
      isCombo: true,
      mainDish: selectedMain,
      drink: selectedDrink
    };

    onAddToCart(combo);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {language === "en" ? "Build Your Combo" : "組合您的套餐"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Main Dish Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center">1</span>
              {language === "en" ? "Choose Main Dish (Lunch/Dinner)" : "選擇主食（午餐/晚餐）"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {mainDishes.map(item => (
                <Card
                  key={item.id}
                  onClick={() => setSelectedMain(item)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedMain?.id === item.id
                      ? "ring-2 ring-red-600 bg-red-50"
                      : "hover:shadow-lg"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">
                        {language === "en" ? item.name_en : item.name_zh}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en" ? item.description_en : item.description_zh}
                      </p>
                      <p className="text-red-600 font-bold mt-2">${item.price}</p>
                    </div>
                    {selectedMain?.id === item.id && (
                      <div className="bg-red-600 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Drink Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center">2</span>
              {language === "en" ? "Choose Drink" : "選擇飲品"}
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {drinks.map(item => (
                <Card
                  key={item.id}
                  onClick={() => setSelectedDrink(item)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedDrink?.id === item.id
                      ? "ring-2 ring-red-600 bg-red-50"
                      : "hover:shadow-lg"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">
                        {language === "en" ? item.name_en : item.name_zh}
                      </h4>
                      <p className="text-red-600 font-bold mt-2">${item.price}</p>
                    </div>
                    {selectedDrink?.id === item.id && (
                      <div className="bg-red-600 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedMain && selectedDrink && (
            <Card className="p-6 bg-yellow-50 border-2 border-yellow-400">
              <h3 className="text-xl font-bold mb-4">
                {language === "en" ? "Your Combo" : "您的套餐"}
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>{language === "en" ? selectedMain.name_en : selectedMain.name_zh}</span>
                  <span>${selectedMain.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === "en" ? selectedDrink.name_en : selectedDrink.name_zh}</span>
                  <span>${selectedDrink.price}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg">
                      {language === "en" ? "Combo Total" : "套餐總價"}
                    </span>
                    <Badge className="ml-2 bg-green-500">
                      {language === "en" ? "10% OFF" : "9折優惠"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 line-through block">
                      ${(selectedMain.price + selectedDrink.price).toFixed(2)}
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      ${comboPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleAddCombo}
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {language === "en" ? "Add Combo to Cart" : "加入購物車"}
              </Button>
            </Card>
          )}

          {!selectedMain && !selectedDrink && (
            <div className="text-center text-gray-500 py-8">
              {language === "en" 
                ? "Please select a main dish and a drink to create your combo" 
                : "請選擇主食和飲品以組合套餐"}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}