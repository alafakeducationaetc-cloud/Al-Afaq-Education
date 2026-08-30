import React, { useState } from 'react';
import { MasterPlatformCalendar } from '../calendar/MasterPlatformCalendar';

interface ClassScheduleViewProps {
  onNavigateTab: (tab: string) => void;
}

export const ClassScheduleView: React.FC<ClassScheduleViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-6">
      <MasterPlatformCalendar onNavigateTab={onNavigateTab} defaultView="WEEK" />
    </div>
  );
};
