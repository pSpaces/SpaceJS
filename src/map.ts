/**
 * Created by SIMONE on 20/08/2017.
 */
interface map<T> {
    [key:string]:T
}

export class StringMap<T> {

    private map:map<T> = {}

    public delete<T>(name:string):boolean {
        if(this.hasKey(name)) {
            delete this.map[name]
            return true
        }
        return false
    }

    public getKeys():string[] {
        /*var elems:string[] = []
        for (let elem in this.map) {
            elems.push(elem)
        }*/
        return //keyof this.map
    }

    public get(name:string):T {
        if (this.hasKey(name)) {
            return this.map[name]
        }
        return undefined
    }

    public put(name:string, value:T):boolean {
        if (!this.hasKey(name)) {
            this.map[name] = value
            return true
        }
        return false
    }

    public hasKey(key:string) {
        return this.map.hasOwnProperty(key)
    }

}
