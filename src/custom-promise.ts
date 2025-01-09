class CustomPromise<T> {
    static STATE = {
        PENDING: "pending",
        FULFILLED: "fulfilled",
        REJECTED: "rejected",
    };

    #state = CustomPromise.STATE.PENDING;
    #value: T | unknown;
    #thenCallbacks: ((value: T) => void)[] = [];
    #catchCallbacks: ((reason: any) => void)[] = [];

    constructor(
        callback: (
            resolve: (value: T | CustomPromise<T>) => void,
            reject: (reason: any) => void
        ) => void
    ) {
        try {
            callback(this.#onSuccess, this.#onFail);
        } catch (e) {
            this.#onFail(e);
        }
    }

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

    #onSuccess(value: T | CustomPromise<T>) {
        if (this.#state !== CustomPromise.STATE.PENDING) return;

        this.#value = value;
        this.#state = CustomPromise.STATE.FULFILLED;

        this.#runCallbacks();
    }

    #onFail(value: any) {
        if (this.#state !== CustomPromise.STATE.PENDING) return;

        this.#value = value;
        this.#state = CustomPromise.STATE.REJECTED;

        this.#runCallbacks();
    }

    then(thenCallback: (value: T) => void, catchCallback: (value: T) => void) {
        if (thenCallback != null) {
            this.#thenCallbacks.push(thenCallback);
        }

        if (catchCallback != null) {
            this.#catchCallbacks.push(catchCallback);
        }

        this.#runCallbacks();
    }

    catch(callback: (value: T) => void) {
        this.then(undefined, callback);
    }
}

export default CustomPromise;
