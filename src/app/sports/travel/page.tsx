"use client";

import React from "react";
import SportsNavigationHeader from "@/components/sports/SportsNavigationHeader";
import ManagedTravelView from "@/components/sports/ManagedTravelView";

export default function SportsTravelPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SportsNavigationHeader activeRole="athlete" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ManagedTravelView />
      </main>
    </div>
  );
}
