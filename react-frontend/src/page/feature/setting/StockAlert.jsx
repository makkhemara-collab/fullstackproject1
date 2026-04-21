import React, { useEffect, useState } from "react";
import request from "../../../utils/request";
import { showAlert } from "../../../utils/alert";
import "../../feature/category/category.css"; // Reuse shared table/form styles

const StockAlert = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        id: null, Stock_alert: 5, Qty_alert: 0, remark: "", is_alert: false
    });
    const [notifications, setNotifications] = useState({
        lowStock: false, availableStock: false, unavailableStock: false
    });

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await request("api/alert-setting", "GET");
            if (Array.isArray(response) && response.length > 0) {
                const data = response[0];
                setSettings({
                    id: data.id, Stock_alert: data.Stock_alert || 5, Qty_alert: data.Qty_alert || 0,
                    remark: data.remark || "", is_alert: data.is_alert || false
                });
                try {
                    const notifData = JSON.parse(data.remark || "{}");
                    setNotifications({
                        lowStock: notifData.lowStock || false,
                        availableStock: notifData.availableStock || false,
                        unavailableStock: notifData.unavailableStock || false
                    });
                } catch (e) {}
            }
        } catch (error) { console.error("Fetch Settings Error:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleNotificationToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                Stock_alert: settings.Stock_alert,
                Qty_alert: settings.Qty_alert,
                remark: JSON.stringify(notifications),
                is_alert: Object.values(notifications).some(v => v === true)
            };

            if (settings.id) {
                await request(`api/alert-setting/${settings.id}`, "PUT", payload);
            } else {
                await request("api/alert-setting", "POST", payload);
            }
            showAlert("success", "Inventory thresholds updated!");
            fetchSettings();
        } catch (error) { showAlert("error", "Failed to save settings"); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="loading">Checking configurations...</div>;

    return (
        <div className="stock-alert-container" style={{maxWidth: "800px", margin: "0 auto"}}>
            <div className="stock-alert-header" style={{background: "#3b82f6", padding: "20px", borderRadius: "12px 12px 0 0"}}>
                <span className="material-symbols-outlined" style={{color: "#fff"}}>notifications_active</span>
                <span style={{fontWeight: "800", marginLeft: "10px"}}>Inventory Guard Settings</span>
            </div>

            <div className="setting-section" style={{background: "#fff", padding: "30px", border: "1px solid #e2e8f0", borderTop: "none"}}>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px"}}>
                    <div>
                        <h4 style={{margin: "0 0 10px 0", color: "#1e293b"}}>Low Stock Threshold</h4>
                        <p style={{fontSize: "13px", color: "#64748b", marginBottom: "15px"}}>Notify when drink ingredients fall below this unit count.</p>
                        <div className="input-group">
                            <input type="number" name="Stock_alert" value={settings.Stock_alert} onChange={handleInputChange} className="threshold-input" style={{padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", width: "100%"}} />
                        </div>
                    </div>
                    <div>
                        <h4 style={{margin: "0 0 10px 0", color: "#1e293b"}}>Reorder Warning</h4>
                        <p style={{fontSize: "13px", color: "#64748b", marginBottom: "15px"}}>Secondary alert level for critical supplies (Milk/Beans).</p>
                        <div className="input-group">
                            <input type="number" name="Qty_alert" value={settings.Qty_alert} onChange={handleInputChange} className="threshold-input" style={{padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", width: "100%"}} />
                        </div>
                    </div>
                </div>

                <h4 style={{borderTop: "1px solid #f1f5f9", paddingTop: "20px", marginBottom: "20px"}}>Alert Channels</h4>
                <div className="notification-list">
                    {Object.keys(notifications).map((key) => (
                        <div key={key} style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: "1px solid #f8fafc"}}>
                            <div>
                                <span style={{fontWeight: "bold", color: "#475569", textTransform: "capitalize"}}>{key.replace(/([A-Z])/g, ' $1')}</span>
                                <p style={{fontSize: "12px", color: "#94a3b8", margin: 0}}>Send push notification to Manager App</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={notifications[key]} onChange={() => handleNotificationToggle(key)} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    ))}
                </div>

                <div style={{marginTop: "30px", textAlign: "right"}}>
                    <button className="btn-add-category" onClick={handleSave} disabled={saving} style={{width: "200px", justifyContent: "center"}}>
                        {saving ? "Updating..." : "Save Configuration"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockAlert;