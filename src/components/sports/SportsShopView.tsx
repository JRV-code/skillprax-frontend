'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, ShieldCheck, Tag, Star, ArrowRight, 
  Check, Truck, Clock, RefreshCw, X, Plus, Minus, Package 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHOP_CATEGORIES = ['All', 'Equipment', 'Footwear', 'Accessories', 'Jerseys'];
const SHOP_SPORTS = ['All', 'Football', 'Cricket', 'Swimming', 'Basketball', 'Tennis'];

export function SportsShopView() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sliding Cart Drawer
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  // Orders Tab
  const [activeTab, setActiveTab] = useState<'shop' | 'orders'>('shop');
  const [orders, setOrders] = useState<any[]>([
    {
      id: 'ORD-9842',
      item: 'SKILL-TRACK Official Pro Match Football (Size 5)',
      amount: 1499,
      status: 'Shipped',
      date: 'Yesterday',
      escrowState: 'HELD IN ESCROW (Protection Active)',
    },
    {
      id: 'ORD-8812',
      item: 'AeroStream Hydrodynamic Competition Goggles',
      amount: 1299,
      status: 'Delivered',
      date: '3 days ago',
      escrowState: 'RELEASED TO VENDOR (Verified)',
    },
  ]);

  useEffect(() => {
    fetchProducts();
  }, [selectedSport, selectedCategory]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sport: selectedSport,
        category: selectedCategory,
      });

      const res = await fetch(`/api/sports/shop/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.warn('Failed to fetch shop products:', err);
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      const storedId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';

      const res = await fetch('/api/sports/shop/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedId,
          items: cartItems.map((c) => ({ productId: c.id, quantity: c.quantity })),
          totalAmount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderNotice(`Order ${data.orderId} placed! ₹${totalAmount} held in Escrow protection until delivery.`);
        setOrders((prev) => [
          {
            id: data.orderId,
            item: cartItems.map((c) => c.title).join(', '),
            amount: totalAmount,
            status: 'Processing',
            date: 'Just now',
            escrowState: 'HELD IN ESCROW (Protection Active)',
          },
          ...prev,
        ]);
        setCartItems([]);
        setCartOpen(false);
        setActiveTab('orders');
        setTimeout(() => setOrderNotice(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Protected Escrow Guarantee:</span>
          <span>Your payment sits in a protected HELD state and releases to the vendor only upon delivery confirmation.</span>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
          100% Refundable Pre-Delivery
        </span>
      </div>

      {orderNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{orderNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
            SPORTS GEAR & ACADEMY MERCHANDISE
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mt-1 tracking-tight">
            Sports Gear Marketplace ("Sports Shop")
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified equipment, match balls, studs, and official academy jerseys backed by platform escrow protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shop' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Orders & Escrow Status ({orders.length})
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ml-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart ({cartItems.reduce((a, b) => a + b.quantity, 0)})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCT CATALOG */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="p-4 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="font-mono text-slate-400 uppercase mr-1">Sport:</span>
              {SHOP_SPORTS.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSport(sp)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedSport === sp
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="font-mono text-slate-400 uppercase mr-1">Type:</span>
              {SHOP_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
            {products.map((prod) => {
              const isOfficial = prod.sellerType === 'official';

              return (
                <div
                  key={prod.id}
                  className="bg-white/95 rounded-3xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono shadow-xs ${
                        isOfficial
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-600 text-white'
                      }`}>
                        {isOfficial ? 'Sold by SKILL-TRACK' : `Sold by ${prod.vendorName || 'Verified Vendor'}`}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{prod.sport}</span>
                        <span>{prod.category}</span>
                      </div>

                      <h3 className="text-sm font-heading font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                        {prod.title}
                      </h3>

                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                        <span>★ 4.8</span>
                        <span className="text-slate-400 font-normal">(Verified Athletes)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Cart Button */}
                  <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                    <span className="text-lg font-black font-mono text-slate-900">
                      ₹{prod.price}
                    </span>

                    <button
                      onClick={() => addToCart(prod)}
                      className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT & ESCROW TRACKER */}
      {activeTab === 'orders' && (
        <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-black text-slate-900">
                Order Tracking & Escrow Protection State
              </h3>
              <p className="text-xs text-slate-500">
                Tracking lifecycle: Order Placed → Processing → Shipped → Delivered. Funds release only on delivery confirmation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {ord.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800">{ord.item}</p>
                  <p className="text-[11px] font-mono text-slate-400">{ord.date} • ₹{ord.amount}</p>
                </div>

                <div className="text-right space-y-1 sm:w-auto w-full border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{ord.escrowState}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SLIDING CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-heading font-black text-slate-900 text-base">Your Sports Cart</h3>
                  </div>
                  <button onClick={() => setCartOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.5]" />
                    <p className="text-xs">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                            <p className="text-[11px] font-mono text-emerald-700 font-bold">₹{item.price} × {item.quantity}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Subtotal:</span>
                    <span className="text-base font-mono font-black text-slate-900">₹{totalAmount}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 text-[11px] text-emerald-900 border border-emerald-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Protected by SKILL-TRACK Escrow. Refundable pre-dispatch.</span>
                  </div>

                  <button
                    disabled={checkingOut}
                    onClick={handleCheckout}
                    className="w-full py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>{checkingOut ? 'Securing Escrow Funds...' : `Pay ₹${totalAmount} via Escrow →`}</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SportsShopView;
