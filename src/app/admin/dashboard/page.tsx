"use client"

import { useEffect, useState } from "react"
import { getDashboardStats } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react"

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444']

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const { stats, charts, completionData } = data

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of the employee data collection progress.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mt-2">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mt-2">{stats.todaySubmissions}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mt-2">{stats.weekSubmissions}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground mt-2">{stats.monthSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">Branch-wise Submissions</CardTitle>
            <MoreHorizontal className="text-muted-foreground w-5 h-5 cursor-pointer" />
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.branchChartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: 'var(--color-muted-foreground)'}} dy={10} />
                <Tooltip cursor={{fill: 'var(--color-secondary)', opacity: 0.4}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">Daily Submission Trend</CardTitle>
            <CalendarIcon className="text-muted-foreground w-5 h-5 cursor-pointer" />
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.dateChartData}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tick={{fill: 'var(--color-muted-foreground)'}} dy={10} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={4} dot={false} activeDot={{r: 8, fill: 'var(--color-primary)', stroke: '#fff', strokeWidth: 3}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">Branch Completion Status</CardTitle>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">Filter</button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">View All</button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Table>
              <TableHeader className="[&_tr]:border-b-0">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Branch Name</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expected</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Submitted</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completionData.map((b: any) => (
                  <TableRow key={b.branch_name} className="border-b border-secondary/50 hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-bold text-foreground py-4">{b.branch_name}</TableCell>
                    <TableCell className="text-muted-foreground py-4">{b.expected || "Not Set"}</TableCell>
                    <TableCell className="font-bold text-foreground py-4">{b.submitted}</TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {b.pending !== null ? b.pending : <span className="bg-secondary text-foreground text-xs font-bold px-2.5 py-1 rounded-full">N/A</span>}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      {b.percentage !== null ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${b.percentage >= 100 ? 'bg-primary' : 'bg-primary'}`}
                              style={{ width: `${b.percentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{b.percentage}% COMPLETE</span>
                        </div>
                      ) : (
                        <span className="bg-secondary text-foreground text-xs font-bold px-2.5 py-1 rounded-full">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
