// import CustomPromise from "../src/custom-promise";
const CustomPromise = Promise;

describe("CustomPromise", () => {
    it("should resolve a value", async () => {
        const promise = new CustomPromise<string>((resolve) =>
            resolve("test value")
        );
        const value = await promise;
        expect(value).toBe("test value");
    });

    it("should reject with an error", async () => {
        const promise = new CustomPromise<string>((_, reject) =>
            reject("error value")
        );
        try {
            await promise;
        } catch (error) {
            expect(error).toBe("error value");
        }
    });

    it("should chain .then() calls", async () => {
        const promise = new CustomPromise<number>((resolve) => resolve(5));
        const value = await promise
            .then((value) => value * 2)
            .then((value) => value + 3);
        expect(value).toBe(13);
    });

    it("should chain .then() and .catch()", async () => {
        const promise = new CustomPromise<number>((_, reject) =>
            reject("failure")
        );
        try {
            await promise.then(() => {});
        } catch (error) {
            expect(error).toBe("failure");
        }
    });

    it("should handle .finally()", async () => {
        const promise = new CustomPromise<string>((resolve) => resolve("done"));
        const value = await promise.finally(() => {
            // No value expected here in the final callback
        });
        expect(value).toBe("done");
    });

    it("should reject correctly when using static reject()", async () => {
        try {
            await CustomPromise.reject("reject value");
        } catch (error) {
            expect(error).toBe("reject value");
        }
    });

    it("should resolve correctly when using static resolve()", async () => {
        const value = await CustomPromise.resolve("resolve value");
        expect(value).toBe("resolve value");
    });

    it("should handle static all() method with multiple promises", async () => {
        const promise1 = new CustomPromise<string>((resolve) => resolve("a"));
        const promise2 = new CustomPromise<string>((resolve) => resolve("b"));
        const values = await CustomPromise.all([promise1, promise2]);
        expect(values).toEqual(["a", "b"]);
    });

    it("should handle static allSettled() method", async () => {
        const promise1 = new CustomPromise<string>((resolve) =>
            resolve("done")
        );
        const promise2 = new CustomPromise<string>((_, reject) =>
            reject("error")
        );

        const results = await CustomPromise.allSettled([promise1, promise2]);
        expect(results).toEqual([
            { status: "fulfilled", value: "done" },
            { status: "rejected", reason: "error" },
        ]);
    });

    it("should handle static race() method", async () => {
        const promise1 = new CustomPromise<string>((resolve) => resolve("a"));
        const promise2 = new CustomPromise<string>((_, reject) =>
            reject("error")
        );

        try {
            const value = await CustomPromise.race([promise1, promise2]);
            expect(value).toBe("a");
        } catch (error) {
            // This should not be triggered because promise1 resolves first
            expect(error).not.toBeDefined();
        }
    });

    it("should handle static any() method", async () => {
        const promise1 = new CustomPromise<string>((_, reject) =>
            reject("error1")
        );
        const promise2 = new CustomPromise<string>((resolve) =>
            resolve("success")
        );

        const value = await CustomPromise.any([promise1, promise2]);
        expect(value).toBe("success");
    });
});
