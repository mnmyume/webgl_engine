
function getTime(){
    return performance.now()/1000;
}


export default class Time{
    start = null;
    lastUpdate = null;
    interval = null;


    get ElapsedTime(){ // since start
        return getTime()-this.start;
    }
    get Interval(){ //since last update
        // return this.interval??0;
        return 0.01666;
    }

    get FPS(){
        return 1/this.interval;
    }

    get Now(){
        return getTime();
    }


    update(){
        if(this.start === null)
            this.start = this.Now;


        if(this.lastUpdate === null)
            this.lastUpdate =  this.start;
        else{
            const now = this.Now;
            this.interval = now - this.lastUpdate;
            this.lastUpdate = now;
        }

    }
}