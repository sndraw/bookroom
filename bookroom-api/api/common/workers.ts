import cluster from "cluster";
import { logger } from "@/common/logger";
import { createQqueue } from "./queue";

const TASK_QUEUE_WORKERS = parseInt(process.env.TASK_QUEUE_WORKERS || "2", 10);

const taskQueue = createQqueue({
    name: "workersTaskQueue",
    db: 1,
});

export const startWorkers = () => {
    if (cluster.isPrimary) {
        for (let i = 0; i < TASK_QUEUE_WORKERS; i++) {
            cluster.fork();
        }

        cluster.on('online', function (worker) {
            logger.log('worker ' + worker.process.pid + ' started');
        });

        cluster.on('exit', function (worker, code, signal) {
            logger.log('worker ' + worker.process.pid + ' died');
            // 重新启动退出的工人
            if (code !== 0 && !signal) {
                logger.log(`重启 worker ${worker.process.pid}`);
                cluster.fork();
            }
        });

        // 添加信号监听器以优雅地关闭所有工作进程
        process.on('SIGTERM', () => {
            logger.log('收到 SIGTERM 信号，正在关闭所有工作进程');
            clearWorkers();
        });

        process.on('SIGINT', () => {
            logger.log('收到 SIGINT 信号，正在关闭所有工作进程');
            clearWorkers();
        });

    } else {
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
    }
}
export const clearWorkers = () => {
    if (cluster.isPrimary) {
        if (cluster && cluster.workers) {
            for (const id in cluster.workers) {
                stopWorker(id);
            }
        }
    }
}

export const stopWorker = (workerId?: string) => {
    if (cluster.isPrimary && workerId) {
        cluster?.worker?.kill(workerId);
    } else {
        if (cluster.isWorker && cluster?.worker?.id === workerId) {
            logger.info('Stopping worker process');
            cluster?.worker?.kill();
        }
        else {
            logger.log('No worker available to stop');
        }
    }
}

startWorkers();

if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {
        if (cluster && cluster.workers) {
            Object.values(cluster.workers).forEach(worker => {
                if (worker) { // 检查 worker 是否存在
                    if (worker.isDead()) {
                        logger.warn(`Worker ${worker.process.pid} is dead, restarting...`);
                        // 重新启动退出的工人
                        cluster.fork();
                    }
                } else {
                    logger.warn('Encountered undefined worker');
                }
            });
        } else {
            logger.warn('No workers available to check');
        }
    }, 60000); // 每分钟检查一次工作进程状态
}