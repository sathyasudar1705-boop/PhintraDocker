export const validateEmail = (email) => {
  if (!email) return 'Email address is required.';
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address.';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 4) {
    return 'Password must be at least 4 characters.';
  }
  return '';
};
