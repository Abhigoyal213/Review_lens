/**
 * Charts.jsx - Visual Recharts Breakdown
 * 
 * Renders:
 * 1. Sentiment Distribution (Donut Chart)
 * 2. Ratings vs Sentiment comparison
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as ChartIcon } from 'lucide-react';

const COLORS = {
  positive: '#22c55e', // Emerald 500
  neutral: '#f59e0b',  // Amber 500
  negative: '#f43f5e', // Rose 500
};

export const Charts = ({ stats }) => {
  const sentiment = stats?.sentiment || { positive: 0, neutral: 0, negative: 0 };

  const data = [
    { name: 'Positive', value: sentiment.positive || 0, color: COLORS.positive },
    { name: 'Neutral', value: sentiment.neutral || 0, color: COLORS.neutral },
    { name: 'Negative', value: sentiment.negative || 0, color: COLORS.negative },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-2 text-gray-800 font-semibold text-sm pb-3 border-b border-gray-100">
        <ChartIcon className="w-4 h-4 text-emerald-600" />
        <span>Sentiment Breakdown Visualization</span>
      </div>

      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} reviews`, name]}
              contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-gray-700 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
