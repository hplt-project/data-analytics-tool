import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { languagePairName } from "../hooks/hooks";
import styles from "./../src/styles/DataAnalyticsReport.module.css";
import ReportScores from "./ReportScores";
import LanguagePieChart from "./LanguagePieChart";
import { randDarkColor } from "../hooks/hooks";
import NGramsTable from "./NGramsTable";
import SegmentDistribution from "./SegmentDistribution";
import Image from "next/image";
import { useTheme } from "next-themes";
import { exportMultipleChartsToPdf } from "./utils";
import NoiseDistributionGraph from "./NoiseDistributionGraph";
import { Oval } from "react-loader-spinner";

export default function DataAnalyticsReport({ reportData, reportName }) {
  const [colorTheme, setColorTheme] = useState();

  const [loadingPdf, setLoadingPdf] = useState(false);

  const theme = useTheme();
  useEffect(() => {
    setColorTheme(theme.resolvedTheme);
  }, [theme]);

  const router = useRouter();

  const corpusName = router.query.corpusName;
  const languagePair = router.query.id;

  const scores = !reportData
    ? ""
    : JSON.parse(reportData.bicleaner_scores).map((s) => {
        return { token: s[0], freq: s[1], fill: "#8864FC" };
      });

  const srcSentTokens = !reportData
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

  const srcUniqueTokens = !reportData
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

  const trgSentTokens = !reportData
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

  const trgUniqueTokens = !reportData
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

  const srcLangs = !reportData
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

  const trgLangs = !reportData
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

  const srcNGrams = !reportData ? "" : JSON.parse(reportData.src_ngrams);
  const trgNGrams = !reportData ? "" : JSON.parse(reportData.trg_ngrams);

  const languageNames = languagePair
    ? languagePairName(languagePair.split("&"))
    : "";

  const noiseDistribution =
    reportData && reportData.hardrules_tags
      ? Object.entries(JSON.parse(reportData.hardrules_tags)).map((v) => {
          return { label: v[0], value: v[1] };
        })
      : "";

  if (!reportData) return;

  const offLoading = () => {
    setLoadingPdf(false);
  };

  return (
    <div className={styles.dataReportContainer}>
      <div className="custom-chart">
        <div className={styles.reportMainStats}>
          <div className={styles.typeTokens}>
            <h3>Type-Token Ratio</h3>
            <div className={styles.typeContainer}>
              <p className={styles.sourceType}>
                Source tokens:
                <span
                  className={
                    +reportData.ttr_src < 0.3
                      ? styles.lowestType
                      : +reportData.ttr_src < 0.5
                      ? styles.lowestType
                      : styles.goodType
                  }
                >
                  {reportData.ttr_src}
                </span>
              </p>
              <p className={styles.sourceType}>
                Target tokens:
                <span
                  className={
                    +reportData.ttr_trg < 0.3
                      ? styles.lowestType
                      : +reportData.ttr_trg < 0.5
                      ? styles.lowestType
                      : styles.goodType
                  }
                >
                  {" "}
                  {reportData.ttr_trg}{" "}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="custom-chart">
        <div className={styles.bicleanerScores}>
          <h2>Bicleaner scores</h2>
          <ReportScores
            scores={scores}
            xLabel={"Score range"}
            yLabel={"Frequency"}
          />
        </div>
      </div>
      <div className="custom-chart">
        <div className={styles.languagesPieReportsContainer}>
          <h2>Language Distribution</h2>
          <div className={styles.languagesPieReports}>
            <div className={styles.singleLanguageReport}>
              <h3>Source</h3>
              <LanguagePieChart langs={srcLangs} id="image" />
            </div>
            <div className={styles.singleLanguageReport}>
              <h3>Target</h3>
              <LanguagePieChart langs={trgLangs} id="image" />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.languageDistributionContainer}>
        <h2 className={styles.marginTop}></h2>
        <div className={styles.singleDistribution}>
          <SegmentDistribution data={srcSentTokens} which={"Source"} />
        </div>

        <div className={styles.singleDistribution}>
          <SegmentDistribution data={trgSentTokens} which={"Target"} />
        </div>
      </div>
      {noiseDistribution && (
        <div className="custom-chart">
          <h2>Noise Distribution</h2>
          <NoiseDistributionGraph noiseData={noiseDistribution} />
        </div>
      )}
      <div className="custom-chart">
        <div className={styles.nGramContainer}>
          <h2 className={styles.marginTop}>Common n-grams</h2>
          <div className={styles.singleNGramContainer}>
            <h3>Source</h3>
            <NGramsTable NGrams={srcNGrams} />
          </div>
          <div className={styles.singleNGramContainer}>
            <h3>Target</h3>
            <NGramsTable NGrams={trgNGrams} />
          </div>
        </div>
        <div className={styles.blank}></div>
      </div>
      <button
        className={styles.exportToPDFButton}
        onClick={() => {
          setLoadingPdf(true);
          exportMultipleChartsToPdf("report", offLoading);
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
  );
}
