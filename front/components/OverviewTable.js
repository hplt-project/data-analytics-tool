import { languagePairName } from "../hooks/hooks";
import Logo from "../public/logos/logo.png";
import { Info } from "lucide-react";
import { Tooltip } from "react-tooltip";

import Image from "next/image";

import styles from "./../src/styles/DataAnalyticsReport.module.css";

export default function OverviewTable({
  reportData,
  date,
  docsTopTenDomains,
  docsTopTenTLDs,
}) {
  const datasetName = reportData.corpus ? reportData.corpus : "Not specified";

  const totalDocs = reportData.docs_total ? reportData.docs_total : "";

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

  return (
    <div className={styles.reportMainStats}>
      <div className={styles.analyticsTitleContainer}>
        <h1 className={styles.analyticsTitle}>HPLT Analytics report</h1>
        <h2>
          <Image src={Logo} width={30} height={30} className={styles.logo} />
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
                  <td>{date === "Invalid Date" ? "Not specified" : date}</td>
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
                  {totalDocs && <th>Docs</th>}
                  <th>
                    <div className={styles.containsTooltip}>
                      Segments{" "}
                      <a className="segments-info">
                        <Info
                          className={styles.helpCircle}
                          strokeWidth={1.4}
                          color="#2C2E35"
                        />
                      </a>
                      <Tooltip anchorSelect=".segments-info" place="top">
                        Segments correspond to paragraph and list boundaries as
                        defined by HTML elements{" "}
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
                          <Info
                            className={styles.helpCircle}
                            strokeWidth={1.4}
                            color="#2C2E35"
                          />
                        </a>
                        <Tooltip anchorSelect=".tokens-info" place="top">
                          Tokenized with {"<"}loquesea{">"}.
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
                  {totalDocs && <td>{totalDocs.toLocaleString("en-US")}</td>}
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
                <Info
                  className={styles.helpCircle}
                  strokeWidth={1.4}
                  color="#2C2E35"
                />
              </a>
              <Tooltip anchorSelect=".type-token-info" place="top" clickable>
                Lexical variety computed as *number or types (uniques)/number of
                tokens*, after removing punctuation (
                <a
                  href="https://www.sltinfo.com/wp-content/uploads/2014/01/type-token-ratio.pdf"
                  target="_blank"
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
  );
}
