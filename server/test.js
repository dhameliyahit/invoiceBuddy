const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PdfPrinter = require('pdfmake');

// Fonts - only Regular and Bold
const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Bold.ttf'
  }
};

const printer = new PdfPrinter(fonts);

const businessInfo = {
  name: 'InvoiceBuddy Pvt Ltd',
  email: 'support@invoicebuddy.com',
  phone: '+91 98765 43210',
  address: '123, MG Road, Mumbai',
  logoUrl: 'https://api.telegram.org/file/bot7703939593:AAFdx95MNWTrM2K-YtaclzTuZ9ZZ5YXzO20/photos/file_13.jpg'
};

const customerInfo = {
  name: 'John Doe',
  email: 'john-hoe@invoicepub.com',
  phone: '+91 95746 6210',
  company: 'Example Pvt Ltd',
  address: '123, MG Road, Mumbai'
};

const products = [
  { id: 1, name: 'Web Design & Development with extra-long description testing text wrapping functionality in pdfmake table cell', qty: 2, unitPrice: 5000, credit: 0, debit: 10000, tax: 18, subtotal: 10000, total: 11800 },
  { id: 2, name: 'Hosting', qty: 1, unitPrice: 2000, credit: 0, debit: 2000, tax: 18, subtotal: 2000, total: 2360 }
];

const totals = {
  subtotal: 12000,
  totalCredit: 0,
  totalDebit: 12000,
  totalTax: 2160,
  grandTotal: 14160
};

const bottomMessage = `This is a computer generated invoice. For any queries, contact ${businessInfo.email} or InvoiceBuddy Team.`;

async function getImageBase64(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const ext = path.extname(url).substring(1) || 'png';
    return `data:image/${ext};base64,${base64}`;
  } catch (error) {
    console.log('Logo not found, using text fallback');
    return null;
  }
}

