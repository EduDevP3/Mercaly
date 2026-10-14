import React from "react";
import "../assets/css/loadingSpinner.css";

function ThemedSuspense({ className = "" }) {
  return (
    <div
      className={`w-full flex justify-center items-center p-6 text-lg font-medium text-gray-600 dark:text-gray-400 ${
        className || "min-h-[50vh]"
      }`}
    >
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default ThemedSuspense;
