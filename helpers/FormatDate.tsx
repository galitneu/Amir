export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format: DD/MM/YY (e.g., 05/07/82)
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString().slice(-2);
  
  return `${day}/${month}/${year}`;
};

export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);
  
  // Format: DD/MM/YY - DD/MM/YY (e.g., 05/07/82 - 10/06/25)
  return `${formattedStart} - ${formattedEnd}`;
};