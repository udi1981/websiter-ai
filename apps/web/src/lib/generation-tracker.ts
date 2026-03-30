import { db, generationJobs, generationSteps, generationArtifacts, eq, and, desc } from '@ubuilder/db'
import { prefixedId } from '@ubuilder/utils'
import { validateArtifact } from './artifact-schemas'
import type {
  GenerationJobStatus,
  GenerationStepStatus,
  GenerationStepName,
  ArtifactType,
} from '@ubuilder/types'

// ─── Job Operations ──────────────────────────────────────────────────

/** Create a new generation job. Returns the job ID. */
export const createJob = async (params: {
  userId: string
  description: string
  locale?: string
  discoveryContext?: Record<string, unknown>
  siteId?: string
}): Promise<string> => {
  const id = prefixedId('gen')
  await db.insert(generationJobs).values({
    id,
    userId: params.userId,
    description: params.description,
    locale: params.locale ?? 'he',
    discoveryContext: params.discoveryContext ?? {},
    siteId: params.siteId ?? null,
    status: 'pending',
  })
  return id
}

/** Link a site to an existing job */
export const linkSiteToJob = async (jobId: string, siteId: string): Promise<void> => {
  await db.update(generationJobs)
    .set({ siteId, updatedAt: new Date() })
    .where(eq(generationJobs.id, jobId))
}

/** Mark job as running */
export const startJob = async (jobId: string): Promise<void> => {
  await db.update(generationJobs)
    .set({ status: 'running', startedAt: new Date(), updatedAt: new Date() })
    .where(eq(generationJobs.id, jobId))
}

/** Mark job as completed */
export const completeJob = async (jobId: string): Promise<void> => {
  await db.update(generationJobs)
    .set({ status: 'completed', completedAt: new Date(), currentStep: null, updatedAt: new Date() })
    .where(eq(generationJobs.id, jobId))
}

