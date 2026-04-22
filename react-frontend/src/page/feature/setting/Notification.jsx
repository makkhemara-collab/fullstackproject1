import { useEffect, useState } from "react";
import request from "../../../utils/request";
import { showAlert, showConfirm } from "../../../utils/alert";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        tel_id: "",
        token: "",
        group_id: "",
        status: "Active",
        is_alert: false
    });

    // Fetch notifications from Telegram config API
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await request("/api/telegram-config", "GET");
            setNotifications(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Filter notifications by search
    const filteredNotifications = notifications.filter((n) =>
        n.token?.toLowerCase().includes(search.toLowerCase()) ||
        n.group_id?.toLowerCase().includes(search.toLowerCase())
    );

    // Handle Add New
    const handleAdd = () => {
        setFormData({
            tel_id: "",
            token: "",
            group_id: "",
            status: "Active",
            is_alert: false
        });
        setEditingId(null);
        setShowForm(true);
    };

    // Handle Edit
    const handleEdit = (notification) => {
        setFormData({
            tel_id: notification.tel_id,
            token: notification.token || "",
            group_id: notification.group_id || "",
            status: notification.status || "Active",
            is_alert: notification.is_alert || false
        });
        setEditingId(notification.tel_id);
        setShowForm(true);
    };

    // Handle Delete
    const handleDelete = async (tel_id) => {
        const result = await showConfirm(
            "Are you sure?",
            `Delete notification "${tel_id}"? This action cannot be undone.`,
            "Yes, delete it!"
        );

        if (result.isConfirmed) {
            try {
                await request(`api/telegram-config/${tel_id}`, "DELETE");
                showAlert("success", "Notification deleted successfully");
                fetchNotifications();
            } catch (error) {
                console.error("Error deleting notification:", error);
                showAlert("error", "Error deleting notification");
            }
        }
    };

    // Handle Form Submit
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tel_id.trim()) {
            showAlert("warning", "Telegram ID is required");
            return;
        }
        if (!formData.token.trim()) {
            showAlert("warning", "Token is required");
            return;
        }
        if (!formData.group_id.trim()) {
            showAlert("warning", "Group ID is required");
            return;
        }

        try {
            if (editingId) {
                // Update existing
                await request(`api/telegram-config/${editingId}`, "PUT", {
                    token: formData.token,
                    group_id: formData.group_id,
                    status: formData.status,
                    is_alert: formData.is_alert
                });
                showAlert("success", "Notification updated successfully");
            } else {
                // Create new
                await request("/api/telegram-config", "POST", formData);
                showAlert("success", "Notification created successfully");
            }
            setShowForm(false);
            fetchNotifications();
        } catch (error) {
            console.error("Error saving notification:", error);
            showAlert("error", error.response?.data?.error || "Error saving notification");
        }
    };

    // Handle Form Cancel
    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
    };

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div>
            <div className="notification-header">
                <h2>Telegram Notifications</h2>
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
                        placeholder="Search notification..."
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
                            <th>Telegram ID</th>
                            <th>Token</th>
                            <th>Group ID</th>
                            <th>Status</th>
                            <th>Is Alert</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNotifications.slice(0, perPage).map((n) => (
                            <tr key={n.tel_id}>
                                <td>
                                    <div className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(n)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(n.tel_id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                                <td>{n.tel_id}</td>
                                <td>{n.token}</td>
                                <td>{n.group_id}</td>
                                <td>
                                    <span
                                        className={`status-badge ${n.status === 'Active' ? 'status-active' : 'status-inactive'}`}
                                    >
                                        {n.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`alert-badge ${n.is_alert ? 'alert-yes' : 'alert-no'}`}>
                                        {n.is_alert ? "Yes" : "No"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredNotifications.length === 0 && (
                            <tr>
                                <td colSpan={6} className="no-data">
                                    No notifications found
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
                        <h2>{editingId ? "Edit Notification" : "Add Notification"}</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Telegram ID *</label>
                                <input
                                    type="text"
                                    name="tel_id"
                                    value={formData.tel_id}
                                    onChange={handleInputChange}
                                    disabled={!!editingId}
                                    placeholder="Enter Telegram ID"
                                />
                            </div>
                            <div className="form-group">
                                <label>Token *</label>
                                <input
                                    type="text"
                                    name="token"
                                    value={formData.token}
                                    onChange={handleInputChange}
                                    placeholder="Enter Bot Token"
                                />
                            </div>
                            <div className="form-group">
                                <label>Group ID *</label>
                                <input
                                    type="text"
                                    name="group_id"
                                    value={formData.group_id}
                                    onChange={handleInputChange}
                                    placeholder="Enter Group ID"
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="is_alert"
                                        checked={formData.is_alert}
                                        onChange={handleInputChange}
                                    />
                                    Enable Alert
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    {editingId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;