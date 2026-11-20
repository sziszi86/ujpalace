'use client';

import { useEffect, useState } from 'react';

type PageRow = { path: string; title: string; total_views: number; unique_visitors: number };
interface AnalyticsData {
  summary: { totalViews: number; totalVisitors: number; totalSessions: number };
  currentOnline: number;
  dailyStats: Array<{ date: string; measured: boolean; total_views: number | null; unique_visitors: number | null }>;
  topPages: PageRow[];
  topTournaments: PageRow[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  referrers: Array<{ referrer_domain: string; sessions: number }>;
  campaigns: Array<{ source: string; medium: string | null; campaign: string; sessions: number }>;
  measurement: { first_event_at: string | null; last_event_at: string | null; checked_at: string };
}
const periods = [
  { label: 'Ma', days: 1, offset: 0 }, { label: 'Tegnap', days: 1, offset: 1 },
  { label: '7 nap', days: 7, offset: 0 }, { label: '30 nap', days: 30, offset: 0 }, { label: '90 nap', days: 90, offset: 0 },
];
const count = (value: number) => value.toLocaleString('hu-HU');
const dateTime = (value: string) => new Date(value).toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });

function PageTable({ title, rows }: { title: string; rows: PageRow[] }) {
  return <section className="bg-white rounded-lg shadow p-5 overflow-x-auto">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {rows.length ? <table className="w-full text-sm text-left">
      <thead><tr className="border-b text-gray-500"><th className="pb-2">Oldal</th><th className="pb-2 text-right">Megtekintés</th><th className="pb-2 text-right pl-3">Látogató</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.path} className="border-b last:border-0">
        <td className="py-3 pr-4"><a href={row.path} className="font-medium text-poker-primary">{row.title || row.path}</a><p className="text-xs text-gray-500 break-all">{row.path}</p></td>
        <td className="text-right">{count(row.total_views)}</td><td className="text-right pl-3">{count(row.unique_visitors)}</td>
      </tr>)}</tbody>
    </table> : <p className="text-gray-500">Ebben az időszakban még nincs mért megtekintés.</p>}
  </section>;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(2);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let stopped = false;
    let busy = false;
    let controller: AbortController | undefined;
    setLoading(true); setData(null); setError('');
    const load = async () => {
      if (busy || document.visibilityState === 'hidden') return;
      busy = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 8000);
      try {
        const { days, offset } = periods[period];
        const response = await fetch(`/api/analytics?days=${days}&offset=${offset}`, {
          cache: 'no-store', signal: controller.signal,
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'A mérés nem elérhető.');
        if (!stopped) { setData(result); setError(''); }
      } catch (e) {
        if (!stopped) { setData(null); setError(e instanceof Error ? e.message : 'A mérés nem elérhető.'); }
      } finally { clearTimeout(timeout); busy = false; if (!stopped) setLoading(false); }
    };
    void load();
    const interval = setInterval(load, 30000);
    document.addEventListener('visibilitychange', load);
    return () => { stopped = true; controller?.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', load); };
  }, [period, refresh]);

  const maxViews = Math.max(1, ...(data?.dailyStats.map(day => day.total_views || 0) || []));
  return <div className="space-y-6 text-gray-900">
    <div className="flex flex-wrap justify-between items-start gap-4">
      <div><h1 className="text-3xl font-bold">Látogatottság</h1><p className="text-gray-600 mt-1">Mért böngészők, látogatások és oldalmegtekintések · magyarországi idő szerint</p></div>
      <button type="button" onClick={() => setRefresh(value => value + 1)} className="px-4 py-2 bg-white border rounded-lg">Frissítés</button>
    </div>
    <div className="flex flex-wrap gap-2">{periods.map((option, index) =>
      <button type="button" key={option.label} aria-pressed={period === index} onClick={() => setPeriod(index)} className={`px-4 py-2 rounded-lg ${period === index ? 'bg-poker-primary text-white' : 'bg-white border'}`}>{option.label}</button>
    )}</div>
    <p className="text-sm text-gray-600">Az egyedi látogató egy böngészőazonosító. Csak a méréshez hozzájáruló, nem blokkolt böngészőket látjuk. Saját adminforgalom és ismert robotok kizárva. A többnapos nézetek a mai, még nem teljes napot is tartalmazzák.</p>
    {loading && <p role="status">Adatok betöltése…</p>}
    {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4"><strong>Mérés nem elérhető.</strong> {error} A hiányzó adat nem jelent nulla látogatót.</div>}
    {data && <>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm space-y-1">
        <p>Utolsó sikeres lekérdezés: {dateTime(data.measurement.checked_at)} · automatikus frissítés 30 másodpercenként</p>
        <p>{data.measurement.first_event_at ? `Új mérés első eseménye: ${dateTime(data.measurement.first_event_at)}. Az első nap részleges.` : 'Az új mérés még nem fogadott eseményt.'}</p>
        <p>Utolsó fogadott esemény: {data.measurement.last_event_at ? dateTime(data.measurement.last_event_at) : 'még nincs'}</p>
        <p>A korábbi, nem hitelesített adatok megmaradtak, de nem szerepelnek ezekben a számokban. A mérés előtti napoknál nincs adat.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Egyedi látogatók', data.summary.totalVisitors, 'Az időszak különböző böngészői'],
          ['Látogatások', data.summary.totalSessions, '30 perc inaktivitás után új látogatás'],
          ['Oldalmegtekintések', data.summary.totalViews, 'Az újratöltés új megtekintés'],
          ['Most aktív', data.currentOnline, 'Látható oldalról életjel az utolsó 5 percben'],
        ].map(([label, value, detail]) => <div key={String(label)} className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-600">{label}</p><p className="text-4xl font-bold mt-2">{count(Number(value))}</p><p className="text-xs text-gray-500 mt-2">{detail}</p>
        </div>)}
      </div>
      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Napi forgalom</h2>
        <div className="overflow-x-auto"><div className="flex items-end gap-2 h-56" style={{ minWidth: data.dailyStats.length * 30 }}>
          {data.dailyStats.map(day => <div key={day.date} className="flex-1 min-w-6 text-center" title={`${day.date}: ${day.measured ? `${day.total_views} megtekintés, ${day.unique_visitors} látogató` : 'nincs mérési adat'}`}>
            <div className={`rounded-t ${day.measured ? 'bg-poker-primary' : 'bg-gray-200'}`} style={{ height: day.measured ? Math.max(2, ((day.total_views || 0) / maxViews) * 170) : 4 }} />
            <span className="text-[10px] text-gray-500">{day.date.slice(5)}</span>
          </div>)}
        </div></div>
        <details className="mt-4 text-sm"><summary className="cursor-pointer">Napi számok táblázatban</summary>
          <div className="max-h-72 overflow-auto mt-2"><table className="w-full text-left"><thead><tr><th>Dátum</th><th>Látogató</th><th>Megtekintés</th></tr></thead>
            <tbody>{data.dailyStats.map(day => <tr key={day.date}><td>{day.date}</td><td>{day.unique_visitors ?? 'Nincs adat'}</td><td>{day.total_views ?? 'Nincs adat'}</td></tr>)}</tbody>
          </table></div>
        </details>
      </section>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6"><PageTable title="Legnézettebb oldalak" rows={data.topPages} /><PageTable title="Legnézettebb versenyek" rows={data.topTournaments} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow p-5"><h2 className="text-lg font-semibold mb-4">Belépési források · látogatások</h2>
          <p className="text-xs text-gray-500 mb-3">A látogatás kezdetén rögzített forrás. A hiányzó hivatkozás közvetlen / ismeretlen.</p>
          {data.referrers.map(row => <div key={row.referrer_domain} className="flex justify-between gap-4 border-b py-2"><span className="break-all">{row.referrer_domain === 'direct' ? 'Közvetlen / ismeretlen' : row.referrer_domain}</span><strong>{count(row.sessions)}</strong></div>)}
          {!data.referrers.length && <p className="text-gray-500">Még nincs mért látogatás.</p>}
        </section>
        <section className="bg-white rounded-lg shadow p-5"><h2 className="text-lg font-semibold mb-4">Eszközök · oldalmegtekintések</h2>
          {(['desktop', 'mobile', 'tablet'] as const).map((device, index) => <div key={device} className="flex justify-between border-b py-2"><span>{['Számítógép', 'Mobil', 'Tablet'][index]}</span><strong>{count(data.deviceBreakdown[device])} · {data.summary.totalViews ? Math.round(data.deviceBreakdown[device] / data.summary.totalViews * 100) : 0}%</strong></div>)}
        </section>
      </div>
      <section className="bg-white rounded-lg shadow p-5 overflow-x-auto"><h2 className="text-lg font-semibold mb-4">Kampányok</h2>
        {data.campaigns.length ? <table className="w-full text-sm text-left"><thead><tr><th>Kampány</th><th>Forrás / médium</th><th className="text-right">Látogatás</th></tr></thead><tbody>
          {data.campaigns.map((row, index) => <tr key={index} className="border-b"><td className="py-3">{row.campaign}</td><td>{row.source} / {row.medium || '–'}</td><td className="text-right">{count(row.sessions)}</td></tr>)}
        </tbody></table> : <p className="text-gray-500">Még nincs UTM kampányból mért látogatás.</p>}
      </section>
    </>}
  </div>;
}
