import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createActivityLog, getActivityLogsByUserId, getAllActivityLogs } from "./db";
import { getCredentialByProviderAndBrand } from "./googleSheets";
import { scrapeTurnoverData } from "./scraper";

// In-memory job store (in production, use database)
interface SearchJob {
  id: string;
  userId: number;
  playerId: string;
  provider: string;
  brand: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobStore = new Map<string, SearchJob>();

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createJob(userId: number, playerId: string, provider: string, brand: string): SearchJob {
  const job: SearchJob = {
    id: generateJobId(),
    userId,
    playerId,
    provider,
    brand,
    status: 'pending',
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  jobStore.set(job.id, job);
  return job;
}

// Background scraping function (non-blocking)
async function runScrapingJob(
  jobId: string,
  userId: number,
  playerId: string,
  provider: string,
  brand: string,
  fromDate: string | undefined = undefined,
  toDate: string | undefined = undefined,
  fromTime: string | undefined = undefined,
  toTime: string | undefined = undefined
) {
  const job = jobStore.get(jobId);
  if (!job) return;

  try {
    job.status = 'running';
    job.updatedAt = new Date();

    // Create activity log
    await createActivityLog({
      userId,
      playerId,
      provider,
      brand,
      status: 'pending',
    });

    // Get credentials
    const credential = await getCredentialByProviderAndBrand(provider, brand);
    if (!credential) {
      throw new Error('Credentials not found for this provider and brand');
    }

    // Run scraping with progress callback
    job.progress = 10;
    const result = await scrapeTurnoverData(
      provider,
      playerId,
      brand,
      fromDate,
      toDate,
      fromTime,
      toTime,
      (progress: number) => {
        job.progress = progress;
        job.updatedAt = new Date();
      }
    );
    job.progress = 100;

    // Sanitize result
    const sanitizedResult = {
      playerId: result.playerId,
      provider: result.provider,
      brand: result.brand,
      games: (result.games || []).map((g: any) => ({
        gameName: g.gameName,
        lines: g.lines,
        betting: g.betting,
        spin: g.spin,
        totalBetting: g.totalBetting,
      })),
      totalTurnover: result.totalTurnover || 0,
      hasNineLines: result.hasNineLines || false,
      scrapedAt: result.scrapedAt ? new Date(result.scrapedAt) : new Date(),
    };

    job.result = sanitizedResult;
    job.progress = 100;
    job.status = 'completed';
    job.updatedAt = new Date();

    // Log success
    await createActivityLog({
      userId,
      playerId,
      provider,
      brand,
      status: 'success',
      resultData: JSON.stringify({
        gameCount: sanitizedResult.games.length,
        totalTurnover: sanitizedResult.totalTurnover,
        hasNineLines: sanitizedResult.hasNineLines,
        scrapedAt: sanitizedResult.scrapedAt,
      }),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    job.error = errorMessage;
    job.status = 'failed';
    job.updatedAt = new Date();

    // Log failure
    await createActivityLog({
      userId,
      playerId,
      provider,
      brand,
      status: 'failed',
      errorMessage,
    });
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  turnover: router({
    // Start a background search job (returns immediately)
    startSearch: protectedProcedure
      .input(z.object({
        playerId: z.string().min(1),
        provider: z.string().min(1),
        brand: z.string().min(1),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        fromTime: z.string().optional(),
        toTime: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { playerId, provider, brand, fromDate, toDate, fromTime, toTime } = input;
        
        // Create job
        const job = createJob(ctx.user.id, playerId, provider, brand);
        
        // Start scraping in background (don't await)
        runScrapingJob(
          job.id,
          ctx.user.id,
          playerId,
          provider,
          brand,
          fromDate,
          toDate,
          fromTime,
          toTime
        ).catch(err => {
          console.error(`[Job ${job.id}] Unhandled error:`, err);
        });
        
        return {
          jobId: job.id,
          status: 'pending',
        };
      }),

    // Get job status and results
    getJob: protectedProcedure
      .input(z.object({
        jobId: z.string().min(1),
      }))
      .query(({ ctx, input }) => {
        const job = jobStore.get(input.jobId);
        
        if (!job) {
          throw new Error('Job not found');
        }
        
        // Security: only allow user to access their own jobs
        if (job.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        
        return {
          id: job.id,
          status: job.status,
          progress: job.progress,
          result: job.result,
          error: job.error,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        };
      }),

    // Legacy: synchronous search (for backward compatibility, but may timeout)
    search: protectedProcedure
      .input(z.object({
        playerId: z.string().min(1),
        provider: z.string().min(1),
        brand: z.string().min(1),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        fromTime: z.string().optional(),
        toTime: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { playerId, provider, brand, fromDate, toDate, fromTime, toTime } = input;
        
        try {
          // Create pending log
          await createActivityLog({
            userId: ctx.user.id,
            playerId,
            provider,
            brand,
            status: 'pending',
          });
          
          // Get credentials from Google Sheets
          const credential = await getCredentialByProviderAndBrand(provider, brand);
          
          if (!credential) {
            await createActivityLog({
              userId: ctx.user.id,
              playerId,
              provider,
              brand,
              status: 'failed',
              errorMessage: 'Credentials not found for this provider and brand',
            });
            throw new Error('Credentials not found for this provider and brand');
          }
          
          // Scrape turnover data (timeout handled within scraper)
          const result = await scrapeTurnoverData(
            provider,
            playerId,
            brand,
            fromDate,
            toDate,
            fromTime,
            toTime
          ) as any;
          
          // Sanitize result for safe serialization
          const sanitizedResult = {
            playerId: result.playerId,
            provider: result.provider,
            brand: result.brand,
            games: (result.games || []).map((g: any) => ({
              gameName: g.gameName,
              lines: g.lines,
              betting: g.betting,
              spin: g.spin,
              totalBetting: g.totalBetting,
            })),
            totalTurnover: result.totalTurnover || 0,
            hasNineLines: result.hasNineLines || false,
            scrapedAt: result.scrapedAt ? new Date(result.scrapedAt) : new Date(),
          };
          
          // Log success - store only summary to avoid large data in DB
          await createActivityLog({
            userId: ctx.user.id,
            playerId,
            provider,
            brand,
            status: 'success',
            resultData: JSON.stringify({
              gameCount: sanitizedResult.games.length,
              totalTurnover: sanitizedResult.totalTurnover,
              hasNineLines: sanitizedResult.hasNineLines,
              scrapedAt: sanitizedResult.scrapedAt,
            }),
          });
          
          return sanitizedResult;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          await createActivityLog({
            userId: ctx.user.id,
            playerId,
            provider,
            brand,
            status: 'failed',
            errorMessage,
          });
          
          throw error;
        }
      }),
    
    getProviders: publicProcedure.query(async () => {
      // Return list of supported providers
      return [
        'MEGA888',
        'PRAGMATIC SLOT',
        'PUSSY888',
        '918KISS',
      ];
    }),

    getBrands: publicProcedure.query(async () => {
      // Return list of supported brands
      return [
        'ABSG',
        'WBSG',
        'OK188SG',
        'OXSG',
        'FWSG',
        'M24SG',
      ];
    }),

    getCredentials: protectedProcedure.query(async () => {
      // Fetch all credentials from Google Sheets
      const { fetchProviderCredentials } = await import('./googleSheets');
      return await fetchProviderCredentials();
    }),

    getActivityLogs: protectedProcedure.query(async ({ ctx }) => {
      return await getActivityLogsByUserId(ctx.user.id);
    }),

    getAllActivityLogs: protectedProcedure.query(async ({ ctx }) => {
      // Only admin can view all logs
      if ((ctx.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return await getAllActivityLogs();
    }),
  }),
});

export type AppRouter = typeof appRouter;
