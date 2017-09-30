
import {TemplateField} from "./template";
export function customEqual(a:any, b:any) {
    return JSON.stringify(a) === JSON.stringify(b)
}


export function getType(obj:any):string {
    return obj.constructor.name
}


export function removeValueFromArray(array:any[], value):boolean {
    var index: number = array.indexOf(value)
    if (index == -1) {
        return false
    } else {
        array.splice(index, 1)
        return true
    }
}

export function testTemplateMatch(template:TemplateField[], tuple:any[]):boolean {
    var len:number
    if ((len = template.length) != tuple.length) {
        return false
    }
    for (var i = 0; i < len; i++) {
        if (!template[i].match(tuple[i])) {
            return false
        }
    }
    return true
}
