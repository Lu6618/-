addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    if (request.method === 'GET') {
        const url = new URL(request.url)
        const path = url.pathname

        if (path === '/') {
            return new Response(renderHTML(), {
                headers: { 'content-type': 'text/html' }
            })
        } else if (path === '/parse') {
            const link = url.searchParams.get('link')
            const nodes = await parseSubscriptionLink(link)
            return new Response(JSON.stringify(nodes), {
                headers: { 'content-type': 'application/json' }
            })
        } else if (path === '/generate') {
            const body = await request.json()
            const newLink = generateNewSubscriptionLink(body.nodes)
            return new Response(newLink, {
                headers: { 'content-type': 'text/plain' }
            })
        }
    }
    return new Response('Not Found', { status: 404 })
}

function renderHTML() {
    return `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CFWK 代码生成器</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 800px;
                margin: auto;
                padding: 20px;
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1, h2 {
                text-align: center;
            }
            label {
                display: block;
                margin-top: 10px;
            }
            textarea, input[type="text"] {
                width: 100%;
                padding: 10px;
                margin-top: 5px;
                margin-bottom: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
            }
            button {
                display: block;
                width: 100%;
                padding: 10px;
                background-color: #007BFF;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            }
            button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>CFWK 代码生成器</h1>
            <form id="cfwk-form">
                <label for="subscription-link">输入订阅链接：</label>
                <input type="text" id="subscription-link" size="50">
                <button type="button" onclick="parseSubscriptionLink()">解析链接</button>
            </form>
            <div id="nodes">
                <h2>节点：</h2>
                <div id="node-list"></div>
            </div>
            <div id="output">
                <h2>生成的订阅链接：</h2>
                <textarea id="output-data" rows="5" cols="50" readonly></textarea>
                <button type="button" onclick="generateNewSubscriptionLink()">生成新链接</button>
            </div>
        </div>
        <script>
            async function parseSubscriptionLink() {
                const link = document.getElementById('subscription-link').value;
                console.log('Parsing link:', link);
                try {
                    const response = await fetch('/parse?link=' + encodeURIComponent(link));
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const nodes = await response.json();
                    console.log('Parsed nodes:', nodes);
                    displayNodes(nodes);
                } catch (error) {
                    console.error('Error fetching the link:', error);
                }
            }

            function displayNodes(nodes) {
                const nodeList = document.getElementById('node-list');
                nodeList.innerHTML = '';

                nodes.forEach((node, index) => {
                    const nodeDiv = document.createElement('div');
                    nodeDiv.className = 'node';
                    nodeDiv.innerHTML = `
                        <label for="node-name-${index}">节点名称：</label>
                        <input type="text" id="node-name-${index}" value="${node.name}">
                        <p>地址: ${node.address}</p>
                        <p>端口: ${node.port}</p>
                    `;
                    nodeList.appendChild(nodeDiv);
                });
            }

            async function generateNewSubscriptionLink() {
                const nodes = [];
                const nodeList = document.getElementById('node-list').children;

                for (let i = 0; i < nodeList.length; i++) {
                    const nodeName = document.getElementById('node-name-' + i).value;
                    const nodeAddress = nodeList[i].querySelector('p:nth-child(3)').innerText.split(' ')[1];
                    const nodePort = nodeList[i].querySelector('p:nth-child(4)').innerText.split(' ')[1];
                    nodes.push({ name: nodeName, address: nodeAddress, port: nodePort });
                }

                const response = await fetch('/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nodes: nodes })
                });
                const newLink = await response.text();
                document.getElementById('output-data').value = newLink;
            }
        </script>
    </body>
    </html>
    `;
}

async function parseSubscriptionLink(link) {
    try {
        const response = await fetch(link);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        const decodedData = atob(data);
        return decodedData.split('\n').map(item => {
            const [name, address, port] = item.split('|');
            return { name, address, port };
        });
    } catch (error) {
        console.error('Error parsing subscription link:', error);
        return [];
    }
}

function generateNewSubscriptionLink(nodes) {
    const data = nodes.map(node => `${node.name}|${node.address}|${node.port}`).join('\n');
    return `data:text/plain;base64,${btoa(data)}`;
}