async function generatePdf() {
  const logoBase64 = await getImageBase64(businessInfo.logoUrl);

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],

    // Subtle watermark
    background: {
      text: 'INVOICE',
      color: '#f5f5f5',
      fontSize: 72,
      bold: true,
      alignment: 'center',
      margin: [0, 250]
    },

    content: [
      // Header Section
      {
        columns: [
          logoBase64
            ? { image: logoBase64, width: 80, height: 80, margin: [0, 0, 20, 0] }
            : { text: businessInfo.name, style: 'businessName', width: 120 },

          {
            stack: [
              { text: businessInfo.name, style: 'businessName' },
              { text: businessInfo.address, style: 'businessInfo', margin: [0, 2, 0, 0] },
              { text: `Phone: ${businessInfo.phone}`, style: 'businessInfo' },
              { text: `Email: ${businessInfo.email}`, style: 'businessInfo' }
            ]
          },

          {
            text: 'INVOICE',
            style: 'invoiceTitle',
            alignment: 'right'
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 30]
      },

      // Separator line
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#2c5aa0' }
        ],
        margin: [0, 0, 0, 20]
      },

      // Customer Details
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'BILL TO:', style: 'sectionHeader' },
              { text: customerInfo.name, style: 'customerName', margin: [0, 5, 0, 2] },
              { text: customerInfo.company, style: 'customerDetail', margin: [0, 0, 0, 2] },
              { text: customerInfo.address, style: 'customerDetail', margin: [0, 0, 0, 2] },
              { text: customerInfo.email, style: 'customerDetail', margin: [0, 0, 0, 2] },
              { text: customerInfo.phone, style: 'customerDetail', margin: [0, 0, 0, 5] }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'INVOICE DETAILS:', style: 'sectionHeader' },
              {
                table: {
                  widths: [70, '*'],
                  body: [
                    [{ text: 'Invoice No:', style: 'invoiceDetailLabel' }, { text: 'INV-2023-001', style: 'invoiceDetailValue' }],
                    [{ text: 'Date:', style: 'invoiceDetailLabel' }, { text: new Date().toLocaleDateString(), style: 'invoiceDetailValue' }],
                    [{ text: 'Due Date:', style: 'invoiceDetailLabel' }, { text: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), style: 'invoiceDetailValue' }]
                  ]
                },
                layout: 'noBorders',
                margin: [0, 5, 0, 0]
              }
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Products Table
      { text: 'PRODUCTS & SERVICES', style: 'sectionHeader', margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: [20, '*', 30, 60, 60, 60, 40, 60],
          body: [
            [
              { text: '#', style: 'tableHeader', alignment: 'center' },
              { text: 'DESCRIPTION', style: 'tableHeader' },
              { text: 'QTY', style: 'tableHeader', alignment: 'center' },
              { text: 'UNIT PRICE', style: 'tableHeader', alignment: 'right' },
              { text: 'CREDIT', style: 'tableHeader', alignment: 'right' },
              { text: 'DEBIT', style: 'tableHeader', alignment: 'right' },
              { text: 'TAX %', style: 'tableHeader', alignment: 'center' },
              { text: 'TOTAL', style: 'tableHeader', alignment: 'right' }
            ],
            ...products.map(product => [
              { text: product.id.toString(), style: 'tableCell', alignment: 'center' },
              { text: product.name, style: 'tableCell', noWrap: false }, // ✅ wrapping enabled
              { text: product.qty.toString(), style: 'tableCell', alignment: 'center' },
              { text: `₹${product.unitPrice.toLocaleString()}`, style: 'tableCell', alignment: 'right' },
              { text: `₹${product.credit.toLocaleString()}`, style: 'tableCell', alignment: 'right' },
              { text: `₹${product.debit.toLocaleString()}`, style: 'tableCell', alignment: 'right' },
              { text: `${product.tax}%`, style: 'tableCell', alignment: 'center' },
              { text: `₹${product.total.toLocaleString()}`, style: 'tableCell', alignment: 'right' }
            ])
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 2 : 1),
          vLineWidth: () => 0,
          hLineColor: i => (i === 0 ? '#2c5aa0' : '#dddddd'),
          vLineColor: () => '#dddddd',
          paddingTop: (i, node) => (i === 0 ? 8 : 6),
          paddingBottom: (i, node) => (i === 0 ? 8 : 6),
          paddingLeft: (i, node) => 8,
          paddingRight: (i, node) => 8
        },
        margin: [0, 0, 0, 20]
      },

      // Totals Section
      {
        columns: [
          { text: '', width: '*' },
          {
            width: 200,
            table: {
              widths: [100, 100],
              body: [
                [{ text: 'Subtotal:', style: 'totalLabel' }, { text: `₹${totals.subtotal.toLocaleString()}`, style: 'totalValue' }],
                [{ text: 'Total Credit:', style: 'totalLabel' }, { text: `+₹${totals.totalCredit.toLocaleString()}`, style: 'totalValue' }],
                [{ text: 'Total Debit:', style: 'totalLabel' }, { text: `-₹${totals.totalDebit.toLocaleString()}`, style: 'totalValue' }],
                [{ text: 'Total Tax:', style: 'totalLabel' }, { text: `₹${totals.totalTax.toLocaleString()}`, style: 'totalValue' }],
                [{ text: 'GRAND TOTAL:', style: 'grandTotalLabel' }, { text: `₹${totals.grandTotal.toLocaleString()}`, style: 'grandTotalValue' }]
              ]
            },
            layout: 'noBorders'
          }
        ],
        margin: [0, 0, 0, 40]
      },

      { text: 'Thank you for your business!', style: 'thankYou', alignment: 'center', margin: [0, 0, 0, 20] },

      { text: bottomMessage, style: 'footer', alignment: 'center', margin: [0, 20, 0, 0] }
    ],

    styles: {
      businessName: { fontSize: 18, bold: true, color: '#2c5aa0' },
      businessInfo: { fontSize: 9, color: '#666666' },
      invoiceTitle: { fontSize: 24, bold: true, color: '#2c5aa0' },

      sectionHeader: { fontSize: 12, bold: true, color: '#333333' },

      customerName: { fontSize: 11, bold: true },
      customerDetail: { fontSize: 9, color: '#666666' },

      invoiceDetailLabel: { fontSize: 9, bold: true, color: '#333333' },
      invoiceDetailValue: { fontSize: 9, color: '#666666' },

      tableHeader: { fontSize: 9, bold: true, color: '#ffffff', fillColor: '#2c5aa0' },
      tableCell: { fontSize: 9, color: '#333333' },

      totalLabel: { fontSize: 10, bold: true, color: '#333333', alignment: 'right' },
      totalValue: { fontSize: 10, color: '#333333', alignment: 'right' },
      grandTotalLabel: { fontSize: 12, bold: true, color: '#2c5aa0', alignment: 'right' },
      grandTotalValue: { fontSize: 12, bold: true, color: '#2c5aa0', alignment: 'right' },

      thankYou: { fontSize: 11, bold: true, color: '#2c5aa0' },
      footer: { fontSize: 8, color: '#999999' }
    },

    defaultStyle: {
      font: 'Roboto',
      lineHeight: 1.2
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream('InvoiceBuddy_Professional.pdf'));
  pdfDoc.end();
  console.log('Professional PDF generated successfully!');
}

generatePdf().catch(console.error);
