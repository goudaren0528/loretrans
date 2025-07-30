import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { initializeDatabase } from '@/lib/database/init'

export const dynamic = 'force-dynamic'

interface CreateTaskRequest {
  type: 'text' | 'document'
  sourceLanguage: string
  targetLanguage: string
  content?: string // For text translation
  fileName?: string // For document translation
  fileUrl?: string // For document translation
  priority?: number // 1-10, default 5
}

interface CreateTaskResponse {
  success: boolean
  taskId?: string
  message?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to create translation tasks'
      }, { status: 401 })
    }

    // Parse request body
    const body: CreateTaskRequest = await request.json()
    
    // Validate request
    if (!body.type || !body.sourceLanguage || !body.targetLanguage) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        message: 'Missing required fields: type, sourceLanguage, targetLanguage'
      }, { status: 400 })
    }

    if (body.type === 'text' && !body.content) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        message: 'Content is required for text translation'
      }, { status: 400 })
    }

    if (body.type === 'document' && (!body.fileName || !body.fileUrl)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        message: 'fileName and fileUrl are required for document translation'
      }, { status: 400 })
    }

    // Estimate credits needed
    let estimatedCredits = 0
    if (body.type === 'text' && body.content) {
      // Rough estimation: 1 credit per 100 characters
      estimatedCredits = Math.ceil(body.content.length / 100)
    } else if (body.type === 'document') {
      // Default estimation for documents, will be updated during processing
      estimatedCredits = 50
    }

    // Check user credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.credits < estimatedCredits) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        message: `You need at least ${estimatedCredits} credits for this translation`
      }, { status: 402 })
    }

    // Prepare task data
    const taskData = {
      user_id: user.id,
      job_type: body.type,
      status: 'pending',
      priority: body.priority || 5,
      source_language: body.sourceLanguage,
      target_language: body.targetLanguage,
      estimated_credits: estimatedCredits,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    // Add content-specific data
    if (body.type === 'text') {
      Object.assign(taskData, {
        original_content: body.content,
        total_chunks: 1
      })
    } else if (body.type === 'document') {
      Object.assign(taskData, {
        file_info: {
          fileName: body.fileName,
          fileUrl: body.fileUrl,
          uploadedAt: new Date().toISOString()
        }
      })
    }

    // Create translation task
    const { data: task, error: createError } = await supabase
      .from('translation_jobs')
      .insert([taskData])
      .select('id')
      .single()

    if (createError) {
      console.error('[CREATE TASK] Database error:', createError)
      
      // If table doesn't exist, try to initialize database
      if (createError.code === '42P01') {
        console.log('[CREATE TASK] Table does not exist, initializing database...')
        const initResult = await initializeDatabase()
        
        if (initResult.success) {
          // Retry task creation
          const { data: retryTask, error: retryError } = await supabase
            .from('translation_jobs')
            .insert([taskData])
            .select('id')
            .single()
            
          if (!retryError && retryTask) {
            // Queue the task for processing
            await queueTranslationTask(retryTask.id, taskData)
            
            return NextResponse.json({
              success: true,
              taskId: retryTask.id,
              message: 'Translation task created successfully'
            })
          }
        }
        
        return NextResponse.json({
          success: false,
          error: 'Database setup required',
          message: 'Please set up the translation_jobs table in your database'
        }, { status: 503 })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to create translation task'
      }, { status: 500 })
    }

    if (!task) {
      return NextResponse.json({
        success: false,
        error: 'Task creation failed',
        message: 'Failed to create translation task'
      }, { status: 500 })
    }

    // Queue the task for processing
    await queueTranslationTask(task.id, taskData)

    return NextResponse.json({
      success: true,
      taskId: task.id,
      message: 'Translation task created successfully'
    })

  } catch (error) {
    console.error('[CREATE TASK] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

// Queue translation task for background processing
async function queueTranslationTask(taskId: string, taskData: any) {
  try {
    // For now, we'll start processing immediately
    // In a production environment, you would use a proper job queue like Bull, Agenda, or similar
    console.log(`[QUEUE] Queuing translation task ${taskId} for processing`)
    
    // Start processing in the background (non-blocking)
    processTranslationTask(taskId, taskData).catch(error => {
      console.error(`[QUEUE] Background processing failed for task ${taskId}:`, error)
    })
    
  } catch (error) {
    console.error('[QUEUE] Failed to queue translation task:', error)
  }
}

// Background translation processing
async function processTranslationTask(taskId: string, taskData: any) {
  const supabase = require('@supabase/supabase-js').createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    console.log(`[PROCESS] Starting translation task ${taskId}`)
    
    // Update status to processing
    await supabase
      .from('translation_jobs')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString(),
        progress_percentage: 0
      })
      .eq('id', taskId)

    // Simulate translation processing with progress updates
    if (taskData.job_type === 'text') {
      await processTextTranslation(taskId, taskData, supabase)
    } else if (taskData.job_type === 'document') {
      await processDocumentTranslation(taskId, taskData, supabase)
    }

  } catch (error) {
    console.error(`[PROCESS] Translation task ${taskId} failed:`, error)
    
    // Update status to failed
    await supabase
      .from('translation_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
  }
}

