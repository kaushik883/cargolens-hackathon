import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { getTracking, getTrackingEvents } from '../api/client';
import type { TrackingShipment } from '../api/types';

const STATUS_COLORS: Record<string, string> = {
  IN_TRANSIT: 'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERED:  'bg-green-50 text-green-700 border-green-200',
  CUSTOMS:    'bg-amber-50 text-amber-700 border-amber-200',
  DELAYED:    'bg-red-50 text-red-700 border-red-200',
  PICKED_UP:  'bg-gray-100 text-gray-600 border-gray-200',
};

function EventTimeline({ quoteId }: { quoteId: number }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['tracking-events', quoteId],
    queryFn: () => getTrackingEvents(quoteId),
  });

  if (isLoading) {
    return (
      <div className="p-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="px-5 py-4 text-sm text-gray-400 italic">No tracking events recorded yet.</p>;
  }

  return (
    <div className="px-6 pb-6 pt-4">
      <div className="relative">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />
        <ul className="space-y-5">
          {events.map((event, idx) => (
            <li key={event.id} className="relative flex gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${
                  idx === 0
                    ? 'border-gray-900 bg-gray-900'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-gray-300'}`} />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-semibold ${idx === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                    {event.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(event.event_time).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{event.description}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {event.location}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ShipmentRow({ shipment }: { shipment: TrackingShipment }) {
  const [expanded, setExpanded] = useState(false);
  const statusCls = STATUS_COLORS[shipment.current_status] ?? 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <div className="flex-1 grid grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">AWB</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{shipment.tracking_number}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Route</p>
            <p className="text-sm text-gray-700">{shipment.origin} → {shipment.destination}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Forwarder</p>
            <p className="text-sm text-gray-700">{shipment.forwarder_name}</p>
          </div>
          <div>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-semibold ${statusCls}`}>
              {shipment.current_status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100">
          <EventTimeline quoteId={shipment.quote_id} />
        </div>
      )}
    </div>
  );
}

export function Tracking() {
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['tracking'],
    queryFn: getTracking,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Logistics</p>
        <h1 className="text-2xl font-bold text-gray-900">Shipment Tracking</h1>
        <p className="text-gray-500 mt-1 text-sm">Live status and event history for all active shipments</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-gray-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-24 text-center">
          <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No shipments tracked yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => (
            <ShipmentRow key={s.quote_id} shipment={s} />
          ))}
        </div>
      )}
    </div>
  );
}
