export function $assert(condition,msg){
    if(!condition){

        for(const line of msg.replaceAll('\x00','').split('\n')){
            if(line)
                console.warn(line);
        }

        throw new Error(msg);
    }
}