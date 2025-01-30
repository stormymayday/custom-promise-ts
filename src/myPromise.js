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

    #resolve(value) {
        if (this.#state !== STATE.PENDING) {
            return;
        }

        this.#value = value;
        this.#state = STATE.FULFILLED;

        this.#handlers.forEach((h) => h(this.#value));
    }

    #reject(error) {
        if (this.#state !== STATE.PENDING) {
            return;
        }

        this.#value = error;
        this.#state = STATE.REJECTED;

        this.#catches.forEach((c) => c(this.#value));
    }

    then(callback) {}
}

module.exports = MyPromise;
