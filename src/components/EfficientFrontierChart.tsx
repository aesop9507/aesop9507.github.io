import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush, AreaChart, Area } from 'recharts';

interface ChartDataPoint {
    volatility: number;
    expected_return: number;
    sharpe_ratio: number;
}

const EfficientFrontierChart: React.FC = () => {
    const [data, setData] = useState<ChartDataPoint[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/v1/portfolio/chart-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ asset_ids: [1, 2, 3] })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    setData(result.data);
                }
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }
        };
        fetchData();
    }, []);

    if (!data || data.length === 0) return <div>Loading...</div>;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="volatility" type="number" label="Risk (Volatility)" domain={['auto', 'auto']} allowDataOverflow={true} />
                <YAxis dataKey="expected_return" type="number" label="Return (%)" domain={['auto', 'auto']} allowDataOverflow={true} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#8884d8', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value, name, props) => {
                        if (name === 'expected_return') return `Return: ${value.toFixed(2)}%`;
                        if (name === 'volatility') return `Risk: ${value.toFixed(2)}`;
                        return props.payload;
                    }}
                />
                <Area type="monotone" dataKey="expected_return" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
                <Line type="monotone" dataKey="expected_return" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Brush dataKey="expected_return" stroke="#8884d8" fill="#8884d8" />
                <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default EfficientFrontierChart;
