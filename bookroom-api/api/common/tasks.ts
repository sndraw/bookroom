import cluster from "cluster";
import { logger } from "@/common/logger";
import { createQqueue } from "./queue";
import Bull from "bull";

const taskQueue = createQqueue({
    name: "workersTaskQueue",
    db: 1,
});

taskQueue.process(function (job: Bull.Job, jobDone: Bull.DoneCallback) {
    if (cluster.worker) {
        logger.log('Job done by worker', cluster.worker.id, job.id);
    } else {
        logger.log('No worker available');
    }
    jobDone(); // Mark the job as completed
});


taskQueue.on('completed', (job: Bull.Job, result: any) => {
    logger.log(`任务 ${job.id} 完成，结果:`, result);
});

taskQueue.on('failed', (job: Bull.Job, err: Error) => {
    logger.log(`任务 ${job.id} 失败，错误:`, err);
});

export { taskQueue };