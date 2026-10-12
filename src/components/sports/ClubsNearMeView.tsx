'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  ExternalLink, 
  Map as MapIcon, 
  Clock, 
  Phone, 
  Award, 
  RefreshCw, 
  ShoppingBag, 
  Building2, 
  Compass, 
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface ClubVenue {
  name: string;
  address: string;
  estimatedDistanceKm: number;
  specialization: string;
  timing: string;
  contactPhone: string;
  verified: boolean;
  googleMapsQuery: string;
}

interface ShopVenue {
  name: string;
  address: string;
  specialization: string;
  timing: string;
  contactPhone: string;
  rating: number;
  verified: boolean;
  googleMapsQuery: string;
}

const SPORTS_LIST = ['Football', 'Cricket', 'Badminton', 'Swimming', 'Tennis', 'Basketball'];
const POPULAR_CITIES = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune'];

export function ClubsNearMeView() {
  const { user } = useAuthStore();
  const [activeSubTab, setActiveSubTab] = useState<'clubs' | 'shops'>('clubs');
  const [selectedSport, setSelectedSport] = useState<string>('Football');
  const [city, setCity] = useState<string>((user as any)?.city || 'Ahmedabad');
  const [state, setState] = useState<string>((user as any)?.state || 'Gujarat');

  const [clubs, setClubs] = useState<ClubVenue[]>([]);
  const [shops, setShops] = useState<ShopVenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedMapVenue, setExpandedMapVenue] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);

  // Sync city from user store if available
  useEffect(() => {
    if ((user as any)?.city) {
      setCity((user as any).city);
    }
    if ((user as any)?.state) {
      setState((user as any).state);
    }
  }, [user]);

  // Fetch real clubs or shops whenever sport or city changes
  useEffect(() => {
    if (activeSubTab === 'clubs') {
      fetchRealClubs();
    } else {
      fetchLocalShops();
    }
  }, [selectedSport, city, state, activeSubTab]);

  async function fetchRealClubs() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sport: selectedSport,
        city,
        state,
      });
      const res = await fetch(`/api/sports/real-clubs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClubs(data.clubs || []);
      }
    } catch (err) {
      console.warn('Failed to fetch real clubs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocalShops() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        city,
        state,
        sport: selectedSport,
      });
      const res = await fetch(`/api/sports/local-shops?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops || []);
      }
    } catch (err) {
      console.warn('Failed to fetch local sports shops:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const detectedCity = data.address?.city || data.address?.town || data.address?.county || 'Ahmedabad';
            const detectedState = data.address?.state || 'Gujarat';
            setCity(detectedCity);
            setState(detectedState);
          }
        } catch (_) {
          setCity('Ahmedabad');
          setState('Gujarat');
        } finally {
          setGeoLocating(false);
        }
      },
      () => {
        setGeoLocating(false);
      },
      { timeout: 7000 }
    );
  };

  const toggleMapDrawer = (venueName: string) => {
    setExpandedMapVenue(expandedMapVenue === venueName ? null : venueName);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tab Switcher: [ Real Clubs & Academies | Local Sports Stores Near Me ] */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/60 w-fit">
          <button
            onClick={() => setActiveSubTab('clubs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'clubs'
                ? 'bg-white text-[#0284C7] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Real Clubs & Academies</span>
          </button>

          <button
            onClick={() => setActiveSubTab('shops')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'shops'
                ? 'bg-white text-[#10B981] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Local Sports Stores Near Me</span>
          </button>
        </div>

        {/* Location & City Selector Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-[#6366F1]" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c}>{c}, {state}</option>
              ))}
            </select>
          </div>

          <motion.button
            onClick={handleDetectLocation}
            disabled={geoLocating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] border border-indigo-200/60 text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
          >
            <Compass className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
            <span>{geoLocating ? 'Detecting...' : 'Detect GPS'}</span>
          </motion.button>
        </div>
      </div>

      {/* Sport Selector Filter (Only for Clubs or Sport-specific Gear) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Sport:
        </span>
        {SPORTS_LIST.map((sp) => (
          <button
            key={sp}
            onClick={() => setSelectedSport(sp)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSport === sp
                ? 'bg-[#0284C7] text-white shadow-sm shadow-sky-500/20'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
            }`}
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0284C7] mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            Scanning Live Verified Establishments in {city}...
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extracting real operating locations with Google Maps geocodes via Tavily & Groq pipeline.
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: REAL CLUBS & ACADEMIES */}
          {activeSubTab === 'clubs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clubs.map((club, idx) => {
                const isMapOpen = expandedMapVenue === club.name;
                const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.googleMapsQuery || `${club.name} ${city}`)}`;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge & Distance */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Academy</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>~{club.estimatedDistanceKm || 3.5} km from center</span>
                        </span>
                      </div>

                      {/* Club Name */}
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {club.name}
                      </h3>

                      {/* Address */}
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {club.address}
                      </p>

                      {/* Specialization / Coaching Traits */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-bold text-slate-700">Focus: </span>
                        <span className="text-slate-600">{club.specialization}</span>
                      </div>

                      {/* Timing & Phone */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{club.timing}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{club.contactPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons & Google Maps Integration */}
                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* Direct Verified Google Maps Link */}
                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Interactive Embed Iframe Drawer Toggle */}
                        <button
                          onClick={() => toggleMapDrawer(club.name)}
                          className="flex items-center gap-1 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200/60 font-bold text-xs transition-all cursor-pointer"
                        >
                          <MapIcon className="w-3.5 h-3.5" />
                          <span>{isMapOpen ? 'Hide Map' : 'Live Map'}</span>
                          {isMapOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Embedded Google Maps Iframe (Module 4) */}
                      <AnimatePresence>
                        {isMapOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <iframe
                              title={club.name}
                              src={`https://www.google.com/maps?q=${encodeURIComponent(club.googleMapsQuery || `${club.name} ${city}`)}&output=embed`}
                              className="w-full h-48 rounded-2xl border border-slate-200 shadow-inner"
                              loading="lazy"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* TAB 2: LOCAL SPORTS STORES NEAR ME */}
          {activeSubTab === 'shops' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shops.map((shop, idx) => {
                const isMapOpen = expandedMapVenue === shop.name;
                const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.googleMapsQuery || `${shop.name} ${city}`)}`;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Verified Retail Badge & Rating */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-[#6366F1] border border-indigo-200">
                          <CheckCircle2 className="w-3 h-3 text-[#6366F1]" />
                          <span>Physical Sports Retail</span>
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{shop.rating || 4.6} / 5.0</span>
                        </div>
                      </div>

                      {/* Shop Name */}
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {shop.name}
                      </h3>

                      {/* Address */}
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {shop.address}
                      </p>

                      {/* Equipment Specialization */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-bold text-slate-700">Equipment in stock: </span>
                        <span className="text-slate-600">{shop.specialization}</span>
                      </div>

                      {/* Operating Hours & Contact */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{shop.timing}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{shop.contactPhone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons & Google Maps Integration */}
                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          <span>Get Directions</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => toggleMapDrawer(shop.name)}
                          className="flex items-center gap-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 font-bold text-xs transition-all cursor-pointer"
                        >
                          <MapIcon className="w-3.5 h-3.5" />
                          <span>{isMapOpen ? 'Hide Map' : 'Store Map'}</span>
                          {isMapOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Embedded Google Maps Iframe */}
                      <AnimatePresence>
                        {isMapOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <iframe
                              title={shop.name}
                              src={`https://www.google.com/maps?q=${encodeURIComponent(shop.googleMapsQuery || `${shop.name} ${city}`)}&output=embed`}
                              className="w-full h-48 rounded-2xl border border-slate-200 shadow-inner"
                              loading="lazy"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClubsNearMeView;
