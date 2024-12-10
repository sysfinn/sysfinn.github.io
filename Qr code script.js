const net = require('net');

// Function to generate ZPL for a given SKU
function generateZPL(sku) {
    const baseUrl = "https://www.fastenal.com/product/details/";
    const url = `${baseUrl}${sku}`;
    const zpl = `
    ^XA
    ^FO20,15
    ^BQN,2,7
    ^FDQA,${url}^FS
    ^XZ
    `;
    return zpl;
}

// Function to send ZPL to QLn420 printer
function sendToPrinter(printerIp, printerPort, zpl) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.connect(printerPort, printerIp, () => {
            console.log('Connected to printer.');
            client.write(zpl, 'utf8', () => {
                console.log('ZPL sent successfully.');
                client.end();
                resolve();
            });
        });

        client.on('error', (err) => {
            console.error('Failed to send label to printer:', err);
            reject(err);
        });

        client.on('close', () => {
            console.log('Connection to printer closed.');
        });
    });
}

// List of SKUs
const skuList = [
    "0200000023",
    "0200000024",
    "0200000025"
];

// Printer IP and Port
const printerIp = "10.15.70.81"; // Replace with your printer's IP
const printerPort = 9100; // Default port for Zebra printers

// Generate and print labels for each SKU
(async () => {
    for (const sku of skuList) {
        const zplCommand = generateZPL(sku);
        console.log(`Sending ZPL for SKU ${sku}:\n${zplCommand}`);
        try {
            await sendToPrinter(printerIp, printerPort, zplCommand);
        } catch (error) {
            console.error(`Error sending label for SKU ${sku}:`, error);
        }
    }
})();
