
import NewRegisterLabels from "./NewRegisterLabels";
import NoiseDistribution from "./NewNoiseDistribution";
import { Info } from "lucide-react";
import { Tooltip } from "recharts";
import styles from "@/styles/DataAnalyticsReport.module.css";
export default function Report({ reportData, date, testReport }) {

    const sentences = testReport.sentence_pairs
        ? parseFloat(testReport.sentence_pairs)
        : "";

    const noiseDistribution =
        testReport.hardrules_tags
            ? Object.entries(testReport.hardrules_tags)
                .filter((el) => (!testReport.trglang ? el[0] !== "length_ratio" : el))
                .map((v) => {
                    return {
                        label: v[0],
                        value: +parseFloat((v[1] * 100) / sentences).toFixed(2),
                        perc: `${((v[1] * 100) / sentences).toFixed(2)} %`,
                    };
                })
            : "";


    const footNote = false;

    return <>
        {testReport.hardrules_tags && noiseDistribution && (
            <div className="custom-chart">
                <div
                    className={[styles.containsTooltip, styles.noiseTitleCont].join(
                        " "
                    )}
                >
                    <h3 className={styles.noiseDistributionTitle}>
                        Segment {reportData.trglang && "pair"} noise distribution
                    </h3>
                    <a className="noise-info">
                        {!footNote && (
                            <Info
                                className={[styles.helpCircle, styles.desktopData].join(" ")}
                                strokeWidth={2}
                                color="#022831"
                                width={18}
                            />
                        )}
                    </a>
                    <Tooltip anchorSelect=".noise-info" place="top">
                        Obtained with Bicleaner Hardrules (
                        <a
                            className={styles.tooltipLink}
                            href="https://github.com/bitextor/bicleaner-hardrules/"
                            target="_blank"
                        >
                            https://github.com/bitextor/bicleaner-hardrules/
                        </a>
                        )
                    </Tooltip>
                </div>
                <NoiseDistribution noiseData={noiseDistribution} />
            </div>
        )}
        {testReport["register_labels"] && <NewRegisterLabels labels={testReport["register_labels"]} />}</>

}