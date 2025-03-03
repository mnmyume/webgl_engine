/**
 * Creates a frames-per-second counter which displays its output as
 * text in a given element on the web page.
 *
 * @param {!Element} outputElement The HTML element on the web page in
 *   which to write the current frames per second.
 * @param {!number} opt_numSamples The number of samples to take
 *   between each update of the frames-per-second.
 */
export default function FPSCounter(outputElement, opt_numSamples) {
    this.outputElement_ = outputElement;
    this.startTime_ = new Date();
    if (opt_numSamples) {
        this.numSamples_ = opt_numSamples;
    } else {
        this.numSamples_ = 200;
    }
    this.curSample_ = 0;
    this.curFPS_ = 0;
}

/**
 * Updates this FPSCounter.
 * @return {boolean} whether this FPS counter actually updated this tick.
 */
FPSCounter.prototype.update = function() {
    if (++this.curSample_ >= this.numSamples_) {
        const curTime = new Date();
        const startTime = this.startTime_;
        const diff = curTime.getTime() - startTime.getTime();
        this.curFPS_ = (1000.0 * this.numSamples_ / diff);
        var str = "" + this.curFPS_.toFixed(2) + " frames per second";
        this.outputElement_.innerHTML = str;
        this.curSample_ = 0;
        this.startTime_ = curTime;
        return true;
    }
    return false;
};

/**
 * Gets the most recent FPS measurement.
 * @return {number} the most recent FPS measurement.
 */
FPSCounter.prototype.getFPS = function() {
    return this.curFPS_;
};

FPSCounter.prototype.reset = function() {
    this.curSample_ = 0;
    this.curFPS_ = 0;
}