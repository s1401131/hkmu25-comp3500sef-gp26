
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"; // Added
import { createPageUrl } from "@/utils"; // Added
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, ChefHat, Package, Bell, Phone, User, X, AlertCircle, Search, Filter, RefreshCw, Copy, CheckCircle2, Trash2, Utensils, ShieldAlert } from "lucide-react"; // Added ShieldAlert
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Restaurant() {
  const navigate = useNavigate(); // Added
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [reorderDialog, setReorderDialog] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const previousOrderIds = useRef(new Set());
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null); // Added
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Added

  // Added useEffect for authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Redirect if not admin
        if (!currentUser || currentUser.role !== 'admin') {
          navigate(createPageUrl("Home") + `?lang=${localStorage.getItem('preferred_language') || 'en'}`);
        }
      } catch (error) {
        // If there's an error (e.g., not logged in or session expired), redirect to home
        navigate(createPageUrl("Home") + `?lang=${localStorage.getItem('preferred_language') || 'en'}`);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    
    checkAuth();
  }, [navigate]); // navigate is a dependency

  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['restaurantOrders'],
    queryFn: () => base44.entities.Order.list("-created_date"),
    refetchInterval: 3000,
    enabled: !isLoadingAuth && user && user.role === 'admin', // Enabled only if authenticated as admin
  });

  useEffect(() => {
    // Only proceed if orders are loaded and user is an admin
    if (isLoadingAuth || !user || user.role !== 'admin' || !orders || orders.length === 0) return;

    const currentOrderIds = new Set(orders.map(o => o.id));
    
    const newOrders = orders.filter(order => 
      !previousOrderIds.current.has(order.id) && 
      order.status === 'stage_1'
    );

    if (newOrders.length > 0 && previousOrderIds.current.size > 0) {
      const newOrder = newOrders[0];
      setNotification({
        orderNumber: newOrder.order_number,
        customerName: newOrder.customer_name,
        itemCount: newOrder.items?.length || 0,
        orderType: newOrder.order_type
      });

      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSBAJT6Lg77BgGwc3jtPy0HwyBSp7yPDajkMKFl226+ytWRIJRJziw');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}

      setTimeout(() => setNotification(null), 10000);
    }

    previousOrderIds.current = currentOrderIds;
  }, [orders, isLoadingAuth, user]); // Added isLoadingAuth, user as dependencies

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status }) => 
      base44.entities.Order.update(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId) => base44.entities.Order.delete(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] });
      setDeleteDialog(null);
    },
  });

  const createReorderMutation = useMutation({
    mutationFn: (orderData) => base44.entities.Order.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] });
      setReorderDialog(null);
    },
  });

  const formatHKTime = (dateString) => {
    const date = new Date(dateString);
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const utcDate = date.getUTCDate();
    const utcMonth = date.getUTCMonth();
    const utcYear = date.getUTCFullYear();
    
    // Add 8 hours for HKT (UTC+8)
    let hkHours = utcHours + 16; // dont move this raw
    let hkDate = utcDate;
    let hkMonth = utcMonth;
    let hkYear = utcYear;
    
    // Handle day overflow
    if (hkHours >= 24) {
      hkHours = hkHours % 24;
      hkDate += 1;
      
      // Handle month overflow
      const daysInMonth = new Date(hkYear, hkMonth + 1, 0).getDate(); 
      if (hkDate > daysInMonth) {
        hkDate = 1;
        hkMonth += 1;
        
        // Handle year overflow
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
    stage_1: { 
      icon: Clock, 
      label: "Stage 1 - Received",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      next: "stage_2",
      sortOrder: 1
    },
    stage_2: { 
      icon: ChefHat, 
      label: "Stage 2 - Preparing",
      color: "bg-orange-100 text-orange-700 border-orange-300",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
      next: "stage_3",
      sortOrder: 2
    },
    stage_3: { 
      icon: Package, 
      label: "Stage 3 - Finalizing",
      color: "bg-purple-100 text-purple-700 border-purple-300",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      next: "ready",
      sortOrder: 3
    },
    ready: { 
      icon: Bell, 
      label: "Ready to Pick Up",
      color: "bg-green-100 text-green-700 border-green-300",
      buttonColor: "bg-green-600 hover:bg-green-700",
      next: "completed",
      sortOrder: 4
    },
    completed: { 
      icon: CheckCircle2, 
      label: "Completed",
      color: "bg-gray-100 text-gray-700 border-gray-300",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
      next: null,
      sortOrder: 5
    }
  };

  const updateStatus = (orderId, currentStatus) => {
    const nextStatus = statusConfig[currentStatus]?.next;
    if (nextStatus) {
      updateOrderMutation.mutate({ orderId, status: nextStatus });
    }
  };

  const handleReorder = (order) => {
    setReorderDialog(order);
  };

  const handleDelete = (order) => {
    setDeleteDialog(order);
  };

  const confirmDelete = () => {
    if (deleteDialog) {
      deleteOrderMutation.mutate(deleteDialog.id);
    }
  };

  const confirmReorder = () => {
    if (!reorderDialog) return;
    
    const orderNumber = "HK" + Date.now().toString().slice(-6);
    const orderData = {
      order_number: orderNumber,
      customer_name: reorderDialog.customer_name,
      customer_phone: reorderDialog.customer_phone,
      items: reorderDialog.items,
      subtotal: reorderDialog.subtotal,
      discount: 0,
      total: reorderDialog.subtotal,
      order_type: reorderDialog.order_type,
      payment_method: reorderDialog.payment_method,
      payment_status: "pending",
      status: "stage_1"
    };
    
    createReorderMutation.mutate(orderData);
  };

  // Show loading state while checking authentication
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If not admin, show access denied (shouldn't reach here due to redirect but good for safety)
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">This page is only accessible to administrators.</p>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Filter orders by status
  let filteredOrders = orders;

  // Apply status filter
  if (filter === "active") {
    filteredOrders = filteredOrders.filter(o => o.status !== "ready" && o.status !== "completed");
  } else if (filter !== "all") {
    filteredOrders = filteredOrders.filter(o => o.status === filter);
  }

  // Apply order type filter
  if (orderTypeFilter !== "all") {
    filteredOrders = filteredOrders.filter(o => o.order_type === orderTypeFilter);
  }

  // Apply time filter
  const now = Date.now();
  if (timeFilter === "today") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    filteredOrders = filteredOrders.filter(o => new Date(o.created_date) >= todayStart);
  } else if (timeFilter === "last_hour") {
    filteredOrders = filteredOrders.filter(o => new Date(o.created_date) > new Date(now - 60 * 60 * 1000));
  } else if (timeFilter === "last_2_hours") {
    filteredOrders = filteredOrders.filter(o => new Date(o.created_date) > new Date(now - 2 * 60 * 60 * 1000));
  }

  // Apply search filter
  if (searchQuery) {
    filteredOrders = filteredOrders.filter(o => 
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone?.includes(searchQuery)
    );
  }

  // Sort orders by status priority and time
  filteredOrders = [...filteredOrders].sort((a, b) => {
    const statusDiff = statusConfig[a.status].sortOrder - statusConfig[b.status].sortOrder;
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const newOrdersCount = orders.filter(o => o.status === 'stage_1').length;
  const activeOrdersCount = orders.filter(o => o.status !== 'ready' && o.status !== 'completed').length;
  const dineInCount = orders.filter(o => o.order_type === 'dine_in').length;
  const takeAwayCount = orders.filter(o => o.order_type === 'take_away').length;

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? 'text-white' : ''}`}>
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top">
          <Card className={`p-5 shadow-2xl border-2 min-w-[350px] ${
            darkMode 
              ? 'bg-gray-800 border-orange-500' 
              : 'bg-orange-50 border-orange-400'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-orange-900' : 'bg-orange-100'}`}>
                  <AlertCircle className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'} animate-pulse`} />
                </div>
                <div>
                  <p className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-orange-900'}`}>🔔 New Order!</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>{notification.orderNumber}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-orange-600'}`}>
                    {notification.customerName} • {notification.itemCount} items
                  </p>
                  <Badge className="mt-1" variant="outline">
                    {notification.orderType === "dine_in" ? "🍽️ Dine In" : "📦 Take Away"}
                  </Badge>
                </div>
              </div>
              <button onClick={() => setNotification(null)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-orange-400 hover:text-orange-600'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Restaurant Dashboard</h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>廚房訂單管理系統</p>
          </div>
          <div className="flex items-center gap-4">
            {newOrdersCount > 0 && (
              <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-lg border-2 border-orange-400 animate-pulse">
                <Bell className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-900">{newOrdersCount} New</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg border-2 border-blue-300">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-900">{activeOrdersCount} Active</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2 lg:col-span-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <Input
                placeholder="Search order #, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
              />
            </div>

            {/* Status Filter */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="active">Active Orders ({activeOrdersCount})</SelectItem>
                <SelectItem value="stage_1">Stage 1 - Received</SelectItem>
                <SelectItem value="stage_2">Stage 2 - Preparing</SelectItem>
                <SelectItem value="stage_3">Stage 3 - Finalizing</SelectItem>
                <SelectItem value="ready">Ready for Pickup</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Order Type Filter */}
            <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
              <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  <SelectValue placeholder="Order Type" />
                </div>
              </SelectTrigger>
              <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dine_in">🍽️ Dine In ({dineInCount})</SelectItem>
                <SelectItem value="take_away">📦 Take Away ({takeAwayCount})</SelectItem>
              </SelectContent>
            </Select>

            {/* Time Filter */}
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <SelectValue placeholder="Time" />
                </div>
              </SelectTrigger>
              <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last_hour">Last Hour</SelectItem>
                <SelectItem value="last_2_hours">Last 2 Hours</SelectItem>
                <SelectItem value="today">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Active Filters Summary */}
          {(searchQuery || filter !== "all" || orderTypeFilter !== "all" || timeFilter !== "all") && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="outline" className="gap-1">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Status: {filter === "active" ? "Active" : statusConfig[filter]?.label?.split(" - ")[0] || filter}
                    <button onClick={() => setFilter("all")} className="ml-1 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {orderTypeFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Type: {orderTypeFilter === "dine_in" ? "Dine In" : "Take Away"}
                    <button onClick={() => setOrderTypeFilter("all")} className="ml-1 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {timeFilter !== "all" && (
                  <Badge variant="outline" className="gap-1">
                    Time: {timeFilter === "today" ? "Today" : timeFilter === "last_hour" ? "Last Hour" : "Last 2 Hours"}
                    <button onClick={() => setTimeFilter("all")} className="ml-1 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("all");
                    setOrderTypeFilter("all");
                    setTimeFilter("all");
                  }}
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className={`p-12 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <Filter className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No orders match your filters</p>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try adjusting your search or filter criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setFilter("all");
              setOrderTypeFilter("all");
              setTimeFilter("all");
            }}
            className={`mt-4 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
          >
            Clear All Filters
          </Button>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{filteredOrders.length}</span> of <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{orders.length}</span> orders
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] })}
              className={`gap-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => {
              const config = statusConfig[order.status];
              const Icon = config.icon;
              const nextConfig = config.next ? statusConfig[config.next] : null;
              const isNew = order.status === 'stage_1' && 
                          new Date(order.created_date) > new Date(Date.now() - 60000);
              
              return (
                <Card key={order.id} className={`p-6 hover:shadow-xl transition-shadow ${isNew ? 'ring-2 ring-orange-400 animate-pulse' : ''} ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-red-600">
                          {order.order_number}
                        </h3>
                        {isNew && (
                          <Badge className="bg-orange-500 text-white animate-bounce">NEW</Badge>
                        )}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatHKTime(order.created_date)}
                      </p>
                    </div>
                    <Badge className={`${config.color} border flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {config.label.split(" - ")[0]}
                    </Badge>
                  </div>

                  <div className={`rounded-lg p-3 mb-4 space-y-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 text-sm">
                      <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : ''}`}>{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={darkMode ? 'text-gray-200' : ''}>{order.customer_phone}</span>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {order.order_type === "dine_in" ? "🍽️ Dine In" : "📦 Take Away"}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Items:</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className={`flex justify-between text-sm p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white'}`}>
                          <span className="font-medium">
                            {item.name_en}
                            <span className={darkMode ? 'text-gray-400 ml-2' : 'text-gray-500 ml-2'}>x{item.quantity}</span>
                          </span>
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`flex justify-between font-bold text-lg mt-3 pt-3 border-t ${darkMode ? 'border-gray-600' : ''}`}>
                      <span className={darkMode ? 'text-white' : ''}>Total:</span>
                      <span className="text-red-600">${order.total?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {config.next ? (
                      <Button
                        onClick={() => updateStatus(order.id, order.status)}
                        className={`w-full ${nextConfig?.buttonColor || 'bg-red-600 hover:bg-red-700'}`}
                        disabled={updateOrderMutation.isPending}
                      >
                        {updateOrderMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        {order.status === 'ready' ? 'Mark as Finished' : `Move to ${statusConfig[config.next].label.split(" - ")[0]}`}
                      </Button>
                    ) : (
                      <div className={`text-center py-3 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                        <p className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>✓ Order Completed</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleReorder(order)}
                        variant="outline"
                        className={`w-full ${darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}`}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Reorder
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(order)}
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Reorder Dialog */}
      <Dialog open={!!reorderDialog} onOpenChange={() => setReorderDialog(null)}>
        <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>Quick Reorder</DialogTitle>
            <DialogDescription className={darkMode ? 'text-gray-400' : ''}>
              Create a new order with the same items for this customer?
            </DialogDescription>
          </DialogHeader>
          
          {reorderDialog && (
            <div className="space-y-4">
              <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>{reorderDialog.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>{reorderDialog.customer_phone}</span>
                </div>
              </div>

              <div>
                <h4 className={`font-semibold mb-2 text-sm ${darkMode ? 'text-gray-300' : ''}`}>Items to reorder:</h4>
                <div className="space-y-1">
                  {reorderDialog.items?.map((item, idx) => (
                    <div key={idx} className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                      <span>{item.name_en} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between font-bold mt-2 pt-2 border-t ${darkMode ? 'border-gray-600 text-white' : ''}`}>
                  <span>Total:</span>
                  <span className="text-red-600">${reorderDialog.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReorderDialog(null)} className={darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReorder}
              className="bg-red-600 hover:bg-red-700"
              disabled={createReorderMutation.isPending}
            >
              {createReorderMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle className={darkMode ? 'text-white' : ''}>Delete Order</AlertDialogTitle>
            <AlertDialogDescription className={darkMode ? 'text-gray-400' : ''}>
              Are you sure you want to delete order <span className="font-bold text-red-600">{deleteDialog?.order_number}</span>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={darkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
