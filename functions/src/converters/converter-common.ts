
export const spacingForHouseLetter = (input: string) => {
    if (input && input.length < 3) {
        return input;
    }

    const lastChars = input.slice(-2);
    const first = parseInt(lastChars.charAt(0), 10);
    if (isNaN(first)) {
        return input;
    }
    if (!lastChars.charAt(1).match(/[a-z]/i)) {
        return input;
    }
    return `${input.slice(0, -2)}${lastChars.charAt(0)} ${lastChars.charAt(1)}`;
};

