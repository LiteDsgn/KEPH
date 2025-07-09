import React from 'react';

export const DailySummaryDialog = ({ isOpen, onClose, tasks, formattedDate, dateKey }: any) => {
  if (!isOpen) return null;
  
  return (
    <div data-testid="daily-summary-dialog">
      <div>Mocked Daily Summary Dialog</div>
      <div>Date: {formattedDate}</div>
      <div>Tasks: {tasks.length}</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};