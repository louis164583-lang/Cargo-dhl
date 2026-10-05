import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Truck, Plane, Package, CheckCircle, Clock, AlertCircle,
  MapPin, ArrowLeft, Shield, FileText, DollarSign, Mail, ExternalLink,
} from 'lucide-react';
import { getShipments, STATUS_LABELS } from '@/lib/shipments';
import type { Shipment, ShipmentStatus } from '@/lib/shipments';
import { getChargeById, formatFee } from '@/lib/charges';

/* ── City coordinates ── */
const CITY_COORDS: Record<string, [number, number]> = {
  'New York':         [40.7128, -74.0060],
  'London':           [51.5074, -0.1278],
  'Dubai':            [25.2048, 55.2708],
  'Lagos':            [6.5244,   3.3792],
  'Frankfurt':        [50.1109,  8.6821],
  'International Hub':[48.0,    10.0],
};

function getCoords(city: string): [number, number] | null {
  return CITY_COORDS[city] ?? null;
}

/* Midpoint of two lat/lng pairs */
function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/* Great-circle approximation (20 intermediate points) */
function arcPoints(a: [number, number], b: [number, number]): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const lat = a[0] + (b[0] - a[0]) * t;
    const lng = a[1] + (b[1] - a[1]) * t;
    const bulge = Math.sin(Math.PI * t) * 4; // slight arc
    pts.push([lat + bulge * 0.3, lng]);
  }
  return pts;
}

/* ── Timeline steps per status ── */
const STAGES = [
  { key: 'booked',     label: 'Booked',    icon: FileText },
  { key: 'picked_up',  label: 'Picked Up', icon: Package },
  { key: 'in_transit', label: 'In Transit',icon: Truck },
  { key: 'customs',    label: 'At Customs',icon: Shield },
  { key: 'delivered',  label: 'Delivered', icon: CheckCircle },
];

const STATUS_STAGE_INDEX: Record<ShipmentStatus, number> = {
  pending:    1,
  in_transit: 2,
  customs:    3,
  delivered:  4,
  exception:  2,
};

const STATUS_ICON: Record<ShipmentStatus, React.ElementType> = {
  pending:    Clock,
  in_transit: Truck,
  customs:    Shield,
  delivered:  CheckCircle,
  exception:  AlertCircle,
};

const STATUS_BG: Record<ShipmentStatus, string> = {
  pending:    'bg-yellow-50 border-yellow-200 text-yellow-800',
  in_transit: 'bg-blue-50 border-blue-200 text-blue-800',
  customs:    'bg-purple-50 border-purple-200 text-purple-800',
  delivered:  'bg-green-50 border-green-200 text-green-800',
  exception:  'bg-red-50 border-red-200 text-red-800',
};

const STATUS_DOT: Record<ShipmentStatus, string> = {
  pending:    'bg-yellow-400',
  in_transit: 'bg-blue-500',
  customs:    'bg-purple-500',
  delivered:  'bg-green-500',
  exception:  'bg-red-500',
};

const SERVICE_ICON: Record<string, React.ElementType> = {
  'Air Freight':  Plane,
  'Road Freight': Truck,
  'Warehousing':  Package,
  'Last Mile':    MapPin,
};

interface TrackEvent {
  date: string; time: string; label: string; location: string; done: boolean; exception?: boolean;
}

function getEvents(s: Shipment): TrackEvent[] {
  const base: TrackEvent[] = [
    { date: s.date, time: '09:14', label: 'Shipment booked', location: s.origin, done: true },
    { date: s.date, time: '14:30', label: 'Package picked up', location: s.origin, done: true },
  ];

  if (s.status === 'pending') return base.slice(0, 1);

  const events = [...base];

  if (s.status === 'in_transit' || s.status === 'customs' || s.status === 'delivered' || s.status === 'exception') {
    events.push({ date: s.date, time: '18:55', label: 'Departed origin facility', location: s.origin, done: true });
    events.push({ date: s.eta, time: '07:22', label: 'Arrived at transit hub', location: 'International Hub', done: true });
  }
  if (s.status === 'customs' || s.status === 'delivered') {
    events.push({ date: s.eta, time: '11:40', label: 'Customs clearance started', location: s.destination, done: true });
    events.push({ date: s.eta, time: '15:10', label: 'Customs cleared', location: s.destination, done: s.status === 'delivered' });
  }
  if (s.status === 'delivered') {
    events.push({ date: s.eta, time: '16:48', label: 'Out for delivery', location: s.destination, done: true });
    events.push({ date: s.eta, time: '18:03', label: 'Delivered — signed by recipient', location: s.destination, done: true });
  }
  if (s.status === 'exception') {
    events.push({ date: s.eta, time: '10:05', label: 'Delivery attempted — no access', location: s.destination, done: true, exception: true });
    events.push({ date: s.eta, time: '10:06', label: 'Awaiting re-delivery instruction', location: s.destination, done: false, exception: true });
  }
  return events;
}

