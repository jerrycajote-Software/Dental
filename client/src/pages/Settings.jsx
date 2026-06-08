import React, { useState } from "react";
import {
  User,
  Bell,
  Lock,
  Globe,
  Clock,
  Mail,
  Smartphone,
  Save,
} from "lucide-react";
import api from "../services/api";

const Settings = ({
  customerWebAccessEnabled,
  setCustomerWebAccessEnabled,
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState("General");

  const handleUpdateWebAccess = async (enabled) => {
    try {
      setCustomerWebAccessEnabled(enabled);
      await api.patch("/settings", {
        key: "customer_web_access_enabled",
        value: enabled.toString(),
      });
    } catch (err) {
      console.error("Failed to update web access setting:", err);
      setCustomerWebAccessEnabled(!enabled); // Revert on error
    }
  };

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      {/* Settings Sidebar */}
      <div className="w-full xl:w-64 shrink-0">
        <div className="flex flex-col gap-1 p-2 bg-white border shadow-sm rounded-2xl border-slate-100">
          <button
            onClick={() => setActiveSettingsTab("General")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeSettingsTab === "General" ? "bg-blue-50/50 text-blue-600 border border-blue-100/50 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}`}
          >
            <User
              size={18}
              className={
                activeSettingsTab === "General"
                  ? "text-blue-600"
                  : "text-slate-400 group-hover:text-slate-500"
              }
            />{" "}
            General
          </button>

          {/* <button
            onClick={() => setActiveSettingsTab('Notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeSettingsTab === 'Notifications' ? 'bg-blue-50/50 text-blue-600 border border-blue-100/50 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
          >
            
            <Bell size={18} className={activeSettingsTab === 'Notifications' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'} /> Notifications
          </button> */}

          {/* <button className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-800">
            <Lock size={18} className="text-slate-400 group-hover:text-slate-500" /> Security
          </button> */}

          {/* <button className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-800">
            <Globe size={18} className="text-slate-400 group-hover:text-slate-500" /> Language
          </button> */}
        </div>
      </div>

      {/* ============================================ */}

      {/* Settings Content */}
      <div className="flex-1 p-8 bg-white border shadow-sm rounded-2xl border-slate-100">
        {/* General Settings */}
        {activeSettingsTab === "General" && (
          <>
            {/* ============================================ */}

            {/* ============================================ */}

            <hr className="mb-8 border-slate-100" />

            {/* ============================================ */}

            <hr className="mb-8 border-slate-100" />

            {/* Customer Web Access Section */}
            <div className="mb-10">
              <h3 className="mb-6 text-base font-bold text-slate-800">
                Customer Web Access
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Enable Customer Web Access
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      Allow patients to log in and access the web dashboard
                    </p>
                  </div>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={customerWebAccessEnabled}
                      onChange={(e) => handleUpdateWebAccess(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-[11px] font-medium text-amber-600">
                  Note: Disabling web access does not affect mobile app access —
                  patients can still use the mobile app.
                </p>
              </div>
            </div>
            
            
          </>
        )}

        {/* Notification Section */}

        <hr className="mb-6 border-slate-100" />
      </div>
      

      {/* ============================================ */}
    </div>
  );
};

export default Settings;