// Process text translation
async function processTextTranslation(taskId: string, taskData: any, supabase: any) {
  try {
    const content = taskData.original_content
    
    // Update progress to 25%
    await updateTaskProgress(taskId, 25, supabase)
    
    // Simulate API call to translation service
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
    
    // Update progress to 75%
    await updateTaskProgress(taskId, 75, supabase)
    
    // For demo purposes, we'll create a simple mock translation
    const translatedContent = `[TRANSLATED] ${content}`
    
    // Update progress to 100% and mark as completed
    await supabase
      .from('translation_jobs')
      .update({
        status: 'completed',
        progress_percentage: 100,
        translated_content: translatedContent,
        completed_chunks: 1,
        consumed_credits: taskData.estimated_credits,
        processing_completed_at: new Date().toISOString(),
        processing_time_ms: 2000
      })
      .eq('id', taskId)
      
    console.log(`[PROCESS] Text translation task ${taskId} completed successfully`)
    
  } catch (error) {
    throw new Error(`Text translation failed: ${error}`)
  }
}

// Process document translation
async function processDocumentTranslation(taskId: string, taskData: any, supabase: any) {
  try {
    const fileInfo = taskData.file_info
    
    // Update progress to 20%
    await updateTaskProgress(taskId, 20, supabase)
    
    // Simulate document processing
    await new Promise(resolve => setTimeout(resolve, 3000)) // 3 second delay
    
    // Update progress to 60%
    await updateTaskProgress(taskId, 60, supabase)
    
    // Simulate translation processing
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
    
    // Update progress to 90%
    await updateTaskProgress(taskId, 90, supabase)
    
    // For demo purposes, create a mock result URL
    const resultUrl = `/api/translate/download/${taskId}`
    
    // Update progress to 100% and mark as completed
    await supabase
      .from('translation_jobs')
      .update({
        status: 'completed',
        progress_percentage: 100,
        file_info: {
          ...fileInfo,
          resultUrl: resultUrl,
          translatedAt: new Date().toISOString()
        },
        completed_chunks: 1,
        consumed_credits: taskData.estimated_credits,
        processing_completed_at: new Date().toISOString(),
        processing_time_ms: 5000
      })
      .eq('id', taskId)
      
    console.log(`[PROCESS] Document translation task ${taskId} completed successfully`)
    
  } catch (error) {
    throw new Error(`Document translation failed: ${error}`)
  }
}

// Helper function to update task progress
async function updateTaskProgress(taskId: string, progress: number, supabase: any) {
  await supabase
    .from('translation_jobs')
    .update({
      progress_percentage: progress
    })
    .eq('id', taskId)
    
  console.log(`[PROGRESS] Task ${taskId} progress: ${progress}%`)
}
