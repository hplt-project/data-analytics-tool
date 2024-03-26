import { languagePairName } from "../hooks/hooks";
import Logo from "../public/logos/logo.png";

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
    ? reportData.src_bytes.toLocaleString()
    : "";

  const trgSize = reportData.trg_bytes
    ? reportData.trg_bytes.toLocaleString()
    : "";

  const sentences = reportData.sentence_pairs
    ? reportData.sentence_pairs.toLocaleString()
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
                  <th>Segments</th>
                  <th>Unique segments</th>
                  {!trglang && <th>Size</th>}
                  {trglang && <th>Src size</th>}
                  {trglang && <th>Trg size</th>}
                  {!trglang && <th>Tokens</th>}
                  {trglang && <th>Src tokens</th>}
                  {trglang && <th>Trg tokens</th>}
                  {totalDocs && <th>Total Docs</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{sentences}</td>
                  <td>{uniqueSegments.toLocaleString()}</td>
                  <td>{srcSize && srcSize}</td>
                  {trgSize && <td>{trgSize}</td>}

                  <td>{srcTokens}</td>
                  {trglang && <td>{trgTokens}</td>}
                  {totalDocs && <td>{totalDocs.toLocaleString()}</td>}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.typeTokens}>
            <h3>Type-Token Ratio</h3>
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
