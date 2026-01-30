import Link from 'next/link'
import { Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { SUBMISSION_STATUS_LABELS, SUBMISSION_STATUS_COLORS } from '@/lib/constants'
import type { GrantSubmission, SubmissionStatus } from '@/types'

async function getUserSubmissions(userId: string): Promise<GrantSubmission[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('grant_submissions')
    .select('*, project:projects(*), grant:grants(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data || []) as unknown as GrantSubmission[]
}

export default async function SubmissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const submissions = await getUserSubmissions(user.id)

  return (
    <div className="max-w-5xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Grant Submissions</h1>
        <p className="text-sm sm:text-base text-text-secondary mt-1">
          Track the status of your grant applications
        </p>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <Link
                    href={`/projects/${submission.project?.id}`}
                    className="font-semibold text-text-primary"
                  >
                    {submission.project?.title}
                  </Link>
                  <p className="text-sm text-text-secondary mt-1">
                    Submitted to{' '}
                    <Link
                      href={`/grants/${submission.grant?.id}`}
                      className="text-accent"
                    >
                      {submission.grant?.title}
                    </Link>
                  </p>
                  <p className="text-sm text-text-muted mt-2">
                    {formatDate(submission.created_at)}
                  </p>
                </div>
                <Badge className={SUBMISSION_STATUS_COLORS[submission.status]}>
                  {SUBMISSION_STATUS_LABELS[submission.status]}
                </Badge>
              </div>

              {submission.pitch && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {submission.pitch}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-text-secondary">You haven&apos;t submitted to any grants yet</p>
          <p className="text-sm text-text-muted mt-2">
            Check out active grants and submit your projects
          </p>
          <Link href="/grants" className="mt-6 inline-block">
            <span className="text-primary">Browse Grants</span>
          </Link>
        </div>
      )}
    </div>
  )
}
