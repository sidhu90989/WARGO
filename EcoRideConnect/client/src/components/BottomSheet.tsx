import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Home, Briefcase, Star, ArrowLeft, Clock } from "lucide-react";

export type BottomSheetState = "collapsed" | "expanded" | "vehicle";

export interface BottomSheetProps {
  state: BottomSheetState;
  setState: (s: BottomSheetState) => void;
  currentAddress?: string;
  fromValue?: string;
  toValue?: string;
  onFromChange?: (v: string) => void;
  onToChange?: (v: string) => void;
  onSelectVehicle?: (vehicleId: string) => void;
  vehicleOptions?: Array<{ id: string; name: string; price: string; eta: string }>;  
  onConfirmRide?: () => void;
  recent?: Array<{ label: string; sub?: string }>;
  saved?: Array<{ id: string; label: string; icon: "home" | "work" | "star" }>;  
  onSelectSaved?: (id: string) => void;
  className?: string;
}

export function BottomSheet(props: BottomSheetProps) {
  const { state, setState } = props;
  const [dragY, setDragY] = useState(0);
  const startRef = useRef(0);
  const draggingRef = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    startRef.current = e.clientY;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const delta = e.clientY - startRef.current;
    setDragY(Math.max(0, delta));
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (dragY > 120) {
      setState("collapsed");
    } else {
      setState("expanded");
    }
    setDragY(0);
  };

  useEffect(() => {
    const onUp = () => onPointerUp();
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  const sheetHeight = useMemo(() => {
    switch (state) {
      case "collapsed":
        return 120;
      case "expanded":
        return 420;
      case "vehicle":
        return 360;
    }
  }, [state]);

  return (
    <div className={cn("fixed left-0 right-0 bottom-0 z-40")}>      
      {/* Backdrop */}
      {state !== "collapsed" && (
        <div className="absolute inset-0 -top-[100vh] bg-black/30 backdrop-blur-sm" onClick={() => setState("collapsed")} />
      )}

      <div
        className={cn("relative mx-auto w-full max-w-screen-md bg-card border-t rounded-t-2xl shadow-2xl", props.className)}
        style={{ height: sheetHeight + dragY }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-2 w-10 h-1.5 bg-muted rounded-full" />

        {/* Header */}
        <div className="px-4 pt-5 pb-3 flex items-center gap-2">
          {state !== "collapsed" && (
            <Button variant="ghost" size="icon" onClick={() => setState("collapsed")}> <ArrowLeft className="h-4 w-4" /> </Button>
          )}
          <div className="text-sm text-muted-foreground">
            {props.currentAddress || "Current location"}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 space-y-4">
          {state === "collapsed" && (
            <div className="space-y-3">
              <Input placeholder="Where do you want to go?" readOnly onFocus={() => setState("expanded")} />
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1"><Home className="h-4 w-4 mr-2"/> Home</Button>
                <Button variant="secondary" className="flex-1"><Briefcase className="h-4 w-4 mr-2"/> Work</Button>
                <Button variant="secondary" className="flex-1"><Star className="h-4 w-4 mr-2"/> Favorites</Button>
              </div>
              {!!props.recent?.length && (
                <div className="space-y-2">
                  <div className="text-xs uppercase text-muted-foreground">Recent</div>
                  <div className="space-y-2">
                    {props.recent.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border">
                        <Clock className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{r.label}</div>
                          {r.sub && <div className="text-xs text-muted-foreground">{r.sub}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {state === "expanded" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Input placeholder="From" value={props.fromValue} onChange={(e) => props.onFromChange?.(e.target.value)} />
                <Input placeholder="To" value={props.toValue} onChange={(e) => props.onToChange?.(e.target.value)} onFocus={() => {}} />
              </div>
              <div className="space-y-2">
                <div className="text-xs uppercase text-muted-foreground">Saved places</div>
                <div className="grid grid-cols-3 gap-2">
                  {(props.saved || [
                    { id: "home", label: "Home", icon: "home" as const },
                    { id: "work", label: "Work", icon: "work" as const },
                    { id: "fav", label: "Favorites", icon: "star" as const },
                  ]).map((s) => (
                    <Button key={s.id} variant="outline" className="h-12" onClick={() => props.onSelectSaved?.(s.id)}>
                      {s.icon === 'home' ? <Home className="h-4 w-4 mr-2"/> : s.icon === 'work' ? <Briefcase className="h-4 w-4 mr-2"/> : <Star className="h-4 w-4 mr-2"/>}
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => setState("vehicle")}>See ride options</Button>
            </div>
          )}

          {state === "vehicle" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {(props.vehicleOptions || [
                  { id: 'auto', name: 'Auto', price: '₹120-140', eta: '3 min' },
                  { id: 'bike', name: 'Bike', price: '₹60-75', eta: '2 min' },
                  { id: 'prime', name: 'Prime Sedan', price: '₹220-260', eta: '5 min' },
                ]).map((v) => (
                  <Button key={v.id} variant="outline" className="justify-between h-14" onClick={() => props.onSelectVehicle?.(v.id)}>
                    <div className="flex items-center gap-3">
                      <Car className="h-4 w-4" />
                      <div>
                        <div className="text-sm font-medium">{v.name}</div>
                        <div className="text-xs text-muted-foreground">{v.eta}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{v.price}</div>
                  </Button>
                ))}
              </div>
              <Button className="w-full" onClick={props.onConfirmRide}>Confirm Ride</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BottomSheet;
