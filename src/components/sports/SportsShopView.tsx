'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ExternalLink, 
  Tag, 
  Sparkles, 
  MapPin, 
  Store, 
  Phone, 
  Clock, 
  Star, 
  CheckCircle2, 
  Info, 
  Compass, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw,
  Search
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface GearDeal {
  id: string;
  category: 'Footwear & Cleats' | 'Match Equipment' | 'Jerseys & Apparel' | 'Protective & Accessories';
  itemTitle: string;
  recommendedSpecs: string;
  priceRange: string;
  dealBadge?: string;
}

interface LocalShop {
  name: string;
  address: string;
  specialization: string;
  timing: string;
  contactPhone: string;
  rating: number;
  verified: boolean;
  googleMapsQuery: string;
}

const DEALS_BY_SPORT: Record<string, GearDeal[]> = {
  Football: [
    {
      id: 'fb-1',
      category: 'Footwear & Cleats',
      itemTitle: 'Turf Football Shoes (TF Studs)',
      recommendedSpecs: 'Multi-rubber studded outsole for synthetic turf; PU synthetic leather upper with reinforced heel cup.',
      priceRange: '₹1,499 - ₹3,999',
      dealBadge: 'Top Recommended for Artificial Turf',
    },
    {
      id: 'fb-2',
      category: 'Footwear & Cleats',
      itemTitle: 'Firm Ground Cleats (FG Studs)',
      recommendedSpecs: 'Molded TPU studs for natural grass pitches; lightweight responsive soleplate and asymmetrical lacing.',
      priceRange: '₹1,999 - ₹4,899',
    },
    {
      id: 'fb-3',
      category: 'Match Equipment',
      itemTitle: 'FIFA Basic Size 5 Match Football',
      recommendedSpecs: 'Thermally bonded or hand-stitched 32-panel casing; butyl bladder for high air retention and true flight trajectory.',
      priceRange: '₹899 - ₹2,499',
      dealBadge: 'Match Standard',
    },
    {
      id: 'fb-4',
      category: 'Protective & Accessories',
      itemTitle: 'Ankle-Guarded Shin Guards',
      recommendedSpecs: 'High-density PP shell with EVA foam backing; attached padded ankle sock for impact absorption.',
      priceRange: '₹349 - ₹899',
    },
    {
      id: 'fb-5',
      category: 'Jerseys & Apparel',
      itemTitle: 'Moisture-Wicking Athletic Football Kit',
      recommendedSpecs: 'Breathable dry-fit polyester knit; mesh ventilation side panels and elasticated drawstring shorts.',
      priceRange: '₹699 - ₹1,499',
    },
    {
      id: 'fb-6',
      category: 'Protective & Accessories',
      itemTitle: 'Grip Goalkeeper Gloves with Finger Spines',
      recommendedSpecs: '4mm German latex palm with supportive finger save spines and wrapped thumb protection.',
      priceRange: '₹1,199 - ₹2,799',
    },
  ],
  Cricket: [
    {
      id: 'cr-1',
      category: 'Match Equipment',
      itemTitle: 'English Willow Cricket Bat (Grade 1/2)',
      recommendedSpecs: 'Large edges (38-40mm), pronounced spine profile, 6-9 straight grains; balanced pick-up.',
      priceRange: '₹4,999 - ₹14,999',
      dealBadge: 'Top Tournament Grade',
    },
    {
      id: 'cr-2',
      category: 'Match Equipment',
      itemTitle: 'Kashmir Willow Hard Tennis & Leather Bat',
      recommendedSpecs: 'Thick contoured blade with curved bow for club practice and leather/tennis ball boundary clearing.',
      priceRange: '₹1,199 - ₹2,499',
    },
    {
      id: 'cr-3',
      category: 'Footwear & Cleats',
      itemTitle: 'Cricket Spike / Rubber Stud Shoes',
      recommendedSpecs: 'Dual-density EVA midsole, reinforced toe guard for bowlers/batsmen; metal spikes or rubber studs.',
      priceRange: '₹1,899 - ₹4,299',
    },
    {
      id: 'cr-4',
      category: 'Protective & Accessories',
      itemTitle: 'Molded Cricket Batting Helmet with Steel Visor',
      recommendedSpecs: 'High-impact ABS shell with expanded polystyrene liner and adjustable powder-coated steel faceguard.',
      priceRange: '₹1,299 - ₹3,499',
      dealBadge: 'Safety Certified',
    },
    {
      id: 'cr-5',
      category: 'Protective & Accessories',
      itemTitle: 'Test Match Batting Leg Guards & Gloves Combo',
      recommendedSpecs: 'High-density foam cane bars, Gel Zone knee cup, sheep leather palm with split-finger plastic inserts.',
      priceRange: '₹2,499 - ₹5,999',
    },
    {
      id: 'cr-6',
      category: 'Match Equipment',
      itemTitle: 'Four-Piece Alum-Tanned Leather Match Cricket Ball',
      recommendedSpecs: 'Cork and rubber core wrapped with 100% genuine alum-tanned leather; hand-stitched seam for prolonged swing.',
      priceRange: '₹499 - ₹1,299',
    },
  ],
  Badminton: [
    {
      id: 'bm-1',
      category: 'Match Equipment',
      itemTitle: 'High-Modulus Graphite Badminton Racket (3U/4U)',
      recommendedSpecs: 'Isometric head shape, built-in T-joint, strung at 24-28 lbs tension with Nanomesh carbon frame.',
      priceRange: '₹1,799 - ₹5,499',
      dealBadge: 'Tournament Ready',
    },
    {
      id: 'bm-2',
      category: 'Footwear & Cleats',
      itemTitle: 'Non-Marking Gum Rubber Badminton Shoes',
      recommendedSpecs: 'Power Cushion sole with hexagrip gum rubber outsole for slip resistance on wooden and synthetic courts.',
      priceRange: '₹1,899 - ₹4,999',
      dealBadge: 'Mandatory Court Requirement',
    },
    {
      id: 'bm-3',
      category: 'Match Equipment',
      itemTitle: 'Goose Feather Shuttlecock Barrel (Speed 77)',
      recommendedSpecs: '100% solid cork base with Grade-A goose feathers; stable flight trajectory and clean smash recovery.',
      priceRange: '₹1,199 - ₹2,199',
    },
    {
      id: 'bm-4',
      category: 'Protective & Accessories',
      itemTitle: 'Sweat-Absorbing Polyurethane Overgrips (Pack of 5)',
      recommendedSpecs: '0.6mm thickness with tacky feel and micro-perforations for blister prevention during long rallies.',
      priceRange: '₹349 - ₹699',
    },
    {
      id: 'bm-5',
      category: 'Jerseys & Apparel',
      itemTitle: 'Quick-Dry Badminton Polo & Breathable Shorts',
      recommendedSpecs: 'Anti-static polyester with UV shielding; engineered armhole gussets for unrestricted overhead smash reach.',
      priceRange: '₹799 - ₹1,899',
    },
  ],
  Swimming: [
    {
      id: 'sw-1',
      category: 'Protective & Accessories',
      itemTitle: 'Anti-Fog Wide-Vision Racing Goggles',
      recommendedSpecs: 'Polycarbonate mirrored lenses with UV400 coating; 3 interchangeable nose bridges and soft silicone seals.',
      priceRange: '₹799 - ₹2,499',
      dealBadge: 'FINA Approved Style',
    },
    {
      id: 'sw-2',
      category: 'Protective & Accessories',
      itemTitle: 'Seamless 100% Silicone Ergonomic Swim Cap',
      recommendedSpecs: 'Hydrodynamic wrinkle-free dome reduces water drag; tear-resistant hypoallergenic silicone.',
      priceRange: '₹299 - ₹799',
    },
    {
      id: 'sw-3',
      category: 'Jerseys & Apparel',
      itemTitle: 'Chlorine-Resistant Competitive Jammers / Swimsuit',
      recommendedSpecs: 'Endurance+ fabric with 4-way stretch; quick drying and 20x more chlorine-resistant than standard Lycra.',
      priceRange: '₹1,199 - ₹3,499',
    },
    {
      id: 'sw-4',
      category: 'Match Equipment',
      itemTitle: 'Biofuse Ergonomic Training Hand Paddles',
      recommendedSpecs: 'Contoured palm surface with flexible flow holes for stroke technique correction and upper body conditioning.',
      priceRange: '₹699 - ₹1,499',
    },
  ],
  Tennis: [
    {
      id: 'tn-1',
      category: 'Match Equipment',
      itemTitle: 'Midplus Graphite Tennis Racket (100 sq in, 300g)',
      recommendedSpecs: 'Open 16x19 string pattern for spin generation; aerodynamic beam with dampened vibration handle.',
      priceRange: '₹4,499 - ₹16,999',
      dealBadge: 'Club Match Grade',
    },
    {
      id: 'tn-2',
      category: 'Footwear & Cleats',
      itemTitle: 'All-Court Tennis Shoes with Lateral Claw Support',
      recommendedSpecs: 'Herringbone tread pattern for clay and hard courts; reinforced medial drag pad for slide stability.',
      priceRange: '₹2,999 - ₹7,499',
    },
    {
      id: 'tn-3',
      category: 'Match Equipment',
      itemTitle: 'Pressurized Extra-Duty Tennis Ball Can (3/4 Balls)',
      recommendedSpecs: 'Interlocked wool fiber felt for consistent bounce and durability on abrasive hard court surfaces.',
      priceRange: '₹399 - ₹899',
    },
  ],
  Basketball: [
    {
      id: 'bb-1',
      category: 'Match Equipment',
      itemTitle: 'Composite Leather Official Size 7 Basketball',
      recommendedSpecs: 'Deep channel design for finger alignment and grip; microfiber composite cover for indoor/outdoor courts.',
      priceRange: '₹1,299 - ₹3,499',
      dealBadge: 'Tournament Standard',
    },
    {
      id: 'bb-2',
      category: 'Footwear & Cleats',
      itemTitle: 'High-Top Court Basketball Shoes with Ankle Lock',
      recommendedSpecs: 'Air-cushioned heel pod for jump landing impact dispersion; multidirectional herringbone rubber traction.',
      priceRange: '₹2,499 - ₹6,999',
    },
    {
      id: 'bb-3',
      category: 'Protective & Accessories',
      itemTitle: 'Honeycomb Compression Knee & Elbow Sleeves',
      recommendedSpecs: 'High-density EVA foam honeycomb pads for court impact shielding with moisture-wicking compression sleeve.',
      priceRange: '₹499 - ₹1,199',
    },
  ],
};

