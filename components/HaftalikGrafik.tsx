"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function HaftalikGrafik({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fill: '#9ca3af'}} 
            dy={10}
        />
        <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fill: '#9ca3af'}} 
        />
        <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            cursor={{fill: 'transparent'}}
        />
        <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
        
        {/* Çubuklar */}
        <Bar dataKey="mama" name="Mama" fill="#fdba74" radius={[4, 4, 0, 0]} stackId="a" />
        <Bar dataKey="bez" name="Bez" fill="#93c5fd" radius={[4, 4, 0, 0]} stackId="a" />
        <Bar dataKey="uyku" name="Uyku" fill="#a5b4fc" radius={[4, 4, 0, 0]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}