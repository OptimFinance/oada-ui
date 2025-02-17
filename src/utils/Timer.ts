//@ts-nocheck
export function Timer(callback, delay) {
    let timerId, start, remaining = delay;

    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    const resume = function() {
        start = new Date();
        timerId = window.setTimeout(function() {
            console.log('timer created')
            remaining = delay;
            resume();
            callback();
        }, remaining);
    };

    this.resume = resume;

    this.resume();
}