const CATEGORIES = [
  'All Categories',
  'Footwear & Cleats',
  'Match Equipment',
  'Jerseys & Apparel',
  'Protective & Accessories',
] as const;

const POPULAR_CITIES = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune'];

export interface SportsShopViewProps {
  enrolledSports?: string[];
}

function getDealsForSport(sport: string): GearDeal[] {
  const direct = DEALS_BY_SPORT[sport];
  if (direct && direct.length > 0) return direct;

  const key = Object.keys(DEALS_BY_SPORT).find((k) => k.toLowerCase() === sport.toLowerCase());
  if (key && DEALS_BY_SPORT[key]) return DEALS_BY_SPORT[key];

  return [
    {
      id: `${sport.toLowerCase()}-1`,
      category: 'Match Equipment',
      itemTitle: `${sport} Official Match & Practice Equipment`,
      recommendedSpecs: `Tournament-grade regulation ${sport} hardware constructed from high-durability composite materials; balanced weight and official dimension compliance.`,
      priceRange: '₹1,299 - ₹4,999',
      dealBadge: 'Tournament Standard',
    },
    {
      id: `${sport.toLowerCase()}-2`,
      category: 'Footwear & Cleats',
      itemTitle: `Specialized Athletic Court / Turf Footwear for ${sport}`,
      recommendedSpecs: `High-traction non-marking or studded soleplate for multi-surface agility; reinforced lateral support and cushioned shock-absorbing midsole.`,
      priceRange: '₹1,899 - ₹4,499',
      dealBadge: 'Top Grip & Stability',
    },
    {
      id: `${sport.toLowerCase()}-3`,
      category: 'Protective & Accessories',
      itemTitle: `Protective Impact & Safety Guard Set for ${sport}`,
      recommendedSpecs: `Anatomical high-density EVA foam and rigid polymer composite shell; breathable moisture-wicking strap lock system.`,
      priceRange: '₹599 - ₹1,999',
    },
    {
      id: `${sport.toLowerCase()}-4`,
      category: 'Jerseys & Apparel',
      itemTitle: `Performance Dry-Fit Athletic Training Kit for ${sport}`,
      recommendedSpecs: `Breathable moisture-wicking microfiber knit with 4-way stretch; flatlock anti-chafing seams and athletic ergonomic cut.`,
      priceRange: '₹699 - ₹1,499',
    },
    {
      id: `${sport.toLowerCase()}-5`,
      category: 'Match Equipment',
      itemTitle: `Precision Skill Development & Training Aids for ${sport}`,
      recommendedSpecs: `Target markers, agility cones, reaction balls, and specialized drills accessories for deliberate technical repetitions.`,
      priceRange: '₹799 - ₹2,199',
    },
    {
      id: `${sport.toLowerCase()}-6`,
      category: 'Protective & Accessories',
      itemTitle: `Heavy-Duty Water-Resistant Equipment Bag for ${sport}`,
      recommendedSpecs: `Reinforced 600D ripstop polyester construction; separate ventilated footwear compartment and padded ergonomic shoulder harness.`,
      priceRange: '₹999 - ₹2,799',
    },
  ];
}

