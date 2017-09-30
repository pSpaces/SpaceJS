import {GateID, Protocol} from "./protocol";
import {ConnServerGate, KeepServerGate, ServerGate} from "./serverGate"
import {ClientSocket, ServerSocket, TCPClient, TCPServer, UDPClient, UDPServer} from "./socket";
import {ConnClientGate, KeepClientGate, ClientGate} from "./ClientGate";
import {spaceGetter} from "./cbDefinitions";

export function buildServerGate(uri:GateID, spaceGetter:spaceGetter):ServerGate {
    switch (uri.mode) {
        case "keep":
            return new KeepServerGate(spaceGetter, uri.port, uri.host, uri.protocol)
        case "conn":
            return new ConnServerGate(spaceGetter, uri.port, uri.host, uri.protocol)
    }
}

export function buildClientGate(uri:GateID):ClientGate {
    switch (uri.mode) {
        case "keep":
            return new KeepClientGate(uri.port, uri.host, uri.protocol)
        case "conn":
            return new ConnClientGate(uri.port, uri.host, uri.protocol)
    }
}

export function buildClientSocket(protocol:Protocol):ClientSocket {
    switch (protocol) {
        case "tcp":
            return new TCPClient()
        case "udp":
            return new UDPClient()
        default:
            return new TCPClient()
    }
}

export function buildServerSocket(protocol:Protocol):ServerSocket {
    switch (protocol) {
        case "tcp":
            return new TCPServer()
        case "udp":
            return new UDPServer()
        default:
            return new TCPServer()
    }
}
