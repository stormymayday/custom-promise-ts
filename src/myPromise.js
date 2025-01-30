const STATE = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2,
};

class MyPromise {
    #state = STATE.PENDING;
    #value;
    #thenCbs = [];
    #catchCbs = [];
    #onSuccessBind = this.#onSuccess.bind(this);
    #onFailBind = this.#onFail.bind(this);

    constructor(executor) {
        try {
            executor(this.#onSuccessBind, this.#onFailBind);
        } catch (e) {
            this.#onFail(e);
        }
    }

    #runCallbacks() {
        if (this.#state === STATE.FULFILLED) {
            this.#thenCbs.forEach((callback) => {
                callback(this.#value);
            });

            this.#thenCbs = [];
        }

        if (this.#state === STATE.REJECTED) {
            this.#catchCbs.forEach((callback) => {
                callback(this.#value);
            });

            this.#catchCbs = [];
        }
    }

    #onSuccess(value) {
        queueMicrotask(() => {
            if (this.#state !== STATE.PENDING) return;

            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBind, this.#onFailBind);
                return;
            }

            this.#value = value;
            this.#state = STATE.FULFILLED;
            this.#runCallbacks();
        });
    }

    #onFail(value) {
        queueMicrotask(() => {
            if (this.#state !== STATE.PENDING) return;

            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBind, this.#onFailBind);
                return;
            }

            if (this.#catchCbs.length === 0) {
                throw new UncaughtPromiseError(value);
            }

            this.#value = value;
            this.#state = STATE.REJECTED;
            this.#runCallbacks();
        });
    }

    then(thenCb, catchCb) {
        return new MyPromise((resolve, reject) => {
            this.#thenCbs.push((result) => {
                if (thenCb == null) {
                    resolve(result);
                    return;
                }

                try {
                    resolve(thenCb(result));
                } catch (error) {
                    reject(error);
                }
            });

            this.#catchCbs.push((result) => {
                if (catchCb == null) {
                    reject(result);
                    return;
                }

                try {
                    resolve(catchCb(result));
                } catch (error) {
                    reject(error);
                }
            });

            this.#runCallbacks();
        });
    }

    catch(catchCb) {
        return this.then(undefined, catchCb);
    }

    finally(callback) {
        return this.then(
            (result) => {
                callback();
                return result;
            },
            (result) => {
                callback();
                throw result;
            }
        );
    }

    static resolve(value) {
        return new MyPromise((resolve) => {
            resolve(value);
        });
    }

    static reject(value) {
        return new MyPromise((resolve, reject) => {
            reject(value);
        });
    }
}

class UncaughtPromiseError extends Error {
    constructor(error) {
        super(error);

        this.stack = `(in promise) ${error.stack}`;
    }
}

module.exports = MyPromise;
