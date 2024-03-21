import { useState } from "react";
import { languagePairName } from "../hooks/hooks";
import ReportScores from "./ReportScores";
import LanguagePieChart from "./LanguagePieChart";
import { randDarkColor } from "../hooks/hooks";
import NGramsTable from "./NGramsTable";
import SegmentDistribution from "./SegmentDistribution";
import { exportMultipleChartsToPdf } from "./utils";
import NoiseDistributionGraph from "./NoiseDistributionGraph";
import { Oval } from "react-loader-spinner";
import { handleDownload } from "../hooks/hooks";
import LangDocs from "./langDocs";

import styles from "./../src/styles/DataAnalyticsReport.module.css";
import OverviewTable from "./OverviewTable";

export default function DataAnalyticsReport({ reportData, date }) {
  if (!reportData) return;

  const [loadingPdf, setLoadingPdf] = useState(false);

  const monocleanerScores = reportData.monocleaner_scores
    ? JSON.parse(reportData.monocleaner_scores).map((s) => {
        return { token: +s[0], freq: +s[1], fill: "#8864FC" };
      })
    : "";

  const bicleanerScores = reportData.bicleaner_scores
    ? JSON.parse(reportData.bicleaner_scores).map((s) => {
        return { token: +s[0], freq: +s[1], fill: "#8864FC" };
      })
    : "";

  const srcSentTokens = !reportData.src_sent_tokens
    ? ""
    : JSON.parse(reportData.src_sent_tokens).map((s) => {
        return {
          token: s[0],
          freq: s[1],
          freqUnique: 0,
          duplicates: 0,
          freqFormatted: 0,
          duplicatesFormatted: 0,
        };
      });

  const srcUniqueTokens = !reportData.src_unique_sents
    ? ""
    : JSON.parse(reportData.src_unique_sents).map((s) => {
        return {
          token: s[0],
          freq: s[1],
          freqUnique: 0,
          duplicates: 0,
          freqFormatted: 0,
          duplicatesFormatted: 0,
        };
      });

  if (srcSentTokens && srcUniqueTokens) {
    srcSentTokens.forEach((item) => {
      srcUniqueTokens.forEach((i) => {
        if (item.token == i.token) {
          item.freqUnique += i.freq;
          item.duplicates += Math.abs(i.freq - item.freq);
        }
      });
    });
  }

  const trgSentTokens = !reportData.trglang
    ? ""
    : JSON.parse(reportData.trg_sent_tokens).map((s) => {
        return {
          token: s[0],
          freq: s[1],
          freqUnique: 0,
          duplicates: 0,
          freqFormatted: 0,
          duplicatesFormatted: 0,
        };
      });

  const trgUniqueTokens = !reportData.trglang
    ? ""
    : JSON.parse(reportData.trg_unique_sents).map((s) => {
        return {
          token: s[0],
          freq: s[1],
          freqUnique: 0,
          duplicates: 0,
          freqFormatted: 0,
          duplicatesFormatted: 0,
        };
      });

  if (trgSentTokens && trgUniqueTokens) {
    trgSentTokens.forEach((item) => {
      trgUniqueTokens.forEach((i) => {
        if (item.token == i.token) {
          item.freqUnique += i.freq;
          item.duplicates += Math.abs(i.freq - item.freq);
        }
      });
    });
  }

  const srcLangs = !reportData.src_langs
    ? ""
    : JSON.parse(reportData.src_langs).map((s) => {
        const readableLanguageName = languagePairName([s[0]]);

        return {
          name: `${readableLanguageName[0].label} - ${Intl.NumberFormat("en", {
            notation: "compact",
          }).format(s[1])}`,
          perc: s[1],
          fill: randDarkColor(),
        };
      });

  const trgLangs = !reportData.trg_langs
    ? ""
    : JSON.parse(reportData.trg_langs).map((s) => {
        const readableLanguageName = languagePairName([s[0]]);
        return {
          name: `${readableLanguageName[0].label} - ${Intl.NumberFormat("en", {
            notation: "compact",
          }).format(s[1])}`,
          perc: s[1],
          fill: randDarkColor(),
        };
      });

  // NGRAMS
  const srcNGrams = !reportData.src_ngrams
    ? ""
    : JSON.parse(reportData.src_ngrams);

  const trgNGrams = !reportData.trg_ngrams
    ? ""
    : JSON.parse(reportData.trg_ngrams);

  // noise distribution

  const noiseDistribution =
    reportData && reportData.hardrules_tags
      ? Object.entries(JSON.parse(reportData.hardrules_tags)).map((v) => {
          return { label: v[0], value: v[1], perc: `${v[1]} %` };
        })
      : "";

  const offLoading = () => {
    setLoadingPdf(false);
  };

  const langDocs = reportData.docs_langs
    ? JSON.parse(reportData.docs_langs).map((doc) => {
        return {
          perc: doc[0] * 100,
          freq: doc[1],
          freqFormatted: Intl.NumberFormat("en", {
            notation: "compact",
          }).format(doc[1]),
        };
      })
    : "";

  const docsSegments = reportData.docs_segments
    ? JSON.parse(reportData.docs_segments).slice(0, 25)
    : "";

  let docsSegmentsTop = docsSegments
    ? docsSegments.map((doc) => {
        return {
          token: doc[0],
          freq: doc[1],
          fill: "#38686a",
        };
      })
    : "";

  const docsAvgLM = reportData.docs_avg_lm
    ? JSON.parse(reportData.docs_avg_lm).map((doc) => {
        return {
          token: doc[0],
          freq: doc[1],
        };
      })
    : "";

  const docsCollections = reportData.docs_collections
    ? JSON.parse(reportData.docs_collections).map((s) => {
        return { token: s[0], freq: s[1], fill: "#8879FC" };
      })
    : "";

  const docsDomains = reportData.docs_top100_domains
    ? JSON.parse(reportData.docs_top100_domains).slice(0, 10)
    : "";

  let docsTopTenDomains = docsDomains
    ? docsDomains.map((doc) => {
        return {
          token: doc[0],
          freq: Intl.NumberFormat("en", {
            notation: "compact",
          }).format(doc[1]),
          fill: "#f5ac72",
        };
      })
    : "";

  const docsTLDs = reportData.docs_top100_tld
    ? JSON.parse(reportData.docs_top100_tld).slice(0, 10)
    : "";

  let docsTopTenTLDs = docsTLDs
    ? docsTLDs.map((doc) => {
        return {
          token: doc[0],
          freq: Intl.NumberFormat("en", {
            notation: "compact",
          }).format(doc[1]),
          fill: "#6a381f",
        };
      })
    : "";

  return (
    <div className={styles.dataReportContainer}>
      <div className="custom-chart">
        <OverviewTable
          reportData={reportData}
          date={date}
          docsTopTenDomains={docsTopTenDomains}
          docsTopTenTLDs={docsTopTenTLDs}
        />
      </div>
      {bicleanerScores && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>Bicleaner scores </h3>
            <ReportScores
              scores={bicleanerScores}
              xLabel={"Score range"}
              yLabel={"Frequency"}
              graph={"another"}
            />
          </div>
        </div>
      )}
      {monocleanerScores && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>Monocleaner scores</h3>
            <ReportScores
              scores={monocleanerScores}
              xLabel={"Score range"}
              yLabel={"Frequency"}
              graph={"another"}
            />
          </div>
        </div>
      )}
      {docsAvgLM && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>
              {!reportData.trglang && docsAvgLM ? "Documents Average LM" : ""}
            </h3>
            <ReportScores
              scores={docsAvgLM}
              xLabel={"Score range"}
              yLabel={"Frequency"}
              graph={"another"}
            />
          </div>
        </div>
      )}
      {docsSegmentsTop && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>Docs segments</h3>
            <ReportScores
              scores={docsSegmentsTop}
              xLabel={"Score range"}
              yLabel={"Frequency"}
              graph={"docsCollections"}
            />
          </div>
        </div>
      )}
      {docsCollections && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>Docs collections</h3>
            <ReportScores
              scores={docsCollections}
              xLabel={"Score range"}
              yLabel={"Frequency"}
              graph={"docsCollections"}
            />
          </div>
        </div>
      )}
      <div className="custom-chart">
        <div className={styles.languagesPieReportsContainer}>
          <h3>Language Distribution</h3>
          <div className={styles.languagesPieReports}>
            {srcLangs && (
              <div className={styles.singleLanguageReport}>
                {reportData.srclang && <h3>Source</h3>}
                <LanguagePieChart langs={srcLangs} id="image" />
              </div>
            )}
            {langDocs && (
              <div className={styles.singleLanguageReport}>
                {" "}
                <h3>Language Documents</h3>
                <LangDocs langDocs={langDocs} />
              </div>
            )}
            {trgLangs && (
              <div className={styles.singleLanguageReport}>
                <h3>Target</h3>
                <LanguagePieChart langs={trgLangs} id="image" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.languageDistributionContainer}>
        {srcSentTokens && (
          <div className={styles.singleDistribution}>
            <SegmentDistribution data={srcSentTokens} which={"Source"} />
          </div>
        )}

        {reportData.trglang && trgSentTokens && (
          <div className={styles.singleDistribution}>
            <SegmentDistribution data={trgSentTokens} which={"Target"} />
          </div>
        )}
      </div>
      {noiseDistribution && (
        <div className="custom-chart">
          <h3>Noise Distribution</h3>
          <NoiseDistributionGraph noiseData={noiseDistribution} />
        </div>
      )}
      <div className="custom-chart">
        <div className={styles.nGramContainer}>
          <h3 className={styles.marginTop}>Common n-grams</h3>
          {srcNGrams && (
            <div className={styles.singleNGramContainer}>
              {reportData.trglang && <h3>Source</h3>}
              <NGramsTable NGrams={srcNGrams} />
            </div>
          )}

          {reportData.trglang && trgNGrams && (
            <div className={styles.singleNGramContainer}>
              <h3>Target</h3>
              <NGramsTable NGrams={trgNGrams} />
            </div>
          )}
        </div>
        <div className={styles.blank}></div>
      </div>
      <div className={styles.reportButtons}>
        <button
          className={styles.downloadButton}
          onClick={handleDownload}
          type="button"
        >
          Download yaml
        </button>
        <button
          className={styles.exportToPDFButton}
          onClick={() => {
            setLoadingPdf(true);
            exportMultipleChartsToPdf(reportData.corpus, offLoading);
          }}
        >
          {!loadingPdf && <p> Export to PDF</p>}
          {loadingPdf && (
            <>
              <p className={styles.ovalP}>Preparing PDF</p>
              <Oval
                visible={true}
                height="16"
                width="16"
                color="#ffffff"
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass="wrapper"
                secondaryColor="white"
                strokeWidth={4}
                strokeWidthSecondary={4}
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
