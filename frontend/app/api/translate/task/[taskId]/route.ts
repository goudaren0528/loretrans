import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface TaskStatusResponse {
  success: boolean
  task?: {
    id: string
    taskType: string
    status: string
    progress: number
    sourceLanguage: string
    targetLanguage: string
    createdAt: string
    processingStartedAt?: string
    processingCompletedAt?: string
    estimatedCredits: number
    consumedCredits: number
    errorMessage?: string
    // Content for text translation
    originalContent?: string
    translatedContent?: string
    // File info for document translation
    fileName?: string
    fileUrl?: string
    resultUrl?: string
  }
  error?: string
  message?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view task status'
      }, { status: 401 })
    }

    const { taskId } = params
    
    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request',
        message: 'Task ID is required'
      }, { status: 400 })
    }

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('translation_jobs')
      .select(`
        id,
        job_type,
        status,
        progress_percentage,
        source_language,
        target_language,
        created_at,
        processing_started_at,
        processing_completed_at,
        estimated_credits,
        consumed_credits,
        error_message,
        original_content,
        translated_content,
        file_info
      `)
      .eq('id', taskId)
      .eq('user_id', user.id) // Ensure user can only access their own tasks
      .single()

    if (taskError) {
      console.error('[TASK STATUS] Database error:', taskError)
      
      if (taskError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Task not found',
          message: 'The requested translation task was not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to retrieve task status'
      }, { status: 500 })
    }

    if (!task) {
      return NextResponse.json({
        success: false,
        error: 'Task not found',
        message: 'The requested translation task was not found'
      }, { status: 404 })
    }

    // Format response
    const response: TaskStatusResponse = {
      success: true,
      task: {
        id: task.id,
        taskType: task.job_type,
        status: task.status,
        progress: task.progress_percentage || 0,
        sourceLanguage: task.source_language,
        targetLanguage: task.target_language,
        createdAt: task.created_at,
        processingStartedAt: task.processing_started_at,
        processingCompletedAt: task.processing_completed_at,
        estimatedCredits: task.estimated_credits || 0,
        consumedCredits: task.consumed_credits || 0,
        errorMessage: task.error_message
      }
    }

    // Add content-specific data
    if (task.job_type === 'text') {
      response.task!.originalContent = task.original_content
      response.task!.translatedContent = task.translated_content
    } else if (task.job_type === 'document' && task.file_info) {
      response.task!.fileName = task.file_info.fileName
      response.task!.fileUrl = task.file_info.fileUrl
      response.task!.resultUrl = task.file_info.resultUrl
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[TASK STATUS] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

// Update task status (for admin or system use)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { taskId } = params
    const body = await request.json()
    
    // Only allow certain status updates by users
    const allowedUpdates = ['cancelled']
    
    if (body.status && !allowedUpdates.includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status update',
        message: 'You can only cancel your own tasks'
      }, { status: 400 })
    }

    // Update task
    const updateData: any = {}
    
    if (body.status === 'cancelled') {
      updateData.status = 'cancelled'
      updateData.processing_completed_at = new Date().toISOString()
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from('translation_jobs')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', user.id) // Ensure user can only update their own tasks
      .select('id, status')
      .single()

    if (updateError) {
      console.error('[TASK UPDATE] Database error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Update failed',
        message: 'Failed to update task status'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully'
    })

  } catch (error) {
    console.error('[TASK UPDATE] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
}
