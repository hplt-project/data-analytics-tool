import styles from "../styles/Report.module.css";
import NGramsTable from "./NGramsTable";
import InfoTooltip from "./InfoTooltip";

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
                            {!footNote && (
                                <InfoTooltip>
                                    <div className={styles.tooltipStack}>
                                    <span>
                                        Tokenized with{" "}
                                        <a
                                            href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                                            target="_blank"
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
                                            href="https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt"
                                            target="_blank"
                                        >
                                            https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt
                                        </a>
                                    </span>
                                    </div>
                                </InfoTooltip>
                            )}
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
