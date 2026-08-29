import React from 'react';
import { TeacherProfile } from '../../types';
import { PlatformTimetableCalendar } from '../calendar/PlatformTimetableCalendar';

interface TeacherWeeklyAvailabilityCalendarProps {
  teacher: TeacherProfile;
}

export const TeacherWeeklyAvailabilityCalendar: React.FC<TeacherWeeklyAvailabilityCalendarProps> = ({ teacher }) => {
  return <PlatformTimetableCalendar teacher={teacher} />;
};
