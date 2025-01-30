type Executor<T> = (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
) => void;

class MyPromise<T> {
    private state: "pending" | "fulfilled" | "rejected" = "pending";
    private value: T | any;
    private callbacks: {
        thenFn: ((value: T) => any) | null;
        catchFn: ((reason: any) => any) | null;
        resolve: (value: any) => void;
        reject: (reason: any) => void;
    }[] = [];

    constructor(executor: Executor<T>) {
        const resolve = (value: T | PromiseLike<T>): void => {
            if (this.state !== "pending") return;

            if (isPromiseLike(value)) {
                value.then(resolve, reject);
                return;
            }

            this.state = "fulfilled";
            this.value = value;
            this.executeCallbacks();
        };

        const reject = (reason?: any): void => {
            if (this.state !== "pending") return;

            this.state = "rejected";
            this.value = reason;
            this.executeCallbacks();
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    private executeCallbacks(): void {
        if (this.state === "pending") return;

        queueMicrotask(() => {
            this.callbacks.forEach(({ thenFn, catchFn, resolve, reject }) => {
                if (this.state === "fulfilled") {
                    if (!thenFn) {
                        resolve(this.value);
                        return;
                    }
                    try {
                        const result = thenFn(this.value);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    if (!catchFn) {
                        reject(this.value);
                        return;
                    }
                    try {
                        const result = catchFn(this.value);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
            this.callbacks = [];
        });
    }

    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): MyPromise<TResult1 | TResult2> {
        return new MyPromise((resolve, reject) => {
            this.callbacks.push({
                thenFn: onFulfilled || null,
                catchFn: onRejected || null,
                resolve,
                reject,
            });

            if (this.state !== "pending") {
                this.executeCallbacks();
            }
        });
    }

    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
    ): MyPromise<T | TResult> {
        return this.then(null, onRejected);
    }

    finally(onFinally?: (() => void) | null): MyPromise<T> {
        return this.then(
            (value) => {
                onFinally?.();
                return value;
            },
            (reason) => {
                onFinally?.();
                throw reason;
            }
        );
    }

    static resolve<T>(value: T | PromiseLike<T>): MyPromise<T> {
        return new MyPromise<T>((resolve) => resolve(value));
    }

    static reject<T = never>(reason?: any): MyPromise<T> {
        return new MyPromise<T>((_, reject) => reject(reason));
    }

    static all<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<T[]> {
        return new MyPromise<T[]>((resolve, reject) => {
            const results: T[] = [];
            let completed = 0;
            const promiseArray = [...values];

            if (promiseArray.length === 0) {
                resolve(results);
                return;
            }

            promiseArray.forEach((value, index) => {
                MyPromise.resolve(value)
                    .then((value) => {
                        results[index] = value;
                        completed++;
                        if (completed === promiseArray.length) {
                            resolve(results);
                        }
                    })
                    .catch(reject);
            });
        });
    }

    static allSettled<T>(
        values: Iterable<T | PromiseLike<T>>
    ): MyPromise<PromiseSettledResult<T>[]> {
        return new MyPromise((resolve) => {
            const results: PromiseSettledResult<T>[] = [];
            let completed = 0;
            const promiseArray = [...values];

            if (promiseArray.length === 0) {
                resolve(results);
                return;
            }

            promiseArray.forEach((value, index) => {
                MyPromise.resolve(value)
                    .then(
                        (value) => {
                            results[index] = { status: "fulfilled", value };
                        },
                        (reason) => {
                            results[index] = { status: "rejected", reason };
                        }
                    )
                    .finally(() => {
                        completed++;
                        if (completed === promiseArray.length) {
                            resolve(results);
                        }
                    });
            });
        });
    }

    static race<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<T> {
        return new MyPromise((resolve, reject) => {
            const promiseArray = [...values];

            if (promiseArray.length === 0) {
                return;
            }

            promiseArray.forEach((value) => {
                MyPromise.resolve(value).then(resolve, reject);
            });
        });
    }

    static any<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<T> {
        return new MyPromise((resolve, reject) => {
            const errors: any[] = [];
            let rejected = 0;
            const promiseArray = [...values];

            if (promiseArray.length === 0) {
                reject(
                    new AggregateError(
                        [],
                        "No Promise in Promise.any was resolved"
                    )
                );
                return;
            }

            promiseArray.forEach((value, index) => {
                MyPromise.resolve(value).then(resolve, (error) => {
                    errors[index] = error;
                    rejected++;
                    if (rejected === promiseArray.length) {
                        reject(new AggregateError(errors));
                    }
                });
            });
        });
    }
}

function isPromiseLike(value: any): value is PromiseLike<any> {
    return value && typeof value.then === "function";
}

export default MyPromise;
