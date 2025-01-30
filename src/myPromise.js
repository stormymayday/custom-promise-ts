const STATE = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2,
};

class MyPromise {
    #state = STATE.PENDING;
    #value;
    #handlers = [];
    #catches = [];
    #onResolveBind = this.#resolve.bind(this);
    #onRejectBind = this.#reject.bind(this);

    constructor(executor) {
        try {
            executor(this.#onResolveBind, this.#onRejectBind);
        } catch (error) {
            this.#reject(error);
        }
    }

    #runCallbacks() {
        if (this.#state !== STATE.FULFILLED) {
            this.#handlers.forEach((h) => h(this.#value));

            this.#handlers = [];
        }

        if (this.#state !== STATE.REJECTED) {
            this.#catches.forEach((c) => c(this.#value));

            this.#catches = [];
        }
    }

    #resolve(value) {
        if (this.#state !== STATE.PENDING) {
            return;
        }

        this.#value = value;
        this.#state = STATE.FULFILLED;

        this.#runCallbacks();
    }

    #reject(error) {
        if (this.#state !== STATE.PENDING) {
            return;
        }

        this.#value = error;
        this.#state = STATE.REJECTED;

        this.#runCallbacks();
    }

    then(handler, catchCb) {
        if (handler !== null) {
            this.#handlers.push(handler);
        }

        if (catchCb !== null) {
            this.#catches.push(catchCb);
        }

        this.#runCallbacks();
    }

    catch(catchCb) {
        this.then(undefined, catchCb);
    }
}

module.exports = MyPromise;
