export const MIN_DESC_LENGTH = 20;
export const MAX_DESC_LENGTH = 150;

export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const getRegistrationErrors = (formData) => {
    const { username, email, password, confirmPassword } = formData;
    const errors = {};

    if (!username || username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters long';
    }

    if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!password || password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
};

export const getLoginErrors = (formData) => {
    const { email, password } = formData;
    const errors = {};

    if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!password) {
        errors.password = 'Password is required';
    }

    return errors;
};
