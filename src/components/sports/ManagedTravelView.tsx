'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, ShieldCheck, MapPin, Clock, Phone, 
  Check, AlertCircle, ArrowRight, X, User, PhoneCall 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ManagedTravelView() {
  const [vans, setVans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVan, setSelectedVan] = useState<any | null>(null);
  const [selectedStop, setSelectedStop] = useState<string>('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [booking, setBooking] = useState(false);
  const [bookingNotice, setBookingNotice] = useState<any | null>(null);

  // Active bookings list
  const [activeBookings, setActiveBookings] = useState<any[]>([
    {
      id: 'VAN-PASS-1092',
      routeTitle: 'Gandhinagar Sector 21 <-> Motera Stadium Sports Hub',
      driverName: 'Ramesh Bhai Patel',
      unlockedDriverPhone: '+91 98250 12345',
      pickupPoint: 'Sector 21 Circle',
      monthlyFare: 1800,
      status: 'Active Pass (Escrow Secured)',
    },
  ]);

  useEffect(() => {
    fetchVans();
  }, []);

  async function fetchVans() {
    try {
      setLoading(true);
      const res = await fetch('/api/sports/travel/vans');
      if (res.ok) {
        const data = await res.json();
        setVans(data.vans || []);
      }
    } catch (err) {
      console.warn('Failed to load travel vans:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleBookVan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVan) return;

    try {
      setBooking(true);
      const storedId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';

      const res = await fetch('/api/sports/travel/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedId,
          vanId: selectedVan.id,
          selectedStop: selectedStop || selectedVan.stops?.[0],
          durationMonths,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookingNotice(data);
        setActiveBookings((prev) => [
          {
            id: data.bookingId,
            routeTitle: selectedVan.routeTitle,
            driverName: data.driverName,
            unlockedDriverPhone: data.unlockedDriverPhone,
            pickupPoint: data.pickupPoint,
            monthlyFare: data.totalFare,
            status: 'Active Pass (Escrow Secured)',
          },
          ...prev,
        ]);
        setSelectedVan(null);
        setTimeout(() => setBookingNotice(null), 6000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Managed Club Transit & Minor Safety:</span>
          <span>Verified commercial drivers, GPS tracked routes, and live emergency guardian linking for all minor athletes.</span>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
          DL Verified
        </span>
      </div>

      {bookingNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-bold space-y-1">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{bookingNotice.message}</span>
          </div>
          <p className="font-mono text-emerald-800 text-[11px] pl-6">
            Driver Contact: {bookingNotice.unlockedDriverPhone} • Pickup: {bookingNotice.pickupPoint}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
            SECURE ACADEMY COMMUTE
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mt-1 tracking-tight">
            Managed Athlete Travel ("Managed Vans")
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Safe, driver-verified shared transit connecting Gandhinagar and Ahmedabad residential sectors directly to training grounds.
          </p>
        </div>
      </div>

      {/* ACTIVE PASSES (UNLOCKED DRIVER DETAILS) */}
      {activeBookings.length > 0 && (
        <div className="p-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
            My Active Monthly Van Passes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-emerald-300 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{b.routeTitle}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Driver:</span>
                    <span className="font-bold text-slate-800">{b.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Direct Phone (Unlocked):</span>
                    <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      <span>{b.unlockedDriverPhone}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Pickup Point: <strong>{b.pickupPoint}</strong></span>
                  <span className="font-mono">Fare: ₹{b.monthlyFare}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VAN ROUTES CATALOG */}
      <div className="space-y-4">
        <h3 className="text-sm font-heading font-black text-slate-900">
          Available Academy Transit Routes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {vans.map((van) => (
            <div
              key={van.id}
              className="p-6 bg-white/95 rounded-3xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {van.registrationNumber}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified Driver
                  </span>
                </div>

                <h3 className="text-sm font-heading font-black text-slate-900 leading-snug">
                  {van.routeTitle}
                </h3>

                {/* Driver safety protocol: DL last 4 digits only, phone masked */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Driver:</span>
                    <span className="font-bold text-slate-800">{van.driverName}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">License:</span>
                    <span className="text-slate-700 font-bold">{van.licenseMasked}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500">Driver Phone:</span>
                    <span className="text-slate-400 italic">{van.phoneMasked} (Unlocks on booking)</span>
                  </div>
                </div>

                {/* Stops */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Route Stops:</span>
                  <div className="flex flex-wrap gap-1">
                    {(van.stops || []).map((st: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        • {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Fare and Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Monthly Seat Pass:</span>
                  <span className="text-lg font-black font-mono text-emerald-700">
                    ₹{van.monthlyFare}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedVan(van);
                    setSelectedStop(van.stops?.[0] || '');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Book Seat Pass →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {selectedVan && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Book Monthly Athlete Transit Pass</h3>
                <button onClick={() => setSelectedVan(null)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                <p className="font-bold text-slate-800">{selectedVan.routeTitle}</p>
                <p className="text-slate-500 font-mono">Van: {selectedVan.registrationNumber} • Driver: {selectedVan.driverName}</p>
              </div>

              <form onSubmit={handleBookVan} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block">Select Your Boarding Stop</label>
                  <select
                    value={selectedStop}
                    onChange={(e) => setSelectedStop(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                    required
                  >
                    {(selectedVan.stops || []).map((s: string, idx: number) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block">Duration (Months)</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value={1}>1 Month (₹{selectedVan.monthlyFare})</option>
                    <option value={3}>3 Months (₹{selectedVan.monthlyFare * 3})</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Escrow money protection active. Funds held until first transit ride.</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVan(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={booking}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    {booking ? 'Securing Pass...' : `Confirm & Pay ₹${selectedVan.monthlyFare * durationMonths} →`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManagedTravelView;
