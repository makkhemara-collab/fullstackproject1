import { useEffect, useState } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";

const MethodPayment = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        type: "",
        is_active: 1,
        fee: 0
    });

    // Fetch payment methods from API
    const fetchPaymentMethods = async () => {
        setLoading(true);
        try {
            const response = await request("api/payment-method", "GET");
            setPaymentMethods(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching payment methods:", error);
            setPaymentMethods([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    // Filter payment methods by search
    const filteredPaymentMethods = paymentMethods.filter((p) =>
        p.code?.toLowerCase().includes(search.toLowerCase()) ||
        p.type?.toLowerCase().includes(search.toLowerCase())
    );

    // Handle Add New
    const handleAdd = () => {
        setFormData({
            code: "",
            type: "",
            is_active: 1,
            fee: 0
        });
        setEditingCode(null);
        setShowForm(true);
    };

    // Handle Edit
    const handleEdit = (method) => {
        setFormData({
            code: method.code,
            type: method.type || "",
            is_active: method.is_active ?? 1,
            fee: method.fee || 0
        });
        setEditingCode(method.code);
        setShowForm(true);
    };

    // Handle Delete
    const handleDelete = async (code) => {
        const result = await showConfirm(
            "Are you sure?",
            `Delete payment method "${code}"? This action cannot be undone.`,
            "Yes, delete it!"
        );

        if (result.isConfirmed) {
            try {
                await request(`api/payment-method/${code}`, "DELETE");
                showAlert("success", "Payment method deleted successfully");
                fetchPaymentMethods();
            } catch (error) {
                console.error("Error deleting payment method:", error);
                showAlert("error", "Error deleting payment method");
            }
        }
    };

    // Handle Form Submit
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            showAlert("warning", "Code is required");
            return;
        }
        if (!formData.type.trim()) {
            showAlert("warning", "Type is required");
            return;
        }

        try {
            if (editingCode) {
                // Update existing
                await request(`api/payment-method/${editingCode}`, "PUT", {
                    type: formData.type,
                    is_active: formData.is_active,
                    fee: formData.fee
                });
                showAlert("success", "Payment method updated successfully");
            } else {
                // Create new
                await request("api/payment-method", "POST", formData);
                showAlert("success", "Payment method created successfully");
            }
            setShowForm(false);
            fetchPaymentMethods();
        } catch (error) {
            console.error("Error saving payment method:", error);
            showAlert("error", error.response?.data?.error || "Error saving payment method");
        }
    };

    // Handle Form Cancel
    const handleCancel = () => {
        setShowForm(false);
        setEditingCode(null);
    };

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    return (
        <div>
            <div className="notification-header">
                <h2>Payment Methods</h2>
                <button className="btn-add" onClick={handleAdd}>
                    + Add New
                </button>
            </div>
            <div className="notification-controls">
                <div className="items-per-page">
                    <label>Show</label>
                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span>entries</span>
                </div>
                <div className="search-box">
                    <label>Search:</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search payment method..."
                    />
                </div>
            </div>
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <table className="notification-table">
                    <thead>
                        <tr>
                            <th>Actions</th>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Fee</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPaymentMethods.slice(0, perPage).map((p) => (
                            <tr key={p.code}>
                                <td>
                                    <div className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(p)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(p.code)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                                <td>{p.code}</td>
                                <td>{p.type}</td>
                                <td>${Number(p.fee).toFixed(2)}</td>
                                <td>
                                    <span
                                        className={`status-badge ${p.is_active === 1 ? 'status-active' : 'status-inactive'}`}
                                    >
                                        {p.is_active === 1 ? "Active" : "Inactive"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredPaymentMethods.length === 0 && (
                            <tr>
                                <td colSpan={5} className="no-data">
                                    No payment methods found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* Modal Form */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingCode ? "Edit Payment Method" : "Add Payment Method"}</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Code *</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    disabled={!!editingCode}
                                    placeholder="Enter Code (e.g., CASH, CARD)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Type *</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    placeholder="Enter Payment Type"
                                />
                            </div>
                            <div className="form-group">
                                <label>Fee</label>
                                <input
                                    type="number"
                                    name="fee"
                                    value={formData.fee}
                                    onChange={handleInputChange}
                                    placeholder="Enter Fee Amount"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="is_active"
                                    value={formData.is_active}
                                    onChange={handleInputChange}
                                >
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    {editingCode ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MethodPayment;