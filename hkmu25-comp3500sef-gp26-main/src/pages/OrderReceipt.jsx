import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, ChefHat, Package, Bell } from "lucide-react";

const translations = {
  en: {
    orderPlaced: "Order Placed!",
    orderNumber: "Order Number",
    orderStatus: "Order Status",
    received: "Received",
    preparing: "Preparing",
    finalizing: "Finalizing",
    readyPickUp: "Ready to Pick Up",
    completed: "Completed",
    orderReady: "🎉 Your order is ready! Please collect it.",
    orderCompleted: "✓ Order has been completed. Thank you!",
    orderDetails: "Order Details",
    total: "Total",
    backToMenu: "Back to Menu"
  },
  zh: {
    orderPlaced: "訂單已下達！",
    orderNumber: "訂單號碼",
    orderStatus: "訂單狀態",
    received: "已接單",
    preparing: "準備中",
    finalizing: "最後準備",
    readyPickUp: "可以取餐",
    completed: "已完成",
    orderReady: "🎉 您的訂單已準備好！請取餐。",
    orderCompleted: "✓ 訂單已完成。謝謝！",
    orderDetails: "訂單詳情",
    total: "總計",
    backToMenu: "返回菜單"
  },
  cn: {
    orderPlaced: "订单已下达！",
    orderNumber: "订单号码",
    orderStatus: "订单状态",
    received: "已接单",
    preparing: "准备中",
    finalizing: "最后准备",
    readyPickUp: "可以取餐",
    completed: "已完成",
    orderReady: "🎉 您的订单已准备好！请取餐。",
    orderCompleted: "✓ 订单已完成。谢谢！",
    orderDetails: "订单详情",
    total: "总计",
    backToMenu: "返回菜单"
  }
};

export default function OrderReceipt() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderNumber(params.get("orderNumber") || "");
    setLanguage(params.get("lang") || "en");

    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const { data: order } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ order_number: orderNumber });
      return orders[0];
    },
    enabled: !!orderNumber,
    refetchInterval: 3000,
  });

  const statusSteps = [
    { id: "stage_1", icon: Clock },
    { id: "stage_2", icon: ChefHat },
    { id: "stage_3", icon: Package },
    { id: "ready", icon: Bell },
    { id: "completed", icon: CheckCircle2 }
  ];

  const getItemName = (item) => {
    if (language === "cn") return item.name_cn || item.name_zh;
    if (language === "zh") return item.name_zh;
    return item.name_en;
  };

  const currentStepIndex = statusSteps.findIndex(s => s.id === order?.status);

  return (
    <div className={`container mx-auto px-4 py-8 max-w-2xl transition-colors duration-300`}>
      <Card className={`p-8 text-center transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t.orderPlaced}
        </h1>
        
        <div className="bg-red-50 rounded-lg p-6 my-6">
          <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.orderNumber}
          </p>
          <p className="text-4xl font-bold text-red-600 tracking-wider">
            {orderNumber}
          </p>
        </div>

        {order && (
          <>
            <div className="mb-8">
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : ''}`}>
                {t.orderStatus}
              </h2>
              
              <div className="relative">
                <div className={`absolute top-6 left-0 right-0 h-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
                
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const labels = {
                      stage_1: t.received,
                      stage_2: t.preparing,
                      stage_3: t.finalizing,
                      ready: t.readyPickUp,
                      completed: t.completed
                    };
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isActive ? "bg-red-600 text-white shadow-lg" : darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-red-200 scale-110" : ""}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className={`text-xs font-medium text-center max-w-[80px] ${
                          isActive ? "text-red-600" : darkMode ? "text-gray-500" : "text-gray-400"
                        }`}>
                          {labels[step.id]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.status === "ready" && (
                <div className="mt-8 p-4 bg-green-50 border-2 border-green-500 rounded-lg animate-pulse">
                  <p className="text-lg font-bold text-green-700">
                    {t.orderReady}
                  </p>
                </div>
              )}

              {order.status === "completed" && (
                <div className={`mt-8 p-4 border-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <p className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.orderCompleted}
                  </p>
                </div>
              )}
            </div>

            <div className={`text-left rounded-lg p-6 mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : ''}`}>
                {t.orderDetails}
              </h3>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                    <span>
                      {getItemName(item)} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className={`border-t pt-2 mt-2 flex justify-between font-bold ${darkMode ? 'border-gray-600 text-white' : ''}`}>
                  <span>{t.total}</span>
                  <span className="text-red-600">${order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <Button
          onClick={() => navigate(createPageUrl("Home"))}
          variant="outline"
          size="lg"
          className={`w-full ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
        >
          {t.backToMenu}
        </Button>
      </Card>
    </div>
  );
}