// Google Places powered location utilities for OLA-style search
// Requires the Maps JavaScript API with libraries=places loaded by @vis.gl/react-google-maps

export type PlaceSuggestion = {
  description: string;
  place_id: string;
};

export type PlaceDetails = {
  address: string;
  lat: number;
  lng: number;
};

export class LocationService {
  initAutocomplete(input: HTMLInputElement) {
    // @ts-ignore
    const Autocomplete = google.maps.places.Autocomplete;
    // @ts-ignore
    return new Autocomplete(input, {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "in" },
    });
  }

  getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const service = new google.maps.places.PlacesService(document.createElement("div"));
      // @ts-ignore
      service.getDetails({ placeId }, (place: any, status: any) => {
        // @ts-ignore
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve({
            address: place.formatted_address || place.name,
            lat: place.geometry?.location?.lat?.() ?? 0,
            lng: place.geometry?.location?.lng?.() ?? 0,
          });
        } else {
          reject(new Error("Failed to fetch place details"));
        }
      });
    });
  }

  saveRecent(label: string, sub?: string) {
    const key = "recent_locations";
    const current = this.getRecent();
    const next = [{ label, sub }, ...current.filter((r) => r.label !== label)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(next));
  }

  getRecent(): Array<{ label: string; sub?: string }> {
    try {
      const key = "recent_locations";
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  watchCurrentLocation(cb: (pos: { lat: number; lng: number; address?: string }) => void) {
    if (!("geolocation" in navigator)) return () => {};
    const id = navigator.geolocation.watchPosition(
      (pos) => cb({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => void 0,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
    return () => { try { navigator.geolocation.clearWatch(id as any); } catch {} };
  }
}

export const locationService = new LocationService();
