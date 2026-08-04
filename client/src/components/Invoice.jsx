import React, { useState, useEffect } from "react";
import { LayoutDashboard, LogOut, Plus, X, User, Package, IndianRupee, FileText, Loader2 } from "lucide-react";
import "@fontsource/permanent-marker";
import "@fontsource/playfair-display";
import axios from 'axios';
import Loader from './Loader';
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from './../../utils/api';
import { alertError, alertSuccess } from './../../utils/alert';
import { logEvent } from "../../utils/analytics";

const base_url = BASE_URL;

export default function InvoicePage() {
    const [profile, setProfile] = useState([]);
    const navigate = useNavigate();
    function validToken() {
        let token;
        token = localStorage.getItem("token");
        if (!token) {
            navigate("/")
        }
    }

    function logout(){
        localStorage.clear();
        validToken();
    }

    async function fetchBusinessInfo() {
        try {
            const res = await axios.get(`${base_url}/api/profile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            setProfile(res.data.user);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        validToken();
        fetchBusinessInfo(); // call it to load profile after validating token
    }, []);


    const [loading, setLoading] = useState(false);

    const [customer, setCustomer] = useState({
        name: "",
        email: "",
        contact: "",
        whatsapp: "",
        sameAsWhatsapp: false,
        address: "",
        company: "",
    });

    const [rows, setRows] = useState([
        { id: 1, product: "", quantity: 1, unitPrice: "", creditAmount: "", debitAmount: "", tax: "", taxAmount: "", total: "", error: "" },
    ]);

    // Customer handlers
    const handleCustomerChange = (e) => {
        const { name, value, /*type*/ checked } = e.target;

        if (name === "sameAsWhatsapp") {
            setCustomer((prev) => ({
                ...prev,
                sameAsWhatsapp: checked,
                whatsapp: checked ? prev.contact : "",
            }));
        } else {
            setCustomer((prev) => {
                const updated = { ...prev, [name]: value };
                if (prev.sameAsWhatsapp && name === "contact") {
                    updated.whatsapp = value;
                }
                return updated;
            });
        }
    };

    const location = useLocation();

    // Product handlers
    const addRow = () => {
        setRows([
            ...rows,
            { id: Date.now(), product: "", quantity: 1, unitPrice: "", creditAmount: "", debitAmount: "", tax: "", taxAmount: "", total: "", error: "" },
        ]);
    };

    const removeRow = (id) => {
        if (rows.length > 1) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const handleProductChange = (id, field, value) => {
        setRows(
            rows.map((row) => {
                if (row.id === id) {
                    const updated = { ...row, [field]: value };

                    // Clear error first
                    updated.error = "";



                    // Calculate and store taxAmount and total for each row
                    const subtotal = calculateSubtotal(updated.unitPrice, updated.quantity);
                    const taxAmount = calculateTaxAmount(subtotal, updated.tax);
                    const total = calculateRowTotal(updated.unitPrice, updated.quantity, updated.tax, updated.creditAmount, updated.debitAmount);

                    updated.taxAmount = taxAmount.toString();
                    updated.total = total.toString();

                    // Auto-calculate debit when unit price or credit changes
                    if (field === 'unitPrice' || field === 'creditAmount' || field === 'quantity') {
                        const unitPrice = Number(field === 'unitPrice' ? value : updated.unitPrice) || 0;
                        // const credit = Number(field === 'creditAmount' ? value : updated.creditAmount) || 0;

                        // Debit represents the bill amount after credit (for reference only)
                        if (unitPrice > 0) {
                            updated.debitAmount = total.toString();
                        }
                    }

                    // Validation: Ensure numbers are not negative
                    if (field === 'quantity' && Number(value) < 0) {
                        updated.error = "❌ Quantity cannot be negative.";
                        return updated;
                    }

                    if ((field === 'unitPrice' || field === 'creditAmount' || field === 'debitAmount' || field === 'tax') && Number(value) < 0) {
                        updated.error = `❌ ${field} cannot be negative.`;
                        return updated;
                    }

                    // Validation: Tax cannot exceed 100%
                    if (field === 'tax' && Number(value) > 100) {
                        updated.error = "❌ Tax cannot exceed 100%.";
                        return updated;
                    }

                    // Validation: Credit cannot exceed unit price
                    if (field === 'creditAmount') {
                        const credit = Number(value) || 0;
                        if (credit > subtotal && subtotal > 0) {
                            updated.error = "❌ Credit cannot exceed unit price.";
                        }
                    }
                    return updated;
                }
                return row;
            })
        );
    };

    // Fixed calculations
    const calculateSubtotal = (unitPrice, quantity) => {
        return (Number(unitPrice) || 0) * (Number(quantity) || 0);
    };

    const calculateTaxAmount = (subtotal, taxRate) => {
        return subtotal * (Number(taxRate) || 0) / 100;
    };

    const calculateRowTotal = (unitPrice, quantity, taxRate, creditAmount, /*debitAmount*/) => {
        const subtotal = calculateSubtotal(unitPrice, quantity);
        const taxAmount = calculateTaxAmount(subtotal, taxRate);
        const credit = Number(creditAmount) || 0;
        // const debit = Number(debitAmount) || 0;
        // Correct calculation: subtotal + tax - credit = final amount
        return subtotal + taxAmount - credit;
    };

    let grandDetails = {};

    const grandSubtotal = rows.reduce((acc, row) => acc + calculateSubtotal(row.unitPrice, row.quantity), 0);
    const grandTaxAmount = rows.reduce((acc, row) => acc + calculateTaxAmount(calculateSubtotal(row.unitPrice, row.quantity), row.tax), 0);
    const grandCreditAmount = rows.reduce((acc, row) => acc + (Number(row.creditAmount) || 0), 0);
    const grandDebitAmount = rows.reduce((acc, row) => acc + (Number(row.debitAmount) || 0), 0);
    const grandTotal = grandSubtotal + grandTaxAmount - grandCreditAmount;

    grandDetails.grandSubtotal = grandSubtotal;
    grandDetails.grandTaxAmount = grandTaxAmount;
    grandDetails.grandCreditAmount = grandCreditAmount;
    grandDetails.grandDebitAmount = grandDebitAmount;
    grandDetails.grandTotal = grandTotal;


    // Fixed grand total calculation - debit is not added, it's just for reference

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Validation function for invoice generation
    const validateInvoice = () => {
        const errors = [];

        // Customer validation
        if (!customer.name.trim()) errors.push("Customer name is required");
        if (!customer.contact.trim()) errors.push("Customer contact is required");

        // Product validation
        const hasProducts = rows.some(row => row.product.trim() && row.unitPrice > 0);
        if (!hasProducts) errors.push("At least one product with valid price is required");

        // Check for row errors
        const hasRowErrors = rows.some(row => row.error);
        if (hasRowErrors) errors.push("Please fix all validation errors in product rows");

        return errors;
    };

    const handleGenerateInvoice = async () => {
        const errors = validateInvoice();

        if (errors.length > 0) {
            alertError("Please fix the following errors:\n\n" + errors.join("\n"));
            return;
        }

        const payload = { customer, rows, grandDetails };
        logEvent("Invoice", "Generate", "Generate Invoice Button");

        try {
            setLoading(true);

            const token = localStorage.getItem("token"); // get token

            const res = await axios.post(`${base_url}/api/invoice`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`, // pass token in headers
                },
                responseType: "blob", // because backend returns PDF
            });

            const file = new Blob([res.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);

            // open PDF in new tab
            window.open(fileURL, "_blank");

            alertSuccess(
                `Invoice generated successfully!\nTotal Amount: ${formatINR(grandDetails.grandTotal)}`
            );

        } catch (e) {
            console.error("Error generating invoice:", e);
            alertError("Failed to generate invoice. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={`h-full flex flex-col ${location.pathname.startsWith('/dashboard') ? '' : 'h-screen'}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                {/* Header - Only show if not in dashboard */}
                {loading && <Loader text="Loading ..." />}
                {!location.pathname.startsWith('/dashboard') && (
                <header className="flex px-8 shadow-sm justify-between items-center bg-blue-900 border-b h-16 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-white underline underline-offset-4 decoration-[#E3FDFD] decoration-2 decoration-wavy" style={{ fontFamily: "Playfair Display, cursive" }}>
                        Invoice Buddy
                    </h1>

                    <div className="relative group">
                        <img
                            src={profile.logo || `https://ui-avatars.com/api/?name=${String(profile.businessName || "Invoice Buddy").replaceAll(' ', '+')}&background=F5F5F5`}
                            alt="profile"
                            className="w-10 h-10 rounded-full cursor-pointer border-3 border-[#E3FDFD] hover:ring-2 hover:border-[#E3FDFD] transition"
                        />

                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible scale-95 group-hover:scale-100 transition-all duration-200 origin-top-right z-50">
                            <button className="flex cursor-pointer items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:border hover:border-dashed rounded-t-lg">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </button>
                            <hr className="border-gray-100" />
                            <button onClick={logout} className="flex cursor-pointer items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:border hover:border-dashed rounded-b-lg">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full flex">
                        {/* Customer Details Section - 1/4 width */}
                        <div className="w-1/4 border-r bg-white">
                            <div className="h-full flex flex-col">
                                <div className="px-6 py-4 border-b bg-gray-100 text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <h2 className="text-lg font-semibold text-gray-800">Customer Details</h2>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-clip overflow-y-auto p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="flex items-center gap-1">
                                                Customer Name <span className="text-red-500">*</span>
                                                <div className="relative group">
                                                    <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                    <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        Enter the customer's full name
                                                    </div>
                                                </div>
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={customer.name}
                                            onChange={handleCustomerChange}
                                            placeholder="Enter customer name"
                                            className={`w-full bg-white border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${!customer.name.trim() ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="flex items-center gap-1">
                                                Email Address
                                                <div className="relative group">
                                                    <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                    <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        Customer's email for invoice delivery
                                                    </div>
                                                </div>
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={customer.email}
                                            onChange={handleCustomerChange}
                                            placeholder="customer@example.com"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="flex items-center gap-1">
                                                Contact Number <span className="text-red-500">*</span>
                                                <div className="relative group">
                                                    <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                    <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        Customer's phone number with country code
                                                    </div>
                                                </div>
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="contact"
                                            value={customer.contact}
                                            onChange={handleCustomerChange}
                                            placeholder="+91 98765 43210"
                                            className={`w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${!customer.contact.trim() ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                            Same as contact number
                                            <div className="relative group">
                                                <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    Use same number for WhatsApp
                                                </div>
                                            </div>
                                        </span>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="sameAsWhatsapp"
                                                checked={customer.sameAsWhatsapp}
                                                onChange={handleCustomerChange}
                                                className="sr-only"
                                            />
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${customer.sameAsWhatsapp ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 left-0.5 transition-transform ${customer.sameAsWhatsapp ? "translate-x-5" : ""}`} />
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="flex items-center gap-1">
                                                WhatsApp Number
                                                <div className="relative group">
                                                    <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                    <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        WhatsApp number for invoice sharing
                                                    </div>
                                                </div>
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="whatsapp"
                                            value={customer.whatsapp}
                                            onChange={handleCustomerChange}
                                            placeholder="+91 98765 43210"
                                            disabled={customer.sameAsWhatsapp}
                                            className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${customer.sameAsWhatsapp ? "bg-gray-50 cursor-not-allowed" : ""}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="flex items-center gap-1">
                                                Company Name
                                                <div className="relative group">
                                                    <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                    <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        Customer's business name (optional)
                                                    </div>
                                                </div>
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={customer.company}
                                            onChange={handleCustomerChange}
                                            placeholder="Company name (optional)"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <span className="flex items-center gap-1">
                                                Address
                                                <div className="relative group">
                                                    <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                    <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        Customer's complete billing address
                                                    </div>
                                                </div>
                                            </span>
                                        </label>
                                        <textarea
                                            name="address"
                                            value={customer.address}
                                            onChange={handleCustomerChange}
                                            placeholder="Enter complete address"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products & Services Section - 3/4 width */}
                        <div className="flex-1 bg-white">
                            <div className="h-full flex flex-col">
                                <div className="px-6 py-3 border-b bg-gray-100 text-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-gray-600" />
                                            <h2 className="text-lg font-semibold text-gray-800">Products & Services</h2>
                                        </div>
                                        <button
                                            onClick={addRow}
                                            className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors text-sm"
                                        >
                                            <Plus size={16} />
                                            Add Item
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b sticky top-0">
                                            <tr>
                                                <th className="px-2 py-1  text-left font-medium text-gray-700 w-12">#</th>
                                                <th className="px-2 py-1 text-left font-medium text-gray-700 min-w-[180px]">
                                                    <span className="flex items-center gap-1">
                                                        Product/Service
                                                        <div className="relative group">
                                                            <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                            <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                Name of product or service you're selling
                                                            </div>
                                                        </div>
                                                    </span>
                                                </th>
                                                <th className="px-2 py-1 text-center font-medium text-gray-700 w-16">
                                                    <span className="flex items-center justify-center gap-1">
                                                        Qty
                                                        <div className="relative group">
                                                            <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                            <div className="absolute bottom-6 left-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                How many items/hours/units
                                                            </div>
                                                        </div>
                                                    </span>
                                                </th>
                                                <th className="px-2 py-1  text-right font-medium text-gray-700 w-24">
                                                    <span className="flex items-center justify-end gap-1">
                                                        Unit Price (₹)
                                                        <div className="relative group">
                                                            <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                            <div className="absolute bottom-6 right-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                Price per single item/unit
                                                            </div>
                                                        </div>
                                                    </span>
                                                </th>
                                                <th className="px-2 py-1 text-right font-medium text-gray-700 w-24">
                                                    <span className="flex items-center justify-end gap-1">
                                                        Credit (₹)
                                                        <div className="relative group">
                                                            <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                            <div className="absolute bottom-6 right-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                Money you owe customer (reduces bill)
                                                            </div>
                                                        </div>
                                                    </span>
                                                </th>
                                                <th className="px-2 py-1 text-right font-medium text-gray-700 w-24">
                                                    <span className="flex items-center justify-end gap-1">
                                                        Debit (₹)
                                                        <div className="relative group">
                                                            <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                            <div className="absolute bottom-6 right-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                Bill amount after credit (for reference only)
                                                            </div>
                                                        </div>
                                                    </span>
                                                </th>
                                                <th className="px-2 py-1 text-center font-medium text-gray-700 w-16">
                                                    <span className="flex items-center justify-center gap-1">
                                                        Tax %
                                                        <div className="relative group">
                                                            <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center cursor-help">?</div>
                                                            <div className="absolute bottom-6 right-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                GST or tax percentage (e.g. 18)
                                                            </div>
                                                        </div>
                                                    </span>
                                                </th>
                                                <th className="px-2 py-1  text-right font-medium text-gray-700 w-24">Subtotal (₹)</th>
                                                <th className="px-2 py-1  text-right font-medium text-gray-700 w-24">Tax Amt (₹)</th>
                                                <th className="px-2 py-1  text-right font-medium text-gray-700 w-24">Total (₹)</th>
                                                <th className="px-2 py-1  text-center font-medium text-gray-700 w-12">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {rows.map((row, index) => {
                                                const subtotal = calculateSubtotal(row.unitPrice, row.quantity);
                                                const taxAmount = calculateTaxAmount(subtotal, row.tax);
                                                const total = calculateRowTotal(row.unitPrice, row.quantity, row.tax, row.creditAmount, row.debitAmount);

                                                return (
                                                    <tr key={row.id} className={`hover:bg-gray-50 ${row.error ? 'bg-red-50' : ''}`}>
                                                        <td className="px-4 py-3 text-center text-gray-500 font-medium">
                                                            {index + 1}
                                                            {row.error && (
                                                                <div className="text-xs text-red-500 mt-1" title={row.error}>
                                                                    ⚠️
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-1 py-3">
                                                            <input
                                                                type="text"
                                                                className="w-full border border-gray-300 rounded pl-2 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                placeholder="Enter product/service"
                                                                value={row.product}
                                                                onChange={(e) => handleProductChange(row.id, "product", e.target.value)}
                                                            />
                                                            {row.error && (
                                                                <div className="text-xs text-red-500 mt-1">
                                                                    {row.error}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-1 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="w-full border-gray-300 rounded border py-2 text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                value={row.quantity}
                                                                onChange={(e) => handleProductChange(row.id, "quantity", e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-1 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="w-full border border-gray-300 rounded py-2 text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                placeholder="0.00"
                                                                value={row.unitPrice}
                                                                onChange={(e) => handleProductChange(row.id, "unitPrice", e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-1 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="w-full border border-gray-300 rounded py-2 text-sm text-right focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none bg-green-50"
                                                                placeholder="0.00"
                                                                value={row.creditAmount}
                                                                onChange={(e) => handleProductChange(row.id, "creditAmount", e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-1 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="w-full border border-gray-300 rounded py-2 text-sm text-right focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none bg-red-50"
                                                                placeholder="0.00"
                                                                value={row.debitAmount}
                                                                onChange={(e) => handleProductChange(row.id, "debitAmount", e.target.value)}
                                                                title="This will be auto-calculated when you enter unit price and credit"
                                                            />
                                                        </td>
                                                        <td className="px-1 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                className="w-full border border-gray-300 rounded py-2 text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                placeholder="0"
                                                                value={row.tax}
                                                                onChange={(e) => handleProductChange(row.id, "tax", e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-gray-700 bg-gray-50">
                                                            {formatINR(subtotal)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-orange-600 bg-orange-50">
                                                            {formatINR(taxAmount)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50">
                                                            {formatINR(total)}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => removeRow(row.id)}
                                                                disabled={rows.length === 1}
                                                                className={`p-2 rounded cursor-pointer transition-colors ${rows.length === 1
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                                                    }`}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary */}
                                <div className="border-t bg-gray-50 p-6">
                                    <div className="flex justify-between items-end">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleGenerateInvoice}
                                                className="relative cursor-pointer inline-flex items-center justify-center px-12 py-4 
                   font-semibold tracking-wide text-white rounded-xl shadow-xl overflow-hidden
                   transition-all duration-300 ease-out group border border-slate-600/30
                   transform hover:scale-105 active:scale-95 hover:shadow-2xl"
                                                style={{ fontFamily: "Playfair Display, cursive" }}
                                            >
                                                {/* Base gradient background */}
                                                <span className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-800
                         group-hover:from-slate-600 group-hover:via-slate-700 group-hover:to-blue-900 
                         transition-all duration-500 ease-in-out"></span>

                                                {/* Active state overlay */}
                                                <span className="absolute inset-0 bg-slate-900 opacity-0 group-active:opacity-100 transition duration-200"></span>

                                                {/* Shine effect */}
                                                <span className="absolute -left-16 top-0 w-1/3 h-full bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent skew-x-12 
                         group-hover:left-[120%] transition-all duration-700 ease-in-out"></span>

                                                {/* Button content */}
                                                <span className="relative z-10 flex items-center gap-3">
                                                    {loading ? <Loader2 /> : <FileText size={20} />}
                                                    Generate Invoice
                                                </span>
                                            </button>
                                        </div>

                                        <div className="w-96 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-semibold text-gray-800">{formatINR(grandSubtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Credit:</span>
                                                <span className="font-semibold text-green-600">-{formatINR(grandCreditAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Debit (Reference):</span>
                                                <span className="font-semibold text-gray-500">{formatINR(grandDebitAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Total Tax:</span>
                                                <span className="font-semibold text-orange-600">{formatINR(grandTaxAmount)}</span>
                                            </div>
                                            <div className="border-t border-gray-300 pt-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <IndianRupee className="w-5 h-5 text-blue-600" />
                                                        <span className="text-lg font-bold text-gray-800">Grand Total:</span>
                                                    </div>
                                                    <span className="text-2xl font-bold text-blue-600">{formatINR(grandTotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
