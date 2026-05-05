import { ProcessingJob } from '../types';

export class BackgroundProcessingQueue {
  private inMemoryQueue: ProcessingJob[] = [];

  public async enqueue(job: Omit<ProcessingJob, 'status' | 'retryCount' | 'createdAt'>): Promise<ProcessingJob> {
    const fullJob: ProcessingJob = {
      ...job,
      status: 'QUEUED',
      retryCount: 0,
      createdAt: new Date(),
    };
    this.inMemoryQueue.push(fullJob);
    console.log(`[Queue] Enqueued job ${fullJob.jobId} for asset ${fullJob.assetId} (${fullJob.taskType})`);
    return fullJob;
  }

  public async processNext(): Promise<ProcessingJob | null> {
    const job = this.inMemoryQueue.shift();
    if (!job) return null;

    job.status = 'RUNNING';
    try {
      console.log(`[Worker] Executing job ${job.jobId} (${job.taskType})...`);
      // Simulate heavy processing (metadata extraction, thumbnailing, virus scanning)
      job.status = 'COMPLETED';
    } catch (err) {
      job.retryCount += 1;
      job.status = job.retryCount >= 3 ? 'FAILED' : 'QUEUED';
    }
    return job;
  }

  public getQueueLength(): number {
    return this.inMemoryQueue.length;
  }
}
