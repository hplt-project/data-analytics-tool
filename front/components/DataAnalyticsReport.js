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
import LangDocs from "./langDocs";
import axios from "axios";
import { useRouter } from "next/router";
import { Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

import OverviewTable from "./OverviewTable";
import CollectionsGraph from "./collectionsGraphs";

import styles from "./../src/styles/DataAnalyticsReport.module.css";
import buttonStyles from "@/styles/Uploader.module.css";

export default function DataAnalyticsReport({ reportData, date }) {
  if (!reportData) return;

  const router = useRouter();

  const handleDownload = async () => {
    const filename = router.query.file;

    try {
      const response = await axios.get(`/api/download/${filename}`);

      if (response.status !== 200) {
        console.error(response.status, response.statusText);
      }
      const blob = response.data;
      const test = new File([blob], `${filename}.yaml`);
      const url = window.URL.createObjectURL(test);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}`;
      link.click();
    } catch (error) {
      console.log(error, "andale wey");
    }
  };

  const srclang = reportData.srclang
    ? languagePairName([reportData.srclang])
    : "";

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
          return { label: v[0], value: parseFloat(v[1]), perc: `${v[1]} %` };
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

  const totalDocs = reportData.docs_segments
    ? JSON.parse(reportData.docs_segments)
        .slice(0, 25)
        .reduce((a, b) => a + b[1], 0)
    : "";
  const docsSegmentsTotal = reportData.docs_segments
    ? JSON.parse(reportData.docs_segments).reduce((a, b) => a + b[1], 0)
    : "";

  const rest =
    reportData.docs_segments && JSON.parse(reportData.docs_segments).length > 25
      ? JSON.parse(reportData.docs_segments)
          .slice(25, JSON.parse(reportData.docs_segments).length - 1)
          .reduce((a, b) => a + b[1], 0)
      : "";

  const docsSegmentsPercOfTotal = (totalDocs * 100) / docsSegmentsTotal;

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
        return { token: s[0], freq: s[1], fill: randDarkColor() };
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
          perc: reportData.docs_total
            ? (doc[1] * 100) / reportData.docs_total
            : "",
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
          perc: reportData.docs_total
            ? (doc[1] * 100) / reportData.docs_total
            : "",
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
      <div className="custom-chart">
        <div className={styles.langDocsContainer}>
          {docsSegmentsTop && (
            <div className={styles.docsCollectionsGraph}>
              <div className={styles.title}>
                <h3>Documents size (in segments) </h3>
                <a className="my-anchor-element">
                  <Info
                    className={styles.helpCircle}
                    strokeWidth={1.4}
                    color="#2C2E35"
                  />
                </a>
                <Tooltip anchorSelect=".my-anchor-element" place="top">
                  Hello world!
                </Tooltip>
              </div>
              <ReportScores
                scores={docsSegmentsTop}
                xLabel={"Segments"}
                yLabel={"Documents"}
                graph={"docsCollections"}
                partOfTotal={docsSegmentsPercOfTotal}
                rest={rest}
              />
            </div>
          )}
          {docsCollections && (
            <div className={styles.collectionsGraphPie}>
              <h3>Documents by collection</h3>
              <CollectionsGraph collection={docsCollections} />
            </div>
          )}
        </div>
      </div>
      {!reportData.trglang && (
        <div className="custom-chart">
          <div className={styles.languagesPieReportsContainer}>
            <h3>Language Distribution</h3>
            <div className={styles.languagesPieReports}>
              {srcLangs && (
                <div className={styles.singleLanguageReport}>
                  {!reportData.trglang ? (
                    <h3>Number of segments</h3>
                  ) : (
                    <h3>Source</h3>
                  )}
                  <LanguagePieChart langs={srcLangs} id="image" />
                </div>
              )}
              {langDocs && (
                <div className={styles.singleLanguageReport}>
                  {" "}
                  <h3>
                    Percentage of segments in {srclang[0].label} inside
                    documents
                  </h3>
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
      )}
      {monocleanerScores && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>Distribution of segments by fluency score</h3>
            <ReportScores
              scores={monocleanerScores}
              xLabel={"Score"}
              yLabel={"Segments"}
              graph={"another"}
            />
          </div>
        </div>
      )}
      {docsAvgLM && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>
              {!reportData.trglang && docsAvgLM
                ? "Distribution of documents by average fluency score"
                : ""}
            </h3>
            <ReportScores
              scores={docsAvgLM}
              xLabel={"Segments"}
              yLabel={"Documents"}
              graph={"another"}
            />
          </div>
        </div>
      )}
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

      {reportData.trglang && (
        <div className="custom-chart">
          <div className={styles.languagesPieReportsContainer}>
            <h3>Language Distribution</h3>
            <div className={styles.languagesPieReports}>
              {srcLangs && (
                <div className={styles.singleLanguageReport}>
                  {!reportData.trglang ? (
                    <h3>Number of segments</h3>
                  ) : (
                    <h3>Source</h3>
                  )}
                  <LanguagePieChart langs={srcLangs} id="image" />
                </div>
              )}
              {langDocs && (
                <div className={styles.singleLanguageReport}>
                  {" "}
                  <h3>Percentage of segments in $lang inside documents</h3>
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
      )}
      <div className={styles.languageDistributionContainer}>
        {srcSentTokens && (
          <div className={styles.singleDistribution}>
            <h3>
              {!reportData.trglang
                ? "Segment length distribution"
                : "Source segment length distribution"}
            </h3>
            <SegmentDistribution data={srcSentTokens} which={"Source"} />
          </div>
        )}

        {reportData.trglang && trgSentTokens && (
          <div className={styles.singleDistribution}>
            <h3>Target segment length distribution</h3>
            <SegmentDistribution data={trgSentTokens} which={"Target"} />
          </div>
        )}
      </div>
      {noiseDistribution && (
        <div className="custom-chart">
          <h3>Segment noise Distribution</h3>
          <NoiseDistributionGraph noiseData={noiseDistribution} />
        </div>
      )}
      <div className="custom-chart">
        <div className={styles.nGramContainer}>
          {Object.entries(srcNGrams).length && (
            <div className={styles.singleNGramContainer}>
              {reportData.trglang ? (
                <h3>Source n-grams</h3>
              ) : (
                <h3>Frequent n-grams</h3>
              )}
              <NGramsTable NGrams={srcNGrams} />
            </div>
          )}

          {reportData.trglang && Object.entries(trgNGrams).length && (
            <div className={styles.singleNGramContainer}>
              <h3>Target n-grams</h3>
              <NGramsTable NGrams={trgNGrams} />
            </div>
          )}
        </div>
        <div className={styles.blank}></div>
      </div>
      <div className={styles.reportButtons}>
        <button
          className={buttonStyles["button-27"]}
          onClick={() => handleDownload(reportData.corpus)}
          type="button"
        >
          Download yaml
        </button>
        <button
          className={buttonStyles["button-26"]}
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
