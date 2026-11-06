export const formatWorkingHours = (decimalHours) => {
    if (!decimalHours || isNaN(decimalHours)) return "-";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    if (hours === 0) {
        return `${minutes} mins`;
    }
    if (minutes === 0) {
        return `${hours} hrs`;
    }

    return `${hours} hrs ${minutes} mins`;
};