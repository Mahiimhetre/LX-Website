export const checkPasswordStrength = (password) => {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    const strengthMap = {
        0: { label: 'weak', color: 'hsl(0, 84%, 60%)' },
        1: { label: 'weak', color: 'hsl(0, 84%, 60%)' },
        2: { label: 'fair', color: 'hsl(30, 100%, 50%)' },
        3: { label: 'fair', color: 'hsl(30, 100%, 50%)' },
        4: { label: 'good', color: 'hsl(45, 100%, 50%)' },
        5: { label: 'strong', color: 'hsl(142, 69%, 58%)' },
    };

    return {
        score,
        ...strengthMap[score],
        requirements,
    };
};
