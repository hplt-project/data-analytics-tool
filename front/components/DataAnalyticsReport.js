import { useEffect, useState } from "react";
import ReportScores from "./ReportScores";
import LanguagePieChart from "./LanguagePieChart";
import {
  randDarkColor,
  numberFormatter,
  languagePairName,
} from "../hooks/hooks";
import NGramsTable from "./NGramsTable";
import SegmentDistribution from "./SegmentDistribution";
import { exportMultipleChartsToPdf } from "./utils";
import NoiseDistributionGraph from "./NoiseDistributionGraph";
import { Oval } from "react-loader-spinner";
import LangDocs from "./langDocs";
import axios from "axios";
import { useRouter } from "next/router";
import { ArrowLeft, ArrowRight, Info, X } from "lucide-react";
import { Tooltip } from "react-tooltip";
import Image from "next/image";
import Logo from "../public/logos/logo.png";
import CollectionsGraph from "./collectionsGraphs";
import DocumentSizes from "./DocumentSizes";
import buttonStyles from "@/styles/Uploader.module.css";
import Footnotes from "./Footnotes";
const punycode = require("punycode/");
import { SAMPLE_DATA } from "@/assets/samples/output";

import styles from "./../src/styles/DataAnalyticsReport.module.css";

export default function DataAnalyticsReport({ reportData, date }) {
  if (!reportData) return;

  const router = useRouter();

  const dName = router.query.file;

  const filename = router.query.file
    .replace("HPLT-v2-", "")
    .replace(".yaml", "")
    .replace(".lite", "");

  const sampleData = SAMPLE_DATA;

  const sample = Object.entries(sampleData).find((key) => key[0] === filename);

  const [footNote, setFootNote] = useState(false);

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
      console.log(error, "Something went wrong with the download.");
    }
  };

  const [loadingPdf, setLoadingPdf] = useState(false);

  const sentences = reportData.sentence_pairs
    ? reportData.sentence_pairs.toLocaleString("en-US")
    : "";

  const sentenceCount = reportData.sentence_pairs
    ? parseFloat(reportData.sentence_pairs)
    : "";

  const srcLangIDWarning =
    reportData.warnings?.includes("src_fasttext") ?? true;

  const trgLangIDWarning =
    reportData.warnings?.includes("trg_fasttext") ?? true;

  const totalBicleanerScores = reportData.bicleaner_scores
    ? JSON.parse(reportData.bicleaner_scores).reduce(
        (a, b) => a + parseFloat(b[1]),
        0
      )
    : "";

  const bicleanerScores = reportData.bicleaner_scores
    ? JSON.parse(reportData.bicleaner_scores).map((s) => {
        return {
          token: +s[0],
          freq: +s[1],
          perc: parseFloat((+s[1] * 100) / totalBicleanerScores).toFixed(2),
          fill: "#8864FC",
        };
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

  const srcLangsTotal = !reportData.src_langs
    ? ""
    : JSON.parse(reportData.src_langs).reduce(
        (a, b) => a + parseFloat(b[1]),
        0
      );

  const srcLangs = !reportData.src_langs
    ? ""
    : JSON.parse(reportData.src_langs).map((s) => {
        const readableLanguageName = languagePairName([s[0]]);

        return {
          name: `${readableLanguageName[0].label} - ${numberFormatter(s[1])}`,
          freq: s[1],
          perc: parseFloat((s[1] * 100) / srcLangsTotal).toFixed(2),
          fill: randDarkColor(),
        };
      });

  const trgLangsTotal = !reportData.trg_langs
    ? ""
    : JSON.parse(reportData.trg_langs).reduce(
        (a, b) => a + parseFloat(b[1]),
        0
      );

  const trgLangs = !reportData.trg_langs
    ? ""
    : JSON.parse(reportData.trg_langs).map((s) => {
        const readableLanguageName = languagePairName([s[0]]);
        return {
          name: `${readableLanguageName[0].label} - ${numberFormatter(s[1])}`,
          freq: s[1],
          perc: parseFloat((s[1] * 100) / trgLangsTotal).toFixed(2),
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
      ? Object.entries(JSON.parse(reportData.hardrules_tags))
          .filter((el) => (!reportData.trglang ? el[0] !== "length_ratio" : el))
          .map((v) => {
            return {
              label:
                v[0] === "not_too_long"
                  ? "Too long"
                  : v[0] === "not_too_short"
                  ? "Too short"
                  : v[0] === "no_urls"
                  ? "URLs"
                  : v[0] === "no_bad_encoding"
                  ? "Bad encoding"
                  : v[0] === "length_ratio"
                  ? "Length ratio"
                  : v[0] === "pii"
                  ? "Contains PII"
                  : v[0] === "no_porn"
                  ? "No porn"
                  : "",
              value: +parseFloat((v[1] * 100) / sentenceCount).toFixed(2),
              perc: `${((v[1] * 100) / sentenceCount).toFixed(2)} %`,
            };
          })
      : "";

  const offLoading = () => {
    setFootNote(false);
    setLoadingPdf(false);
  };

  const langDocs = reportData.docs_langs
    ? JSON.parse(reportData.docs_langs).map((doc) => {
        return {
          perc: doc[0] * 100,
          freq: doc[1],
          freqFormatted: numberFormatter(doc[1]),
        };
      })
    : "";

  const totalDocs = reportData.docs_segments
    ? JSON.parse(reportData.docs_segments)
        .filter((doc) => doc[0] <= 25)
        .reduce((a, b) => a + b[1], 0)
    : "";
  const docsSegmentsTotal = reportData.docs_segments
    ? JSON.parse(reportData.docs_segments).reduce((a, b) => a + b[1], 0)
    : "";

  const rest =
    reportData.docs_segments &&
    JSON.parse(reportData.docs_segments).filter((doc) => doc[0] <= 25)
      ? JSON.parse(reportData.docs_segments)
          .filter((doc) => doc[0] > 25)
          .reduce((a, b) => a + b[1], 0)
      : "";

  const docsSegmentsPercOfTotal = (totalDocs * 100) / docsSegmentsTotal;

  const restPerc = ((docsSegmentsTotal - totalDocs) * 100) / docsSegmentsTotal;

  const documentScoreTotal = reportData.docs_wds
    ? JSON.parse(reportData.docs_wds).reduce((a, b) => a + +b[1], 0)
    : "";

  const documentScore = reportData.docs_wds
    ? JSON.parse(reportData.docs_wds).map((s) => {
        return {
          token: +s[0],
          freq: +s[1],
          perc: parseFloat((+s[1] * 100) / documentScoreTotal).toFixed(2),
          fill: "#E9C46A",
        };
      })
    : "";

  const docsScoreLessThanFive = reportData.docs_wds
    ? JSON.parse(reportData.docs_wds)
        .filter((el) => parseFloat(el[0]) < 5)
        .reduce((a, b) => a + +b[1], 0)
    : "";

  const docsScoreOverFive = reportData.docs_wds
    ? JSON.parse(reportData.docs_wds)
        .filter((el) => parseFloat(el[0]) >= 5)
        .reduce((a, b) => a + +b[1], 0)
    : "";

  const totalDocsScore = reportData.docs_wds
    ? JSON.parse(reportData.docs_wds).reduce((a, b) => a + +b[1], 0)
    : "";

  const docsScoresPercUnderFive = docsScoreLessThanFive
    ? (docsScoreLessThanFive * 100) / totalDocsScore
    : 0;

  const docsScoresPercOverFive = docsScoreOverFive
    ? (docsScoreOverFive * 100) / totalDocsScore
    : 0;

  let docsSegmentsTop = reportData.docs_segments
    ? JSON.parse(reportData.docs_segments)
        .filter((doc) => doc[0] <= 25)
        .map((doc) => {
          return {
            token: doc[0],
            freq: doc[1],
            perc: parseFloat((+doc[1] * 100) / totalDocsScore).toFixed(2),
            fill: "#38686a",
          };
        })
    : "";

  const docsCollectionsTotal = reportData.docs_collections
    ? JSON.parse(reportData.docs_collections).reduce((a, b) => a + b[1], 0)
    : "";

  const docsCollections = reportData.docs_collections
    ? JSON.parse(reportData.docs_collections).map((s) => {
        return {
          token: s[0],
          freq: s[1],
          perc: parseFloat((s[1] * 100) / docsCollectionsTotal).toFixed(2),
          fill: randDarkColor(),
        };
      })
    : "";

  const docsDomains = reportData.docs_top100_domains
    ? JSON.parse(reportData.docs_top100_domains).slice(0, 10)
    : "";

  let docsTopTenDomains = docsDomains
    ? docsDomains.map((doc) => {
        return {
          token: punycode.toUnicode(doc[0]),
          freq: numberFormatter(doc[1]),
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
          token: punycode.toUnicode(doc[0]),
          freq: numberFormatter(doc[1]),
          perc: reportData.docs_total
            ? (doc[1] * 100) / reportData.docs_total
            : "",
        };
      })
    : "";

  const datasetName = reportData.corpus ? reportData.corpus : "Not specified";

  const totalDocsOverview = reportData.docs_total ? reportData.docs_total : "";

  const srclang = reportData.srclang
    ? languagePairName([reportData.srclang])
    : "";

  const trglang = reportData.trglang
    ? languagePairName([reportData.trglang])
    : "";

  const srcSize = reportData.src_bytes
    ? reportData.src_bytes.toLocaleString("en-US")
    : "";

  const trgSize = reportData.trg_bytes
    ? reportData.trg_bytes.toLocaleString("en-US")
    : "";

  const srcChars = reportData.src_chars
    ? reportData.src_chars.toLocaleString("en-US")
    : "";

  const trgChars = reportData.trg_chars
    ? reportData.trg_chars.toLocaleString("en-US")
    : "";

  const uniqueSegments = reportData.unique_sents ? reportData.unique_sents : "";

  const srcTokens = reportData.src_tokens
    ? numberFormatter(reportData.src_tokens)
    : "";

  const trgTokens = reportData.trg_tokens
    ? numberFormatter(reportData.trg_tokens)
    : "";

  useEffect(() => {
    if (footNote) {
      exportMultipleChartsToPdf(reportData.corpus, offLoading);
    }
  }, [footNote]);

  const [showSample, setShowSample] = useState(false);

  const [currentSample, setCurrentSample] = useState(1);

  return (
    <div className={styles.dataReportContainer}>
      {sample && dName.includes("HPLT-v2") && (
        <div className={styles.sampleBtnCont}>
          <button
            className={buttonStyles["button-32"]}
            onClick={() => setShowSample((sample) => !sample)}
          >
            See dataset sample
          </button>{" "}
        </div>
      )}
      {showSample && (
        <div className={styles.blur}>
          <div className={styles.sampleModal}>
            <div className={styles.modalHead}>
              <h2>Random samples from the {srclang[0].label} dataset</h2>
              <button
                className={styles.closeSampleBtn}
                onClick={() => setShowSample(false)}
              >
                <X />
              </button>
            </div>
            <div
              className={styles.sampleContent}
              dangerouslySetInnerHTML={{
                __html: sample[1][currentSample - 1].replaceAll("\n", "<br/>"),
              }}
            ></div>
            <div className={styles.sampleButtons}>
              {currentSample > 1 && (
                <button
                  onClick={() =>
                    setCurrentSample((currentSample) =>
                      currentSample > 1 ? currentSample - 1 : currentSample
                    )
                  }
                >
                  <ArrowLeft />
                </button>
              )}
              <p>
                Currently showing doc number {currentSample} out of{" "}
                {sample[1].length}
              </p>
              {currentSample < sample[1].length && (
                <button
                  onClick={() =>
                    setCurrentSample((currentSample) =>
                      currentSample < sample[1].length
                        ? currentSample + 1
                        : currentSample
                    )
                  }
                >
                  <ArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="custom-chart">
        <div className={styles.reportMainStats}>
          <div className={styles.analyticsTitleContainer}>
            <h1 className={styles.analyticsTitle}>HPLT Analytics report</h1>
            <h2>
              <Image
                src={Logo}
                width={30}
                height={30}
                className={styles.logo}
              />
              <p className={styles.hpltAnalyticsTitle}>
                <span className={styles.analyticsTitleSpan}>HPLT</span>Analytics
              </p>
            </h2>
          </div>
          <div className={styles.tables}>
            <div className={styles.overviewTables}>
              <div className={styles.generalOverview}>
                <h3>General overview</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Corpus</th>
                      <th>Analytics date</th>
                      {trglang ? (
                        <>
                          <th className={styles.desktopData}>
                            Source language
                          </th>
                          <th className={styles.desktopData}>
                            Target language
                          </th>{" "}
                        </>
                      ) : (
                        <th className={styles.desktopData}>Language</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{datasetName}</td>
                      <td>
                        {date === "Invalid Date" ? "Not specified" : date}
                      </td>
                      <td className={styles.desktopData}>
                        {srclang && srclang[0].label}
                      </td>
                      {trglang && (
                        <td className={styles.desktopData}>
                          {trglang[0].label}
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
                <div className={styles.mobileData}>
                  <h4>Language</h4>
                  <p>
                    {srclang && srclang[0].label}
                    {trglang && `-${trglang[0].label}`}
                  </p>
                </div>
              </div>
              <div className={styles.volumes}>
                <h3>Volumes</h3>
                <table>
                  <thead>
                    <tr>
                      {totalDocsOverview && <th>Docs</th>}
                      <th>
                        <div className={styles.containsTooltip}>
                          Segments{" "}
                          <a className="segments-info">
                            {!footNote && (
                              <Info
                                className={[
                                  styles.helpCircle,
                                  styles.desktopData,
                                ].join(" ")}
                                strokeWidth={1.2}
                                color="#2C2E35"
                                width={20}
                              />
                            )}
                          </a>
                          <Tooltip anchorSelect=".segments-info" place="top">
                            Segments correspond to paragraph and list boundaries
                            as defined by HTML elements{" "}
                            <code>
                              ({"<"}p{">"}, {"<"}ul{">"}, {"<"}ol{">"}, etc.)
                            </code>{" "}
                            replaced by newlines.
                          </Tooltip>
                        </div>
                      </th>
                      <th className={styles.desktopData}>Unique segments</th>
                      {!trglang && (
                        <th className={styles.desktopData}>
                          <div className={styles.containsTooltip}>
                            Tokens{" "}
                            <a className="tokens-info">
                              {!footNote && (
                                <Info
                                  className={[
                                    styles.helpCircle,
                                    styles.desktopData,
                                  ].join(" ")}
                                  strokeWidth={1.2}
                                  color="#2C2E35"
                                  width={20}
                                />
                              )}
                            </a>
                            <Tooltip
                              anchorSelect=".tokens-info"
                              place="top"
                              clickable
                            >
                              Tokenized with{" "}
                              <a
                                href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                                target="_blank"
                                className={styles.tooltipLink}
                              >
                                https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                              </a>
                            </Tooltip>
                          </div>
                        </th>
                      )}
                      {trglang && (
                        <th className={styles.desktopData}>Src tokens</th>
                      )}
                      {trglang && (
                        <th className={styles.desktopData}>Trg tokens</th>
                      )}
                      {!trglang && <th className={styles.desktopData}>Size</th>}
                      {!trglang && (
                        <th className={styles.desktopData}>Characters</th>
                      )}
                      {trglang && (
                        <th className={styles.desktopData}>Src size</th>
                      )}
                      {trglang && (
                        <th className={styles.desktopData}>Trg size</th>
                      )}
                      {trglang && (
                        <th className={styles.desktopData}>Src characters</th>
                      )}
                      {trglang && (
                        <th className={styles.desktopData}>Trg characters</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {totalDocs && (
                        <td>
                          <p className={styles.desktopNum}>
                            {totalDocsOverview.toLocaleString("en-US")}
                          </p>
                          <p className={styles.mobileNum}>
                            {numberFormatter(totalDocsOverview)}
                          </p>
                        </td>
                      )}
                      <td>
                        <p className={styles.desktopNum}>{sentences}</p>
                        <p className={styles.mobileNum}>
                          {numberFormatter(+reportData.sentence_pairs)}
                        </p>
                      </td>
                      <td className={styles.desktopData}>
                        <p className={styles.desktopNum}>
                          {uniqueSegments.toLocaleString("en-US")}
                        </p>
                        <p className={styles.mobileNum}>
                          {numberFormatter(+uniqueSegments)}
                        </p>
                        {uniqueSegments && sentences && (
                          <span className={styles.percSpan}>
                            {" ("}
                            {(
                              (reportData.unique_sents * 100) /
                              reportData.sentence_pairs
                            ).toFixed(2)}{" "}
                            %)
                          </span>
                        )}
                      </td>
                      <td className={styles.desktopData}>{srcTokens}</td>
                      {trglang && (
                        <td className={styles.desktopData}>{trgTokens}</td>
                      )}
                      <td className={styles.desktopData}>
                        {srcSize && srcSize}
                      </td>
                      {trgSize && (
                        <td className={styles.desktopData}>{trgSize}</td>
                      )}
                      <td className={styles.desktopData}>
                        {srcChars && srcChars}
                      </td>
                      {trgChars && (
                        <td className={styles.desktopData}>{trgChars}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
                <div className={styles.mobileData}>
                  <p className={styles.mobileNum}>
                    Unique segments - {numberFormatter(+uniqueSegments)}
                    {uniqueSegments && sentences && (
                      <span className={styles.percSpan}>
                        {" ("}
                        {(
                          (reportData.src_unique_sents.length * 100) /
                          reportData.sentence_pairs
                        ).toFixed(2)}{" "}
                        %)
                      </span>
                    )}
                  </p>
                  {!trglang && <p>Tokens - {srcTokens}</p>}
                  {trglang && <p>Src tokens - {srcTokens}</p>}
                  {trglang && <p>Trg tokens - {trgTokens}</p>}
                  {!trglang && srcSize && <p>Size -{srcSize}</p>}
                  {trglang && <p>Src size - {srcSize}</p>}
                  {trglang && <p>Trg size - {trgSize}</p>}
                </div>
              </div>
            </div>
            <div className={styles.tablesLeft}>
              {docsTopTenDomains && (
                <div className={styles.topDomains}>
                  <h3>Top 10 domains </h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Docs</th>
                        {docsTopTenDomains[0].perc && <th>% of total</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {docsTopTenDomains.map((doc) => {
                        return (
                          <tr>
                            <td>
                              <a
                                href={`http://www.${doc.token}`}
                                target="_blank"
                                className={styles.domainLink}
                              >
                                {doc.token}
                              </a>
                            </td>
                            <td>{doc.freq}</td>
                            <td>{doc.perc.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {docsTopTenTLDs && (
                <div className={styles.topTLDs}>
                  <h3>Top 10 TLDs </h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Docs</th>
                        {docsTopTenTLDs[0].perc && <th>% of total</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {docsTopTenTLDs.map((doc) => {
                        return (
                          <tr>
                            <td>{doc.token}</td>
                            <td>{doc.freq}</td>
                            <td>{doc.perc.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {docsSegmentsTop && (
        <div className="custom-chart">
          <div className={styles.langDocsContainer}>
            {docsSegmentsTop && (
              <div className={styles.docsCollectionsGraph}>
                <div className={styles.title}>
                  <h3>Documents size (in segments) </h3>
                  <a className="segments-info-graph">
                    {!footNote && (
                      <Info
                        className={[styles.helpCircle, styles.desktopData].join(
                          " "
                        )}
                        strokeWidth={1.2}
                        color="#2C2E35"
                        width={20}
                      />
                    )}
                  </a>
                  <Tooltip anchorSelect=".segments-info-graph" place="top">
                    Segments correspond to paragraph and list boundaries as
                    defined by HTML elements{" "}
                    <code>
                      ({"<"}p{">"}, {"<"}ul{">"}, {"<"}ol{">"}, etc.)
                    </code>{" "}
                    replaced by newlines.
                  </Tooltip>
                </div>
                <DocumentSizes
                  scores={docsSegmentsTop}
                  xLabel={"Segments"}
                  yLabel={"Documents"}
                  partOfTotal={docsSegmentsPercOfTotal}
                  totalDocs={totalDocs}
                  restPerc={restPerc}
                  restDocs={rest}
                />
              </div>
            )}
            {docsCollections && (
              <div className={styles.collectionsGraphPie}>
                <h3>Documents by collection</h3>
                <CollectionsGraph
                  collection={docsCollections}
                  total={docsCollectionsTotal}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {!reportData.trglang && (
        <div className="custom-chart">
          <div className={styles.languagesPieReportsContainer}>
            <div className={styles.title}>
              {" "}
              <h3>Language Distribution</h3>{" "}
            </div>
            <div className={styles.languagesPieReports}>
              {srcLangs && (
                <div className={styles.singleLanguageReport}>
                  {!reportData.trglang ? (
                    <h3 className={styles.smaller}>
                      Number of segments{" "}
                      <a className="lang-distribution-info">
                        {" "}
                        {!footNote && (
                          <Info
                            className={[
                              styles.helpCircle,
                              styles.desktopData,
                            ].join(" ")}
                            strokeWidth={1.2}
                            color="#2C2E35"
                            width={20}
                          />
                        )}
                      </a>
                      <Tooltip
                        anchorSelect=".lang-distribution-info"
                        place="top"
                        clickable
                      >
                        Language identified with FastSpell (
                        <a
                          href="https://github.com/mbanon/fastspell"
                          target="_blank"
                          className={styles.tooltipLink}
                        >
                          https://github.com/mbanon/fastspell
                        </a>
                        )
                      </Tooltip>
                    </h3>
                  ) : (
                    <h3>Source</h3>
                  )}
                  <LanguagePieChart
                    langs={srcLangs}
                    total={srcLangsTotal}
                    warning={srcLangIDWarning}
                    warningLang={srclang[0].label}
                    id="image"
                  />
                </div>
              )}
              {langDocs && (
                <div className={styles.singleLanguageReportDocs}>
                  {" "}
                  <h3 className={styles.smaller}>
                    Percentage of segments {srclang && `in ${srclang[0].label}`}{" "}
                    inside documents{" "}
                    <a className="lang-distribution-info-second">
                      {" "}
                      {!footNote && (
                        <Info
                          className={[
                            styles.helpCircle,
                            styles.desktopData,
                          ].join(" ")}
                          strokeWidth={1.2}
                          color="#2C2E35"
                          width={20}
                        />
                      )}
                    </a>
                    <Tooltip
                      anchorSelect=".lang-distribution-info-second"
                      place="top"
                      clickable
                    >
                      Language identification at segment-level based on
                      Heliport: (
                      <a
                        href="https://github.com/ZJaume/heliport"
                        target="_blank"
                        className={styles.tooltipLink}
                      >
                        https://github.com/ZJaume/heliport
                      </a>
                      )
                    </Tooltip>
                  </h3>
                  <LangDocs langDocs={langDocs} />
                </div>
              )}
              {trgLangs && (
                <div className={styles.singleLanguageReport}>
                  <h3 className={styles.smaller}>Target</h3>
                  <LanguagePieChart
                    langs={trgLangs}
                    total={trgLangsTotal}
                    warning={trgLangIDWarning}
                    warningLang={trglang[0].label}
                    id="image"
                  />
                </div>
              )}
            </div>
          </div>
          <div className={styles.blank}></div>
        </div>
      )}
      {bicleanerScores && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>Translation likelihood</h3>
            <div className={styles.desktopNum}>
              <ReportScores
                scores={bicleanerScores}
                xLabel={"Segments per document"}
                yLabel={"Frequency"}
                graph={"another"}
                padding={60}
                labellist={true}
                fontSize={14}
              />
            </div>
            <div className={styles.mobileNum}>
              <ReportScores
                scores={bicleanerScores}
                xLabel={"Segments per document"}
                yLabel={"Frequency"}
                graph={"another"}
                padding={20}
                labellist={true}
                fontSize={12}
              />
            </div>
          </div>
        </div>
      )}

      {documentScore && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <div className={styles.title}>
              <h3>Distribution of documents by document score</h3>
              <a className="doc-scores-distribution-info">
                {" "}
                {!footNote && (
                  <Info
                    className={[styles.helpCircle, styles.desktopData].join(
                      " "
                    )}
                    strokeWidth={1.2}
                    color="#2C2E35"
                    width={20}
                  />
                )}
              </a>
              <Tooltip
                anchorSelect=".doc-scores-distribution-info"
                place="top"
                clickable
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span>
                    Obtained with Web Docs Scorer (
                    <a
                      className={styles.tooltipLink}
                      href="https://github.com/pablop16n/web-docs-scorer/"
                      target="_blank"
                    >
                      https://github.com/pablop16n/web-docs-scorer/
                    </a>
                    )
                  </span>
                </div>
              </Tooltip>
            </div>
            <div className={styles.desktopNum}>
              <ReportScores
                scores={documentScore}
                xLabel={"Scores"}
                yLabel={"Documents"}
                graph={"docscores"}
                firstHalf={docsScoreLessThanFive}
                secondHalf={docsScoreOverFive}
                firstHalfPerc={docsScoresPercUnderFive}
                secondHalfPerc={docsScoresPercOverFive}
                fontSize={14}
              />
            </div>

            <div className={styles.mobileNum}>
              <ReportScores
                scores={documentScore}
                xLabel={"Scores"}
                yLabel={"Documents"}
                graph={"docscores"}
                firstHalf={docsScoreLessThanFive}
                secondHalf={docsScoreOverFive}
                firstHalfPerc={docsScoresPercUnderFive}
                secondHalfPerc={docsScoresPercOverFive}
                fontSize={12}
              />
            </div>
          </div>
        </div>
      )}
      {reportData.trglang && (
        <div className="custom-chart">
          <div className={styles.languagesPieReportsContainer}>
            <div className={styles.title}>
              {" "}
              <h3>Language Distribution</h3>{" "}
              <a className="lang-distribution-info">
                {" "}
                {!footNote && (
                  <Info
                    className={[styles.helpCircle, styles.desktopData].join(
                      " "
                    )}
                    strokeWidth={1.2}
                    color="#2C2E35"
                    width={20}
                  />
                )}
              </a>
              <Tooltip
                anchorSelect=".lang-distribution-info"
                place="top"
                clickable
              >
                Language identified with FastSpell (
                <a
                  href="https://github.com/mbanon/fastspell"
                  target="_blank"
                  className={styles.tooltipLink}
                >
                  https://github.com/mbanon/fastspell
                </a>
                )
              </Tooltip>
            </div>
            <div className={styles.languagesPieReports}>
              {srcLangs && (
                <div className={styles.singleLanguageReport}>
                  {!reportData.trglang ? (
                    <h3>Number of segments</h3>
                  ) : (
                    <h3>Source</h3>
                  )}
                  <LanguagePieChart
                    langs={srcLangs}
                    total={srcLangsTotal}
                    warning={srcLangIDWarning}
                    warningLang={srclang[0].label}
                    id="image"
                  />
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
                  <LanguagePieChart
                    langs={trgLangs}
                    total={trgLangsTotal}
                    warning={trgLangIDWarning}
                    warningLang={trglang[0].label}
                    id="image"
                  />
                </div>
              )}
            </div>
          </div>
          <div className={styles.blank}></div>
        </div>
      )}
      <div className={styles.languageDistributionContainer}>
        {srcSentTokens && (
          <div
            className={[styles.singleDistribution, " custom-chart"].join("")}
          >
            <div className={styles.containsTooltip}>
              <h3>
                {!reportData.trglang
                  ? "Segment length distribution by token"
                  : "Source segment length distribution by token"}
              </h3>
              <a className="segment-length-info">
                {!footNote && (
                  <Info
                    className={[styles.helpCircle, styles.desktopData].join(
                      " "
                    )}
                    strokeWidth={1.2}
                    color="#2C2E35"
                    width={20}
                  />
                )}
              </a>
              <Tooltip
                anchorSelect=".segment-length-info"
                place="top"
                clickable
              >
                Tokenized with{" "}
                <a
                  href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                  target="_blank"
                  className={styles.tooltipLink}
                >
                  https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                </a>
              </Tooltip>
            </div>
            <div className={styles.desktopNum}>
              <SegmentDistribution
                data={srcSentTokens}
                which={"Source"}
                fontSize={14}
              />
            </div>
            <div className={styles.mobileNum}>
              <SegmentDistribution
                data={srcSentTokens}
                which={"Source"}
                fontSize={12}
              />
            </div>
          </div>
        )}

        {reportData.trglang && trgSentTokens && (
          <div
            className={[styles.singleDistribution, " custom-chart"].join("")}
          >
            <h3>Target segment length distribution by token</h3>
            <div className={styles.desktopNum}>
              <SegmentDistribution
                data={trgSentTokens}
                which={"Target"}
                fontSize={14}
              />
            </div>
            <div className={styles.mobileNum}>
              <SegmentDistribution
                data={trgSentTokens}
                which={"Target"}
                fontSize={12}
              />
            </div>
          </div>
        )}
      </div>
      {reportData.hardrules_tags && noiseDistribution && (
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
                  strokeWidth={1.2}
                  color="#2C2E35"
                  width={20}
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
          <NoiseDistributionGraph noiseData={noiseDistribution} />
        </div>
      )}
      {reportData.src_ngrams && Object.entries(srcNGrams).length && (
        <div className="custom-chart">
          <div className={styles.nGramContainer}>
            <div className={styles.singleNGramContainer}>
              <div className={styles.containsTooltip}>
                {reportData.trglang ? (
                  <h3>Source n-grams</h3>
                ) : (
                  <h3>Frequent n-grams</h3>
                )}
                <a className="ngrams-info">
                  {!footNote && (
                    <Info
                      className={[styles.helpCircle, styles.desktopData].join(
                        " "
                      )}
                      strokeWidth={1.2}
                      color="#2C2E35"
                      width={20}
                    />
                  )}
                </a>
                <Tooltip anchorSelect=".ngrams-info" place="top" clickable>
                  <div style={{ display: "flex", flexDirection: "column" }}>
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
              <NGramsTable NGrams={srcNGrams} />
            </div>

            <div className={styles.blank}></div>
          </div>
        </div>
      )}
      {reportData.trglang && Object.entries(trgNGrams).length && (
        <div className="custom-chart">
          <div className={styles.singleNGramContainer}>
            <div className={styles.containsTooltip}>
              <h3>Target n-grams</h3>
              <a className="ngrams-info-trg">
                {!footNote && (
                  <Info
                    className={[styles.helpCircle, styles.desktopData].join(
                      " "
                    )}
                    strokeWidth={1.2}
                    color="#2C2E35"
                    width={20}
                  />
                )}
              </a>
              <Tooltip anchorSelect=".ngrams-info-trg" place="top" clickable>
                <div style={{ display: "flex", flexDirection: "column" }}>
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
            <NGramsTable NGrams={trgNGrams} />
          </div>

          <div className={styles.blank}></div>
        </div>
      )}
      <div className="custom-chart">
        {footNote && (
          <>
            <Footnotes />
            <div className={styles.blank}></div>
          </>
        )}
      </div>

      <div className={[styles.reportButtons, styles.desktopNum].join(" ")}>
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
            setFootNote(true);
            setLoadingPdf(true);
            if (footNote) {
              exportMultipleChartsToPdf(reportData.corpus, offLoading);
            }
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
      {footNote && (
        <div className={styles.overlay}>
          <div className={styles.overlayText}>
            {" "}
            <h1>Please wait. Your report is being generated</h1>{" "}
            <Oval
              visible={true}
              height="46"
              width="46"
              color="#ffffff"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass="wrapper"
              secondaryColor="white"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}
