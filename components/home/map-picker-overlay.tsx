"use client";

import { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, MapPin, Navigation, CheckCircle2 } from "lucide-react";

interface MapPickerOverlayProps {
  isOpen: boolean;
  isDarkMode: boolean;
  mapPickerOrigin: { x: number; y: number };
  mapPickerRef: RefObject<HTMLDivElement | null>;
  mapContainerRef: RefObject<HTMLDivElement | null>;
  mapSearchInputRef: RefObject<HTMLInputElement | null>;
  mapPickerType: "pickup" | "dropoff" | null;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchResults: google.maps.places.AutocompletePrediction[];
  setSearchResults: (results: google.maps.places.AutocompletePrediction[]) => void;
  isSearching: boolean;
  isDraggingMap: boolean;
  mapLoaded: boolean;
  selectedPlace: { lat: number; lng: number } | null;
  setSelectedPlace: (place: { lat: number; lng: number } | null) => void;
  mapRef: RefObject<google.maps.Map | null>;
  onClose: () => void;
  onPlaceSearch: (query: string) => void;
  onPlaceSelect: (prediction: google.maps.places.AutocompletePrediction) => void;
  onConfirmLocation: () => void;
}

export function MapPickerOverlay({
  isOpen,
  isDarkMode,
  mapPickerOrigin,
  mapPickerRef,
  mapContainerRef,
  mapSearchInputRef,
  mapPickerType,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  isSearching,
  isDraggingMap,
  mapLoaded,
  selectedPlace,
  setSelectedPlace,
  mapRef,
  onClose,
  onPlaceSearch,
  onPlaceSelect,
  onConfirmLocation,
}: MapPickerOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      ref={mapPickerRef}
      className={`fixed inset-0 z-[100] ${isDarkMode ? "bg-[#0a0a0a]" : "bg-[#f5f5f5]"}`}
      style={{
        clipPath: `circle(0% at ${mapPickerOrigin.x || "50%"} ${mapPickerOrigin.y || "50%"})`,
      }}
    >
      {/* Full Screen Map */}
      <div className="absolute inset-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        {!mapLoaded && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? "bg-[#0a0a0a]" : "bg-[#f5f5f5]"}`}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full border-2 animate-spin ${
                  isDarkMode
                    ? "border-white/10 border-t-white/60"
                    : "border-black/10 border-t-black/60"
                }`}
              />
              <p
                className={`text-sm font-medium ${isDarkMode ? "text-white/40" : "text-black/40"}`}
              >
                Loading map...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map Picker Content */}
      <div className="map-picker-content relative z-10 h-full flex flex-col pointer-events-none">
        {/* Top Section - Header & Search */}
        <div className="pointer-events-auto">
          {/* Header */}
          <div className="flex items-center px-3 pt-3 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
            <button
              type="button"
              onClick={onClose}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all ${
                isDarkMode
                  ? "bg-white shadow-black/20 hover:bg-gray-50"
                  : "bg-white shadow-black/10 hover:bg-gray-50"
              }`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a1a1a]" />
            </button>
          </div>

          {/* Unified Search & Confirm Card */}
          <div className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="max-w-lg mx-auto sm:mx-0">
              <div
                className={`rounded-xl sm:rounded-2xl shadow-xl overflow-hidden ${
                  isDarkMode
                    ? "bg-[#1a1a1a] shadow-black/30"
                    : "bg-white shadow-black/10"
                }`}
              >
                {/* Search Input Row */}
                <div className="relative p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
                  {/* Location Type Dot */}
                  <div
                    className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full flex-shrink-0 ${
                      mapPickerType === "pickup"
                        ? "bg-[#312783]"
                        : "bg-emerald-500"
                    }`}
                  />

                  {/* Search Input */}
                  <input
                    ref={mapSearchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onPlaceSearch(e.target.value)}
                    placeholder={
                      mapPickerType === "pickup"
                        ? "Enter pickup address"
                        : "Enter dropoff address"
                    }
                    className={`flex-1 h-9 sm:h-10 rounded-lg px-2.5 sm:px-3 text-sm sm:text-[15px] outline-none transition-all ${
                      isDarkMode
                        ? "bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
                        : "bg-[#f5f5f5] text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:bg-[#efefef]"
                    }`}
                  />

                  {/* Loading indicator */}
                  {isSearching && (
                    <div
                      className={`w-5 h-5 rounded-full border-2 animate-spin flex-shrink-0 ${
                        isDarkMode
                          ? "border-white/10 border-t-white/60"
                          : "border-[#1a1a1a]/10 border-t-[#1a1a1a]/60"
                      }`}
                    />
                  )}

                  {/* Clear button - shows when there's text */}
                  {searchQuery && !isSearching && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                      }`}
                    >
                      <X
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDarkMode ? "text-white/50" : "text-[#1a1a1a]/50"}`}
                      />
                    </button>
                  )}

                  {/* GPS button - always visible */}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        setSearchQuery("Getting location...");
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            setSelectedPlace({ lat, lng });

                            // Pan map to location
                            if (mapRef.current) {
                              mapRef.current.panTo({ lat, lng });
                              mapRef.current.setZoom(17);
                            }

                            // Reverse geocode to get address
                            if (mapLoaded) {
                              const geocoder = new google.maps.Geocoder();
                              geocoder.geocode(
                                { location: { lat, lng } },
                                (results, status) => {
                                  if (status === "OK" && results?.[0]) {
                                    setSearchQuery(results[0].formatted_address);
                                  } else {
                                    setSearchQuery(
                                      `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                                    );
                                  }
                                }
                              );
                            }
                          },
                          (error) => {
                            console.error("Geolocation error:", error);
                            setSearchQuery("");
                          },
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      }
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isDarkMode
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-[#f5f5f5] hover:bg-[#e5e5e5]"
                    }`}
                    title="Use current location"
                  >
                    <Navigation
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDarkMode ? "text-white/70" : "text-[#1a1a1a]/70"}`}
                    />
                  </button>
                </div>

                {/* Confirm Button - Shows when location selected */}
                <AnimatePresence>
                  {searchQuery.trim() && !searchResults.length && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`border-t ${isDarkMode ? "border-white/10" : "border-[#f0f0f0]"}`}
                    >
                      <div className="p-2.5 sm:p-3">
                        <button
                          type="button"
                          onClick={onConfirmLocation}
                          className={`w-full h-10 sm:h-11 rounded-xl text-sm sm:text-[15px] font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                            isDarkMode
                              ? "bg-white text-[#1a1a1a] hover:bg-gray-100"
                              : "bg-[#1a1a1a] text-white hover:bg-[#333]"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm{" "}
                          {mapPickerType === "pickup" ? "pickup" : "dropoff"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`mt-1.5 sm:mt-2 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden ${
                      isDarkMode
                        ? "bg-[#1a1a1a] shadow-black/30"
                        : "bg-white shadow-black/10"
                    }`}
                  >
                    {searchResults.slice(0, 4).map((result, index) => (
                      <button
                        key={result.place_id}
                        type="button"
                        onClick={() => onPlaceSelect(result)}
                        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-3 text-left transition-colors ${
                          isDarkMode
                            ? `hover:bg-white/5 active:bg-white/10 ${index > 0 ? "border-t border-white/10" : ""}`
                            : `hover:bg-[#fafafa] active:bg-[#f5f5f5] ${index > 0 ? "border-t border-[#f0f0f0]" : ""}`
                        }`}
                      >
                        <MapPin
                          className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isDarkMode ? "text-white/30" : "text-[#1a1a1a]/30"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[13px] sm:text-[14px] font-medium truncate ${isDarkMode ? "text-white" : "text-[#1a1a1a]"}`}
                          >
                            {result.structured_formatting.main_text}
                          </p>
                          <p
                            className={`text-[11px] sm:text-xs truncate ${isDarkMode ? "text-white/50" : "text-[#1a1a1a]/50"}`}
                          >
                            {result.structured_formatting.secondary_text}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Spacer for map visibility */}
        <div className="flex-1" />
      </div>

      {/* Static Center Pin - Zimpost Red for visibility */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-20">
        <motion.div
          animate={{
            y: isDraggingMap ? -12 : 0,
            scale: isDraggingMap ? 1.15 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative"
        >
          {/* Pin shadow on ground */}
          <motion.div
            animate={{
              scale: isDraggingMap ? 0.6 : 1,
              opacity: isDraggingMap ? 0.5 : 0.35,
            }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-black rounded-full blur-md"
          />
          {/* Pin body - Zimpost Red with theme-aware border/center */}
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-full bg-[#E53935] shadow-xl shadow-[#E53935]/40 flex items-center justify-center border-[3px] ${
                isDarkMode ? "border-white" : "border-[#1a1a1a]"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${isDarkMode ? "bg-white" : "bg-[#1a1a1a]"}`}
              />
            </div>
            {/* Pin pointer */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2">
              <div
                className="w-0 h-0 border-l-[9px] border-r-[9px] border-t-[14px] border-l-transparent border-r-transparent border-t-[#E53935]"
                style={{
                  filter: "drop-shadow(0 2px 3px rgba(229, 57, 53, 0.4))",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loading indicator when dragging */}
      <AnimatePresence>
        {isDraggingMap && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-8 pointer-events-none z-20"
          >
            <div
              className={`backdrop-blur-sm text-xs font-medium px-3 py-1.5 rounded-full ${
                isDarkMode
                  ? "bg-white/90 text-[#1a1a1a]"
                  : "bg-[#1a1a1a]/90 text-white"
              }`}
            >
              Release to select
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Hint - Desktop Only */}
      <div className="absolute top-6 right-6 z-10 hidden lg:flex items-center gap-2 pointer-events-none">
        <kbd
          className={`px-2.5 py-1.5 backdrop-blur rounded-lg text-xs font-medium shadow-lg ${
            isDarkMode
              ? "bg-white/90 text-[#1a1a1a]/60"
              : "bg-[#1a1a1a]/90 text-white/60"
          }`}
        >
          ESC
        </kbd>
      </div>
    </div>
  );
}
