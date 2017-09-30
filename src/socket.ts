/**
 * Created by SIMONE on 10/08/2017.
 */

import {Protocol} from "./protocol";
import {genHandler, processMsg} from "./cbDefinitions";
import {deserialize, multipleDeserialization} from "./serialization";

let dgram = require('dgram')
let net = require('net')
let ev = require('events')

export abstract class ClientSocket {

    protected port:number
    protected host:string

    public abstract getProtocol():Protocol
    public abstract bind(port:number, host:string)
    public abstract connect(port:number, host:string, callback?)
    public abstract send(message:string, callback:processMsg)
    public abstract close()
    public getAddr() {
        return [this.host, this.port]
    }

}

export abstract class ServerSocket {

    public EXPIRATION_TIME:number = 60000

    public abstract getProtocol():Protocol
    public abstract bind(port:number, host:string)
    public abstract onConnection(messageHandler:genHandler, isConnful?:boolean)
    public abstract close()

}

export class TCPServer extends ServerSocket {

    public getProtocol(): Protocol {
        return "tcp";
    }

    private server

    public bind(port: number, host?: string) {
        if (host == undefined) {
            host = 'localhost'
        }
        this.server = net.createServer();
        this.server.listen(port, host)
    }

    public onConnection(messageHandler: genHandler, isConnful:boolean) {
        this.server.on('error', (error) => {
            this.server.close()
        })
        this.server.on('connection', (client) => {
            client.setTimeout(this.EXPIRATION_TIME)
            client.on('timeout', () => {
                console.log("expired")
                client.end()
            })
            client.on('error', (error) =>{
                console.log(error)
                client.end()
            })
            client.on('drain', (data) => {
                if (!isConnful) {
                    client.end()
                }
            })
            client.on('data', (data) => {
                let msgSender:processMsg = (resp:string) => {
                    client.write(resp)
                }
                let msg:string[] = multipleDeserialization(data.toString())
                for (let elem of msg) {
                    console.log(elem)
                    setImmediate(() => {
                        messageHandler(elem, msgSender)
                    })
                }
            })
        })
    }

    public close() {
        this.server.close()
    }

}

export class TCPClient extends ClientSocket {

    public getProtocol(): Protocol {
        return "tcp"
    }

    private client
    private emitter
    public bind(port: number, host: string) {}

    public connect(port: number, host: string, callback?) {
        this.emitter = new ev.EventEmitter()
        this.client = net.Socket()
        this.client.on('data', (data) => {
            var msgs:any[] = multipleDeserialization(data.toString())
            for (let msg of msgs) {
                var de = deserialize(msg)
                this.emitter.emit("Recv" + de.clientSession, de)
            }

        })
        this.client.connect(port, host)
        this.client.on('connect', () => {
            console.log(this.client.address().port)
            this.port = this.client.address().port
            this.host = this.client.address().address
            if (callback != undefined) {
                callback(this.host, this.port)
            }
        })
    }

    public send(message: string, callback:processMsg) {
        this.client.on("error", (error) => {
            console.log(error)
        })
        var cb = (data) => {
            if (callback != undefined) {
                setImmediate(callback, data)
            }
        }
        this.emitter.once('Recv'+deserialize(message).clientSession, cb)
        this.client.write(message);
    }

    public close() {
        this.client.end()
    }

}

export class UDPServer extends ServerSocket {

    public getProtocol(): Protocol {
        return "udp";
    }

    private socket

    public bind(port: number, host?: string) {
        if (host == undefined) {
            host = 'localhost'
        }

        this.socket = dgram.createSocket('udp4')
        this.socket.bind(port, host);
    }

    public onConnection(messageHandler: genHandler) {
        this.socket.on('message', (data) => {
            let sendHandler:processMsg = (resp:string) => {
                this.socket.write(resp)
            }
            messageHandler(data.toString(), sendHandler)
        })
    }

    public close() {
        this.socket.close();
    }

}

export class UDPClient extends ClientSocket {

    public getProtocol(): Protocol {
        return "udp";
    }

    private socket

    public bind(port: number, host: string) {
        this.socket = dgram.createSocket('udp4')
        this.port = port
        this.host = host
        this.socket.bind(port, host)
    }

    public connect(port: number, host: string) {}

    public send(message: string, callback:processMsg) {
        this.socket.send(message)
        var cb = (data) => {
            callback(data)
            this.socket.removeListener('data', cb)
        }
        this.socket.on('data', cb)
    }

    public close() {
        this.socket.close()
    }

}
