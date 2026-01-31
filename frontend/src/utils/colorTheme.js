// Color theme for different user roles
export const colors = {
  farmer: {
    primary: '#0db60c',
    light: 'rgba(13, 182, 12, 0.1)',
    lighter: 'rgba(13, 182, 12, 0.05)',
    gradient: 'linear-gradient(to bottom right, rgba(13, 182, 12, 0.05), rgba(13, 182, 12, 0.1))',
    border: '4px solid #0db60c',
    name: 'Farmer'
  },
  contractor: {
    primary: '#29003b',
    light: 'rgba(41, 0, 59, 0.1)',
    lighter: 'rgba(41, 0, 59, 0.05)',
    gradient: 'linear-gradient(to bottom right, rgba(41, 0, 59, 0.05), rgba(41, 0, 59, 0.1))',
    border: '4px solid #29003b',
    name: 'Contractor'
  }
};

// Get color theme by role
export const getThemeByRole = (role) => {
  return colors[role] || colors.farmer;
};

// Get color style object
export const getColorStyle = (role, property = 'primary') => {
  const theme = getThemeByRole(role);
  return { color: theme[property] };
};

// Get background gradient style
export const getGradientStyle = (role) => {
  const theme = getThemeByRole(role);
  return { background: theme.gradient };
};

// Get border style
export const getBorderStyle = (role) => {
  const theme = getThemeByRole(role);
  return { borderTop: theme.border };
};

export default colors;
