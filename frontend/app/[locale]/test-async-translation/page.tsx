'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'

interface TranslationTask {
  id: string
  taskType: string
  status: string
  progress: number
  sourceLanguage: string
  targetLanguage: string
  createdAt: string
  originalContent?: string
  translatedContent?: string
  fileName?: string
  errorMessage?: string
}

interface HistoryItem {
  id: string
  taskType: string
  status: string
  sourceLanguage: string
  targetLanguage: string
  progress: number
  createdAt: string
  preview?: string
  fileName?: string
  errorMessage?: string
}

export default function TestAsyncTranslation() {
  const { user, loading: authLoading } = useAuth()
  const [textContent, setTextContent] = useState('Hello, this is a test translation.')
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [targetLanguage, setTargetLanguage] = useState('zh')
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [currentTask, setCurrentTask] = useState<TranslationTask | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [message, setMessage] = useState('')

  // Load translation history on component mount
  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  // Poll current task status
  useEffect(() => {
    if (currentTask && ['pending', 'processing'].includes(currentTask.status)) {
      const interval = setInterval(() => {
        checkTaskStatus(currentTask.id)
      }, 2000) // Poll every 2 seconds

      return () => clearInterval(interval)
    }
  }, [currentTask])

  const createTranslationTask = async () => {
    if (!user) {
      setMessage('Please log in to create translation tasks')
      return
    }

    if (!textContent.trim()) {
      setMessage('Please enter some text to translate')
      return
    }

    setIsCreatingTask(true)
    setMessage('')

    try {
      const response = await fetch('/api/translate/create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'text',
          sourceLanguage,
          targetLanguage,
          content: textContent,
          priority: 5
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`Translation task created successfully! Task ID: ${result.taskId}`)
        // Start monitoring the task
        checkTaskStatus(result.taskId)
        // Refresh history
        loadHistory()
      } else {
        setMessage(`Error: ${result.message || result.error}`)
      }
    } catch (error) {
      console.error('Error creating translation task:', error)
      setMessage('Failed to create translation task')
    } finally {
      setIsCreatingTask(false)
    }
  }

  const checkTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/translate/task/${taskId}`)
      const result = await response.json()

      if (result.success && result.task) {
        setCurrentTask(result.task)
        
        // If task is completed or failed, refresh history
        if (['completed', 'failed', 'cancelled'].includes(result.task.status)) {
          loadHistory()
        }
      }
    } catch (error) {
      console.error('Error checking task status:', error)
    }
  }

  const loadHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch('/api/translate/history?limit=10&includeStats=true')
      const result = await response.json()

      if (result.success) {
        setHistory(result.data)
      } else {
        console.error('Failed to load history:', result.message)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const cancelTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/translate/task/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Task cancelled successfully')
        setCurrentTask(null)
        loadHistory()
      } else {
        setMessage(`Error cancelling task: ${result.message}`)
      }
    } catch (error) {
      console.error('Error cancelling task:', error)
      setMessage('Failed to cancel task')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600'
      case 'processing': return 'text-blue-600'
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'cancelled': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'processing': return 'Processing'
      case 'completed': return 'Completed'
      case 'failed': return 'Failed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  if (authLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Async Translation Test</h1>
        <p className="text-gray-600">Please log in to test the async translation system.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Async Translation System Test</h1>
      
      {/* Create Translation Task */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Translation Task</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Source Language</label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="en">English</option>
              <option value="zh">Chinese</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Target Language</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="zh">Chinese</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Text to Translate</label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md h-32"
            placeholder="Enter text to translate..."
          />
        </div>
        
        <button
          onClick={createTranslationTask}
          disabled={isCreatingTask}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreatingTask ? 'Creating Task...' : 'Create Translation Task'}
        </button>
        
        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>

      {/* Current Task Status */}
      {currentTask && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Task Status</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p><strong>Task ID:</strong> {currentTask.id}</p>
              <p><strong>Status:</strong> <span className={getStatusColor(currentTask.status)}>{getStatusText(currentTask.status)}</span></p>
              <p><strong>Progress:</strong> {currentTask.progress}%</p>
            </div>
            <div>
              <p><strong>Languages:</strong> {currentTask.sourceLanguage} → {currentTask.targetLanguage}</p>
              <p><strong>Created:</strong> {new Date(currentTask.createdAt).toLocaleString()}</p>
            </div>
          </div>
          
          {currentTask.progress > 0 && currentTask.progress < 100 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentTask.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {currentTask.originalContent && (
            <div className="mb-4">
              <p><strong>Original:</strong></p>
              <p className="bg-gray-50 p-3 rounded-md">{currentTask.originalContent}</p>
            </div>
          )}
          
          {currentTask.translatedContent && (
            <div className="mb-4">
              <p><strong>Translation:</strong></p>
              <p className="bg-green-50 p-3 rounded-md">{currentTask.translatedContent}</p>
            </div>
          )}
          
          {currentTask.errorMessage && (
            <div className="mb-4">
              <p><strong>Error:</strong></p>
              <p className="bg-red-50 p-3 rounded-md text-red-700">{currentTask.errorMessage}</p>
            </div>
          )}
          
          {['pending', 'processing'].includes(currentTask.status) && (
            <button
              onClick={() => cancelTask(currentTask.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Cancel Task
            </button>
          )}
        </div>
      )}

      {/* Translation History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Translation History</h2>
          <button
            onClick={loadHistory}
            disabled={isLoadingHistory}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {isLoadingHistory ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {history.length === 0 ? (
          <p className="text-gray-500">No translation history found.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {item.sourceLanguage} → {item.targetLanguage}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    {item.progress > 0 && item.progress < 100 && (
                      <p className="text-sm text-gray-600">{item.progress}%</p>
                    )}
                  </div>
                </div>
                
                {item.preview && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {item.preview}
                  </p>
                )}
                
                {item.fileName && (
                  <p className="text-sm text-gray-700">
                    📄 {item.fileName}
                  </p>
                )}
                
                {item.errorMessage && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                    Error: {item.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
