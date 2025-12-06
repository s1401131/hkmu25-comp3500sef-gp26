import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Globe, ShoppingCart, Plus, Minus, Utensils, History, Bell, Clock, CheckCircle2, X, Search, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import SetUpgradeModal from "../components/SetUpgradeModal";
import TemperatureModal from "../components/TemperatureModal";
import ToastToppingsModal from "../components/ToastToppingsModal";

const translations = {
  en: {
    orderFood: "Order Food",
    hkt: "HKT",
    orders: "Orders",
    menu: "Menu",
    language: "Language",
    closed: "We are currently closed. Opening hours: 7:00 AM - 10:00 PM (HKT)",
    closedShort: "Restaurant is Closed",
    openingHours: "Opening hours: 7:00 AM - 10:00 PM (HKT)",
    readyToPickUp: "Ready to Pick Up!",
    yourOrderReady: "Your order is ready! Please collect it.",
    ready: "Ready!",
    yourActiveOrder: "Your Active Order",
    orderHistory: "Order History",
    noOrders: "No orders yet",
    total: "Total",
    noItems: "No items found",
    soldOut: "Sold Out",
    setAvailable: "Set Available",
    addToCart: "Add to Cart",
    addedToCart: "Added to cart!",
    yourCart: "Your Cart",
    checkout: "Checkout",
    searchMenu: "Search menu...",
    all: "All",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dessert: "Dessert",
    dinner: "Dinner",
    drinks: "Drinks",
    notAvailableNow: "Not Available Now",
    breakfastTime: "Available 7:00 AM - 10:59 AM",
    lunchTime: "Available 11:00 AM - 3:59 PM",
    dinnerTime: "Available 4:00 PM - 10:00 PM"
  },
  zh: {
    orderFood: "點餐",
    hkt: "香港時間",
    orders: "訂單",
    menu: "菜單",
    language: "語言",
    closed: "我們現已關門。營業時間：07:00 - 22:00 (香港時間)",
    closedShort: "餐廳已關門",
    openingHours: "營業時間：07:00 - 22:00 (香港時間)",
    readyToPickUp: "可以取餐！",
    yourOrderReady: "您的訂單已準備好！請取餐。",
    ready: "可取餐！",
    yourActiveOrder: "您的進行中訂單",
    orderHistory: "訂單記錄",
    noOrders: "暫無訂單記錄",
    total: "總計",
    noItems: "找不到項目",
    soldOut: "已售罄",
    setAvailable: "可升級套餐",
    addToCart: "加入購物車",
    addedToCart: "已加入購物車！",
    yourCart: "您的購物車",
    checkout: "結帳",
    searchMenu: "搜尋菜單...",
    all: "全部",
    breakfast: "早餐",
    lunch: "午餐",
    dessert: "甜品",
    dinner: "晚餐",
    drinks: "飲品",
    notAvailableNow: "現時不供應",
    breakfastTime: "供應時間 7:00 AM - 10:59 AM",
    lunchTime: "供應時間 11:00 AM - 3:59 PM",
    dinnerTime: "供應時間 4:00 PM - 10:00 PM"
  },
  cn: {
    orderFood: "点餐",
    hkt: "香港时间",
    orders: "订单",
    menu: "菜单",
    language: "语言",
    closed: "我们现已关门。营业时间：07:00 - 22:00 (香港时间)",
    closedShort: "餐厅已关门",
    openingHours: "营业时间：07:00 - 22:00 (香港时间)",
    readyToPickUp: "可以取餐！",
    yourOrderReady: "您的订单已准备好！请取餐。",
    ready: "可取餐！",
    yourActiveOrder: "您的进行中订单",
    orderHistory: "订单记录",
    noOrders: "暂无订单记录",
    total: "总计",
    noItems: "找不到项目",
    soldOut: "已售罄",
    setAvailable: "可升级套餐",
    addToCart: "加入购物车",
    addedToCart: "已加入购物车！",
    yourCart: "您的购物车",
    checkout: "结账",
    searchMenu: "搜索菜单...",
    all: "全部",
    breakfast: "早餐",
    lunch: "午餐",
    dessert: "甜品",
    dinner: "晚餐",
    drinks: "饮品",
    notAvailableNow: "现时不供应",
    breakfastTime: "供应时间 7:00 AM - 10:59 AM",
    lunchTime: "供应时间 11:00 AM - 3:59 PM",
    dinnerTime: "供应时间 4:00 PM - 10:00 PM"
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSetUpgrade, setShowSetUpgrade] = useState(false);
  const [selectedMainItem, setSelectedMainItem] = useState(null);
  const [showTemperatureModal, setShowTemperatureModal] = useState(false);
  const [selectedDrinkItem, setSelectedDrinkItem] = useState(null);
  const [showToastModal, setShowToastModal] = useState(false);
  const [selectedToastItem, setSelectedToastItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const previousOrderStatus = useRef({});
  const [cartMinimized, setCartMinimized] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const lastScrollY = useRef(0);
  const [cartPulse, setCartPulse] = useState(false);
  const [addedItemAnimation, setAddedItemAnimation] = useState(null);
  const previousOrdersList = useRef([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentHKTime, setCurrentHKTime] = useState(new Date());

  const t = translations[language] || translations.en;

  // Check if restaurant is open (GMT+8)
  const isRestaurantOpen = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const hkHours = (utcHours + 8) % 24;
    
    // Restaurant hours: 7:00 AM - 10:00 PM (HKT)
    return hkHours >= 7 && hkHours < 22;
  };

  // Check if category is available based on time
  const isCategoryAvailable = (category) => {
    if (category === 'dessert' || category === 'drinks') return true;
    
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const hkHours = (utcHours + 8) % 24;
    const hkTime = hkHours + (utcMinutes / 60);
    
    // Breakfast: 7:00 AM - 10:59 AM
    if (category === 'breakfast') {
      return hkTime >= 7 && hkTime < 11;
    }
    
    // Lunch: 11:00 AM - 3:59 PM
    if (category === 'lunch') {
      return hkTime >= 11 && hkTime < 16;
    }
    
    // Dinner: 4:00 PM - 10:00 PM
    if (category === 'dinner') {
      return hkTime >= 16 && hkTime < 22;
    }
    
    return true;
  };

  // Get current available category based on time
  const getCurrentCategory = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const hkHours = (utcHours + 8) % 24;
    const hkTime = hkHours + (utcMinutes / 60);
    
    // Breakfast: 7:00 AM - 10:59 AM
    if (hkTime >= 7 && hkTime < 11) {
      return 'breakfast';
    }
    
    // Lunch: 11:00 AM - 3:59 PM
    if (hkTime >= 11 && hkTime < 16) {
      return 'lunch';
    }
    
    // Dinner: 4:00 PM - 10:00 PM
    if (hkTime >= 16 && hkTime < 22) {
      return 'dinner';
    }
    
    return 'all';
  };

  const getCategoryTimeInfo = (category) => {
    if (category === 'breakfast') return t.breakfastTime;
    if (category === 'lunch') return t.lunchTime;
    if (category === 'dinner') return t.dinnerTime;
    return null;
  };

  const [isOpen, setIsOpen] = useState(isRestaurantOpen());

  useEffect(() => {
    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentHKTime(new Date());
      setIsOpen(isRestaurantOpen());
      
      // Auto-update category if still on "all" or if current category is no longer available
      const currentCat = getCurrentCategory();
      if (selectedCategory === "all" || !isCategoryAvailable(selectedCategory)) {
        setSelectedCategory(currentCat);
      }
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [selectedCategory]);

  const getHKTime = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const hkHours = (utcHours + 8) % 24;
    
    // Convert to 12-hour format
    const hour12 = hkHours === 0 ? 12 : hkHours > 12 ? hkHours - 12 : hkHours;
    const ampm = hkHours >= 12 ? 'PM' : 'AM';
    const minutes = String(utcMinutes).padStart(2, '0');
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang") || localStorage.getItem('preferred_language');
    
    if (!lang) {
      navigate(createPageUrl("LanguageSelection"));
      return;
    }
    
    setLanguage(lang);
    
    // Auto-select current category on load
    const currentCat = getCurrentCategory();
    setSelectedCategory(currentCat);
    
    const savedPhone = localStorage.getItem('customer_phone');
    if (savedPhone) {
      setCustomerPhone(savedPhone);
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart from localStorage:', e);
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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Scroll detection for auto-hiding search bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setShowSearchBar(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowSearchBar(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowSearchBar(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => base44.entities.MenuItem.list(),
    enabled: true,
    staleTime: 30000,
  });

  const { data: myOrders = [] } = useQuery({
    queryKey: ['myOrders', customerPhone],
    queryFn: async () => {
      if (!customerPhone) return [];
      const orders = await base44.entities.Order.filter({ customer_phone: customerPhone }, "-created_date", 10);
      return orders;
    },
    enabled: !!customerPhone,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (!myOrders || myOrders.length === 0) return;

    // Check for status changes
    myOrders.forEach(order => {
      const prevStatus = previousOrderStatus.current[order.id];
      
      if (prevStatus && prevStatus !== order.status) {
        const statusMessages = {
          stage_1: { en: "Order received!", zh: "已接收訂單！", cn: "已接收订单！" },
          stage_2: { en: "Your order is being prepared!", zh: "正在準備您的訂單！", cn: "正在准备您的订单！" },
          stage_3: { en: "Your order is almost ready!", zh: "您的訂單即將完成！", cn: "您的订单即将完成！" },
          ready: { en: "🎉 Your order is ready for pickup!", zh: "🎉 您的訂單已準備好，請取餐！", cn: "🎉 您的订单已准备好，请取餐！" },
          completed: { en: "Your order has been completed.", zh: "您的訂單已完成。", cn: "您的订单已完成。" }
        };

        const message = statusMessages[order.status];
        if (message) {
          setNotification({
            orderNumber: order.order_number,
            message: message[language] || message.en,
            status: order.status
          });

          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSBAJT6Lg77BgGwc3jtPy0HwyBSp7yPDajkMKFl226+ytWRIJRJziw');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch (e) {}

          setTimeout(() => setNotification(null), 8000);
        }
      }
      
      previousOrderStatus.current[order.id] = order.status;
    });

    // Check for deleted orders
    if (previousOrdersList.current.length > 0) {
      const currentOrderIds = new Set(myOrders.map(o => o.id));
      const deletedOrders = previousOrdersList.current.filter(prevOrder => 
        !currentOrderIds.has(prevOrder.id) &&
        prevOrder.status !== 'completed'
      );

      if (deletedOrders.length > 0) {
        const deletedOrder = deletedOrders[0];
        const cancelMessages = {
          en: "Order has been cancelled",
          zh: "訂單已被取消",
          cn: "订单已被取消"
        };
        setNotification({
          orderNumber: deletedOrder.order_number,
          message: cancelMessages[language] || cancelMessages.en,
          status: "cancelled"
        });

        setTimeout(() => setNotification(null), 6000);
      }
    }

    previousOrdersList.current = myOrders;
  }, [myOrders, language]);

  const activeOrders = myOrders.filter(order => 
    order.status !== "ready" && 
    order.status !== "completed" &&
    new Date(order.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  
  const readyOrders = myOrders.filter(order => 
    order.status === "ready" &&
    new Date(order.created_date) > new Date(Date.now() - 2 * 60 * 60 * 1000)
  );

  const categories = [
    { id: "all", label: t.all },
    { id: "breakfast", label: t.breakfast },
    { id: "lunch", label: t.lunch },
    { id: "dessert", label: t.dessert },
    { id: "dinner", label: t.dinner },
    { id: "drinks", label: t.drinks }
  ];

  const filteredItems = menuItems.filter(item => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    const searchMatch = searchQuery === "" || 
      item.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name_zh.includes(searchQuery) ||
      (item.name_cn && item.name_cn.includes(searchQuery));
    return categoryMatch && searchMatch;
  });

  const drinks = menuItems.filter(item => item.category === "drinks" && item.available);

  const needsTemperatureSelection = (item) => {
    const itemName = item.name_en.toLowerCase();
    return itemName.includes('milk tea') || itemName.includes('lemon tea');
  };

  const needsToastTopping = (item) => {
    const itemName = item.name_en.toLowerCase();
    return itemName.includes('toast');
  };

  const handleAddToCart = (item) => {
    const categoryAvailable = isCategoryAvailable(item.category);
    if (!item.available || !isOpen || !categoryAvailable) return;
    
    if (item.category === "lunch" || item.category === "dinner") {
      setSelectedMainItem(item);
      setShowSetUpgrade(true);
    } else if (needsTemperatureSelection(item)) {
      setSelectedDrinkItem(item);
      setShowTemperatureModal(true);
    } else if (needsToastTopping(item)) {
      setSelectedToastItem(item);
      setShowToastModal(true);
    } else {
      addToCart(item);
    }
  };

  const handleSetUpgradeConfirm = (mainItem, drinkItem) => {
    if (drinkItem) {
      const setMeal = {
        id: `set_${Date.now()}`,
        name_en: `${mainItem.name_en} Set (with ${drinkItem.name_en})`,
        name_zh: `${mainItem.name_zh} 套餐 (配 ${drinkItem.name_zh})`,
        name_cn: `${mainItem.name_cn || mainItem.name_zh} 套餐 (配 ${drinkItem.name_cn || drinkItem.name_zh})`,
        price: parseFloat((mainItem.price + Math.max(0, drinkItem.price - 5)).toFixed(2)),
        category: "set",
        isSet: true,
        mainDish: mainItem,
        drink: drinkItem
      };
      addToCart(setMeal);
    } else {
      addToCart(mainItem);
    }
  };

  const handleTemperatureConfirm = (item, temperature) => {
    const tempLabels = {
      iced: { en: "Iced", zh: "凍", cn: "冰" },
      hot: { en: "Hot", zh: "熱", cn: "热" }
    };
    const tempLabel = tempLabels[temperature][language] || tempLabels[temperature].en;
    
    const itemWithTemp = {
      ...item,
      id: `${item.id}_${temperature}_${Date.now()}`,
      name_en: `${tempLabel} ${item.name_en}`,
      name_zh: `${tempLabel}${item.name_zh}`,
      name_cn: `${tempLabel}${item.name_cn || item.name_zh}`,
      temperature: temperature
    };
    
    addToCart(itemWithTemp);
  };

  const handleToastToppingConfirm = (item, topping) => {
    const toppingLabels = {
      condensed_milk: { en: "with Condensed Milk", zh: "配煉奶", cn: "配炼奶" },
      peanut_butter: { en: "with Peanut Butter", zh: "配花生醬", cn: "配花生酱" }
    };
    const toppingLabel = toppingLabels[topping][language] || toppingLabels[topping].en;
    
    const itemWithTopping = {
      ...item,
      id: `${item.id}_${topping}_${Date.now()}`,
      name_en: `${item.name_en} ${toppingLabel}`,
      name_zh: `${item.name_zh} ${toppingLabel}`,
      name_cn: `${item.name_cn || item.name_zh} ${toppingLabel}`,
      topping: topping
    };
    
    addToCart(itemWithTopping);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartMinimized(true);
    
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 600);
    
    const itemName = language === "cn" ? (item.name_cn || item.name_zh) : language === "zh" ? item.name_zh : item.name_en;
    setAddedItemAnimation({
      name: itemName,
      timestamp: Date.now()
    });
    setTimeout(() => setAddedItemAnimation(null), 2000);
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.id === itemId) {
          const newQuantity = i.quantity + delta;
          return newQuantity > 0 ? { ...i, quantity: newQuantity } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const goToCheckout = () => {
    navigate(createPageUrl("Checkout") + `?cart=${encodeURIComponent(JSON.stringify(cart))}&lang=${language}`);
  };

  const changeLanguage = () => {
    navigate(createPageUrl("LanguageSelection") + "?force=true");
  };

  const viewOrderDetail = (orderId) => {
    navigate(createPageUrl("OrderDetail") + `?orderId=${orderId}&lang=${language}`);
  };

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

  const statusConfig = {
    stage_1: { icon: Clock, label: { en: "Received", zh: "已接單", cn: "已接单" }, color: "text-blue-600", bgColor: "bg-blue-50" },
    stage_2: { icon: Utensils, label: { en: "Preparing", zh: "準備中", cn: "准备中" }, color: "text-orange-600", bgColor: "bg-orange-50" },
    stage_3: { icon: CheckCircle2, label: { en: "Almost Ready", zh: "即將完成", cn: "即将完成" }, color: "text-purple-600", bgColor: "bg-purple-50" },
    ready: { icon: Bell, label: { en: "Ready!", zh: "可取餐！", cn: "可取餐！" }, color: "text-green-600", bgColor: "bg-green-50" },
    completed: { icon: CheckCircle2, label: { en: "Completed", zh: "已完成", cn: "已完成" }, color: "text-gray-600", bgColor: "bg-gray-50" },
    cancelled: { icon: X, label: { en: "Cancelled", zh: "已取消", cn: "已取消" }, color: "text-red-600", bgColor: "bg-red-50" }
  };

  const getItemName = (item) => {
    if (language === "cn") return item.name_cn || item.name_zh;
    if (language === "zh") return item.name_zh;
    return item.name_en;
  };

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : ''}`}>
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top">
          <Card className={`p-4 shadow-2xl border-2 min-w-[300px] ${
            notification.status === 'cancelled'
              ? darkMode
                ? 'bg-gray-800 border-red-500'
                : 'bg-red-50 border-red-400'
              : notification.status === 'ready'
                ? darkMode
                  ? 'bg-gray-800 border-green-500'
                  : 'bg-green-50 border-green-400'
                : darkMode
                  ? 'bg-gray-800 border-blue-500'
                  : 'bg-blue-50 border-blue-400'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  notification.status === 'cancelled'
                    ? darkMode ? 'bg-red-900' : 'bg-red-100'
                    : notification.status === 'ready'
                      ? darkMode ? 'bg-green-900' : 'bg-green-100'
                      : darkMode ? 'bg-blue-900' : 'bg-blue-100'
                }`}>
                  {notification.status === 'cancelled' ? (
                    <X className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  ) : (
                    <Bell className={`w-5 h-5 ${
                      notification.status === 'ready' 
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-blue-400' : 'text-blue-600'
                    } ${notification.status !== 'cancelled' ? 'animate-bounce' : ''}`} />
                  )}
                </div>
                <div>
                  <p className={`font-bold text-lg ${darkMode ? 'text-white' : ''}`}>{notification.orderNumber}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>{notification.message}</p>
                </div>
              </div>
              <button onClick={() => setNotification(null)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {showSetUpgrade && selectedMainItem && (
        <SetUpgradeModal
          mainItem={selectedMainItem}
          drinks={drinks}
          language={language}
          onClose={() => {
            setShowSetUpgrade(false);
            setSelectedMainItem(null);
          }}
          onConfirm={handleSetUpgradeConfirm}
        />
      )}

      {showTemperatureModal && selectedDrinkItem && (
        <TemperatureModal
          item={selectedDrinkItem}
          language={language}
          onClose={() => {
            setShowTemperatureModal(false);
            setSelectedDrinkItem(null);
          }}
          onConfirm={handleTemperatureConfirm}
        />
      )}

      {showToastModal && selectedToastItem && (
        <ToastToppingsModal
          item={selectedToastItem}
          language={language}
          onClose={() => {
            setShowToastModal(false);
            setSelectedToastItem(null);
          }}
          onConfirm={handleToastToppingConfirm}
        />
      )}

      <div className={`shadow-md sticky top-0 z-40 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h2 className={`text-lg font-semibold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.orderFood}
            </h2>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.hkt}: {getHKTime()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOrderHistory(!showOrderHistory)}
              className={`flex items-center gap-2 transition-colors duration-300 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
            >
              <History className="w-4 h-4" />
              {showOrderHistory ? t.menu : t.orders}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={changeLanguage}
              className={`flex items-center gap-2 transition-colors duration-300 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
            >
              <Globe className="w-4 h-4" />
              {t.language}
            </Button>
          </div>
        </div>
      </div>

      {!isOpen && !showOrderHistory && (
        <div className="container mx-auto px-4 py-4">
          <Alert className={`border-2 ${darkMode ? 'bg-gray-800 border-red-500' : 'bg-red-50 border-red-400'}`}>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-red-900'}`}>
              🔒 {t.closed}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {readyOrders.length > 0 && !showOrderHistory && (
        <div className="container mx-auto px-4 py-4">
          <Card 
            className="p-4 bg-green-50 border-2 border-green-500 cursor-pointer hover:shadow-lg transition-shadow animate-pulse"
            onClick={() => viewOrderDetail(readyOrders[0].id)}
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              🎉 {t.readyToPickUp}
            </h3>
            {readyOrders.slice(0, 1).map(order => {
              return (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-2xl text-green-700">{order.order_number}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.items?.slice(0, 2).map(item => getItemName(item)).join(", ")}
                      {order.items?.length > 2 && "..."}
                    </p>
                    <p className="text-sm font-semibold text-green-700 mt-2">
                      {t.yourOrderReady}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 text-white flex items-center gap-1 text-base px-3 py-1">
                      <Bell className="w-4 h-4" />
                      {t.ready}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {activeOrders.length > 0 && !showOrderHistory && (
        <div className="container mx-auto px-4 py-4">
          <Card 
            className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}
            onClick={() => viewOrderDetail(activeOrders[0].id)}
          >
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
              <Clock className="w-4 h-4" />
              {t.yourActiveOrder}
            </h3>
            {activeOrders.slice(0, 1).map(order => {
              const config = statusConfig[order.status] || statusConfig.stage_1;
              const Icon = config.icon;
              return (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-red-600">{order.order_number}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {order.items?.slice(0, 2).map(item => getItemName(item)).join(", ")}
                      {order.items?.length > 2 && "..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`flex items-center gap-1 ${config.bgColor} ${config.color}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      {config.label[language] || config.label.en}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {showOrderHistory ? (
        <div className="container mx-auto px-4 py-6">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : ''}`}>
            {t.orderHistory}
          </h2>
          {myOrders.length === 0 ? (
            <Card className={`p-12 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <History className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {t.noOrders}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myOrders.map(order => {
                const config = statusConfig[order.status] || statusConfig.stage_1;
                const Icon = config.icon;
                return (
                  <Card 
                    key={order.id} 
                    className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                    onClick={() => viewOrderDetail(order.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-xl text-red-600">{order.order_number}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatHKTime(order.created_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`flex items-center gap-1 ${config.bgColor} ${config.color}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          {config.label[language] || config.label.en}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                          <span>{getItemName(item)} x{item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {language === "en" ? `+${order.items.length - 3} more items` : `还有 ${order.items.length - 3} 项`}
                        </p>
                      )}
                    </div>
                    <div className={`flex justify-between font-bold border-t pt-2 ${darkMode ? 'border-gray-700 text-white' : ''}`}>
                      <span>{t.total}</span>
                      <span className="text-red-600">${order.total?.toFixed(2)}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={`shadow-sm sticky top-14 z-30 border-b transition-all duration-300 ${showSearchBar ? 'translate-y-0' : '-translate-y-full'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="container mx-auto px-4 py-3">
              <div className="mb-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Input
                    type="text"
                    placeholder={t.searchMenu}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
                    disabled={!isOpen}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      disabled={!isOpen}
                      className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? "bg-red-600 text-white shadow-md"
                          : darkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } ${!isOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              </div>
            ) : !isOpen ? (
              <Card className={`p-12 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <Clock className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {t.closedShort}
                </p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {t.openingHours}
                </p>
              </Card>
            ) : filteredItems.length === 0 ? (
              <Card className={`p-12 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {t.noItems}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => {
                  const categoryAvailable = isCategoryAvailable(item.category);
                  const isItemAvailable = item.available && isOpen && categoryAvailable;
                  const timeInfo = getCategoryTimeInfo(item.category);
                  
                  return (
                    <Card 
                      key={item.id} 
                      className={`overflow-hidden transition-all relative ${
                        isItemAvailable
                          ? "hover:shadow-xl cursor-pointer" 
                          : "opacity-60 cursor-not-allowed"
                      } ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                    >
                      {!isItemAvailable && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-10 flex items-center justify-center">
                          <div className="text-center px-4">
                            <Badge className="bg-gray-800 text-white text-lg px-6 py-2 mb-2">
                              {!isOpen 
                                ? (language === "en" ? "Closed" : language === "zh" ? "已關門" : "已关门")
                                : !categoryAvailable
                                  ? t.notAvailableNow
                                  : t.soldOut}
                            </Badge>
                            {!categoryAvailable && timeInfo && (
                              <p className="text-white text-xs mt-2">
                                {timeInfo}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className={`aspect-video flex items-center justify-center overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gradient-to-br from-red-100 to-yellow-100'}`}>
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name_en} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={item.image_url ? "hidden" : "flex"} style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                          <Utensils className={`w-16 h-16 ${darkMode ? 'text-gray-500' : 'text-red-300'}`} />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {getItemName(item)}
                            </h3>
                            {(item.category === "lunch" || item.category === "dinner") && isItemAvailable && (
                              <Badge className="bg-yellow-500 text-white mt-1">
                                {t.setAvailable}
                              </Badge>
                            )}
                          </div>
                          <span className="text-red-600 font-bold text-xl">
                            ${item.price}
                          </span>
                        </div>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {language === "cn" ? (item.description_cn || item.description_zh) : language === "zh" ? item.description_zh : item.description_en}
                        </p>
                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={!isItemAvailable}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t.addToCart}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {addedItemAnimation && (
        <div className="fixed top-24 right-6 z-40 animate-in slide-in-from-right">
          <Card className="p-3 shadow-xl border-2 border-green-500 bg-green-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700">
                  {t.addedToCart}
                </p>
                <p className="text-xs text-green-600 truncate max-w-[200px]">
                  {addedItemAnimation.name}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {cart.length > 0 && !showOrderHistory && cartMinimized && (
        <button
          onClick={() => setCartMinimized(false)}
          className={`fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl z-50 transition-all ${
            cartPulse ? 'animate-pulse scale-110' : ''
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className={`absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center transition-transform ${
              cartPulse ? 'scale-125' : ''
            }`}>
              {cartCount}
            </span>
          </div>
        </button>
      )}

      {cart.length > 0 && !showOrderHistory && !cartMinimized && (
        <div className={`fixed bottom-0 left-0 right-0 border-t-4 border-red-600 shadow-2xl z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="w-full px-3 md:px-4 py-3 md:py-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCartMinimized(true)}
                className={`flex items-center gap-2 transition-colors ${darkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'}`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-bold text-base md:text-lg">
                  {t.yourCart} ({cartCount})
                </span>
              </button>
              <button
                onClick={() => setCartMinimized(true)}
                className={`transition-colors p-2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`max-h-64 overflow-y-auto space-y-2 mb-3 border-t pt-3 ${darkMode ? 'border-gray-700' : ''}`}>
              {cart.map((item, idx) => (
                <div key={item.id || idx} className={`flex items-center justify-between p-2 md:p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex-1 min-w-0 mr-2">
                    <p className={`font-semibold text-sm md:text-base truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getItemName(item)}
                    </p>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-red-600 font-bold text-sm md:text-lg whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className={`flex items-center gap-1 rounded-lg p-0.5 shadow-sm ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                      <button
                        onClick={() => updateQuantity(item.id || idx, -1)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <Minus className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                      </button>
                      <span className={`w-6 md:w-8 text-center font-bold text-sm md:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id || idx, 1)}
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className={`flex items-center justify-between sm:justify-start flex-1 rounded-lg px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <span className={`text-sm md:text-base mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t.total}:
                </span>
                <span className="text-xl md:text-2xl font-bold text-red-600">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={goToCheckout}
                size="lg"
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto h-12 text-base md:text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t.checkout}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}