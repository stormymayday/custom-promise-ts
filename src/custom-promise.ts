class CustomPromise<T> {
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

    // Private method to handle successful resolution of the promise
    #onSuccess(value: T | CustomPromise<T>) {
        // This is a placeholder for handling success
        console.log("Resolved with value:", value);
    }

    // Private method to handle failure/rejection of the promise
    #onFail(value: any) {
        // This is a placeholder for handling failure
        console.log("Rejected with reason:", value);
    }
}

export default CustomPromise;

const myPromise = new CustomPromise((resolve, reject) => {});