/* ── Lazy-loaded map ── */
function ShipmentMap({ origin, destination }: { origin: string; destination: string }) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Polyline: any;
    Popup: any;
    L: any;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([rl, leafletMod]) => {
      const L = leafletMod.default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setMapComponents({ ...rl, L });
    });
  }, []);

  const oCoords = getCoords(origin);
  const dCoords = getCoords(destination);

  if (!MapComponents || !oCoords || !dCoords) {
    return (
      <div className="h-52 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
        {!oCoords || !dCoords ? `Map not available for this route` : 'Loading map…'}
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Polyline, Popup, L } = MapComponents;
  const arc = arcPoints(oCoords, dCoords);
  const center = midpoint(oCoords, dCoords);

  const orangeIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  return (
    <MapContainer
      center={center}
      zoom={3}
      style={{ height: '220px', borderRadius: '16px' }}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <Polyline
        positions={arc}
        pathOptions={{ color: '#f97316', weight: 2.5, dashArray: '6 5', opacity: 0.85 }}
      />
      <Marker position={oCoords} icon={orangeIcon}>
        <Popup>{origin} (Origin)</Popup>
      </Marker>
      <Marker position={dCoords} icon={orangeIcon}>
        <Popup>{destination} (Destination)</Popup>
      </Marker>
    </MapContainer>
  );
}

