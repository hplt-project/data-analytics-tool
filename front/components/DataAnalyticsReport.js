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

import styles from "./../src/styles/DataAnalyticsReport.module.css";

export default function DataAnalyticsReport({ reportData, date }) {
  const [loadingPdf, setLoadingPdf] = useState(false);

  if (!reportData) return;

  const scores = JSON.parse(
    !reportData.trglang
      ? reportData.monocleaner_scores
      : reportData.bicleaner_scores
  ).map((s) => {
    return { token: +s[0], freq: +s[1], fill: "#8864FC" };
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

  const trgUniqueTokens = reportData.trglang
    ? ""
    : JSON.parse(reportData.src_unique_sents).map((s) => {
        return {
          token: +s[0],
          freq: +s[1],
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

  const trgLangs = !reportData.trglang
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
  const srcNGrams =
    !reportData && Object.keys(JSON.parse(reportData.src_ngrams)).length
      ? ""
      : JSON.parse(reportData.src_ngrams);
  const trgNGrams =
    !reportData && Object.keys(JSON.parse(reportData.trg_ngrams)).length
      ? ""
      : JSON.parse(reportData.trg_ngrams);

  /// language names

  const srclang = reportData.srclang
    ? languagePairName([reportData.srclang])
    : "";

  const trglang = reportData.trglang
    ? languagePairName([reportData.trglang])
    : "";

  // noise distribution

  const noiseDistribution =
    reportData && reportData.hardrules_tags
      ? Object.entries(JSON.parse(reportData.hardrules_tags)).map((v) => {
          return { label: v[0], value: v[1] };
        })
      : "";

  const offLoading = () => {
    setLoadingPdf(false);
  };

  // DATE

  // let d;

  // if ("timestamp" in reportData) {
  //   const timestamp_ms = reportData["timestamp"];
  //   const timestamp_secs = timestamp_ms * 1000;
  //   d = new Date(timestamp_secs).toLocaleString();
  // } else {
  //   d = "n/a;";
  // }

  return (
    <div className={styles.dataReportContainer}>
      <div className="custom-chart">
        <div className={styles.reportMainStats}>
          <div className={styles.corpusDetails}>
            <h1 className={styles.analyticsTitle}>HPLT Analytics report</h1>
          </div>
          <div className={styles.generalOverview}>
            <h3>General overview</h3>
            <table>
              <thead>
                <tr>
                  <th>Corpus</th>
                  <th>Analytics date</th>
                  {trglang ? (
                    <>
                      {" "}
                      <th>Source language</th>
                      <th>Target language</th>{" "}
                    </>
                  ) : (
                    <th>Language</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{reportData.corpus}</td>
                  <td>{date && date}</td>
                  <td>{srclang[0].label}</td>
                  {trglang && <td>{trglang[0].label}</td>}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.volumes}>
            <h3>Volumes</h3>
            <table>
              <thead>
                <tr>
                  <th>Segment pairs</th>
                  <th>Src size</th>
                  {trglang && <th>Trg size</th>}
                  <th>Unique segment pairs</th>
                  <th>Src tokens</th>
                  {trglang && <th>Trg tokens</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{reportData.sentence_pairs}</td>
                  <td>{reportData.src_bytes}</td>
                  {trglang && <td>{reportData.trg_bytes}</td>}
                  <td>{reportData.src_unique_sents.length}</td>
                  <td>{reportData.src_tokens}</td>
                  {trglang && <td>{reportData.trg_tokens}</td>}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.typeTokens}>
            <h3>Type-Token Ratio</h3>
            <table>
              <thead>
                <tr>
                  {!trglang && <th>{srclang[0].label}</th>}
                  {trglang && (
                    <>
                      <th>Source</th>
                      <th>Target</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {" "}
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
                  </td>
                  {trglang && (
                    <td>
                      {" "}
                      <span
                        className={
                          +reportData.ttr_src < 0.3
                            ? styles.lowestType
                            : +reportData.ttr_src < 0.5
                            ? styles.lowestType
                            : styles.goodType
                        }
                      >
                        {reportData.ttr_trg}
                      </span>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="custom-chart">
        <div className={styles.bicleanerScores}>
          <h3>
            {!reportData.trglang ? "Monocleaner scores" : "Bicleaner scores"}
          </h3>
          <ReportScores
            scores={scores}
            xLabel={"Score range"}
            yLabel={"Frequency"}
          />
        </div>
      </div>
      <div className="custom-chart">
        <div className={styles.languagesPieReportsContainer}>
          <h3>Language Distribution</h3>
          <div className={styles.languagesPieReports}>
            {srcLangs && (
              <div className={styles.singleLanguageReport}>
                {reportData.trglang && <h3>Source</h3>}
                <LanguagePieChart langs={srcLangs} id="image" />
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
        <a
          className={styles.downloadButton}
          href={`http://dat-webapp:5000/download/${reportData.corpus}.yaml`}
          target="_blank"
        >
          Download yaml
        </a>
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
