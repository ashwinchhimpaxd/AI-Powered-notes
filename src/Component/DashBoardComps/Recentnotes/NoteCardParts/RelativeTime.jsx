import React, { useState, useEffect, useMemo, memo } from "react";

const RelativeTime = memo(({ updatedAt }) => {
    const [now, setNow] = useState(Date.now());
    
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 60000); // Tick every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const relativeModified = useMemo(() => {
        if (!updatedAt) return "";
        const diffMs = now - new Date(updatedAt);
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return new Date(updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }, [updatedAt, now]);

    return <>{relativeModified}</>;
});

export default RelativeTime;
