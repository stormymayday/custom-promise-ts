enum PromiseState {
    FULFILLED = "fulfilled",
    REJECTED = "rejected",
    PENDING = "pending",
}

class CustomPromise<T> {
    #state = PromiseState.PENDING;
    #value: T | any;

    #thenCallbacks: ((value: T) => void)[] = [];
    #catchCallbacks: ((reason: any) => void)[] = [];

    #onSuccessBind = this.#onSuccess.bind(this);
    #onFailBind = this.#onFail.bind(this);

    constructor(
        callback: (
            resolve: (value: T | CustomPromise<T>) => void,
            reject: (reason: any) => void
        ) => void
    ) {
        try {
            callback(this.#onSuccessBind, this.#onFailBind);
        } catch (e) {
            this.#onFail(e);
        }
    }

    #runCallbacks() {
        if (this.#state === PromiseState.FULFILLED) {
            this.#thenCallbacks.forEach((callback) => {
                callback(this.#value as T);
            });

            this.#thenCallbacks = [];
        }

        if (this.#state === PromiseState.REJECTED) {
            this.#catchCallbacks.forEach((callback) => {
                callback(this.#value);
            });

            this.#catchCallbacks = [];
        }
    }

    #onSuccess(value: T | CustomPromise<T>) {
        queueMicrotask(() => {
            if (this.#state !== PromiseState.PENDING) return;

            if (value instanceof CustomPromise) {
                value.then(this.#onSuccessBind, this.#onFailBind);
                return;
            }

            this.#value = value;
            this.#state = PromiseState.FULFILLED;

            this.#runCallbacks();
        });
    }

    #onFail(value: any) {
        queueMicrotask(() => {
            if (this.#state !== PromiseState.PENDING) return;

            if (value instanceof CustomPromise) {
                value.then(this.#onSuccessBind, this.#onFailBind);
                return;
            }

            this.#value = value;
            this.#state = PromiseState.REJECTED;

            this.#runCallbacks();
        });
    }

    then(
        thenCallback?: (value: T) => void,
        catchCallback?: (reason: any) => void
    ) {
        return new CustomPromise((resolve, reject) => {
            this.#thenCallbacks.push((result) => {
                if (!thenCallback) {
                    resolve(result);
                    return;
                }

                try {
                    resolve(thenCallback(result));
                } catch (error) {
                    reject(error);
                }
            });

            this.#catchCallbacks.push((result) => {
                if (!catchCallback) {
                    reject(result);
                    return;
                }

                try {
                    resolve(catchCallback(result));
                } catch (error) {
                    reject(error);
                }
            });

            this.#runCallbacks();
        });
    }

    catch(callback: (value: T) => void) {
        return this.then(undefined, callback);
    }

    finally(cb: () => void) {
        return this.then(
            (result) => {
                cb();
                return result;
            },
            (result) => {
                cb();
                throw result;
            }
        );
    }
}

export default CustomPromise;
