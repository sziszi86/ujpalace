'use client';

import { useState, useEffect, useCallback } from 'react';

interface VisitorData {
  currentVisitors: number;
  visitorId?: string;
}

export function useVisitorTracking() {
  const [visitorData, setVisitorData] = useState<VisitorData>({ currentVisitors: 0 });
  const [loading, setLoading] = useState(true);

  const trackVisitor = useCallback(async () => {
    try {
      const response = await fetch('/api/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setVisitorData(data);
      }
    } catch (error) {
      console.error('Error tracking visitor:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVisitor = useCallback(async () => {
    try {
      const response = await fetch('/api/visitors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setVisitorData(prev => ({ ...prev, currentVisitors: data.currentVisitors }));
      }
    } catch (error) {
      console.error('Error updating visitor:', error);
    }
  }, []);

  const getVisitorCount = useCallback(async () => {
    try {
      const response = await fetch('/api/visitors');
      
      if (response.ok) {
        const data = await response.json();
        setVisitorData(prev => ({ ...prev, currentVisitors: data.currentVisitors }));
      }
    } catch (error) {
      console.error('Error getting visitor count:', error);
    }
  }, []);

  useEffect(() => {
    // Track visitor on mount
    trackVisitor();

    // Update visitor activity every 2 minutes
    const updateInterval = setInterval(updateVisitor, 2 * 60 * 1000);

    // Refresh visitor count every 30 seconds
    const refreshInterval = setInterval(getVisitorCount, 30 * 1000);

    // Clean up intervals on unmount
    return () => {
      clearInterval(updateInterval);
      clearInterval(refreshInterval);
    };
  }, [trackVisitor, updateVisitor, getVisitorCount]);

  return {
    currentVisitors: visitorData.currentVisitors,
    visitorId: visitorData.visitorId,
    loading,
    refreshCount: getVisitorCount
  };
}