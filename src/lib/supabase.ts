import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error }
    }
    console.log('Supabase connection successful')
    return { success: true, data }
  } catch (err) {
    console.error('Supabase connection failed:', err)
    return { success: false, error: err }
  }
}

// User types
export interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  created_at?: string
}

// Auth helper functions
export const signUp = async (email: string, password: string, userData: { firstName: string; lastName: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`
      }
    }
  })
  
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}

// Database helper functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  
  return { data, error }
}

export const saveWebsite = async (websiteData: any) => {
  const { data, error } = await supabase
    .from('websites')
    .insert(websiteData)
  
  return { data, error }
}

export const getUserWebsites = async (userId: string) => {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const saveAIInsight = async (insightData: any) => {
  const { data, error } = await supabase
    .from('ai_insights')
    .insert(insightData)
  
  return { data, error }
}

export const getUserInsights = async (userId: string) => {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const logUserActivity = async (activityData: any) => {
  const { data, error } = await supabase
    .from('user_activity')
    .insert(activityData)
  
  return { data, error }
}

// Chatbot context functions
export const getBusinessProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const getUserContext = async (userId: string) => {
  try {
    // Get business profile
    const { data: businessProfile, error: businessError } = await getBusinessProfile(userId)
    
    // Get user profile
    const { data: userProfile, error: userError } = await getProfile(userId)
    
    // Get recent websites
    const { data: websites, error: websitesError } = await supabase
      .from('websites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    // Get recent AI insights
    const { data: insights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)
    
    // Get recent email campaigns
    const { data: emailCampaigns, error: emailError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)
    
    return {
      businessProfile: businessProfile || null,
      userProfile: userProfile || null,
      recentWebsites: websites || [],
      recentInsights: insights || [],
      recentEmailCampaigns: emailCampaigns || [],
      errors: {
        business: businessError,
        user: userError,
        websites: websitesError,
        insights: insightsError,
        email: emailError
      }
    }
  } catch (error) {
    console.error('Error fetching user context:', error)
    return {
      businessProfile: null,
      userProfile: null,
      recentWebsites: [],
      recentInsights: [],
      recentEmailCampaigns: [],
      errors: { general: error }
    }
  }
}

// Analytics functions
export const getAnalyticsData = async (userId: string, period: string = "30d") => {
  try {
    // Get user's websites
    const { data: websites, error: websitesError } = await supabase
      .from('websites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (websitesError) {
      console.error('Error fetching websites:', websitesError)
      return { data: null, error: websitesError }
    }

    // Get analytics events for the period
    const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError)
      return { data: null, error: analyticsError }
    }

    // Get email campaigns
    const { data: emailCampaigns, error: emailError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (emailError) {
      console.error('Error fetching email campaigns:', emailError)
    }

    return {
      data: {
        websites: websites || [],
        analytics: analytics || [],
        emailCampaigns: emailCampaigns || []
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return { data: null, error }
  }
}

export const logAnalyticsEvent = async (eventData: {
  user_id: string
  website_id?: string
  event_type: string
  event_data?: any
  session_id?: string
  page_url?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
}) => {
  const { data, error } = await supabase
    .from('analytics')
    .insert(eventData)
  
  return { data, error }
}