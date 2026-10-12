'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, Search, Filter, Sliders, Check, 
  Star, ExternalLink, Calendar, Phone, Award, ShieldCheck, 
  Map as MapIcon, List, Tag, ArrowRight, X, AlertCircle, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const SPORTS_LIST = ['Football', 'Cricket', 'Swimming', 'Basketball', 'Tennis', 'Athletics'];
const COMPETITION_LEVELS = ['All', 'District', 'State', 'National'];

export function ClubsExploreView() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [bestAlternatives, setBestAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

  // Filters
  const [selectedSport, setSelectedSport] = useState<string>('Football');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [maxFee, setMaxFee] = useState<number>(5000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [discountOnly, setDiscountOnly] = useState<boolean>(false);

  // Selected Club for Profile Modal
  const [selectedClub, setSelectedClub] = useState<any | null>(null);
  const [applyingTrial, setApplyingTrial] = useState<boolean>(false);
  const [trialSuccessNotice, setTrialSuccessNotice] = useState<string | null>(null);

  // Coordinates: default center Gandhinagar / Ahmedabad
  const [userLocation, setUserLocation] = useState({ lat: 23.2156, lng: 72.6369 });

  // Google Maps loader
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    // Attempt HTML5 geolocation
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default Gandhinagar
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [selectedSport, selectedLevel, maxDistance, maxFee, verifiedOnly, discountOnly]);

  async function fetchClubs() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sport: selectedSport,
        competitionLevel: selectedLevel,
        radiusKm: String(maxDistance),
        maxFee: String(maxFee),
        userLat: String(userLocation.lat),
        userLng: String(userLocation.lng),
        verifiedOnly: String(verifiedOnly),
        discountOnly: String(discountOnly),
      });

      const res = await fetch(`/api/sports/clubs/explore?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClubs(data.clubs || []);
        setBestAlternatives(data.bestAlternatives || []);
      }
    } catch (err) {
      console.warn('Failed to explore clubs:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApplyTrial = async (club: any) => {
    try {
      setApplyingTrial(true);
      const storedId = localStorage.getItem('skillprax_active_profile_id') || 'default-profile';

      const res = await fetch('/api/sports/scouting/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: club.id,
          playerId: storedId,
          message: `Athlete application for selection trial at ${club.club_name}`,
          trialDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (res.ok) {
        setTrialSuccessNotice(`Trial Application submitted to ${club.club_name}. Registered in your Inbox.`);
        setTimeout(() => setTrialSuccessNotice(null), 4000);
        setSelectedClub(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingTrial(false);
    }
  };

  const clearFilters = () => {
    setSelectedSport('Football');
    setSelectedLevel('All');
    setMaxDistance(30);
    setMaxFee(5000);
    setVerifiedOnly(false);
    setDiscountOnly(false);
    setSearchQuery('');
  };

  // Filter local search text
  const displayedClubs = clubs.filter((c) =>
    searchQuery === ''
      ? true
      : (c.club_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Notice Banner */}
      {trialSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-400 text-emerald-950 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{trialSuccessNotice}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
            REAL-TIME ACADEMY DISCOVERY
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mt-1 tracking-tight">
            Clubs Near Me & Verified Selection Trials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover accredited sports academies across Gandhinagar, Ahmedabad, Surat, and national hubs with verified coaching staff and direct trial applications.
          </p>
        </div>

        {/* Map / List View Toggle */}
        <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex items-center shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* FILTER SUITE */}
      <div className="p-5 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* 1. PRIMARY SPORT FILTER (STRICT SPORT-FIRST) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase mr-1 shrink-0">Sport:</span>
          {SPORTS_LIST.map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSport(sp)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSport === sp
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        {/* 2. Secondary Combinable Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search academy or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Competition Level */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium cursor-pointer"
            >
              {COMPETITION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>Level: {lvl}</option>
              ))}
            </select>
          </div>

          {/* Distance Slider */}
          <div className="flex flex-col justify-center px-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Radius:</span>
              <span className="font-mono text-emerald-700">{maxDistance} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Monthly Fee Slider */}
          <div className="flex flex-col justify-center px-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Max Fee:</span>
              <span className="font-mono text-emerald-700">₹{maxFee}/mo</span>
            </div>
            <input
              type="range"
              min={1500}
              max={6000}
              step={500}
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                verifiedOnly
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              ✓ Verified Only
            </button>
            <button
              onClick={() => setDiscountOnly(!discountOnly)}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                discountOnly
                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              🏷️ Discounts
            </button>
          </div>
        </div>

        {/* Dynamic Active Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Active Filters:</span>
          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md text-[11px] font-bold">
            Sport: {selectedSport}
          </span>
          {selectedLevel !== 'All' && (
            <span className="px-2 py-0.5 bg-sky-50 border border-sky-300 text-sky-800 rounded-md text-[11px] font-bold">
              Level: {selectedLevel}
            </span>
          )}
          <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 rounded-md text-[11px] font-bold">
            Within {maxDistance} km
          </span>
          {discountOnly && (
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-md text-[11px] font-bold">
              Special Concession Active
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors ml-auto font-bold cursor-pointer"
          >
            Clear All ✕
          </button>
        </div>
      </div>

      {/* MAP VIEW CONTAINER */}
      {viewMode === 'map' && (
        <div className="rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm bg-white h-[450px] relative">
          {apiKey && isMapLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={userLocation}
              zoom={11}
              options={{ disableDefaultUI: true, zoomControl: true }}
            >
              {displayedClubs.map((club) => (
                <MarkerF
                  key={club.id}
                  position={{ lat: Number(club.latitude), lng: Number(club.longitude) }}
                  onClick={() => setSelectedClub(club)}
                />
              ))}
            </GoogleMap>
          ) : (
            /* Graceful Visual Interactive Map Canvas */
            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>

              <div className="relative z-10 max-w-md">
                <h3 className="text-base font-bold text-slate-900">
                  Interactive Spatial Map: Gujarat & National Centers
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Active center coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)} (Gandhinagar / Ahmedabad region).
                </p>
              </div>

              {/* Custom pins simulation */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 pt-2">
                {displayedClubs.map((club) => (
                  <button
                    key={club.id}
                    onClick={() => setSelectedClub(club)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-400 text-slate-900 text-xs font-bold shadow-xs hover:bg-emerald-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{club.club_name} ({club.distanceKm}km)</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIST VIEW / RESULTS FEED */}
      {displayedClubs.length === 0 ? (
        /* BEST ALTERNATIVES FALLBACK ENGINE */
        <div className="p-8 sm:p-12 text-center bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-lg font-heading font-black text-slate-900">
              No Direct {selectedSport} Clubs within {maxDistance} km
            </h3>
            <p className="text-xs text-slate-500">
              We couldn't find matching academies within your strict distance radius. Our engine has synthesized the <strong>Best Verified Alternatives</strong> nearby:
            </p>
          </div>

          {bestAlternatives.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                RECOMMENDED BEST ALTERNATIVES (SORTED BY DISTANCE & RATING)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                {bestAlternatives.map((club) => (
                  <div
                    key={club.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition-all space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {club.sportsOffered?.[0] || selectedSport}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{club.club_name}</h4>
                        <p className="text-[11px] text-slate-500">{club.city} • {club.distanceKm} km away</p>
                      </div>
                      <span className="text-xs font-black font-mono text-emerald-700">
                        ₹{club.discountedFee || club.monthlyFee}/mo
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedClub(club)}
                      className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      View Academy Details & Apply →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD CLUB CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedClubs.map((club) => {
            const hasDiscount = Boolean(club.discountedFee);

            return (
              <div
                key={club.id}
                className="p-6 bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Sport Pill, Distance, and Verified Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60 font-mono">
                      {club.sportsOffered?.[0] || selectedSport}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{club.distanceKm} km</span>
                    </div>
                  </div>

                  {/* Club Title & City */}
                  <div>
                    <h3 className="text-base font-heading font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {club.club_name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {club.address}
                    </p>
                  </div>

                  {/* Admin Discount Badge */}
                  {hasDiscount && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>{club.discountLabel || 'Negotiated Concession Available'}</span>
                    </div>
                  )}

                  {/* Facilities Badges */}
                  <div className="flex flex-wrap gap-1">
                    {(club.facilities || []).slice(0, 3).map((f: string, fIdx: number) => (
                      <span key={fIdx} className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-200/60">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Fees and CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Monthly Admission:</span>
                    <div className="flex items-baseline gap-1.5">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm font-mono text-slate-400 line-through">
                            ₹{club.monthlyFee}
                          </span>
                          <span className="text-base font-black font-mono text-emerald-700">
                            ₹{club.discountedFee}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-black font-mono text-slate-900">
                          ₹{club.monthlyFee}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedClub(club)}
                    className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>View Club</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED CLUB PROFILE MODAL */}
      <AnimatePresence>
        {selectedClub && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black uppercase font-mono">
                      {selectedClub.competition_level || 'State'} Level
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      ✓ Verified by SKILL-TRACK
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-black mt-1">
                    {selectedClub.club_name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {selectedClub.address}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedClub(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 text-xs text-slate-700">
                {/* Timings & Contact */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Training Timings</span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedClub.timings}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Official Contact</span>
                    <p className="text-xs font-mono font-semibold text-slate-800 mt-0.5">{selectedClub.contact_phone || '+91 79 2322 4110'}</p>
                  </div>
                </div>

                {/* Coaching Staff Qualifications */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
                    Accredited Coaching Staff
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedClub.coachingStaff || []).map((staff: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{staff.name}</p>
                          <span className="text-[10px] text-slate-400">{staff.role}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {staff.license}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facilities Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
                    Facilities & Training Ground Infrastructure
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedClub.facilities || []).map((f: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-medium">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* External Website */}
                {selectedClub.website_url && (
                  <a
                    href={selectedClub.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:underline font-mono"
                  >
                    <span>Visit Official Academy Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Bottom CTA Bar */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Monthly Admission Fee:</span>
                    <span className="text-xl font-black font-mono text-emerald-700">
                      ₹{selectedClub.discountedFee || selectedClub.monthlyFee}
                    </span>
                  </div>

                  <button
                    disabled={applyingTrial}
                    onClick={() => handleApplyTrial(selectedClub)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-heading font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{applyingTrial ? 'Submitting Application...' : 'Apply for Selection Trials →'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ClubsExploreView;
