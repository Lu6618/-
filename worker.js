addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/') {
        return new Response(renderHTML(), {
            headers: { 'content-type': 'text/html' }
        });
    } else if (path === '/parse') {
        const link = url.searchParams.get('link');
        const nodes = await parseSubscriptionLink(link);
        return new Response(JSON.stringify(nodes), {
            headers: { 'content-type': 'application/json' }
        });
    } else if (path === '/generate') {
        const body = await request.json();
        const newLink = generateNewSubscriptionLink(body.nodes);
        return new Response(newLink, {
            headers: { 'content-type': 'text/plain' }
        });
    }

    return new Response('Not Found', { status: 404 });
}

function renderHTML() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>CFWK Tool</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            input, textarea { width: 100%; margin: 10px 0; }
            button { padding: 10px; background: #007BFF; color: white; border: none; cursor: pointer; }
            button:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>CFWK Tool</h1>
        <input type="text" id="link" placeholder="Enter subscription link" />
        <button onclick="parseLink()">Parse</button>
        <div id="nodes"></div>
        <textarea id="output" placeholder="Generated link"></textarea>
        <button onclick="generateLink()">Generate</button>
        <script src="script.js"></script>
    </body>
    </html>
    `;
}

async function parseSubscriptionLink(link) {
    const response = await fetch(link);
    const data = await response.text();
    const nodes = data.split('\\n').map(line => {
        const [name, address, port] = line.split('|');
        return { name, address, port };
    });
    return nodes;
}

function generateNewSubscriptionLink(nodes) {
    const data = nodes.map(node => `${node.name}|${node.address}|${node.port}`).join('\\n');
    return `data:text/plain;base64,${btoa(data)}`;
} 
