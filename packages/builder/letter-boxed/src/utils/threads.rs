use std::{ thread::sleep, time::Duration, sync::{ atomic::{ Ordering }, Arc } };

use atomic_enum::atomic_enum;
use threadpool::ThreadPool;

pub enum TimeoutThread {
    Completed = 0,
    Timeout = 1,
}

#[atomic_enum]
#[derive(PartialEq)]
enum TimeoutThreadRunning {
    Completed = 0,
    Timeout = 1,
    Running = 2,
}

impl TimeoutThread {
    fn from_running(e: &TimeoutThreadRunning) -> TimeoutThread {
        match e {
            TimeoutThreadRunning::Completed => TimeoutThread::Completed,
            TimeoutThreadRunning::Timeout => TimeoutThread::Timeout,
            _ => panic!("Cannot from Running"),
        }
    }
}

// impl Drop for ThreadPool {
//     fn drop(&mut self) {
//         for worker in &mut self.workers {
//             println!("Shutting down worker {}", worker.id);

//             if let Some(thread) = worker.thread.take() {
//                 thread.join().unwrap();
//             }
//         }
//     }
// }

pub fn timeout_thread<F>(
    job: F,
    timeout: Duration
)
    -> TimeoutThread
    where F: FnOnce() + Send + 'static
{
    let pool = ThreadPool::new(2);
    let state = Arc::new(
        AtomicTimeoutThreadRunning::new(TimeoutThreadRunning::Running)
    );

    let state_timeout = state.clone();
    pool.execute(move || {
        sleep(timeout);
        state_timeout.store(TimeoutThreadRunning::Timeout, Ordering::SeqCst);
    });

    let state_job = state.clone();
    pool.execute(move || {
        job();
        state_job.store(TimeoutThreadRunning::Completed, Ordering::SeqCst);
    });

    let state_check = state.clone();
    while state_check.load(Ordering::SeqCst) == TimeoutThreadRunning::Running {
        sleep(Duration::from_millis(1));
    }

    TimeoutThread::from_running(&state.load(Ordering::SeqCst))
}