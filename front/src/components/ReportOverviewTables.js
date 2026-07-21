"use client";

import { convertSize, numberFormatter } from "@/lib/helpers";
import BilingualTable from "./BilingualTable";
import DomainTable from "./DomainTable";
import InfoTooltip from "@/components/InfoTooltip";
import TLDTable from "./TLDTable";
import styles from "@/styles/ReportOverviewTables.module.css";

const displayLanguageName = (language) => {
  if (!language) return "";

  return language[0].value === "hbs"
    ? "Croatian-Bosnian-Serbian"
    : language[0].label;
};

const displaySize = (value) => {
  if (!value) return "";

  return typeof value === "number"
    ? convertSize(value)
    : value.toLocaleString("en-US");
};

export default function ReportOverviewTables({ report, date, src, trg, footNote }) {
  const {
    trglang,
    sentence_pairs,
    src_tokens,
    trg_tokens,
  } = report;

  const docsDomains = report.docs_top100_domains?.length
    ? report.docs_top100_domains.slice(0, 10)
    : undefined;
  const docsTLDs = report.docs_top100_tld?.length
    ? report.docs_top100_tld.slice(0, 10)
    : undefined;
  const srcDomains = report.src_top100_domains?.slice(0, 10);
  const trgDomains = report.trg_top100_domains?.slice(0, 10);
  const srcTLDs = report.src_top100_tld?.slice(0, 10);
  const trgTLDs = report.trg_top100_tld?.slice(0, 10);

  const dataset = report?.corpus ?? "";
  const docsTotal = report.docs_total;
  const totalDocsOverview = report?.docs_total ?? "";
  const sentences = sentence_pairs?.toLocaleString("en-US");
  const srcUniqueTokens = report?.src_unique_sents ?? "";
  const uniqueSegments = report.unique_sents ? report.unique_sents : "";
  const duplicationRatio = report.duplication_ratio ?? "";
  const srcTokens = numberFormatter(src_tokens) ?? "";
  const trgTokens = numberFormatter(trg_tokens) ?? "";
  const srcChars = report.src_chars?.toLocaleString("en-US") ?? "";
  const trgChars = report.trg_chars ? report.trg_chars.toLocaleString("en-US") : "";
  const srcSize = displaySize(report.src_bytes);
  const trgSize = displaySize(report.trg_bytes);
  const sourceVolumeColumnCount = [
    totalDocsOverview,
    true,
    !trglang && uniqueSegments,
    duplicationRatio !== "",
    Number(src_tokens) > 0,
    srcChars,
    srcSize,
  ].filter(Boolean).length;
  const splitSourceVolumes = sourceVolumeColumnCount > 4;

  return (
    <div className={styles.tables}>
      <div className={styles.overviewTables}>
        <section className={styles.summaryPanel}>
          <h3>General overview</h3>
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Corpus</th>
                  <th>Date</th>
                  {trglang ? (
                    <>
                      <th className={styles.desktopData}>SL</th>
                      <th className={styles.desktopData}>TL</th>
                    </>
                  ) : (
                    <th className={styles.desktopData}>Language</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{dataset ? dataset : "Not specified"}</td>
                  <td>{date === "Invalid Date" ? "Not specified" : date}</td>
                  <td className={styles.desktopData}>{displayLanguageName(src)}</td>
                  {trg && <td className={styles.desktopData}>{trg[0].label}</td>}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.mobileData}>
            <h4>Language</h4>
            <p>
              {displayLanguageName(src)}
              {trglang && `-${trglang[0].label}`}
            </p>
          </div>
        </section>

        <section className={[styles.summaryPanel, styles.volumes].join(" ")}>
          <h3>Volumes</h3>
          <div className={[styles.tableShell, styles.wideTableShell].join(" ")}>
            <table>
              <thead>
                <tr>
                  {totalDocsOverview && <th>Docs</th>}
                  <th>
                    <div className={styles.containsTooltip}>
                      Segments
                      {!footNote && (
                        <InfoTooltip placement="bottom">
                          <p>
                            Segments correspond to paragraph and list boundaries as
                            defined by HTML elements{" "}
                            <code>
                              ({"<"}p{">"}, {"<"}ul{">"}, {"<"}ol{">"}, etc.)
                            </code>{" "}
                            replaced by newlines.
                          </p>
                        </InfoTooltip>
                      )}
                    </div>
                  </th>
                  {!trglang && uniqueSegments && (
                    <th className={styles.desktopData}>Unique segments</th>
                  )}
                  {duplicationRatio !== "" && !splitSourceVolumes && (
                    <th className={styles.desktopData}>Duplication ratio</th>
                  )}
                  {!trglang && Number(src_tokens) > 0 && !splitSourceVolumes && (
                    <th className={styles.desktopData}>
                      <div className={styles.containsTooltip}>
                        Tokens
                        {!footNote && (
                        <InfoTooltip placement="bottom">
                            <p>
                              Tokenized with{" "}
                              <a
                                href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                                target="_blank"
                              >
                                https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                              </a>
                            </p>
                          </InfoTooltip>
                        )}
                      </div>
                    </th>
                  )}
                  {trglang && Number(src_tokens) > 0 && !splitSourceVolumes && (
                    <th className={styles.desktopData}>SL tokens</th>
                  )}
                  {trglang && srcChars && !splitSourceVolumes && (
                    <th className={styles.desktopData}>SL characters</th>
                  )}
                  {trglang && srcSize && (
                    <th className={styles.desktopData}>SL size</th>
                  )}
                  {!trglang && srcChars && !splitSourceVolumes && (
                    <th className={styles.desktopData}>Characters</th>
                  )}
                  {!trglang && <th className={styles.desktopData}>Size</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {docsTotal && (
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
                      {numberFormatter(+report.sentence_pairs)}
                    </p>
                  </td>
                  {!trglang && uniqueSegments && (
                    <td className={styles.desktopData}>
                      <p className={styles.desktopNum}>
                        {uniqueSegments.toLocaleString("en-US")}
                        {uniqueSegments && sentences && (
                          <span className={styles.percSpan}>
                            {" ("}
                            {((report.unique_sents * 100) / report.sentence_pairs).toFixed(2)} %)
                          </span>
                        )}
                      </p>
                      <p className={styles.mobileNum}>
                        {numberFormatter(+uniqueSegments)}
                        {uniqueSegments && sentences && (
                          <span className={styles.percSpan}>
                            {" ("}
                            {((report.unique_sents * 100) / report.sentence_pairs).toFixed(2)} %)
                          </span>
                        )}
                      </p>
                    </td>
                  )}
                  {duplicationRatio !== "" && !splitSourceVolumes && (
                    <td className={styles.desktopData}>
                      {(duplicationRatio * 100).toFixed(2)}%
                    </td>
                  )}
                  {Number(src_tokens) > 0 && !splitSourceVolumes && (
                    <td className={styles.desktopData}>{srcTokens}</td>
                  )}
                  {srcChars && !splitSourceVolumes && (
                    <td className={styles.desktopData}>{srcChars}</td>
                  )}
                  {srcSize && <td className={styles.desktopData}>{srcSize}</td>}
                </tr>
              </tbody>
            </table>
          </div>

          {splitSourceVolumes && (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    {duplicationRatio !== "" && (
                      <th className={styles.desktopData}>Duplication ratio</th>
                    )}
                    {Number(src_tokens) > 0 && (
                      <th className={styles.desktopData}>
                        <div className={styles.containsTooltip}>
                          {trglang ? "SL tokens" : "Tokens"}
                          {!footNote && (
                            <InfoTooltip placement="bottom">
                              <p>
                                Tokenized with{" "}
                                <a
                                  href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                                  target="_blank"
                                >
                                  https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                                </a>
                              </p>
                            </InfoTooltip>
                          )}
                        </div>
                      </th>
                    )}
                    {srcChars && (
                      <th className={styles.desktopData}>
                        {trglang ? "SL characters" : "Characters"}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {duplicationRatio !== "" && (
                      <td className={styles.desktopData}>
                        {(duplicationRatio * 100).toFixed(2)}%
                      </td>
                    )}
                    {Number(src_tokens) > 0 && (
                      <td className={styles.desktopData}>{srcTokens}</td>
                    )}
                    {srcChars && <td className={styles.desktopData}>{srcChars}</td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.tableShell}>
            <table className={styles.targetTable}>
              <thead>
                <tr>
                  {trglang && trgTokens && (
                    <th className={styles.desktopData}>TL tokens</th>
                  )}
                  {trglang && trgChars && (
                    <th className={styles.desktopData}>TL characters</th>
                  )}
                  {trglang && trgSize && (
                    <th className={styles.desktopData}>TL size</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {trglang && trgTokens && (
                    <td className={styles.desktopData}>{trgTokens}</td>
                  )}
                  {trgChars && <td className={styles.desktopData}>{trgChars}</td>}
                  {trgSize && <td className={styles.desktopData}>{trgSize}</td>}
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.mobileData}>
            {!trglang && uniqueSegments && (
              <p className={styles.mobileNum}>
                Unique segments - {numberFormatter(+uniqueSegments)}
                {uniqueSegments && sentences && (
                  <span className={styles.percSpan}>
                    {" ("}
                    {((srcUniqueTokens && srcUniqueTokens.length * 100) / report.sentence_pairs).toFixed(2)} %)
                  </span>
                )}
              </p>
            )}
            {duplicationRatio !== "" && (
              <p className={styles.mobileNum}>
                Duplication ratio - {(duplicationRatio * 100).toFixed(2)}%
              </p>
            )}
            {!trglang && srcTokens && <p>Tokens - {srcTokens}</p>}
            {trglang && <p>SL tokens - {srcTokens}</p>}
            {trglang && <p>TL tokens - {trgTokens}</p>}
            {!trglang && srcSize && <p>Size -{srcSize}</p>}
            {trglang && <p>SL size - {srcSize}</p>}
            {trglang && <p>TL size - {trgSize}</p>}
          </div>
        </section>
      </div>

      <div className={styles.tablesLeft}>
        {docsDomains && <DomainTable domains={docsDomains} docsTotal={docsTotal} />}
        {docsTLDs && <TLDTable tlds={docsTLDs} docsTotal={docsTotal} />}
      </div>

      <div className={styles.bilingualTables}>
        {srcDomains && trgDomains && (
          <BilingualTable
            src={srcDomains}
            trg={trgDomains}
            type="domains"
            sentences={report.sentence_pairs}
          />
        )}
        {srcTLDs && trgTLDs && (
          <BilingualTable
            src={srcTLDs}
            trg={trgTLDs}
            type="TLDs"
            sentences={report.sentence_pairs}
          />
        )}
      </div>
    </div>
  );
}
