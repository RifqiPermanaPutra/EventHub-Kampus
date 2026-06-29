/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Event } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

export function EventCard({ event }: { event: Event }) {
  const categoryColors: Record<string, 'blue' | 'green' | 'purple' | 'red' | 'gray'> = {
    Akademik: 'green',
    'Seni & Budaya': 'purple',
    Olahraga: 'red',
    Seminar: 'blue',
  };

  const isPast = new Date(event.date).getTime() < new Date().getTime();

  return (
    <Link 
      to={`/event/${event.id}`}
      className={cn(
        "group block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:translate-x-1",
        isPast ? "opacity-75 grayscale-[0.2]" : "hover:border-l-[6px] hover:border-l-campus-blue"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        {isPast ? (
          <Badge variant="gray">Selesai</Badge>
        ) : (
          <Badge variant={categoryColors[event.category] || 'blue'}>{event.category}</Badge>
        )}
        <span className="text-[10px] font-bold text-gray-400">
          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
        </span>
      </div>
      
      <h5 className="font-bold text-gray-900 mb-2 truncate group-hover:text-campus-blue transition-colors">{event.title}</h5>
      <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
        {event.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
          <Calendar size={12} />
          {format(new Date(event.date), 'MMM d, yyyy')}
        </div>
        <span className={cn(
          "font-bold text-[10px] uppercase tracking-wider group-hover:underline",
          isPast ? "text-gray-400" : "text-campus-blue"
        )}>
          {isPast ? 'Lihat Detail' : 'RSVP Sekarang'}
        </span>
      </div>
    </Link>
  );
}
