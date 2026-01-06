'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, RefreshCw, Calendar, Filter, BarChart3 } from 'lucide-react'
import { Report } from '@/types'
import { format } from 'date-fns'
import { ReportGenerator } from '@/components/keph/report-generator'

import { supabase } from '@/lib/supabase'

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)

  const [reportCategories, setReportCategories] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetchReports()
  }, [])

  // Function to fetch task categories for a specific date range
  const fetchTaskCategories = async (startDate: string, endDate: string): Promise<string[]> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return []

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          categories(name)
        `)
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .not('categories', 'is', null)

      if (error) {
        console.error('Error fetching task categories:', error)
        return []
      }

      // Extract unique category names
      const categories = tasks
        ?.map(task => task.categories?.name)
        .filter((name): name is string => Boolean(name))
        .filter((name, index, arr) => arr.indexOf(name) === index) || []

      return categories
    } catch (error) {
      console.error('Error fetching task categories:', error)
      return []
    }
  }

  // Function to fetch categories for all reports
  const fetchAllReportCategories = async (reportsData: Report[]) => {
    const categoriesMap: Record<string, string[]> = {}
    
    for (const report of reportsData) {
      const categories = await fetchTaskCategories(report.date_range_start, report.date_range_end)
      categoriesMap[report.id] = categories
    }
    
    setReportCategories(categoriesMap)
  }

  const handleRegenerateReport = async (reportId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports/${reportId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to regenerate report')
      }

      // Refresh the reports list
      await fetchReports()
    } catch (error) {
      console.error('Error regenerating report:', error)
      setError('Failed to regenerate report')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required')
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch reports')
      }

      const data = await response.json()
       setReports(data.reports || [])
       
       // Fetch categories for all reports
       if (data.reports && data.reports.length > 0) {
         await fetchAllReportCategories(data.reports)
       }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }



  const getToneProfileColor = (tone: Report['tone_profile']) => {
    const colors = {
      professional: 'bg-slate-100 text-slate-800',
      casual: 'bg-yellow-100 text-yellow-800',
      motivational: 'bg-pink-100 text-pink-800',
      analytical: 'bg-indigo-100 text-indigo-800',
      reflective: 'bg-purple-100 text-purple-800',
    }
    return colors[tone]
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      health: 'bg-red-100 text-red-800',
      learning: 'bg-purple-100 text-purple-800',
      finance: 'bg-yellow-100 text-yellow-800',
      social: 'bg-pink-100 text-pink-800',
      travel: 'bg-indigo-100 text-indigo-800',
      hobbies: 'bg-orange-100 text-orange-800',
    }
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading reports...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center gap-4 mb-12">
          <Button 
            variant="ghost" 
            className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 px-0"
            onClick={() => router.push('/dashboard')}
          >
            <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-4 w-4">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
            </div>
            <span className="font-bold text-xs uppercase tracking-wider">Back to Dashboard</span>
          </Button>
        </div>
      
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md group-hover:blur-xl transition-all duration-500" />
              <div className="relative p-4 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] shadow-2xl">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Reports
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Your productivity insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full bg-white/5 border-white/[0.08] hover:bg-white/10 transition-all duration-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <Button className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300" onClick={() => setShowGenerator(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>

      {reports.length === 0 ? (
        <Card className="text-center py-12 bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first productivity report to get insights into your task completion patterns.
            </p>
            <Button className="flex items-center gap-2 mx-auto" onClick={() => setShowGenerator(true)}>
              <Plus className="h-4 w-4" />
              Generate Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Timeline Layout */
        <div className="relative">
          {reports.map((report, index) => (
            <div key={report.id} className="flex relative">
              {/* Date Column - Fixed width and sticky */}
              <div className="w-[130px] flex-shrink-0 pr-6 mt-8 sticky top-8 self-start">
                <div className="text-sm font-medium text-foreground">
                  {format(new Date(report.created_at), 'MMM d, yyyy')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(report.created_at), 'h:mm a')}
                </div>
              </div>
              
              {/* Timeline Line and Dot */}
              <div className="relative flex flex-col items-center">
                <div className="w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm z-10 mt-8" />
                {index < reports.length - 1 && (
                  <div className="w-px bg-border flex-1 mt-2" style={{ minHeight: '200px' }} />
                )}
              </div>
              
              {/* Content Area - Flexible width */}
              <div className="flex-1 pl-6 pb-12">
                <Card className="w-full bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
    
                  <CardContent className="space-y-6 pt-6">
                    {/* Personal Intro Section */}
                    {/* Title */}
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{report.title}</CardTitle>


                    </div>

                    {/* Report Period */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Report Period: {format(new Date(report.date_range_start), 'MMM d')} - {format(new Date(report.date_range_end), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{report.completionRate || 0}%</div>
                        <div className="text-xs text-muted-foreground">Completion Rate</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{report.completedTasks || 0}</div>
                        <div className="text-xs text-muted-foreground">Tasks Completed</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {report.totalSubtasks || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Subtasks</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {report.totalUrls || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Total URLs</div>
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="text-muted-foreground leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{
                          __html: report.content
                            .replace(/\*\*([^*]+)\*\*/g, '<h3 class="text-lg font-semibold text-foreground mb-3 mt-6">$1</h3>')
                            .replace(/\*([^*\n]+)\*/g, '<div class="flex items-start gap-3 mb-2"><div class="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div><div class="font-medium text-foreground">$1</div></div>')
                            .replace(/\n\n/g, '</p><p class="mb-3">')
                            .replace(/^/, '<p class="mb-3">')
                            .replace(/$/, '</p>')
                        }}
                      />
                    </div>

                    {/* Task Categories from Report Date Range */}
                    <div className="flex flex-wrap gap-2">
                        {reportCategories[report.id]?.length > 0 ? (
                          reportCategories[report.id].map((category, idx) => (
                            <Badge key={idx} className={getCategoryColor(category)}>
                              {category}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            No categories
                          </Badge>
                        )}
                        <Badge variant="outline" className={getToneProfileColor(report.tone_profile)}>
                          {report.tone_profile}
                        </Badge>

                      </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t border-border/30">
                      <Button variant="outline" size="sm" className="flex items-center gap-2 bg-muted/50 border-border/50">
                        <FileText className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 bg-muted/50 border-border/50"
                        onClick={() => handleRegenerateReport(report.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}
      
        <ReportGenerator 
          open={showGenerator} 
          onOpenChange={setShowGenerator}
          onReportGenerated={fetchReports}
        />
        

      </div>
    </div>
  )
}