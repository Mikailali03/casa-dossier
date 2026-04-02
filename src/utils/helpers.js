export const toTitleCase = (str) => {
  if (!str) return 'Homeowner';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { 
  month: 'short', day: 'numeric', year: 'numeric' 
});