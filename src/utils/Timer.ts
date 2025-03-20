/**
 * Timer Implementation
 * 
 * This module provides a custom timer implementation that supports pausing and resuming.
 * The timer repeatedly executes a callback function at specified intervals, with the ability
 * to pause and resume while maintaining accurate timing.
 */

//@ts-nocheck
/**
 * Creates a new Timer instance that repeatedly executes a callback function
 * 
 * @param callback - Function to be executed at each interval
 * @param delay - Time in milliseconds between each callback execution
 * 
 * @example
 * ```typescript
 * // Create a timer that logs every 5 seconds
 * const timer = new Timer(() => console.log('Tick!'), 5000);
 * 
 * // Pause the timer
 * timer.pause();
 * 
 * // Resume the timer
 * timer.resume();
 * ```
 */
export function Timer(callback, delay) {
    let timerId, start, remaining = delay;

    /**
     * Pauses the timer and calculates remaining time
     * 
     * Clears the current timeout and updates the remaining time
     * based on how long the timer has been running since the last resume.
     */
    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    /**
     * Resumes the timer with the remaining time
     * 
     * Sets up a new timeout with the remaining duration and
     * recursively schedules the next execution.
     */
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

    // Start the timer immediately
    this.resume();
}
