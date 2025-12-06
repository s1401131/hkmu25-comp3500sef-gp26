import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request body for optional filters
        const body = await req.json().catch(() => ({}));
        const { date_from, date_to, status_filter } = body;

        // Fetch all orders using service role for admin access
        let orders = await base44.asServiceRole.entities.Order.list();

        // Apply filters if provided
        if (date_from) {
            orders = orders.filter(order => new Date(order.created_date) >= new Date(date_from));
        }
        if (date_to) {
            orders = orders.filter(order => new Date(order.created_date) <= new Date(date_to));
        }
        if (status_filter) {
            orders = orders.filter(order => order.status === status_filter);
        }

        // Analyze item frequency
        const itemStats = {};
        let totalOrders = orders.length;
        let totalRevenue = 0;
        let totalItems = 0;

        orders.forEach(order => {
            totalRevenue += order.total || 0;
            
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const itemId = item.menu_item_id || item.name_en;
                    const quantity = item.quantity || 1;
                    totalItems += quantity;
                    
                    if (!itemStats[itemId]) {
                        itemStats[itemId] = {
                            item_id: itemId,
                            name_en: item.name_en,
                            name_zh: item.name_zh,
                            times_ordered: 0,
                            total_quantity: 0,
                            total_revenue: 0,
                            price: item.price
                        };
                    }
                    
                    itemStats[itemId].times_ordered += 1;
                    itemStats[itemId].total_quantity += quantity;
                    itemStats[itemId].total_revenue += (item.price * quantity);
                });
            }
        });

        // Convert to array and sort by popularity
        const popularItems = Object.values(itemStats)
            .sort((a, b) => b.total_quantity - a.total_quantity);

        // Calculate category statistics
        const categoryStats = {};
        popularItems.forEach(item => {
            // Try to determine category from item name or use 'other'
            let category = 'other';
            const nameLower = item.name_en.toLowerCase();
            
            if (nameLower.includes('tea') || nameLower.includes('coffee')) {
                category = 'drinks';
            } else if (nameLower.includes('toast') || nameLower.includes('sandwich')) {
                category = 'breakfast';
            } else if (nameLower.includes('rice') || nameLower.includes('noodle')) {
                category = 'lunch';
            } else if (nameLower.includes('cake') || nameLower.includes('dessert')) {
                category = 'dessert';
            }
            
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    category: category,
                    total_quantity: 0,
                    total_revenue: 0,
                    item_count: 0
                };
            }
            
            categoryStats[category].total_quantity += item.total_quantity;
            categoryStats[category].total_revenue += item.total_revenue;
            categoryStats[category].item_count += 1;
        });

        // Order type statistics
        const orderTypeStats = {
            dine_in: orders.filter(o => o.order_type === 'dine_in').length,
            take_away: orders.filter(o => o.order_type === 'take_away').length
        };

        // Status statistics
        const statusStats = {
            stage_1: orders.filter(o => o.status === 'stage_1').length,
            stage_2: orders.filter(o => o.status === 'stage_2').length,
            stage_3: orders.filter(o => o.status === 'stage_3').length,
            ready: orders.filter(o => o.status === 'ready').length,
            completed: orders.filter(o => o.status === 'completed').length
        };

        // Payment method statistics
        const paymentStats = {};
        orders.forEach(order => {
            const method = order.payment_method || 'unknown';
            paymentStats[method] = (paymentStats[method] || 0) + 1;
        });

        // Calculate average order value
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return Response.json({
            success: true,
            summary: {
                total_orders: totalOrders,
                total_revenue: parseFloat(totalRevenue.toFixed(2)),
                total_items_sold: totalItems,
                average_order_value: parseFloat(averageOrderValue.toFixed(2)),
                date_range: {
                    from: date_from || 'all time',
                    to: date_to || 'present'
                }
            },
            popular_items: popularItems.map((item, index) => ({
                rank: index + 1,
                ...item,
                total_revenue: parseFloat(item.total_revenue.toFixed(2))
            })),
            top_5_items: popularItems.slice(0, 5).map((item, index) => ({
                rank: index + 1,
                name_en: item.name_en,
                name_zh: item.name_zh,
                total_quantity: item.total_quantity,
                total_revenue: parseFloat(item.total_revenue.toFixed(2))
            })),
            category_stats: Object.values(categoryStats).map(cat => ({
                ...cat,
                total_revenue: parseFloat(cat.total_revenue.toFixed(2))
            })),
            order_type_stats: orderTypeStats,
            status_stats: statusStats,
            payment_method_stats: paymentStats
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});