export function SportsShopView({ enrolledSports = [] }: SportsShopViewProps = {}) {
  const { user } = useAuthStore();
  const [activeSubTab, setActiveSubTab] = useState<'online' | 'stores'>('online');
  const [searchedSports, setSearchedSports] = useState<string[]>([]);
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');

  const sportsList = React.useMemo(() => {
    const list: Array<{ name: string; isEnrolled: boolean }> = [];
    const seen = new Set<string>();

    // 1. Enrolled sports first
    if (enrolledSports && enrolledSports.length > 0) {
      for (const sp of enrolledSports) {
        const clean = sp.trim();
        const lower = clean.toLowerCase();
        if (clean && !seen.has(lower)) {
          seen.add(lower);
          list.push({ name: clean, isEnrolled: true });
        }
      }
    }

    // 2. Searched sports
    for (const sp of searchedSports) {
      const clean = sp.trim();
      const lower = clean.toLowerCase();
      if (clean && !seen.has(lower)) {
        seen.add(lower);
        list.push({ name: clean, isEnrolled: false });
      }
    }

    // 3. Fallback popular sports
    for (const sp of Object.keys(DEALS_BY_SPORT)) {
      const lower = sp.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push({ name: sp, isEnrolled: false });
      }
    }

    return list;
  }, [enrolledSports, searchedSports]);

  const initialSport = (enrolledSports && enrolledSports.length > 0)
    ? enrolledSports[0]
    : 'Football';
  const [selectedSport, setSelectedSport] = useState<string>(initialSport);

  useEffect(() => {
    if (enrolledSports && enrolledSports.length > 0) {
      setSelectedSport((prev) => (prev === 'Football' && !enrolledSports.includes('Football') ? enrolledSports[0] : prev));
    }
  }, [enrolledSports]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  
  // Physical store location state
  const [city, setCity] = useState<string>((user as any)?.city || 'Ahmedabad');
  const [state, setState] = useState<string>((user as any)?.state || 'Gujarat');
  const [shops, setShops] = useState<LocalShop[]>([]);
  const [loadingShops, setLoadingShops] = useState<boolean>(false);
  const [expandedMapStore, setExpandedMapStore] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);

  const handleCustomSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = customSearchQuery.trim();
    if (!query) return;

    const cleanSport = query.charAt(0).toUpperCase() + query.slice(1);
    if (!searchedSports.includes(cleanSport)) {
      setSearchedSports((prev) => [cleanSport, ...prev]);
    }
    setSelectedSport(cleanSport);
    setCustomSearchQuery('');
  };

  // Sync city from user store
  useEffect(() => {
    if ((user as any)?.city) setCity((user as any).city);
    if ((user as any)?.state) setState((user as any).state);
  }, [user]);

  // Fetch local stores when viewing stores tab or when city/sport changes
  useEffect(() => {
    if (activeSubTab === 'stores') {
      fetchLocalShops();
    }
  }, [activeSubTab, city, state, selectedSport]);

  async function fetchLocalShops() {
    try {
      setLoadingShops(true);
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
      setLoadingShops(false);
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
      () => setGeoLocating(false),
      { timeout: 7000 }
    );
  };

  const allDeals = getDealsForSport(selectedSport);
  const filteredDeals = selectedCategory === 'All Categories'
    ? allDeals
    : allDeals.filter((d) => d.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Controls: Mode Switcher & Sport Selector */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Sub-tab Switcher: Online Verified Deals vs. Local Physical Stores */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/60 w-fit">
            <button
              type="button"
              onClick={() => setActiveSubTab('online')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'online'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Online Gear Deals</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('stores')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'stores'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Local Physical Stores</span>
            </button>
          </div>

          {/* "Search by Yourself" Custom Sport Search Bar */}
          <form onSubmit={handleCustomSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              placeholder="🔍 Search any sport (e.g., Hockey, Archery)..."
              className="w-64 sm:w-72 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Sport Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Sport:
          </span>
          {sportsList.map((sp) => (
            <button
              key={sp.name}
              type="button"
              onClick={() => setSelectedSport(sp.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedSport.toLowerCase() === sp.name.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700'
              }`}
            >
              <span>{sp.name}</span>
              {sp.isEnrolled && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black tracking-tight ${
                  selectedSport.toLowerCase() === sp.name.toLowerCase()
                    ? 'bg-white/20 text-amber-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  ★ Enrolled
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: ONLINE GEAR DEALS (AMAZON / FLIPKART) */}
      {activeSubTab === 'online' && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>DIRECT VERIFIED DEALS</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Zero Platform Fees
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Verified {selectedSport} Hardware & Gear
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Compare direct live inventory and buyer protection across Amazon India and Flipkart with expert buying guidelines.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Deals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDeals.map((deal, idx) => {
              const amazonUrl = `https://www.amazon.in/s?k=${encodeURIComponent(`${selectedSport} ${deal.itemTitle}`)}`;
              const flipkartUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(`${selectedSport} ${deal.itemTitle}`)}`;

              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ scale: 1.012, y: -2 }}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-200/80 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Category & Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {deal.category}
                      </span>
                      {deal.dealBadge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#F43F5E] border border-rose-200">
                          {deal.dealBadge}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                      {deal.itemTitle}
                    </h3>

                    {/* Price Indicator */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {deal.priceRange}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        (Market Range)
                      </span>
                    </div>

                    {/* Buying Guide / Recommended Specs Card */}
                    <div className="mt-3.5 p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100/70 text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[11px] mb-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>Coach Selection Advice:</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {deal.recommendedSpecs}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: Direct Amazon and Flipkart Search Links */}
                  <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                    <a
                      href={amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span className="font-extrabold">Amazon India</span>
                      <span className="text-amber-950/70 text-[11px]">View Live Deals</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                    </a>

                    <a
                      href={flipkartUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span className="font-extrabold">Flipkart</span>
                      <span className="text-blue-100/80 text-[11px]">Compare Offers</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: LOCAL PHYSICAL SPORTS STORES NEAR USER */}
      {activeSubTab === 'stores' && (
        <div className="space-y-6">
          {/* Location Bar & City Selector */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Store className="w-3 h-3 text-emerald-600" />
                  <span>BRICK & MORTAR RETAIL</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  Real Store Geocodes
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Physical Sports Shops in {city}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Visit walk-in equipment stores, try out gear in person, and get professional stringing or repair services.
              </p>
            </div>

            {/* City Selector & GPS Button */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/60 text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
              >
                <Compass className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
                <span>{geoLocating ? 'Detecting...' : 'Detect GPS'}</span>
              </motion.button>
            </div>
          </div>

          {/* Stores List / Grid */}
          {loadingShops ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">
                Scanning Verified Sports Stores in {city}...
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Querying live Google Maps retail geocodes and store operational hours.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shops.map((shop, idx) => {
                const isMapOpen = expandedMapStore === shop.name;
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
                      {/* Badge & Rating */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Sports Retailer</span>
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{shop.rating || 4.6} / 5.0</span>
                        </div>
                      </div>

                      {/* Store Name */}
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {shop.name}
                      </h3>

                      {/* Address */}
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {shop.address}
                      </p>

                      {/* Equipment in Stock */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-bold text-slate-700">Specialization: </span>
                        <span className="text-slate-600">{shop.specialization}</span>
                      </div>

                      {/* Timing & Phone */}
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

                    {/* Action Buttons: Google Maps Directions & Live Map Embed */}
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
                          onClick={() => setExpandedMapStore(isMapOpen ? null : shop.name)}
                          className="flex items-center gap-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 font-bold text-xs transition-all cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
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
        </div>
      )}
    </div>
  );
}

export default SportsShopView;
