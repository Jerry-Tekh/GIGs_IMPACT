const hasValidDate = (value) => {
  if (!value) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

export const formatReadableDate = (value, options = {}) => {
  if (!hasValidDate(value)) {
    return 'No date available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  }).format(new Date(value));
};

export const formatReadableDateTime = (value) =>
  formatReadableDate(value, {
    hour: 'numeric',
    minute: '2-digit'
  });

export const formatShortChartDate = (value) =>
  formatReadableDate(value, {
    month: 'short',
    day: 'numeric'
  });
