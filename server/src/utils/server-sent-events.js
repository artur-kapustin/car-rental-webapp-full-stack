const clients = new Set();

export function addClient(res) {
    clients.add(res);
}

export function removeClient(res) {
    clients.delete(res);
}

export function broadcast(event, data) {
    for (const res of clients) {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
}