/* ── Charge banner ── */
function ChargeBanner({ shipment: s }: { shipment: Shipment }) {
  if (!s.pendingCharge || s.pendingCharge.paid) return null;
  const charge = getChargeById(s.pendingCharge.chargeId);
  if (!charge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <DollarSign size={18} className="text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-bold text-red-800 text-base">{charge.name}</h3>
            <span className="bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {formatFee(charge)}
            </span>
          </div>
          <p className="text-red-700 text-sm mt-2 leading-relaxed">{charge.customerMessage}</p>

          <div className="mt-4 bg-white border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
            <Mail size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-800 text-sm font-semibold">To clear this charge and release your shipment:</p>
              <p className="text-red-600 text-sm mt-1">
                Contact our customer service team at{' '}
                <a href="mailto:cdhl04192@gmail.com" className="font-bold underline underline-offset-2 hover:text-red-700 inline-flex items-center gap-1">
                  cdhl04192@gmail.com <ExternalLink size={11} />
                </a>
                {' '}quoting your tracking number <span className="font-mono font-bold">{s.id}</span>
              </p>
            </div>
          </div>
          <p className="text-red-400 text-xs mt-3">Charge assigned on {s.pendingCharge.assignedAt}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Not found state ── */
function NotFound({ id }: { id: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Package size={28} className="text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Shipment not found</h2>
      <p className="text-slate-400 text-sm mb-6">
        We couldn't find a shipment with ID <span className="font-mono font-semibold text-slate-600">"{id}"</span>.
      </p>
      <p className="text-slate-400 text-xs">Try: <span className="font-mono text-slate-600">CDHL-0013-LG</span></p>
    </div>
  );
}

/* ── Result card ── */
function TrackResult({ shipment: s }: { shipment: Shipment }) {
  const stageIndex = STATUS_STAGE_INDEX[s.status];
  const events = getEvents(s);
  const ServiceIcon = SERVICE_ICON[s.service] ?? Package;
  const StatusIcon = STATUS_ICON[s.status];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Status banner */}
      <div className={`flex items-center gap-3 border rounded-2xl px-5 py-4 mb-6 ${STATUS_BG[s.status]}`}>
        <StatusIcon size={20} />
        <div className="flex-1">
          <div className="font-bold text-sm">{STATUS_LABELS[s.status]}</div>
          <div className="text-xs opacity-70 mt-0.5">
            {s.status === 'delivered'
              ? `Delivered on ${s.eta}`
              : s.status === 'exception'
              ? 'Action required — delivery could not be completed'
              : `Estimated delivery: ${s.eta}`}
          </div>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[s.status]} animate-pulse`} />
      </div>

      {/* Charge banner — shown before route if unpaid charge exists */}
      <ChargeBanner shipment={s} />

      {/* Route card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-slate-700 text-sm">{s.id}</span>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
            <ServiceIcon size={12} />
            {s.service}
          </div>
        </div>

        {/* Origin → Destination */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Origin</div>
            <div className="text-lg font-black text-slate-900">{s.origin}</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200" />
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${s.status === 'delivered' ? 'bg-green-500' : 'bg-orange-500'}`}>
                <ServiceIcon size={13} className="text-white" />
              </div>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5">{s.weight}</div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Destination</div>
            <div className="text-lg font-black text-slate-900">{s.destination}</div>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-50">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Client</div>
            <div className="text-sm font-semibold text-slate-700">{s.client}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ship Date</div>
            <div className="text-sm font-semibold text-slate-700">{s.date}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">ETA</div>
            <div className="text-sm font-semibold text-slate-700">{s.eta}</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={14} className="text-orange-500" />
          <h3 className="font-bold text-slate-900 text-sm">Route Map</h3>
          <span className="text-slate-400 text-xs ml-auto">{s.origin} → {s.destination}</span>
        </div>
        <ShipmentMap origin={s.origin} destination={s.destination} />
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-5">
        <h3 className="font-bold text-slate-900 text-sm mb-6">Shipment Progress</h3>
        <div className="relative flex items-start justify-between">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-orange-500 z-0 transition-all duration-700"
            style={{ width: `${Math.min((stageIndex / (STAGES.length - 1)) * 100, 100)}%` }}
          />

          {STAGES.map((stage, i) => {
            const done = i <= stageIndex;
            const active = i === stageIndex;
            return (
              <div key={stage.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? active
                      ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/25'
                      : 'bg-orange-500 border-orange-500'
                    : 'bg-white border-slate-200'
                }`}>
                  <stage.icon size={15} className={done ? 'text-white' : 'text-slate-300'} />
                </div>
                <div className={`text-[11px] font-semibold text-center leading-tight ${done ? 'text-slate-700' : 'text-slate-300'}`}>
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event timeline */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-5">Tracking History</h3>
        <div className="space-y-0">
          {[...events].reverse().map((ev, i) => (
            <div key={i} className="flex gap-4 relative">
              {i < events.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-100" />
              )}
              <div className={`w-[22px] h-[22px] rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                !ev.done
                  ? 'border-slate-200 bg-white'
                  : ev.exception
                  ? 'border-red-400 bg-red-50'
                  : i === 0
                  ? 'border-orange-500 bg-orange-500'
                  : 'border-orange-200 bg-orange-50'
              }`}>
                {ev.done && <span className={`w-2 h-2 rounded-full ${ev.exception ? 'bg-red-400' : i === 0 ? 'bg-white' : 'bg-orange-400'}`} />}
              </div>

              <div className="pb-5 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm font-semibold ${!ev.done ? 'text-slate-300' : ev.exception ? 'text-red-600' : 'text-slate-900'}`}>
                    {ev.label}
                  </span>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{ev.date} · {ev.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-slate-300" />
                  <span className="text-xs text-slate-400">{ev.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Page ── */
export default function TrackPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState(id ?? '');
  const [searched, setSearched] = useState(id ?? '');

  const shipment = searched
    ? getShipments().find(s => s.id.toLowerCase() === searched.toLowerCase())
    : undefined;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearched(trimmed);
    navigate(`/track/${trimmed}`, { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <header className="bg-slate-900 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <Truck size={15} className="text-white" />
            </div>
            <span className="font-black text-white text-base tracking-tight">
              CARGO<span className="text-orange-400"> DHL</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Track your shipment</h1>
          <p className="text-slate-400 text-sm mb-6">Enter your Cargo DHL tracking number below.</p>

          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. CDHL-0013-LG"
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 font-mono shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
            >
              <Search size={15} /> Track
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 mb-8 text-xs text-slate-400">
            <span>Try:</span>
            {['CDHL-0012-NY', 'CDHL-0013-LG', 'CDHL-0014-LN', 'CDHL-0017-NY'].map(tid => (
              <button key={tid} onClick={() => { setQuery(tid); setSearched(tid); navigate(`/track/${tid}`, { replace: true }); }}
                className="font-mono text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors">
                {tid}
              </button>
            ))}
          </div>
        </motion.div>

        {searched && (
          shipment
            ? <TrackResult shipment={shipment} />
            : <NotFound id={searched} />
        )}

        {!searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-center py-20">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Package size={26} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">Enter a tracking number to see shipment details</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
