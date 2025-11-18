'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [salesData] = useState([
    { month: 'Jan', sales: 45000, trials: 120, bookings: 85 },
    { month: 'Feb', sales: 52000, trials: 135, bookings: 95 },
    { month: 'Mar', sales: 48000, trials: 115, bookings: 82 },
    { month: 'Apr', sales: 61000, trials: 150, bookings: 110 },
    { month: 'May', sales: 55000, trials: 140, bookings: 98 },
    { month: 'Jun', sales: 67000, trials: 160, bookings: 125 },
  ])

  const [inventoryData] = useState([
    { item: 'Hearing Aids', current: 45, minimum: 20, status: 'Good' },
    { item: 'Domes', current: 12, minimum: 30, status: 'Low' },
    { item: 'Batteries', current: 8, minimum: 50, status: 'Critical' },
    { item: 'Receivers', current: 25, minimum: 15, status: 'Good' },
    { item: 'Molds', current: 18, minimum: 10, status: 'Good' },
  ])

  const [staffPerformance] = useState([
    { name: 'Dr. Priya', trials: 45, conversion: '85%', satisfaction: '4.8/5' },
    { name: 'Dr. Rajesh', trials: 38, conversion: '79%', satisfaction: '4.6/5' },
    { name: 'Ms. Neha', trials: 32, conversion: '88%', satisfaction: '4.9/5' },
  ])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-600">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">Complete clinic overview and analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <KPICard
          title="Total Revenue"
          value="₹3,28,000"
          change="+12% from last month"
          icon={<DollarSign className="w-5 sm:w-6 h-5 sm:h-6" />}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <KPICard
          title="Total Patients"
          value="328"
          change="+8 new patients"
          icon={<Users className="w-5 sm:w-6 h-5 sm:h-6" />}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <KPICard
          title="Conversion Rate"
          value="84%"
          change="Trials to bookings"
          icon={<TrendingUp className="w-5 sm:w-6 h-5 sm:h-6" />}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
        />
        <KPICard
          title="Low Stock Items"
          value="2"
          change="Immediate action needed"
          icon={<AlertTriangle className="w-5 sm:w-6 h-5 sm:h-6" />}
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Sales & Performance Trend</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Monthly sales, trials, and bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 sm:h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2} />
                <Line type="monotone" dataKey="trials" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Inventory Status</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Current stock levels and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {inventoryData.map((item) => (
                <div key={item.item} className="flex items-center justify-between p-2 sm:p-3 border border-slate-200 rounded-lg">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{item.item}</p>
                    <p className="text-xs text-slate-600">Min: {item.minimum}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${item.status === 'Good' ? 'text-green-600' : item.status === 'Low' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {item.current}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                      item.status === 'Good' ? 'bg-green-100 text-green-600' :
                      item.status === 'Low' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Staff Performance</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Audiologist statistics and ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {staffPerformance.map((staff) => (
                <div key={staff.name} className="p-2 sm:p-3 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">{staff.name}</h4>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs sm:text-sm">
                    <div>
                      <p className="text-slate-600">Trials</p>
                      <p className="font-bold">{staff.trials}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Conversion</p>
                      <p className="font-bold text-teal-600">{staff.conversion}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Rating</p>
                      <p className="font-bold text-teal-600">{staff.satisfaction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KPICard({ title, value, change, icon, bgColor, textColor }) {
  return (
    <Card className="border-0">
      <CardContent className="pt-3 sm:pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-slate-600 text-xs">{title}</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-slate-600 mt-1">{change}</p>
          </div>
          <div className={`${bgColor} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
            <div className={textColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
