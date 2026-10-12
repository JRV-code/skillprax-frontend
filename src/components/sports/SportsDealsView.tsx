'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  ExternalLink, 
  Tag, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2
} from 'lucide-react';

interface GearDeal {
  id: string;
  category: 'Footwear & Cleats' | 'Match Equipment' | 'Jerseys & Apparel' | 'Protective & Accessories';
  itemTitle: string;
  recommendedSpecs: string;
  priceRange: string;
  dealBadge?: string;
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
      recommendedSpecs: 'Impact-resistant ABS shell, shock-absorbing EPS liner, adjustable powder-coated steel faceguard.',
      priceRange: '₹1,499 - ₹3,499',
      dealBadge: 'Safety Essential',
    },
    {
      id: 'cr-5',
      category: 'Protective & Accessories',
      itemTitle: 'Batting Legguards & High-Density Cotton Gloves',
      recommendedSpecs: 'Traditional cane construction or lightweight high-density foam; Pittards leather palm on gloves.',
      priceRange: '₹1,799 - ₹3,999',
    },
  ],
  Badminton: [
    {
      id: 'bm-1',
      category: 'Match Equipment',
      itemTitle: 'High-Modulus Carbon Fiber Badminton Racket',
      recommendedSpecs: 'Weight 4U (80-84g), isometric frame, high-string tension support (up to 28-30 lbs), head-heavy or even balance.',
      priceRange: '₹1,899 - ₹5,499',
      dealBadge: 'Popular for Attacking Smashes',
    },
    {
      id: 'bm-2',
      category: 'Footwear & Cleats',
      itemTitle: 'Non-Marking Indoor Court Shoes',
      recommendedSpecs: 'Gum rubber non-marking outsole with hexagrip pattern; lateral claw stability for rapid lunges and cushion midsole.',
      priceRange: '₹2,199 - ₹4,899',
      dealBadge: 'Court Required',
    },
    {
      id: 'bm-3',
      category: 'Match Equipment',
      itemTitle: 'Goose Feather & Synthetic Shuttlecocks (Pack of 12)',
      recommendedSpecs: 'Natural goose feather skirt for true spin dynamics or precision nylon with Portuguese cork base.',
      priceRange: '₹649 - ₹1,899',
    },
  ],
  Tennis: [
    {
      id: 'tn-1',
      category: 'Match Equipment',
      itemTitle: 'Graphite Composite Tennis Racket (100 sq in)',
      recommendedSpecs: 'Midplus 100 sq inch head, 280-300g unstrung weight, 16x19 open string pattern for topspin generation.',
      priceRange: '₹3,499 - ₹8,999',
      dealBadge: 'All-Court Control',
    },
    {
      id: 'tn-2',
      category: 'Footwear & Cleats',
      itemTitle: 'Hard Court Tennis Shoes',
      recommendedSpecs: 'Herringbone tread rubber outsole with DragGuard toe bumper and torsional TPU shank.',
      priceRange: '₹2,999 - ₹6,499',
    },
    {
      id: 'tn-3',
      category: 'Match Equipment',
      itemTitle: 'Pressurized Heavy Duty Felt Tennis Balls (Can of 3)',
      recommendedSpecs: 'Interlocked wool fiber felt for consistent bounce and resistance against fuzzing on hard court surfaces.',
      priceRange: '₹449 - ₹899',
    },
  ],
  Swimming: [
    {
      id: 'sw-1',
      category: 'Protective & Accessories',
      itemTitle: 'Anti-Fog Mirrored Racing Goggles',
      recommendedSpecs: 'Hydrodynamic low-profile silicone gasket, UV 400 protection, anti-fog coating with interchangeable nose bridges.',
      priceRange: '₹599 - ₹1,699',
      dealBadge: 'Hydrodynamic Fit',
    },
    {
      id: 'sw-2',
      category: 'Protective & Accessories',
      itemTitle: '100% Medical Grade Silicone Swim Cap',
      recommendedSpecs: 'Snag-free contour fit, tear-resistant hypoallergenic silicone to reduce hydrodynamic drag and protect hair.',
      priceRange: '₹299 - ₹699',
    },
    {
      id: 'sw-3',
      category: 'Jerseys & Apparel',
      itemTitle: 'Chlorine-Resistant Endurance Swim Jammers',
      recommendedSpecs: 'Four-way stretch polyester-PBT blend, UPF 50+ UV protection, front gusset lining with interior drawcord.',
      priceRange: '₹799 - ₹1,899',
    },
  ],
  Basketball: [
    {
      id: 'bb-1',
      category: 'Match Equipment',
      itemTitle: 'Composite Leather Official Size 7 Basketball',
      recommendedSpecs: 'Microfiber composite cover with deep pebbling and recessed channels for indoor hardwood & outdoor concrete grip.',
      priceRange: '₹1,199 - ₹2,999',
      dealBadge: 'Official Grip Spec',
    },
    {
      id: 'bb-2',
      category: 'Footwear & Cleats',
      itemTitle: 'High-Top Ankle Support Basketball Shoes',
      recommendedSpecs: 'Multidirectional herringbone traction rubber, responsive forefoot foam, padded high-top collar to safeguard against roll.',
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

export function SportsDealsView() {
  const [selectedSport, setSelectedSport] = useState<string>('Football');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  const sportsList = Object.keys(DEALS_BY_SPORT);
  const allDeals = DEALS_BY_SPORT[selectedSport] || [];

  const filteredDeals = selectedCategory === 'All Categories'
    ? allDeals
    : allDeals.filter((d) => d.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-[#6366F1] border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>REAL E-COMMERCE DEALS</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#F43F5E] border border-rose-200">
              Direct Verified Price Search
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Verified Sports Gear & Hardware
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            No simulated platform inventory. Select your sport to see expert buying guidelines and compare live offers directly on Amazon India and Flipkart.
          </p>
        </div>

        {/* Live Sport Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-100 rounded-2xl border border-slate-200/60 scrollbar-none">
          {sportsList.map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSport(sp)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSport === sp
                  ? 'bg-white text-[#6366F1] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
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
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.015, y: -2 }}
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
                    (Typical Range)
                  </span>
                </div>

                {/* Buying Guide / Recommended Specs Card */}
                <div className="mt-3.5 p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100/70 text-xs">
                  <div className="flex items-center gap-1.5 text-[#6366F1] font-bold text-[11px] mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Expert Selection Advice:</span>
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
                  <span className="text-amber-950/70 text-[11px]">Check Live Deals</span>
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
  );
}

export default SportsDealsView;
