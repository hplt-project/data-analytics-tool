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

    const result = segments.reduce(
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
    };
};