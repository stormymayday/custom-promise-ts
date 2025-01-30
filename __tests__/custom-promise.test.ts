import MyPromise from "../src/custom-promise";

// const MyPromise = Promise;

const DEFAULT_VALUE = "default";

function promise<T = string>({
    value = DEFAULT_VALUE as T,
    fail = false,
}: { value?: T; fail?: boolean } = {}): Promise<T> {
    return new Promise<T>((resolve, reject) =>
        fail ? reject(value) : resolve(value)
    );
}

describe("then", () => {
    it("with no chaining", () => {
        return promise().then((v) => expect(v).toEqual(DEFAULT_VALUE));
    });

    it("with multiple thens for same promise", () => {
        const checkFunc = (v: string): void => expect(v).toEqual(DEFAULT_VALUE);
        const mainPromise = promise();
        return MyPromise.allSettled([
            mainPromise.then(checkFunc),
            mainPromise.then(checkFunc),
        ]);
    });

    it("with chaining", () => {
        return promise<number>({ value: 3 })
            .then((v) => v * 4)
            .then((v) => expect(v).toEqual(12));
    });
});

describe("catch", () => {
    it("with no chaining", () => {
        return promise({ fail: true }).catch((v) =>
            expect(v).toEqual(DEFAULT_VALUE)
        );
    });

    it("with multiple catches for same promise", () => {
        const checkFunc = (v: string): void => expect(v).toEqual(DEFAULT_VALUE);
        const mainPromise = promise({ fail: true });
        return MyPromise.allSettled([
            mainPromise.catch(checkFunc),
            mainPromise.catch(checkFunc),
        ]);
    });

    it("with chaining", () => {
        return promise<number>({ value: 3 })
            .then((v) => {
                throw v * 4;
            })
            .catch((v) => expect(v).toEqual(12));
    });
});

describe("finally", () => {
    it("with no chaining", () => {
        const checkFunc = (): void => expect(undefined).toBeUndefined();
        return MyPromise.allSettled([
            promise().finally(checkFunc),
            promise({ fail: true }).finally(checkFunc),
        ]);
    });

    it("with multiple finallys for same promise", () => {
        const checkFunc = (): void => expect(undefined).toBeUndefined();
        const mainPromise = promise();
        return MyPromise.allSettled([
            mainPromise.finally(checkFunc),
            mainPromise.finally(checkFunc),
        ]);
    });

    it("with chaining", () => {
        const checkFunc = (): void => expect(undefined).toBeUndefined();
        return MyPromise.allSettled([
            promise()
                .then((v) => v)
                .finally(checkFunc),
            promise({ fail: true })
                .then((v) => v)
                .finally(checkFunc),
        ]);
    });
});

describe("static methods", () => {
    it("resolve", () => {
        return MyPromise.resolve(DEFAULT_VALUE).then((v) =>
            expect(v).toEqual(DEFAULT_VALUE)
        );
    });

    it("reject", () => {
        return MyPromise.reject(DEFAULT_VALUE).catch((v) =>
            expect(v).toEqual(DEFAULT_VALUE)
        );
    });

    describe("all", () => {
        it("with success", () => {
            return MyPromise.all([
                promise<number>({ value: 1 }),
                promise<number>({ value: 2 }),
            ]).then((v) => expect(v).toEqual([1, 2]));
        });

        it("with fail", () => {
            return MyPromise.all([promise(), promise({ fail: true })]).catch(
                (v) => expect(v).toEqual(DEFAULT_VALUE)
            );
        });
    });

    it("allSettled", () => {
        return MyPromise.allSettled([promise(), promise({ fail: true })]).then(
            (v) =>
                expect(v).toEqual([
                    { status: "fulfilled", value: DEFAULT_VALUE },
                    { status: "rejected", reason: DEFAULT_VALUE },
                ])
        );
    });

    describe("race", () => {
        it("with success", () => {
            return MyPromise.race([
                promise<number>({ value: 1 }),
                promise<number>({ value: 2 }),
            ]).then((v) => expect(v).toEqual(1));
        });

        it("with fail", () => {
            return MyPromise.race([
                promise<number>({ fail: true, value: 1 }),
                promise<number>({ fail: true, value: 2 }),
            ]).catch((v) => expect(v).toEqual(1));
        });
    });

    describe("any", () => {
        it("with success", () => {
            return MyPromise.any([
                promise<number>({ value: 1 }),
                promise<number>({ value: 2 }),
            ]).then((v) => expect(v).toEqual(1));
        });

        it("with fail", () => {
            return MyPromise.any([
                promise<number>({ fail: true, value: 1 }),
                promise<number>({ value: 2 }),
            ]).catch((e: AggregateError) => expect(e.errors).toEqual([1, 2]));
        });
    });
});
