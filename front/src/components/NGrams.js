import styles from "../styles/Report.module.css";
import NGramsTable from "./NGramsTable";
import { Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

function NGrams({ which, ngrams, trg, footNote }) {
    return (
        <div>
            <div className="custom-chart">
                <div className={styles.nGramContainer}>
                    <div className={styles.singleNGramContainer}>
                        <div className={styles.containsTooltip}>
                            {trg ? (
                                <h3>{which} n-grams</h3>
                            ) : (
                                <h3>Frequent n-grams</h3>
                            )}
                            <a className="ngrams-info">
                                {!footNote && (
                                    <Info
                                        className={[styles.helpCircle, styles.desktopData].join(
                                            " "
                                        )}
                                        strokeWidth={2}
                                        color="#022831"
                                        width={18}
                                    />
                                )}
                            </a>
                            <Tooltip anchorSelect=".ngrams-info" place="top" clickable>
                                <div style={{ display: "flex", flexDirection: "column", fontSize: "14px", lineHeight: "1.6" }}>
                                    <span>
                                        Tokenized with{" "}
                                        <a
                                            href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                                            target="_blank"
                                            className={styles.tooltipLink}
                                        >
                                            https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                                        </a>
                                        ,
                                    </span>
                                    <span>
                                        after removing n-grams starting or ending in a stopword.
                                        Stopwords from
                                    </span>
                                    <span>
                                        <a
                                            className={styles.tooltipLink}
                                            href="https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt"
                                            target="_blank"
                                        >
                                            https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt
                                        </a>
                                    </span>
                                </div>
                            </Tooltip>
                        </div>
                        <NGramsTable NGrams={ngrams} />
                    </div>

                    <div className={styles.blank}></div>
                </div>
            </div>
        </div>
    )
}

export default NGrams
