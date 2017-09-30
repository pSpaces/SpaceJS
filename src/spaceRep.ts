import {Space} from "./knolewdge";
import {ServerGate} from "./serverGate"
import {GateID} from "./protocol";
import {buildServerGate} from "./buildingUtils";
import {StringMap} from "./map";
/**
 * Created by SIMONE on 02/08/2017.
 */

interface map<T> {
    [key:string]:T
}

interface spaceMap {
    [key:string]:Space
}

interface gateMap {
    [key:string]:ServerGate
}

export class SpaceRepository {

    //protected numericalString:RegExp
    private spaces:StringMap<Space>
    private gates:StringMap<ServerGate>

    private getSpace = (name:string) => {
        let space = this.spaces.get(name)
        return space
    }

    constructor() {
        //this.numericalString = new RegExp('^[0-9]{1,}$')
        this.spaces = new StringMap<Space>()
        this.gates = new StringMap<ServerGate>()
    }

    public addGate(id:GateID):boolean {
        let gate:ServerGate = buildServerGate(id, this.getSpace)
        let flag:boolean = this.gates.put(id.toString(), gate)
        if (!flag) {
            return false
        } else {
            setImmediate(() => {gate.open()})
            return true
        }
    }

    public removeAllGate() {
        for (let elem of this.gates.getKeys()) {
            this.gates[elem].close()
            this.gates.delete(elem)
        }
    }

    public removeGate(id:GateID):boolean {
        let gate:ServerGate = this.gates[id.toString()]
        if (gate == undefined) {
            return false
        } else {
            gate.close()
            return true
        }
    }

    public addSpace(space:Space, name:string):boolean {
        return this.spaces.put(name, space)
    }

    public removeSpace(name:string):boolean {
        return this.spaces.delete(name)
    }


}
