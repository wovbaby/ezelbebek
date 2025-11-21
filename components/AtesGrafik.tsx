"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

export default function AtesGrafik({ data }: { data: any[] }) {
  // Veriyi grafiğe uygun hale getir (Ters çevir ki eskiden yeniye gitsin)
  const grafikVerisi = data.slice().reverse().map(item => ({
    saat: new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    derece: item.derece,
    ilac: item.ilac !== 'İlaçsız' ? item.ilac : null // İlaç varsa tooltipte görünsün
  }));

  if (grafikVerisi.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-300 text-sm">Veri yok</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={grafikVerisi}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        
        <XAxis 
            dataKey="saat" 
            tick={{fontSize: 10, fill: '#9ca3af'}} 
            axisLine={false} 
            tickLine={false}
            interval="preserveStartEnd"
        />
        
        <YAxis 
            domain={[35, 41]} // Derece aralığı
            tick={{fontSize: 10, fill: '#9ca3af'}} 
            axisLine={false} 
            tickLine={false}
            width={30}
        />
        
        <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '2px' }}
        />

        {/* Kritik Sınır Çizgisi (38 Derece) */}
        <ReferenceLine y={38} stroke="red" strokeDasharray="3 3" strokeOpacity={0.5} />

        <Line 
            type="monotone" 
            dataKey="derece" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}