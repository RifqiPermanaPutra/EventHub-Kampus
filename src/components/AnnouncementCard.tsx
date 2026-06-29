/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AnnouncementCard() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div>
        <h4 className="text-[10px] font-bold text-campus-blue uppercase tracking-[0.2em] mb-4">Pengumuman Terbaru</h4>
        <p className="editorial-title text-2xl font-bold leading-tight mb-4">
          Jadwal Libur Semester Telah Dirilis
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Rektorat telah mengumumkan libur semester yang dipercepat mulai Desember ini. Cek kalender akademik lengkap...
        </p>
      </div>
      
      <Link 
        to="/explore" 
        className="text-campus-blue text-sm font-bold mt-8 flex items-center gap-2 hover:underline group"
      >
        Baca selengkapnya 
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
