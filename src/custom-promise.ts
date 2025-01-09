class CustomPromise<T> {
    // States
    static STATE = {
        PENDING: "pending",
        FULFILLED: "fulfilled",
        REJECTED: "rejected",
    };

    // Private variables
    #state = CustomPromise.STATE.PENDING;
    #value: T | unknown;
    #thenCallbacks: ((value: T) => void)[] = [];
    #catchCallbacks: ((reason: any) => void)[] = [];

    // Constructor accepts a callback with resolve and reject methods
    constructor(
        callback: (
            resolve: (value: T | CustomPromise<T>) => void,
            reject: (reason: any) => void
        ) => void
    ) {
        try {
            // Try to invoke the callback with resolve and reject methods
            callback(this.#onSuccess, this.#onFail);
        } catch (e) {
            // If any error occurs, reject immediately
            this.#onFail(e);
        }
    }

    // Execute the .then() and .catch() callbacks
    #runCallbacks() {
        if (this.#state === CustomPromise.STATE.FULFILLED) {
            this.#thenCallbacks.forEach((callback) => {
                callback(this.#value as T);
            });

            this.#thenCallbacks = [];
        }

        if (this.#state === CustomPromise.STATE.REJECTED) {
            this.#catchCallbacks.forEach((callback) => {
                callback(this.#value);
            });

            this.#catchCallbacks = [];
        }
    }

    // Private method to handle successful resolution of the promise
    #onSuccess(value: T | CustomPromise<T>) {
        if (this.#state !== CustomPromise.STATE.PENDING) return;

        this.#value = value;
        this.#state = CustomPromise.STATE.FULFILLED;

        this.#runCallbacks();
    }

    // Private method to handle failure/rejection of the promise
    #onFail(value: any) {
        if (this.#state !== CustomPromise.STATE.PENDING) return;

        this.#value = value;
        this.#state = CustomPromise.STATE.REJECTED;

        this.#runCallbacks();
    }

    then(callback: (value: T) => void) {
        this.#thenCallbacks.push(callback);

        this.#runCallbacks();
    }
}

export default CustomPromise;

const myPromise = new CustomPromise((resolve, reject) => {});
