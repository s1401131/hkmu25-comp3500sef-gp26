import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, ChefHat, Package, Bell, User, Phone, CreditCard, Utensils, Calendar, CheckCircle2 } from "lucide-react";

const translations = {
  en: {
    back: "Back",
    orderStatus: "Order Status",
    orderReceived: "Order Received",
    preparing: "Preparing",
    finalizing: "Finalizing",
    readyPickUp: "Ready to Pick Up",
    completed: "Completed",
    orderReady: "🎉 Your order is ready! Please collect it.",
    orderCompleted: "✓ Order has been completed. Thank you!",
    customerDetails: "Customer Details",
    paid: "Paid",
    orderItems: "Order Items",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total"
  },
  zh: {
    back: "返回",
    orderStatus: "訂單狀態",
    orderReceived: "已接單",
    preparing: "準備中",
    finalizing: "最後準備",
    readyPickUp: "可以取餐",
    completed: "已完成",
    orderReady: "🎉 您的訂單已準備好！請取餐。",
    orderCompleted: "✓ 訂單已完成。謝謝！",
    customerDetails: "客戶資料",
    paid: "已付款",
    orderItems: "訂單項目",
    orderSummary: "訂單摘要",
    subtotal: "小計",
    discount: "折扣",
    total: "總計"
  },
  cn: {
    back: "返回",
    orderStatus: "订单状态",
    orderReceived: "已接单",
    preparing: "准备中",
    finalizing: "最后准备",
    readyPickUp: "可以取餐",
    completed: "已完成",
    orderReady: "🎉 您的订单已准备好！请取餐。",
    orderCompleted: "✓ 订单已完成。谢谢！",
    customerDetails: "客户资料",
    paid: "已付款",
    orderItems: "订单项目",
    orderSummary: "订单摘要",
    subtotal: "小计",
    discount: "折扣",
    total: "总计"
  }
};

export default function OrderDetail() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get("orderId") || "");
    setLanguage(params.get("lang") || localStorage.getItem('preferred_language') || "en");

    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId,
    refetchInterval: 3000,
  });

  const formatHKTime = (dateString) => {
    const date = new Date(dateString);
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const utcDate = date.getUTCDate();
    const utcMonth = date.getUTCMonth();
    const utcYear = date.getUTCFullYear();
    
    let hkHours = utcHours + 16;
    let hkDate = utcDate;
    let hkMonth = utcMonth;
    let hkYear = utcYear;
    
    if (hkHours >= 24) {
      hkHours = hkHours % 24;
      hkDate += 1;
      
      const daysInMonth = new Date(hkYear, hkMonth + 1, 0).getDate(); 
      if (hkDate > daysInMonth) {
        hkDate = 1;
        hkMonth += 1;
        
        if (hkMonth > 11) {
          hkMonth = 0;
          hkYear += 1;
        }
      }
    }
    
    const month = String(hkMonth + 1).padStart(2, '0');
    const day = String(hkDate).padStart(2, '0');
    const hours = String(hkHours).padStart(2, '0');
    const minutes = String(utcMinutes).padStart(2, '0');
    
    return `${day}/${month}/${hkYear} ${hours}:${minutes}`;
  };

  const statusSteps = [
    { id: "stage_1", icon: Clock },
    { id: "stage_2", icon: ChefHat },
    { id: "stage_3", icon: Package },
    { id: "ready", icon: Bell },
    { id: "completed", icon: CheckCircle2 }
  ];

  const paymentMethodLabels = {
    alipay: { en: "Alipay", zh: "支付寶", cn: "支付宝" },
    wechat: { en: "WeChat Pay", zh: "微信支付", cn: "微信支付" },
    paypal: { en: "PayPal", zh: "PayPal", cn: "PayPal" },
    credit_card: { en: "Credit Card", zh: "信用卡", cn: "信用卡" },
    cash: { en: "Cash", zh: "現金", cn: "现金" }
  };

  const orderTypeLabels = {
    dine_in: { en: "Dine In", zh: "堂食", cn: "堂食" },
    take_away: { en: "Take Away", zh: "外賣", cn: "外卖" }
  };

  const getItemName = (item) => {
    if (language === "cn") return item.name_cn || item.name_zh;
    if (language === "zh") return item.name_zh;
    return item.name_en;
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.id === order.status);

  return (
    <div className={`min-h-screen pb-8 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <div className={`shadow-md sticky top-0 z-40 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home") + `?lang=${language}`)}
            className={`flex items-center gap-2 ${darkMode ? 'text-white hover:bg-gray-700' : ''}`}
          >
            <ArrowLeft className="w-5 h-5" />
            {t.back}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className={`p-6 mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">{order.order_number}</h1>
              <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatHKTime(order.created_date)}</span>
              </div>
            </div>
            <Badge className="text-lg px-4 py-2">
              {orderTypeLabels[order.order_type]?.[language] || orderTypeLabels[order.order_type]?.en}
            </Badge>
          </div>

          <div className="mt-6">
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
                    stage_1: t.orderReceived,
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
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg animate-pulse">
                <p className="text-lg font-bold text-green-700 text-center">
                  {t.orderReady}
                </p>
              </div>
            )}

            {order.status === "completed" && (
              <div className={`mt-6 p-4 border-2 rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                <p className={`text-lg font-bold text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.orderCompleted}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className={`p-6 mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : ''}`}>
            {t.customerDetails}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${darkMode ? 'text-gray-300' : ''}`}>{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${darkMode ? 'text-gray-300' : ''}`}>{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${darkMode ? 'text-gray-300' : ''}`}>
                {paymentMethodLabels[order.payment_method]?.[language] || paymentMethodLabels[order.payment_method]?.en}
              </span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {t.paid}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Utensils className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`font-medium ${darkMode ? 'text-gray-300' : ''}`}>
                {orderTypeLabels[order.order_type]?.[language] || orderTypeLabels[order.order_type]?.en}
              </span>
            </div>
          </div>
        </Card>

        <Card className={`p-6 mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : ''}`}>
            {t.orderItems}
          </h2>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex-1">
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {getItemName(item)}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    ${item.price} × {item.quantity}
                  </p>
                </div>
                <span className="text-red-600 font-bold text-lg">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className={`p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : ''}`}>
            {t.orderSummary}
          </h2>
          <div className="space-y-3">
            <div className={`flex justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{t.subtotal}</span>
              <span>${order.subtotal?.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t.discount}</span>
                <span>-${order.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className={`flex justify-between text-2xl font-bold text-red-600 pt-3 border-t ${darkMode ? 'border-gray-700' : ''}`}>
              <span>{t.total}</span>
              <span>${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}