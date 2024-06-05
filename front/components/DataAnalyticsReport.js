import { useEffect, useState } from "react";
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
import { languagePairName } from "../hooks/hooks";
import Image from "next/image";
import Logo from "../public/logos/logo.png";
import CollectionsGraph from "./collectionsGraphs";
import DocumentSizes from "./DocumentSizes";

import styles from "./../src/styles/DataAnalyticsReport.module.css";
import buttonStyles from "@/styles/Uploader.module.css";
import Footnotes from "./Footnotes";

export default function DataAnalyticsReport({ reportData, date }) {
  if (!reportData) return;

  const router = useRouter();

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
      console.log(error, "andale wey");
    }
  };

  const [loadingPdf, setLoadingPdf] = useState(false);

  const monocleanerScores = reportData.monocleaner_scores
    ? JSON.parse(reportData.monocleaner_scores).map((s) => {
        return { token: +s[0], freq: +s[1], fill: "#8864FC" };
      })
    : "";

  const documentScore = reportData.docs_wds
    ? JSON.parse(reportData.docs_wds).map((s) => {
        return { token: +s[0], freq: +s[1], fill: "#E9C46A" };
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
                : "Contains porn",
            value: parseFloat(v[1]),
            perc: `${v[1]} %`,
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

  const restPerc = ((docsSegmentsTotal - totalDocs) * 100) / docsSegmentsTotal;

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

  const sentences = reportData.sentence_pairs
    ? reportData.sentence_pairs.toLocaleString("en-US")
    : "";

  const uniqueSegments = reportData.src_unique_sents
    ? reportData.src_unique_sents.length
    : "";

  const srcTokens = reportData.src_tokens
    ? Intl.NumberFormat("en", { notation: "compact" }).format(
        reportData.src_tokens
      )
    : "";

  const trgTokens = reportData.trg_tokens
    ? Intl.NumberFormat("en", { notation: "compact" }).format(
        reportData.trg_tokens
      )
    : "";

  useEffect(() => {
    if (footNote) {
      exportMultipleChartsToPdf(reportData.corpus, offLoading);
    }
  }, [footNote]);

  return (
    <div className={styles.dataReportContainer}>
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
                      <td>{datasetName}</td>
                      <td>
                        {date === "Invalid Date" ? "Not specified" : date}
                      </td>
                      <td>{srclang && srclang[0].label}</td>
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
                      {totalDocsOverview && <th>Docs</th>}
                      <th>
                        <div className={styles.containsTooltip}>
                          Segments{" "}
                          <a className="segments-info">
                            {!footNote && (
                              <Info
                                className={styles.helpCircle}
                                strokeWidth={1.4}
                                color="#2C2E35"
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
                      <th>Unique segments</th>
                      {!trglang && (
                        <th>
                          <div className={styles.containsTooltip}>
                            Tokens{" "}
                            <a className="tokens-info">
                              {!footNote && (
                                <Info
                                  className={styles.helpCircle}
                                  strokeWidth={1.4}
                                  color="#2C2E35"
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
                      {trglang && <th>Src tokens</th>}
                      {trglang && <th>Trg tokens</th>}
                      {!trglang && <th>Size</th>}
                      {trglang && <th>Src size</th>}
                      {trglang && <th>Trg size</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {totalDocs && (
                        <td>{totalDocsOverview.toLocaleString("en-US")}</td>
                      )}
                      <td>{sentences}</td>
                      <td>
                        {uniqueSegments.toLocaleString("en-US")}
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
                      </td>
                      <td>{srcTokens}</td>
                      {trglang && <td>{trgTokens}</td>}
                      <td>{srcSize && srcSize}</td>
                      {trgSize && <td>{trgSize}</td>}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.typeTokens}>
                <div className={styles.containsTooltip}>
                  <h3>Type-Token Ratio</h3>
                  <a className="type-token-info">
                    {!footNote && (
                      <Info
                        className={styles.helpCircle}
                        strokeWidth={1.4}
                        color="#2C2E35"
                      />
                    )}
                  </a>
                  <Tooltip
                    anchorSelect=".type-token-info"
                    place="top"
                    clickable
                  >
                    Lexical variety computed as *number or types
                    (uniques)/number of tokens*, after removing punctuation (
                    <a
                      href="https://www.sltinfo.com/wp-content/uploads/2014/01/type-token-ratio.pdf"
                      target="_blank"
                      className={styles.tooltipLink}
                    >
                      https://www.sltinfo.com/wp-content/uploads/2014/01/type-token-ratio.pdf
                    </a>
                    ).
                  </Tooltip>
                </div>
                <table>
                  <thead>
                    <tr>
                      {!trglang && srclang && <th>{srclang[0].label}</th>}
                      {trglang && reportData.ttr_trg && (
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
                              +reportData.ttr_trg < 0.3
                                ? styles.lowestType
                                : +reportData.ttr_trg < 0.5
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
                        className={styles.helpCircle}
                        strokeWidth={1.4}
                        color="#2C2E35"
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
                  graph={"docsCollections"}
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
                <CollectionsGraph collection={docsCollections} />
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
              <a className="lang-distribution-info">
                {" "}
                {!footNote && (
                  <Info
                    className={styles.helpCircle}
                    strokeWidth={1.4}
                    color="#2C2E35"
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
                    <h3 className={styles.smaller}>Number of segments</h3>
                  ) : (
                    <h3>Source</h3>
                  )}
                  <LanguagePieChart langs={srcLangs} id="image" />
                </div>
              )}
              {langDocs && (
                <div className={styles.singleLanguageReportDocs}>
                  {" "}
                  <h3 className={styles.smaller}>
                    Percentage of segments {srclang && `in ${srclang[0].label}`}{" "}
                    inside documents
                  </h3>
                  <LangDocs langDocs={langDocs} />
                </div>
              )}
              {trgLangs && (
                <div className={styles.singleLanguageReport}>
                  <h3 className={styles.smaller}>Target</h3>
                  <LanguagePieChart langs={trgLangs} id="image" />
                </div>
              )}
            </div>
          </div>
          <div className={styles.blank}></div>
        </div>
      )}
      {monocleanerScores && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <div className={styles.title}>
              {" "}
              <h3>Distribution of segments by fluency score</h3>{" "}
              <a className="segment-fluency-distribution-info">
                {" "}
                {!footNote && (
                  <Info
                    className={styles.helpCircle}
                    strokeWidth={1.4}
                    color="#2C2E35"
                  />
                )}
              </a>
              <Tooltip
                anchorSelect=".segment-fluency-distribution-info"
                place="top"
                clickable
              >
                Obtained with Monocleaner (
                <a
                  className={styles.tooltipLink}
                  href="https://github.com/bitextor/monocleaner"
                  target="_blank"
                >
                  https://github.com/bitextor/monocleaner
                </a>
                )
              </Tooltip>
            </div>
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
            <div className={styles.title}>
              {" "}
              <h3>
                {!reportData.trglang && docsAvgLM
                  ? "Distribution of documents by average fluency score"
                  : ""}
              </h3>{" "}
              <a className="doc-fluency-distribution-info">
                {" "}
                {!footNote && (
                  <Info
                    className={styles.helpCircle}
                    strokeWidth={1.4}
                    color="#2C2E35"
                  />
                )}
              </a>
              <Tooltip
                anchorSelect=".doc-fluency-distribution-info"
                place="top"
                clickable
              >
                Obtained with Monocleaner (
                <a
                  className={styles.tooltipLink}
                  href="https://github.com/bitextor/monocleaner"
                  target="_blank"
                >
                  ( https://github.com/bitextor/monocleaner )
                </a>
                )
              </Tooltip>
            </div>

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
            <h3>Translation likelihood</h3>
            <ReportScores
              scores={bicleanerScores}
              xLabel={"Segments per document"}
              yLabel={"Frequency"}
              graph={"another"}
            />
          </div>
        </div>
      )}

      {documentScore && (
        <div className="custom-chart">
          <div className={styles.bicleanerScores}>
            <h3>Document scores</h3>
            <ReportScores
              scores={documentScore}
              xLabel={"Segments per document"}
              yLabel={"Frequency"}
              graph={"docscores"}
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
                    className={styles.helpCircle}
                    strokeWidth={1.4}
                    color="#2C2E35"
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
            <SegmentDistribution data={srcSentTokens} which={"Source"} />
          </div>
        )}

        {reportData.trglang && trgSentTokens && (
          <div
            className={[styles.singleDistribution, " custom-chart"].join("")}
          >
            <h3>Target segment length distribution by token</h3>
            <SegmentDistribution data={trgSentTokens} which={"Target"} />
          </div>
        )}
      </div>
      {noiseDistribution && (
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
                  className={styles.helpCircle}
                  strokeWidth={1.4}
                  color="#2C2E35"
                />
              )}
            </a>
            <Tooltip anchorSelect=".noise-info" place="top">
              Obtained with Bicleaner Hardrules
            </Tooltip>
          </div>
          <NoiseDistributionGraph noiseData={noiseDistribution} />
        </div>
      )}
      {Object.entries(srcNGrams).length && (
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
                      className={styles.helpCircle}
                      strokeWidth={1.4}
                      color="#2C2E35"
                    />
                  )}
                </a>
                <Tooltip anchorSelect=".ngrams-info" place="top" clickable>
                  Tokenized with{" "}
                  <a
                    href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                    target="_blank"
                    className={styles.tooltipLink}
                  >
                    https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                  </a>
                  , after removing n-grams starting or ending in a stopword.
                  Stopwords from
                  <a
                    className={styles.tooltipLink}
                    href="https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt"
                    target="_blank"
                  >
                    https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt
                  </a>
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
              <a className="ngrams-info">
                {!footNote && (
                  <Info
                    className={styles.helpCircle}
                    strokeWidth={1.4}
                    color="#2C2E35"
                  />
                )}
              </a>
              <Tooltip anchorSelect=".ngrams-info" place="top" clickable>
                Tokenized with{" "}
                <a
                  href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                  target="_blank"
                  className={styles.tooltipLink}
                >
                  https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                </a>
                , after removing n-grams starting or ending in a stopword.
                Stopwords from
                <a
                  className={styles.tooltipLink}
                  href="https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt"
                  target="_blank"
                >
                  {" "}
                  https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt
                </a>
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
