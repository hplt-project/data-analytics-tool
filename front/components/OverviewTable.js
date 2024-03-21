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
  const totalDocs = reportData.docs_total ? reportData.docs_total : "";

  /// language names

  const srclang = reportData.srclang
    ? languagePairName([reportData.srclang])
    : "";

  const trglang = reportData.trglang
    ? languagePairName([reportData.trglang])
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
                      {" "}
                      <th>Source language</th>
                      <th>Target language</th>{" "}
                    </>
                  ) : (
                    <th>Language</th>
                  )}
                  {totalDocs && <th>Total Docs</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{reportData.corpus.replace(".tsv", "")}</td>
                  <td>{date && date}</td>
                  <td>{srclang[0].label}</td>
                  {trglang && <td>{trglang[0].label}</td>}
                  {totalDocs && <td>{totalDocs.toLocaleString()}</td>}
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
                  <th>Unique segment pairs</th>
                  <th>Src size</th>
                  {trglang && <th>Trg size</th>}
                  <th>Src tokens</th>
                  {trglang && <th>Trg tokens</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{reportData.sentence_pairs.toLocaleString()}</td>
                  <td>{reportData.src_unique_sents.length}</td>
                  <td>{reportData.src_bytes}</td>
                  {trglang && <td>{reportData.trg_bytes}</td>}

                  <td>
                    {" "}
                    {Intl.NumberFormat("en", { notation: "compact" }).format(
                      reportData.src_tokens
                    )}
                  </td>
                  {trglang && (
                    <td>
                      {Intl.NumberFormat("en", { notation: "compact" }).format(
                        reportData.trg_tokens
                      )}
                    </td>
                  )}
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
