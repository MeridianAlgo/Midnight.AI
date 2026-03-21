
"use strict";
"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Brain, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [logFile, setLogFile] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/logs');
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          setLogFile(json.file);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Initial
    const interval = setInterval(fetchData, 2000); // Poll
    return () => clearInterval(interval);
  }, []);

  const lastEpoch = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Midnight.AI Cortex
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Live Training Telemetry | File: <span className="font-mono text-purple-300">{logFile}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${loading ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'} flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`}></div>
            {loading ? 'CONNECTING...' : 'LIVE'}
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <Activity size={18} />
            <span className="text-xs uppercase tracking-wider">Current Epoch</span>
          </div>
          <div className="text-2xl font-bold">{lastEpoch ? lastEpoch.epoch : '-'}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <Brain size={18} />
            <span className="text-xs uppercase tracking-wider">Validation Accuracy</span>
          </div>
          <div className={`text-2xl font-bold ${lastEpoch?.val_acc > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
            {lastEpoch ? lastEpoch.val_acc.toFixed(1) + '%' : '-'}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <TrendingUp size={18} />
            <span className="text-xs uppercase tracking-wider">Generalization Gap</span>
          </div>
          <div className="text-2xl font-bold">
            {lastEpoch ? (lastEpoch.val_loss - lastEpoch.train_loss).toFixed(4) : '-'}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <AlertTriangle size={18} />
            <span className="text-xs uppercase tracking-wider">Val Loss</span>
          </div>
          <div className="text-2xl font-bold text-pink-400">
            {lastEpoch ? lastEpoch.val_loss.toFixed(4) : '-'}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loss Chart */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Loss Dynamics</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="epoch" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="train_loss" stroke="#8b5cf6" strokeWidth={2} name="Train Loss" dot={false} />
                <Line type="monotone" dataKey="val_loss" stroke="#ec4899" strokeWidth={2} name="Val Loss" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-slate-300">Accuracy Trajectory</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="epoch" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="train_acc" stroke="#22c55e" strokeWidth={2} name="Train Acc" dot={false} />
                <Line type="monotone" dataKey="val_acc" stroke="#3b82f6" strokeWidth={2} name="Val Acc" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
