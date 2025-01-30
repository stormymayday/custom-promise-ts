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

    constructor(executor) {
        try {
            executor(this.#resolve, this.#reject);
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

    then(thenCb, catchCb) {
        if (thenCb !== null) {
            this.#handlers.push(thenCb);
        }

        if (catchCb !== null) {
            this.#catches.push(catchCb);
        }

        this.#runCallbacks();
    }

    catch() {}
}

module.exports = MyPromise;
