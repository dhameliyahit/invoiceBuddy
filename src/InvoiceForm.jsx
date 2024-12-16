import html2canvas from "html2canvas";
import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

const InvoiceForm = () => {
  const printRef = useRef(null);

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSameNumber, setIsSameNumber] = useState(false);

  const handleShare = () => {
    const URL = `https://wa.me/${whatsappNumber}`;
    window.open(URL, "_blank");
  };

  const GenratePDF = async () => {
    const element = printRef.current;
    if (!element) {
      return;
    }
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });
    const imgProp = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProp.height * pdfWidth) / imgProp.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${name + dateTime.time}.pdf`);
  };
  const [rows, setRows] = useState([
    { srNo: 1, productName: "", credit: "", debit: "", tax: "" },
  ]);

  const [total, setTotal] = useState({
    credit: 0,
    debit: 0,
    tax: 0,
    taxableTaxAmount: 0,
  });
  const [taxPercentage, setTaxPercentage] = useState(0);

  // Function to add a new row
  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        srNo: rows.length + 1,
        productName: "",
        credit: "",
        debit: "",
        tax: "",
      },
    ]);
  };

  // Handle changes in input fields
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];

    // Ensure numeric fields are converted to valid numbers
    if (["credit", "debit", "tax"].includes(field)) {
      updatedRows[index][field] = value ? parseFloat(value) || 0 : ""; // Default to 0 if not a number
    } else {
      updatedRows[index][field] = value;
    }

    setRows(updatedRows);
    calculateTotals(updatedRows);
  };

  // Handle row removal
  const handleRemoveRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  // Calculate total values including the taxable tax amount
  const calculateTotals = (updatedRows) => {
    const totals = updatedRows.reduce(
      (acc, row) => {
        acc.credit += parseFloat(row.credit) || 0;
        acc.debit += parseFloat(row.debit) || 0;
        acc.tax += parseFloat(row.tax) || 0;
        acc.taxableTaxAmount +=
          (parseFloat(row.credit) || 0) * (taxPercentage / 100) +
          (parseFloat(row.debit) || 0) * (taxPercentage / 100);
        return acc;
      },
      { credit: 0, debit: 0, tax: 0, taxableTaxAmount: 0 }
    );
    setTotal(totals);
  };

  // Handle tax percentage change
  const handleTaxPercentageChange = (e) => {
    const value = e.target.value;
    setTaxPercentage(value); // Ensures taxPercentage always stays numeric
  };

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    setContactNumber(value);
    if (isSameNumber) {
      setWhatsappNumber(value);
    }
  };
  const handleWhatsappNumberChange = (e) => {
    setWhatsappNumber(e.target.value);
  };
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsSameNumber(checked);

    if (checked) {
      setWhatsappNumber(contactNumber); // Set WhatsApp number same as contact number
    } else {
      setWhatsappNumber(""); // Clear WhatsApp number if unchecked
    }
  };

  const [dateTime, setDateTime] = useState({
    date: "",
    time: "",
  });

  useEffect(() => {
    const currentDate = new Date();

    // Formatting date components
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Months are 0-based
    const year = currentDate.getFullYear();

    // Formatting time components
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format

    // Construct formatted date and time
    const formattedDate = `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
    const formattedTime = `${hours}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;

    setDateTime({
      date: formattedDate,
      time: formattedTime,
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col justify-center items-center">
      {/* header   */}
      <div
        ref={printRef}
        className="w-[90%] min-h-[90vh] border bg-white rounded-md shadow-lg"
      >
        <div className="w-full bg-zinc-200 h-16 px-6 flex justify-between items-center">
          <div className="w-32 border">
            <img
              src="./InvoiceBuddy.png"
              className="w-full"
              alt="InvoiceBuddy_Logo"
            />
          </div>
          <div className="text-xs line-clamp-2 font-extralight">
            <p>
              <b>Date :</b> {dateTime.date}
            </p>
            <p>
              <b>Time :</b> {dateTime.time}
            </p>
          </div>
        </div>
        {/* basic deatil */}
        <div className="min-w-[90%] max-w-2xl mx-auto p-4">
          {/* Customer Name */}
          <div className="flex flex-col sm:flex-row items-center mb-4">
            <label
              htmlFor="customerName"
              className="w-full sm:w-40 font-medium mb-2 sm:mb-0 text-sm sm:text-base"
            >
              Customer Name:  <span className="text-red-700">*</span>
            </label>
            <input
              id="customerName"
              value={name}
              type="text"
              onChange={(e) => setName(e.target.value)}
              className="w-full md:w-52 border border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none rounded-md px-2 py-1 text-sm sm:text-base"
            />
          </div>

          {/* Contact Number */}
          <div className="flex flex-col sm:flex-row items-center mb-4">
            <label
              htmlFor="contactNumber"
              className="w-full sm:w-40 font-medium mb-2 sm:mb-0 text-sm sm:text-base"
            >
              Contact No: <span className="text-red-700">*</span>
            </label>
            <div className="w-full block md:flex-1 items-center gap-4">
              <input
                id="contactNumber"
                type="text"
                value={contactNumber}
                onChange={handleContactNumberChange}
                className="w-full md:w-52 border border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none rounded-md px-2 py-1 text-sm sm:text-base"
              />
              <div className="block my-2 md:flex items-center">
                <input
                  id="sameAsWhatsApp"
                  checked={isSameNumber}
                  type="checkbox"
                  onChange={handleCheckboxChange}
                  className="appearance-none h-5 w-5 border border-gray-400 rounded-md checked:bg-blue-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 cursor-pointer"
                />
                <label
                  htmlFor="sameAsWhatsApp"
                  className="ml-2 font-medium cursor-pointer text-gray-700 text-sm sm:text-base"
                >
                  Same Number for WhatsApp
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center mb-4">
            <label
              htmlFor="whatsAppNumber"
              className="w-full sm:w-40 font-medium mb-2 sm:mb-0 text-sm sm:text-base"
            >
              WhatsApp No:  <span className="text-red-700">*</span>
            </label>
            <input
              id="whatsAppNumber"
              value={whatsappNumber}
              type="text"
              onChange={handleWhatsappNumberChange}
              disabled={isSameNumber}
              className="w-full md:w-52  border border-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none rounded-md px-2 py-1 text-sm"
            />
          </div>

          {/* invoice Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-gray-300 text-sm sm:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Sr. No.
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Product Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Credit
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Debit
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Tax
                    <input
                      type="number"
                      value={taxPercentage}
                      onChange={handleTaxPercentageChange}
                      className="w-full border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 mt-1"
                    />
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {row.srNo}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={row.productName}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "productName",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={row.credit}
                        onChange={(e) =>
                          handleInputChange(index, "credit", e.target.value)
                        }
                        className="w-full border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={row.debit}
                        onChange={(e) =>
                          handleInputChange(index, "debit", e.target.value)
                        }
                        className="w-full border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={(
                          (row.credit || 0) * (taxPercentage / 100) +
                          (row.debit || 0) * (taxPercentage / 100)
                        ).toFixed(2)}
                        readOnly
                        className="w-full border border-gray-300 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        className="text-red-600 hover:text-red-800 font-medium"
                        onClick={() => handleRemoveRow(index)}
                      >
                        <i className="fa-solid fa-x"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-gray-100">
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-4 py-2 text-right font-semibold"
                  >
                    Total:
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    {total.credit.toFixed(2)} / {total.debit.toFixed(2)} /{" "}
                    {total.taxableTaxAmount.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      onClick={handleAddRow}
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* buttons */}
        </div>
      </div>
      <div className="my-3 flex items-center">
        <button
          onClick={GenratePDF}
          className="bg-blue-600 text-white border border-blue-600 p-4 rounded-md hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Download PDF
        </button>
        <button
          onClick={handleShare}
          className="bg-gray-600 text-white border border-gray-600 p-4 rounded-md mx-3 hover:bg-gray-700 hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
