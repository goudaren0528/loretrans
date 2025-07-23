'use client'

import { useState } from 'react'
import { translationQueue } from '@/lib/translation-queue'

export default function TestPollingPage() {
  const [result, setResult] = useState<string>('')
  const [jobId, setJobId] = useState<string>('')

  const testPolling = async () => {
    try {
      console.log('[Test] 开始测试轮询...')
      setResult('Creating task...')
      
      const task = await translationQueue.addTask(
        'This is a test sentence that will be repeated many times to create a very long text. '.repeat(80),
        'eng_Latn',
        'zho_Hans',
        {
          type: 'text',
          priority: 2,
          sessionId: 'test-session'
        }
      )
      
      console.log('[Test] 任务已创建:', task)
      setJobId(task.queueJobId || task.id)
      setResult(`Task created: ${task.id}, Status: ${task.status}, Progress: ${task.progress}%`)
      
    } catch (error) {
      console.error('[Test] 测试失败:', error)
      setResult(`Error: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Frontend Polling</h1>
      <button 
        onClick={testPolling}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test Polling
      </button>
      <div className="mb-4">
        <strong>Job ID:</strong> {jobId}
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <strong>Result:</strong>
        <pre>{result}</pre>
      </div>
    </div>
  )
}
