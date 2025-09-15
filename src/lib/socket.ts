// lib/ws.ts
let socket: WebSocket | null = null;

export function getSocket() {
    if (!socket) {
        socket = new WebSocket("ws://localhost:8000"); // your backend ws URL

        socket.onopen = () => {
            console.log("[WS] Connected");
        };

        socket.onclose = () => {
            console.log("[WS] Disconnected");
            socket = null;
        };
    }

    return socket;
}
