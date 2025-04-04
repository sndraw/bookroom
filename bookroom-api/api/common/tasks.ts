import cluster from "cluster";
import { logger } from "@/common/logger";
import { createQqueue } from "./queue";

const taskQueue = createQqueue({
    name: "workersTaskQueue",
    db: 1,
});

taskQueue.process(function (job, jobDone) {
    if (cluster.worker) {
        logger.log('Job done by worker', cluster.worker.id, job.id);
    } else {
        logger.log('No worker available');
    }
    jobDone(); // Mark the job as completed
});


taskQueue.on('completed', (job, result) => {
    logger.log(`任务 ${job.id} 完成，结果:`, result);
});

taskQueue.on('failed', (job, err) => {
    logger.log(`任务 ${job.id} 失败，错误:`, err);
});

export { taskQueue };