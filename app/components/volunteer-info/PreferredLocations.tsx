"use client";

import { useState, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { VolunteerInfoSection } from "./VolunteerInfoSection";
import { LocationCard } from "./LocationCard";
import { LocationMap } from "@/app/components/map";
import { Button } from "@/app/components/Button";
import { reverseGeocode, forwardGeocode } from "@/app/lib/geocode";

export type SavedLocation = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
};

export function PreferredLocations({
  radiusKm = 10,
  onRadiusChange,
  onSearch,
  onUseMyLocation,
}: {
  radiusKm?: number;
  onRadiusChange?: (km: number) => void;
  onSearch?: (query: string) => void;
  onUseMyLocation?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedLocation, setPinnedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // When the marker moves (map click or "use my location"), fill the input with the address.
  useEffect(() => {
    if (pinnedLocation == null) return;
    let cancelled = false;
    reverseGeocode(pinnedLocation.lat, pinnedLocation.lng).then((result) => {
      if (!cancelled && result?.display_name) setSearchQuery(result.display_name);
    });
    return () => {
      cancelled = true;
    };
  }, [pinnedLocation?.lat, pinnedLocation?.lng]);

  // Keep saved locations in sync with pinnedLocation + searchQuery
  useEffect(() => {
    if (pinnedLocation == null || searchQuery.trim() === "") return;
    const id = `${pinnedLocation.lat.toFixed(5)},${pinnedLocation.lng.toFixed(5)}`;
    setSavedLocations((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) {
        return prev.map((l) =>
          l.id === id ? { ...l, label: searchQuery.trim() } : l,
        );
      }
      return [
        {
          id,
          label: searchQuery.trim(),
          lat: pinnedLocation.lat,
          lng: pinnedLocation.lng,
          radiusKm: radiusKm ?? 10,
        },
        ...prev,
      ];
    });
    setActiveLocationId(id);
  }, [pinnedLocation, searchQuery, radiusKm]);

  const handleUseMyLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Location is not supported by your browser.");
      return;
    }
    setLocationError(null);
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPinnedLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
        onUseMyLocation?.();
      },
      (err) => {
        setLocationLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location in your browser or device settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable. Please check that location is turned on.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Unable to get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [onUseMyLocation]);

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setLocationError(null);
    setSearchLoading(true);
    try {
      const result = await forwardGeocode(query);
      if (result) {
        setPinnedLocation({ lat: result.lat, lng: result.lon });
        setSearchQuery(result.display_name);
        onSearch?.(query);
      } else {
        setLocationError("Location not found. Try a different address or postcode.");
      }
    } catch {
      setLocationError("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, onSearch]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPinnedLocation({ lat, lng });
    setLocationError(null);
  }, []);

  const handleSelectLocation = useCallback(
    (id: string) => {
      const loc = savedLocations.find((l) => l.id === id);
      if (loc == null) return;
      setActiveLocationId(id);
      setPinnedLocation({ lat: loc.lat, lng: loc.lng });
      setSearchQuery(loc.label);
    },
    [savedLocations],
  );

  const handleRadiusForLocation = useCallback(
    (id: string, value: number) => {
      setSavedLocations((prev) =>
        prev.map((l) => (l.id === id ? { ...l, radiusKm: value } : l)),
      );
      onRadiusChange?.(value);
    },
    [onRadiusChange],
  );

  const handleDeleteLocation = useCallback((id: string) => {
    setSavedLocations((prev) => prev.filter((l) => l.id !== id));
    setActiveLocationId((current) => (current === id ? null : current));
  }, []);

  const handleEditLocation = useCallback(
    (id: string) => {
      const loc = savedLocations.find((l) => l.id === id);
      if (!loc) return;
      setActiveLocationId(id);
      setPinnedLocation({ lat: loc.lat, lng: loc.lng });
      setSearchQuery(loc.label);
    },
    [savedLocations],
  );

  const activeLocation =
    (activeLocationId &&
      savedLocations.find((l) => l.id === activeLocationId)) ||
    null;

  return (
    <VolunteerInfoSection
      showHeader={false}
      className="space-y-5!"
    >
      <div className="flex flex-col gap-0.5">
        <h4 className="text-base sm:text-lg font-medium text-gray-900">Preferred Locations</h4>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-700">Add locations where you'd like to volunteer. Click on the map to add a location, or use the search box to find by postcode/address.</p>
      </div>

      {/* Search bar */}
      <section className="w-full flex flex-col gap-2.5 sm:flex-row">
        <input
          type="text"
          placeholder="Enter postcode or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-slate-400 px-4 py-3 text-sm text-gray-500 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Search by postcode or address"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-2 sm:flex-none border-none bg-primary text-white text-sm font-normal hover:bg-primary/90"
            onClick={handleSearch}
            disabled={searchLoading}
          >
            {searchLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
                Searching…
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 gap-2 sm:flex-none border-slate-400! text-gray-800! text-sm font-normal"
            onClick={handleUseMyLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" aria-hidden />
                Getting location…
              </>
            ) : (
              <>
                <MapPinIcon className="h-4 w-4" />
                Use my location
              </>
            )}
          </Button>
        </div>
      </section>
      {locationError != null && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2" role="alert">
          {locationError}
        </p>
      )}

      <LocationMap
        className="aspect-2/1 w-full overflow-hidden rounded-md border border-primary bg-himalayan-white sm:aspect-2.5/1"
        hint="Click map to add location"
        markers={
          pinnedLocation
            ? [
                {
                  lat: pinnedLocation.lat,
                  lng: pinnedLocation.lng,
                  label: activeLocation?.label ?? "Selected location",
                },
              ]
            : []
        }
        center={pinnedLocation ? [pinnedLocation.lat, pinnedLocation.lng] : null}
        radiusKm={activeLocation?.radiusKm ?? radiusKm}
        onMapClick={handleMapClick}
      />

      {/* Your locations */}
      <div className="space-y-4">
        <h3 className="text-base font-medium text-gray-900">
          Your locations
        </h3>
        <div className="space-y-3">
          {savedLocations.map((loc) => (
            <LocationCard
              key={loc.id}
              label={loc.label}
              radiusLabel={`Within ${loc.radiusKm} km radius`}
              isActive={loc.id === activeLocationId}
              radiusKm={loc.radiusKm}
              onRadiusChange={(value) => handleRadiusForLocation(loc.id, value)}
              onClick={() => handleSelectLocation(loc.id)}
              onEdit={() => handleEditLocation(loc.id)}
              onDelete={() => handleDeleteLocation(loc.id)}
            />
          ))}
          {savedLocations.length === 0 && (
            <p className="text-sm text-hydrocarbon">
              Add a location using the map or search above.
            </p>
          )}
        </div>
      </div>
    </VolunteerInfoSection>
  );
}
