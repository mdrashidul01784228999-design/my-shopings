'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 5300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 700 },
  { name: 'May', value: 600 },
   { name: 'june', value: 1200 },
  { name: 'julay', value: 3300 },
  { name: 'agust', value: 1500 },
  { name: 'octo', value: 1700 },
  { name: 'november', value: 15600 },
  { name: 'Dec', value: 1500 },
  { name: 'Dec', value: 50 },
];

export default function ChartSection() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-4">
      <h3 className="text-lg font-medium mb-2">Monthly Spending</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
