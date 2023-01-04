import { resolve } from 'path';
import { Worker } from 'worker_threads';

export class WorkerService {
    worker<T extends object>(path: string, data: T): Worker {
        return new Worker(resolve(__dirname, '../../workers/worker.js'), {
            workerData: {
                ...data,
                path,
            },
        });
    }

    async first<R, T extends object>(path: string, data: T): Promise<R> {
        return new Promise((resolve, reject) => {
            const worker = this.worker(path, data);

            worker.on('message', (result: R) => {
                resolve(result);
                worker.terminate();
            });

            worker.on('error', (error) => {
                reject(error);
                worker.terminate();
            });

            worker.on('messageerror', (error) => {
                reject(error);
                worker.terminate();
            });
        });
    }

    async race<R, T extends object>(path: string, allData: T[]): Promise<R> {
        const workers = allData.map((data) => this.worker(path, data));

        const result: R = await Promise.race(
            workers.map((worker) => {
                return new Promise<R>((resolve, reject) => {
                    worker.on('message', (result: R) => {
                        resolve(result);
                        worker.terminate();
                    });

                    worker.on('error', (error) => {
                        reject(error);
                        worker.terminate();
                    });

                    worker.on('messageerror', (error) => {
                        reject(error);
                        worker.terminate();
                    });
                });
            }),
        );

        for (const worker of workers) worker.terminate();

        return result;
    }
}
