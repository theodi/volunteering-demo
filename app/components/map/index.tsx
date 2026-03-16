import dynamic from "next/dynamic";
import type { LocationMapViewProps } from "./LocationMapView";

export type { LocationMapViewProps, MapMarker } from "./LocationMapView";

const LocationMapView = dynamic(
  () => import("./LocationMapView").then((m) => m.LocationMapView),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full min-h-[200px] w-full items-center justify-center rounded-lg border border-sparkling-silver bg-himalayan-white"
        aria-label="Loading map"
      >
        <span className="text-sm text-gray-500">Loading map…</span>
      </div>
    ),
  }
);

export function LocationMap(props: LocationMapViewProps) {
  return <LocationMapView {...props} />;
}
