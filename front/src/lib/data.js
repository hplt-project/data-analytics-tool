export const calculateDocumentSegments = (reportData) => {
    if (!reportData?.docs_segments)
        return {
            segments: "",
            totalDocuments: "",
            remainingSum: "",
            percentageOfTotal: "",
            remainingPercentage: "",
        };

    const segments = reportData.docs_segments.filter((doc) => doc[0] <= 25);

    const result = reportData.docs_segments.reduce(
        (acc, segment) => ({
            total: acc.total + segment[1],
            filteredSum: acc.filteredSum + (segment[0] <= 25 ? segment[1] : 0),
        }),
        { total: 0, filteredSum: 0 }
    );

    return {
        segments: segments,
        totalDocuments: result.filteredSum,
        remainingSum: result.total - result.filteredSum,
        percentageOfTotal: (result.filteredSum * 100) / result.total,
        remainingPercentage:
            ((result.total - result.filteredSum) * 100) / result.total,
        total: result.total
    };
};


export function processTokenFrequencies(sentTokens, uniqueTokens) {
    if (!sentTokens || !uniqueTokens) {
        return null;
    }

    const uniqueTokensMap = new Map(uniqueTokens.map(([token, freq]) => [token, freq]));

    return sentTokens.map(([token, freq]) => {
        const uniqueFreq = uniqueTokensMap.get(token) || 0;
        return {
            token,
            freq,
            freqUnique: uniqueFreq,
            duplicates: freq - uniqueFreq,
            freqFormatted: 0,
            duplicatesFormatted: 0,
        };
    });
}