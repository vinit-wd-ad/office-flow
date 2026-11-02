import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-start pt-20 justify-center z-50">

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-md shadow-lg w-full max-w-xl p-6 z-10 animate-fadeIn">

                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    ✕
                </button>

                {/* Content */}
                {children}
            </div>
        </div>
    );
};

export default Modal;