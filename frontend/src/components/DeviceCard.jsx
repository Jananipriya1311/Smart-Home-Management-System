import React from "react";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const DeviceCard = ({ device }) => {
  const toggleStatus = async () => {
    const newStatus = device.status === "ON" ? "OFF" : "ON";
    const deviceRef = doc(db, "devices", device.id);

    try {
      // Update the device status in Firestore
      await updateDoc(deviceRef, { status: newStatus });

      // Also add a log entry to the logs collection
      await addDoc(collection(db, "logs"), {
        device_id: device.id,
        status_change: newStatus,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating device or logging:", error);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "12px" }}>
      <h3>{device.name}</h3>
      <p>Status: <strong>{device.status}</strong></p>
      <p>Location: {device.location}</p>
      <button onClick={toggleStatus}>
        Turn {device.status === "ON" ? "OFF" : "ON"}
      </button>
    </div>
  );
};

export default DeviceCard;