/** Mark job as failed */
export const failJob = async (jobId: string, reason: string, resumePoint?: string): Promise<void> => {
  await db.update(generationJobs)
    .set({
      status: 'failed',
      failureReason: reason,
      resumePoint: resumePoint ?? null,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(generationJobs.id, jobId))
}

/** Update the current step being executed */
export const setCurrentStep = async (jobId: string, stepName: string): Promise<void> => {
  await db.update(generationJobs)
    .set({ currentStep: stepName, updatedAt: new Date() })
    .where(eq(generationJobs.id, jobId))
}

/** Mark that fallback was used in this job */
export const markJobFallback = async (jobId: string): Promise<void> => {
  await db.update(generationJobs)
    .set({ fallbackUsed: true, updatedAt: new Date() })
    .where(eq(generationJobs.id, jobId))
}

// ─── Step Operations ─────────────────────────────────────────────────

/** Create and start a new generation step. Returns the step ID. */
export const startStep = async (
  jobId: string,
  stepName: GenerationStepName,
  agent?: string,
): Promise<string> => {
  const id = prefixedId('step')
  await db.insert(generationSteps).values({
    id,
    jobId,
    stepName,
    status: 'running',
    agent: agent ?? null,
    startedAt: new Date(),
  })
  await setCurrentStep(jobId, stepName)
  return id
}

/** Mark a step as completed with timing */
export const completeStep = async (
  stepId: string,
  meta?: { promptSize?: number; responseSize?: number },
): Promise<void> => {
  const now = new Date()
  const [step] = await db.select({ startedAt: generationSteps.startedAt })
    .from(generationSteps)
    .where(eq(generationSteps.id, stepId))
    .limit(1)

  const durationMs = step?.startedAt ? now.getTime() - step.startedAt.getTime() : null

  await db.update(generationSteps)
    .set({
      status: 'completed',
      finishedAt: now,
      durationMs,
      promptSize: meta?.promptSize ?? null,
      responseSize: meta?.responseSize ?? null,
    })
    .where(eq(generationSteps.id, stepId))
}

/** Mark a step as failed */
export const failStep = async (stepId: string, reason: string): Promise<void> => {
  const now = new Date()
  const [step] = await db.select({ startedAt: generationSteps.startedAt })
    .from(generationSteps)
    .where(eq(generationSteps.id, stepId))
    .limit(1)

  const durationMs = step?.startedAt ? now.getTime() - step.startedAt.getTime() : null

  await db.update(generationSteps)
    .set({ status: 'failed', finishedAt: now, durationMs, failureReason: reason })
    .where(eq(generationSteps.id, stepId))
}

/** Mark a step as skipped */
export const skipStep = async (stepId: string): Promise<void> => {
  await db.update(generationSteps)
    .set({ status: 'skipped', finishedAt: new Date() })
    .where(eq(generationSteps.id, stepId))
}

/** Increment step retry count and mark fallback */
export const markStepRetry = async (stepId: string, usedFallback?: boolean): Promise<void> => {
  const [step] = await db.select({ retries: generationSteps.retries })
    .from(generationSteps)
    .where(eq(generationSteps.id, stepId))
    .limit(1)

  await db.update(generationSteps)
    .set({
      retries: (step?.retries ?? 0) + 1,
      fallbackUsed: usedFallback ?? false,
    })
    .where(eq(generationSteps.id, stepId))
}

// ─── Artifact Operations ─────────────────────────────────────────────

/** Save a validated artifact. Returns the artifact ID and validation result. */
export const saveArtifact = async (params: {
  jobId: string
  stepId?: string
  artifactType: ArtifactType
  data: Record<string, unknown>
}): Promise<{ id: string; valid: boolean; error?: string }> => {
  const validation = validateArtifact(params.artifactType, params.data)
  const id = prefixedId('art')

  // Check for existing artifact of same type for versioning
  const existing = await db.select({ version: generationArtifacts.version })
    .from(generationArtifacts)
    .where(
      and(
        eq(generationArtifacts.jobId, params.jobId),
        eq(generationArtifacts.artifactType, params.artifactType),
      ),
    )
    .orderBy(desc(generationArtifacts.version))
    .limit(1)

  const version = existing.length > 0 ? existing[0].version + 1 : 1

  await db.insert(generationArtifacts).values({
    id,
    jobId: params.jobId,
    stepId: params.stepId ?? null,
    artifactType: params.artifactType,
    data: params.data,
    version,
    valid: validation.ok,
  })

  if (!validation.ok) {
    return { id, valid: false, error: validation.error }
  }
  return { id, valid: true }
}

/** Get the latest valid artifact of a given type for a job */
export const getArtifact = async (
  jobId: string,
  artifactType: ArtifactType,
): Promise<Record<string, unknown> | null> => {
  const [artifact] = await db.select({ data: generationArtifacts.data })
    .from(generationArtifacts)
    .where(
      and(
        eq(generationArtifacts.jobId, jobId),
        eq(generationArtifacts.artifactType, artifactType),
        eq(generationArtifacts.valid, true),
      ),
    )
    .orderBy(desc(generationArtifacts.version))
    .limit(1)

  return (artifact?.data as Record<string, unknown>) ?? null
}

// ─── Job Status Query ────────────────────────────────────────────────

/** Get full job status with steps and artifact summary */
export const getJobStatus = async (jobId: string) => {
  const [job] = await db.select()
    .from(generationJobs)
    .where(eq(generationJobs.id, jobId))
    .limit(1)

  if (!job) return null

  const steps = await db.select()
    .from(generationSteps)
    .where(eq(generationSteps.jobId, jobId))
    .orderBy(generationSteps.createdAt)

  const artifacts = await db.select({
    artifactType: generationArtifacts.artifactType,
    valid: generationArtifacts.valid,
    version: generationArtifacts.version,
    createdAt: generationArtifacts.createdAt,
  })
    .from(generationArtifacts)
    .where(eq(generationArtifacts.jobId, jobId))
    .orderBy(generationArtifacts.createdAt)

  return {
    job,
    steps,
    artifacts: artifacts.map((a: Record<string, unknown>) => ({
      type: a.artifactType as ArtifactType,
      valid: a.valid,
      version: a.version,
      createdAt: a.createdAt,
    })),
  }
}

/** Get job by site ID (most recent) */
export const getJobBySiteId = async (siteId: string) => {
  const [job] = await db.select()
    .from(generationJobs)
    .where(eq(generationJobs.siteId, siteId))
    .orderBy(desc(generationJobs.createdAt))
    .limit(1)

  return job ?? null
}
