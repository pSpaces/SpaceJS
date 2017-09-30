export function serialize(obj:any):string {
    return JSON.stringify(obj)
}

function parseJson(data) {
    data = data.replace('\n', '', 'g');
    var
        start = data.indexOf('{'),
        open = 0,
        i = start,
        len = data.length,
        result = [];

    for (; i < len; i++) {
        if (data[i] == '{') {
            open++;
        } else if (data[i] == '}') {
            open--;
            if (open === 0) {
                result.push(data.substring(start, i + 1));
                start = i + 1;
            }
        }
    }

    return result;
}

export function multipleDeserialization(message:String):any {
    return parseJson(message.toString())
}

export function deserialize(message:string) {
    return JSON.parse(message)
}
