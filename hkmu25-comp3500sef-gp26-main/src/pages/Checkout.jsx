import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingBag, Utensils, Receipt, CreditCard, Tag, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";

const translations = {
  en: {
    checkout: "Checkout",
    back: "Back",
    orderSummary: "Order Summary",
    qty: "Qty",
    subtotal: "Subtotal",
    discount: "Discount",
    total: "Total",
    discountCode: "Discount Code",
    enterCode: "Enter code",
    apply: "Apply",
    availableCodes: "Available codes: ",
    orderType: "Order Type",
    dineIn: "Dine In",
    takeAway: "Take Away",
    yourDetails: "Your Details",
    name: "Name",
    enterName: "Enter your name",
    phone: "Phone",
    enterPhone: "Enter phone number",
    paymentMethod: "Payment Method",
    noPaymentMethods: "No payment methods available",
    selectPayment: "Please select a payment method",
    payAndOrder: "Pay & Place Order",
    fillDetails: "Please fill in your details",
    selectPaymentAlert: "Please select a payment method",
    orderFailed: "Failed to place order",
    discountApplied: "Discount applied!",
    enterDiscountCode: "Please enter a discount code",
    invalidCode: "Invalid discount code",
    codeInactive: "This discount code is no longer active",
    codeExpired: "This discount code has expired",
    codeLimit: "This discount code has reached its usage limit",
    minPurchase: "Minimum purchase of $"
  },
  zh: {
    checkout: "結帳",
    back: "返回",
    orderSummary: "訂單摘要",
    qty: "數量",
    subtotal: "小計",
    discount: "折扣",
    total: "總計",
    discountCode: "折扣碼",
    enterCode: "輸入折扣碼",
    apply: "使用",
    availableCodes: "可用折扣碼：",
    orderType: "訂單類型",
    dineIn: "堂食",
    takeAway: "外賣",
    yourDetails: "您的資料",
    name: "姓名",
    enterName: "輸入您的姓名",
    phone: "電話",
    enterPhone: "輸入電話號碼",
    paymentMethod: "付款方式",
    noPaymentMethods: "暫無付款方式",
    selectPayment: "請選擇付款方式",
    payAndOrder: "付款並下單",
    fillDetails: "請填寫您的資料",
    selectPaymentAlert: "請選擇付款方式",
    orderFailed: "下單失敗",
    discountApplied: "折扣已套用！",
    enterDiscountCode: "請輸入折扣碼",
    invalidCode: "無效的折扣碼",
    codeInactive: "此折扣碼已失效",
    codeExpired: "此折扣碼已過期",
    codeLimit: "此折扣碼已達使用上限",
    minPurchase: "需滿 $"
  },
  cn: {
    checkout: "结账",
    back: "返回",
    orderSummary: "订单摘要",
    qty: "数量",
    subtotal: "小计",
    discount: "折扣",
    total: "总计",
    discountCode: "折扣码",
    enterCode: "输入折扣码",
    apply: "使用",
    availableCodes: "可用折扣码：",
    orderType: "订单类型",
    dineIn: "堂食",
    takeAway: "外卖",
    yourDetails: "您的资料",
    name: "姓名",
    enterName: "输入您的姓名",
    phone: "电话",
    enterPhone: "输入电话号码",
    paymentMethod: "付款方式",
    noPaymentMethods: "暂无付款方式",
    selectPayment: "请选择付款方式",
    payAndOrder: "付款并下单",
    fillDetails: "请填写您的资料",
    selectPaymentAlert: "请选择付款方式",
    orderFailed: "下单失败",
    discountApplied: "折扣已套用！",
    enterDiscountCode: "请输入折扣码",
    invalidCode: "无效的折扣码",
    codeInactive: "此折扣码已失效",
    codeExpired: "此折扣码已过期",
    codeLimit: "此折扣码已达使用上限",
    minPurchase: "需满 $"
  }
};

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState([]);
  const [language, setLanguage] = useState("en");
  const [orderType, setOrderType] = useState("dine_in");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountError, setDiscountError] = useState("");

  const t = translations[language] || translations.en;

  const { data: paymentMethods = [], isLoading: isLoadingPayments, error: paymentError } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const methods = await base44.entities.PaymentMethod.list();
      return methods.filter(m => m.active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    },
    enabled: true,
    retry: 3,
    retryDelay: 1000,
  });

  const { data: discountCodes = [] } = useQuery({
    queryKey: ['discountCodes'],
    queryFn: async () => {
      const codes = await base44.entities.DiscountCode.list();
      return codes.filter(c => c.active);
    },
    enabled: true,
  });

  const updateDiscountUsageMutation = useMutation({
    mutationFn: ({ id, times_used }) => 
      base44.entities.DiscountCode.update(id, { times_used }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discountCodes'] });
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cartData = params.get("cart");
    const lang = params.get("lang") || localStorage.getItem('preferred_language') || "en";
    if (cartData) setCart(JSON.parse(decodeURIComponent(cartData)));
    setLanguage(lang);
    
    const savedName = localStorage.getItem('customer_name');
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedName) setCustomerName(savedName);
    if (savedPhone) setCustomerPhone(savedPhone);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const getItemName = (item) => {
    if (language === "cn") return item.name_cn || item.name_zh;
    if (language === "zh") return item.name_zh;
    return item.name_en;
  };

  const getPaymentMethodName = (method) => {
    if (language === "cn") return method.name_cn || method.name_zh;
    if (language === "zh") return method.name_zh;
    return method.name_en;
  };

  const applyDiscount = async () => {
    setDiscountError("");
    setDiscount(0);
    setAppliedDiscountCode(null);

    if (!discountCode.trim()) {
      setDiscountError(t.enterDiscountCode);
      return;
    }

    const code = discountCodes.find(c => c.code.toUpperCase() === discountCode.toUpperCase());

    if (!code) {
      setDiscountError(t.invalidCode);
      return;
    }

    if (!code.active) {
      setDiscountError(t.codeInactive);
      return;
    }

    if (code.expiry_date) {
      const expiry = new Date(code.expiry_date);
      const now = new Date();
      if (expiry < now) {
        setDiscountError(t.codeExpired);
        return;
      }
    }

    if (code.usage_limit && code.times_used >= code.usage_limit) {
      setDiscountError(t.codeLimit);
      return;
    }

    if (code.min_purchase && subtotal < code.min_purchase) {
      setDiscountError(
        language === "en" 
          ? `${t.minPurchase}${code.min_purchase} required` 
          : `${t.minPurchase}${code.min_purchase} 才可使用`
      );
      return;
    }

    let discountAmount = 0;
    if (code.discount_type === "percentage") {
      discountAmount = subtotal * (code.discount_value / 100);
      if (code.max_discount && discountAmount > code.max_discount) {
        discountAmount = code.max_discount;
      }
    } else if (code.discount_type === "fixed") {
      discountAmount = code.discount_value;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    setDiscount(discountAmount);
    setAppliedDiscountCode(code);
    setDiscountError("");
  };

  const placeOrder = async () => {
    if (!customerName || !customerPhone) {
      alert(t.fillDetails);
      return;
    }

    if (!paymentMethod) {
      alert(t.selectPaymentAlert);
      return;
    }

    setIsProcessing(true);
    try {
      const orderNumber = "HK" + Date.now().toString().slice(-6);
      
      localStorage.setItem('customer_name', customerName);
      localStorage.setItem('customer_phone', customerPhone);
      
      await base44.entities.Order.create({
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart.map(item => ({
          menu_item_id: item.id,
          name_en: item.name_en,
          name_zh: item.name_zh,
          name_cn: item.name_cn || item.name_zh,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal,
        discount: discount,
        total: total,
        order_type: orderType,
        payment_method: paymentMethod,
        payment_status: "paid",
        status: "stage_1"
      });

      if (appliedDiscountCode) {
        updateDiscountUsageMutation.mutate({
          id: appliedDiscountCode.id,
          times_used: (appliedDiscountCode.times_used || 0) + 1
        });
      }

      localStorage.removeItem('cart');

      navigate(createPageUrl("OrderReceipt") + `?orderNumber=${orderNumber}&lang=${language}`);
    } catch (error) {
      alert(t.orderFailed);
    }
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {t.checkout}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 md:gap-2"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-sm md:text-base">{t.back}</span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-6">
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              {t.orderSummary}
            </h2>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center pb-3 border-b">
                  <div>
                    <p className="font-medium text-sm md:text-base">
                      {getItemName(item)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {t.qty}: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-red-600 text-sm md:text-base">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-gray-600 text-sm md:text-base">
                <span>{t.subtotal}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 text-sm md:text-base">
                  <span>
                    {t.discount}
                    {appliedDiscountCode && (
                      <span className="text-xs ml-2">({appliedDiscountCode.code})</span>
                    )}
                  </span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg md:text-xl font-bold text-red-600 pt-2 border-t">
                <span>{t.total}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 md:w-5 md:h-5" />
              {t.discountCode}
            </h2>
            <div className="flex gap-2">
              <Input
                placeholder={t.enterCode}
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value);
                  setDiscountError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    applyDiscount();
                  }
                }}
                className="text-sm md:text-base"
              />
              <Button onClick={applyDiscount} variant="outline" className="text-sm md:text-base px-3 md:px-4">
                {t.apply}
              </Button>
            </div>
            
            {discountError && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-xs md:text-sm">
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span>{discountError}</span>
              </div>
            )}
            
            {appliedDiscountCode && !discountError && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-xs md:text-sm">
                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span>
                  {t.discountApplied}
                  {appliedDiscountCode.discount_type === "percentage" 
                    ? ` ${appliedDiscountCode.discount_value}% off`
                    : ` $${appliedDiscountCode.discount_value} off`}
                </span>
              </div>
            )}
            
            {discountCodes.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {t.availableCodes}
                {discountCodes.slice(0, 3).map(c => c.code).join(", ")}
                {discountCodes.length > 3 && "..."}
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Utensils className="w-4 h-4 md:w-5 md:h-5" />
              {t.orderType}
            </h2>
            <RadioGroup value={orderType} onValueChange={setOrderType}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="dine_in" id="dine_in" />
                <Label htmlFor="dine_in" className="cursor-pointer flex-1 text-sm md:text-base">
                  {t.dineIn}
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="take_away" id="take_away" />
                <Label htmlFor="take_away" className="cursor-pointer flex-1 text-sm md:text-base">
                  {t.takeAway}
                </Label>
              </div>
            </RadioGroup>
          </Card>

          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 md:w-5 md:h-5" />
              {t.yourDetails}
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm md:text-base">{t.name}</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.enterName}
                  className="text-sm md:text-base"
                />
              </div>
              <div>
                <Label className="text-sm md:text-base">{t.phone}</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t.enterPhone}
                  className="text-sm md:text-base"
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
              {t.paymentMethod}
            </h2>
            
            {isLoadingPayments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : paymentError ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-2" />
                <p className="text-red-600 text-sm">
                  {language === "en" ? "Failed to load payment methods" : language === "zh" ? "無法載入付款方式" : "无法载入付款方式"}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-3"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })}
                >
                  {language === "en" ? "Retry" : language === "zh" ? "重試" : "重试"}
                </Button>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm md:text-base">
                {t.noPaymentMethods}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.method_id)}
                    className={`relative p-3 md:p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                      paymentMethod === method.method_id
                        ? "border-red-600 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {paymentMethod === method.method_id && (
                      <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-2">
                      {method.image_url ? (
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img 
                            src={method.image_url} 
                            alt={method.name_en}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center">
                            <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                        </div>
                      )}
                      <span className={`text-xs md:text-sm font-medium text-center ${
                        paymentMethod === method.method_id ? "text-red-600" : "text-gray-700"
                      }`}>
                        {getPaymentMethodName(method)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {!paymentMethod && paymentMethods.length > 0 && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                {t.selectPayment}
              </p>
            )}
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="flex-1 h-16 md:h-20 text-base md:text-xl py-4"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              {t.back}
            </Button>
            <Button
              onClick={placeOrder}
              disabled={isProcessing || !paymentMethod}
              size="lg"
              className="flex-1 bg-red-600 hover:bg-red-700 h-16 md:h-20 text-base md:text-xl disabled:opacity-50 px-3 md:px-4 py-4"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6 mr-2 flex-shrink-0" />
                  <span className="leading-tight">
                    {t.payAndOrder}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}