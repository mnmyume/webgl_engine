export default class Time{
    startTime = null;
    lastUpdateTime = null;
    intervalTime;


    get ElapsedTime(){
        return Date.now()/1000-this.startTime;
    }


    update(){
        if(this.startTime === null)
            this.startTime = Date.now()/1000;


        if(this.lastUpdateTime === null)
            this.lastUpdateTime = Date.now()/1000;
        else
            this.intervalTime = Date.now()/1000 - this.lastUpdateTime;
    }
}