'use client'

import React, { useEffect, useState } from 'react'

interface NotificationProps {
    message?: string | undefined; // Message can be undefined
    onClose:  (value: (((prevState: (string | undefined)) => (string | undefined)) | string | undefined)) => void
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(!!message); // Set visibility based on the presence of a message

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose(undefined)
            }, 5000);

            return () => {
                clearTimeout(timer);
            }
        }
    }, [isVisible]);

    return (
        <>
            {isVisible && message && ( // Ensure message exists before rendering
                <div className="fixed bottom-5 right-5 bg-[#faf5b7] text-[#163a2e] p-3 rounded shadow max-w-[250px] max-h-[80px] overflow-y-scroll">
                    {message}
                </div>
            )}
        </>
    )
}

export default Notification;
