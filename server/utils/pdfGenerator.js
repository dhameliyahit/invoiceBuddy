const PdfPrinter = require("pdfmake");
const path = require("path");
const axios = require("axios");

// fonts
const fonts = {
    Roboto: {
        normal: path.join(__dirname, "../fonts/Roboto-Regular.ttf"),
        bold: path.join(__dirname, "../fonts/Roboto-Bold.ttf"),
        italic: path.join(__dirname, "../fonts/Roboto-Italic.ttf"),
        bolditalic: path.join(__dirname, "../fonts/Roboto-BoldItalic.ttf"),
    },
};

const printer = new PdfPrinter(fonts);

// helper to fetch remote logo
async function getImageBase64(url) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        const ext = path.extname(url).substring(1) || "png";
        return `data:image/${ext};base64,${base64}`;
    } catch (err) {
        console.log("Logo fetch failed:", err.message);
        return null;
    }
}

async function generateInvoicePdf({ pdfBusinessData, customer, rows, grandDetails, watermarkText = "SUCCESS" }) {
    const businessInfo = {
        name: pdfBusinessData.name,
        email: pdfBusinessData.email,
        phone: pdfBusinessData.phone,
        address: pdfBusinessData.address,
        logoUrl: pdfBusinessData.logo,
    };
    console.log(JSON.stringify(businessInfo, null, 2))

    const logoBase64 = await getImageBase64(businessInfo.logoUrl);

    // invoice number + date
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const currentDate = new Date().toLocaleDateString("en-IN");

    // rows -> pdfmake table rows
    const products = rows.map((item, idx) => [
        { text: idx + 1, alignment: "center" },
        { text: item.product || "" },
        { text: String(item.quantity || 0), alignment: "center" },
        { text: `₹${Number(item.unitPrice || 0).toFixed(2)}`, alignment: "right" },
        { text: `₹${Number(item.creditAmount || 0).toFixed(2)}`, alignment: "right" },
        { text: `₹${Number(item.debitAmount || 0).toFixed(2)}`, alignment: "right" },
        { text: item.tax ? `${item.tax}%` : "-", alignment: "center" },
        { text: `₹${Number(item.total || 0).toFixed(2)}`, alignment: "right", bold: true },
    ]);

    const docDefinition = {
        pageSize: "A4",
        pageMargins: [40, 50, 40, 50],

        // watermark
        watermark: {
            text: watermarkText,
            color: "#2c5aa0",
            opacity: 0.1,
            bold: true,
            italics: false,
            angle: -45,
        },

        content: [
            // header
            {
                columns: [
                    {
                        stack: [
                            logoBase64
                                ? { image: logoBase64, width: 70, height: 70, margin: [0, 0, 0, 10] }
                                : { text: businessInfo.name, style: "businessName" },
                            { text: businessInfo.name, style: "businessName" },
                            { text: businessInfo.address, style: "businessInfo" },
                            { text: `Phone: ${businessInfo.phone}`, style: "businessInfo" },
                            { text: `Email: ${businessInfo.email}`, style: "businessInfo" },
                        ],
                    },
                    {
                        width: "auto",
                        table: {
                            widths: ["*", "*"],
                            body: [
                                [
                                    { text: "INVOICE", style: "invoiceTitle", colSpan: 2, alignment: "center" },
                                    {},
                                ],
                                ["Invoice #:", invoiceNumber],
                                ["Date:", currentDate],
                            ],
                        },
                        layout: {
                            fillColor: (rowIndex) => (rowIndex === 0 ? "#2c5aa0" : null),
                            hLineWidth: () => 0,
                            vLineWidth: () => 0,
                            paddingLeft: () => 8,
                            paddingRight: () => 8,
                            paddingTop: () => 4,
                            paddingBottom: () => 4,
                        },
                    },
                ],
                margin: [0, 0, 0, 20],
            },

            // customer
            {
                table: {
                    widths: ["*"],
                    body: [
                        [
                            {
                                stack: [
                                    { text: "BILL TO:", style: "sectionHeader" },
                                    { text: customer.name, style: "customerName" },
                                    customer.company && { text: customer.company, style: "customerDetail" },
                                    customer.address && { text: customer.address, style: "customerDetail" },
                                    customer.email && { text: customer.email, style: "customerDetail" },
                                    customer.contact && { text: customer.contact, style: "customerDetail" },
                                ].filter(Boolean),
                            },
                        ],
                    ],
                },
                layout: { fillColor: () => "#f9f9f9", hLineWidth: () => 0, vLineWidth: () => 0 },
                margin: [0, 0, 0, 20],
            },

            // table
            {
                table: {
                    headerRows: 1,
                    widths: [20, "*", 30, 60, 60, 60, 40, 70],
                    body: [
                        [
                            { text: "#", style: "tableHeader", alignment: "center" },
                            { text: "DESCRIPTION", style: "tableHeader" },
                            { text: "QTY", style: "tableHeader", alignment: "center" },
                            { text: "UNIT PRICE", style: "tableHeader", alignment: "center" },
                            { text: "CREDIT", style: "tableHeader", alignment: "center" },
                            { text: "DEBIT", style: "tableHeader", alignment: "center" },
                            { text: "TAX", style: "tableHeader", alignment: "center" },
                            { text: "TOTAL", style: "tableHeader", alignment: "center" },
                        ],
                        ...products,
                    ],
                },
                layout: {
                    fillColor: (rowIndex) => (rowIndex % 2 === 0 && rowIndex > 0 ? "#f5f5f5" : null),
                },
                margin: [0, 0, 0, 20],
            },

            // totals
            {
                columns: [
                    { text: "", width: "*" },
                    {
                        width: 220,
                        table: {
                            widths: ["*", "*"],
                            body: [
                                ["Subtotal:", `₹${Number(grandDetails.grandSubtotal || 0).toFixed(2)}`],
                                ["Credit:", `₹${Number(grandDetails.grandCreditAmount || 0).toFixed(2)}`],
                                ["Debit:", `₹${Number(grandDetails.grandDebitAmount || 0).toFixed(2)}`],
                                ["Tax:", `₹${Number(grandDetails.grandTaxAmount || 0).toFixed(2)}`],
                                [
                                    { text: "GRAND TOTAL:", bold: true },
                                    {
                                        text: `₹${Number(grandDetails.grandTotal || 0).toFixed(2)}`,
                                        bold: true,
                                        color: "#2c5aa0",
                                    },
                                ],
                            ],
                        },
                        layout: {
                            hLineWidth: () => 0,
                            vLineWidth: () => 0,
                            paddingLeft: () => 6,
                            paddingRight: () => 6,
                            paddingTop: () => 4,
                            paddingBottom: () => 4,
                        },
                    },
                ],
                margin: [0, 0, 0, 20],
            },

            // footer
            { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: "#ddd" }] },
            { text: "Thank you for your business!", alignment: "center", margin: [0, 10, 0, 0] },
        ],

        styles: {
            businessName: { fontSize: 16, bold: true },
            businessInfo: { fontSize: 9, color: "#555" },
            invoiceTitle: { fontSize: 20, bold: true, color: "white" },
            sectionHeader: { fontSize: 12, bold: true, margin: [0, 0, 0, 8], color: "#2c5aa0" }, // slightly bigger + more bottom margin
            customerName: { fontSize: 12, bold: true, margin: [0, 0, 0, 4] },   // increased font size + bottom margin
            customerDetail: { fontSize: 11, margin: [0, 0, 0, 2] },             // slightly bigger + small bottom margin
            tableHeader: { fontSize: 9, bold: true, fillColor: "#2c5aa0", color: "white" },
        },
        defaultStyle: { font: "Roboto" },
    };

    return new Promise((resolve, reject) => {
        try {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            let chunks = [];
            pdfDoc.on("data", (chunk) => chunks.push(chunk));
            pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
            pdfDoc.on("error", reject);
            pdfDoc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { generateInvoicePdf };
