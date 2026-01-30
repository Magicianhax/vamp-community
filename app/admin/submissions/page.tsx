'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Check, X, Eye } from 'lucide-react'
import { Button, Badge, Avatar, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { SUBMISSION_STATUS_COLORS, SUBMISSION_STATUS_LABELS } from '@/lib/constants'
import type { GrantSubmission, SubmissionStatus } from '@/types'

type SubmissionWithDetails = GrantSubmission & {
  project: any
  user: any
  grant: any
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('grant_submissions')
      .select('*, project:projects(*, user:users(*)), user:users(*), grant:grants(*)')
      .order('created_at', { ascending: false })

    setSubmissions(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const updateStatus = async (submissionId: string, status: SubmissionStatus) => {
    setActionLoading(submissionId)
    const supabase = createClient()

    await supabase
      .from('grant_submissions')
      .update({ status })
      .eq('id', submissionId)

    await fetchSubmissions()
    setActionLoading(null)
  }

  const submittedSubmissions = submissions.filter((s) => s.status === 'submitted')
  const underReviewSubmissions = submissions.filter((s) => s.status === 'under_review')
  const winnerSubmissions = submissions.filter((s) => s.status === 'winner')
  const rejectedSubmissions = submissions.filter((s) => s.status === 'rejected')

  const SubmissionRow = ({ submission }: { submission: SubmissionWithDetails }) => (
    <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
        <Avatar
          src={submission.user?.avatar_url}
          alt={submission.user?.username || 'User'}
          size="sm"
          className="sm:w-10 sm:h-10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/projects/${submission.project?.id}`}
              className="font-medium text-text-primary text-sm sm:text-base truncate"
            >
              {submission.project?.title}
            </Link>
            <Badge className={SUBMISSION_STATUS_COLORS[submission.status]} size="sm">
              {SUBMISSION_STATUS_LABELS[submission.status]}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Submitted to{' '}
            <Link href={`/grants/${submission.grant?.id}`} className="text-accent">
              {submission.grant?.title}
            </Link>
          </p>
          <p className="text-[10px] sm:text-xs text-text-muted mt-1">
            by @{submission.user?.username} · {formatDate(submission.created_at)}
          </p>
          {submission.pitch && (
            <p className="text-xs sm:text-sm text-text-secondary mt-2 line-clamp-2">
              {submission.pitch}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap">
        <Link
          href={`/projects/${submission.project?.id}`}
          className="p-1.5 sm:p-2 text-text-muted"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>

        {submission.status === 'submitted' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateStatus(submission.id, 'under_review')}
            isLoading={actionLoading === submission.id}
            disabled={actionLoading !== null}
            className="text-xs sm:text-sm"
          >
            Review
          </Button>
        )}

        {submission.status === 'under_review' && (
          <>
            <Button
              size="sm"
              variant="accent"
              onClick={() => updateStatus(submission.id, 'winner')}
              isLoading={actionLoading === submission.id}
              disabled={actionLoading !== null}
              className="text-xs sm:text-sm"
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Winner</span>
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => updateStatus(submission.id, 'rejected')}
              isLoading={actionLoading === submission.id}
              disabled={actionLoading !== null}
              className="text-xs sm:text-sm"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Reject</span>
            </Button>
          </>
        )}

        {submission.status === 'winner' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateStatus(submission.id, 'under_review')}
            isLoading={actionLoading === submission.id}
            disabled={actionLoading !== null}
            className="text-xs sm:text-sm"
          >
            Revoke
          </Button>
        )}

        {submission.status === 'rejected' && (
          <Button
            size="sm"
            onClick={() => updateStatus(submission.id, 'under_review')}
            isLoading={actionLoading === submission.id}
            disabled={actionLoading !== null}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Reconsider</span>
            <span className="sm:hidden">Retry</span>
          </Button>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="max-w-6xl animate-pulse">
        <div className="h-10 w-48 bg-surface-hover rounded mb-8" />
        <div className="card">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-border last:border-0">
              <div className="h-20 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Grant Submissions</h1>
        <p className="text-sm sm:text-base text-text-secondary mt-1">
          Review and judge grant submissions
        </p>
      </div>

      <Tabs defaultValue="submitted">
        <TabsList className="mb-4 sm:mb-6 overflow-x-auto flex-nowrap">
          <TabsTrigger value="submitted">
            Submitted ({submittedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="under_review">
            Under Review ({underReviewSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="winner">
            Winners ({winnerSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submitted">
          <div className="card divide-y divide-border">
            {submittedSubmissions.length > 0 ? (
              submittedSubmissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">
                No pending submissions
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="under_review">
          <div className="card divide-y divide-border">
            {underReviewSubmissions.length > 0 ? (
              underReviewSubmissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">
                No submissions under review
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="winner">
          <div className="card divide-y divide-border">
            {winnerSubmissions.length > 0 ? (
              winnerSubmissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">
                No winners yet
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="card divide-y divide-border">
            {rejectedSubmissions.length > 0 ? (
              rejectedSubmissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">
                No rejected submissions
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
