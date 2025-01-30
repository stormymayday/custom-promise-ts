const STATE = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2,
};

class MyPromise {
    #state = STATE.PENDING;
    #value;
    #handlers = [];

    constructor(callback) {
        try {
            callback(this.#resolve, this.#reject);
        } catch (error) {
            this.#reject(error);
        }
    }

    #resolve(value) {
        this.#value = value;
        this.#state = STATE.FULFILLED;
    }

    #reject(value) {
        this.#value = value;
        this.#state = STATE.REJECTED;
    }

    then(callback) {
        this.#handlers.push(callback);
    }
}

module.exports = MyPromise;
