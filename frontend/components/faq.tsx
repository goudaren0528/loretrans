import React from 'react'

export function FAQ({ t }: { t: (key: string,
  values?: Record<string, string | number>) => string }) {
  // Assuming there are 8 questions based on the JSON structure.
  // This is not ideal, a more dynamic way would be better if the number of questions can change.
  const questionIndexes = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <section className="relative py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {t('description')}
            </p>
          </div>
          
          <div className="space-y-6">
            {questionIndexes.map((index) => {
              const question = t(`questions.${index}.question`);
              const answer = t(`questions.${index}.answer`);

              // Do not render if question or answer is missing
              if (question.startsWith('questions.') || answer.startsWith('questions.')) {
                return null;
              }

              return (
                <details
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 marker:content-['']">
                    {question}
                    <svg
                      className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-4 text-gray-600 leading-7">
                    {answer}
                  </div>
                </details>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              {t('contact_prompt')}{' '}
              <a
                href="mailto:support@transly.app"
                className="font-medium text-primary hover:text-primary/80"
              >
                {t('contact_link')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 