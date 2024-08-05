async function parseLink() {
    const link = document.getElementById('link').value;
    const response = await fetch('/parse?link=' + encodeURIComponent(link));
    const nodes = await response.json();
    const nodesDiv = document.getElementById('nodes');
    nodesDiv.innerHTML = nodes.map((node, i) =>
        `<div>
            <input type="text" id="name-${i}" value="${node.name}" placeholder="Node name" />
            <input type="text" id="address-${i}" value="${node.address}" placeholder="Address" />
            <input type="text" id="port-${i}" value="${node.port}" placeholder="Port" />
        </div>`
    ).join('');
}

async function generateLink() {
    const nodes = [];
    document.querySelectorAll('#nodes > div').forEach((div, i) => {
        nodes.push({
            name: document.getElementById('name-' + i).value,
            address: document.getElementById('address-' + i).value,
            port: document.getElementById('port-' + i).value
        });
    });
    const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes })
    });
    const link = await response.text();
    document.getElementById('output').value = link;
}