import { useEffect, useState } from "react";
import BicleanerScores from "./BicleanerScores";
import LanguagePieChart from "./LanguagePieChart";
import {
  numberFormatter,
  languagePairName,
  handleDownload,
  convertSize,
} from "@/lib/helpers";
import { calculateDocumentSegments, processTokenFrequencies } from "@/lib/data";
import SegmentDistribution from "./SegmentDistribution";
import { exportMultipleChartsToPdf } from "./utils";
import NoiseDistribution from "./NoiseDistribution";
import LangDocs from "./LangDocs";
import { useRouter } from "next/router";
import { Tooltip } from "react-tooltip";
import CollectionsGraph from "./CollectionsGraph";
import DocumentSizes from "./DocumentSizes";
import Footnotes from "./Footnotes";
import DomainTable from "./DomainTable";
import TLDTable from "./TLDTable";
import SampleButton from "./SampleButton";
import Loader from "./Loader";
import ReportTitle from "./ReportTitle";
import BilingualTable from "./BilingualTable";
import Sample from "./Sample";
import RegisterLabels from "@/components/RegisterLabels";
import DomainLabels from "@/components/DomainLabels";
import InfoCircle from "@/components/InfoCircle";
import buttonStyles from "@/styles/Uploader.module.css";
import styles from "@/styles/Report.module.css";
import NGrams from "./NGrams";
import DocumentScores from "./DocumentScores";

export default function Report({ date, report }) {
  if (!report) return;

  const router = useRouter();

  const [showSample, setShowSample] = useState(false);
  const [footNote, setFootNote] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const {
    srclang,
    trglang,
    sentence_pairs,
    warnings,
    docs_langs,
    src_tokens,
    trg_tokens,
    sample,
  } = report;

  const datasetName = router.query.file;

  const filename = router.query.file.replace(".yaml", "");

  const sentences = sentence_pairs?.toLocaleString("en-US");

  const srcLangIDWarning = warnings?.includes("src_fastspell") ? true : false;

  const trgLangIDWarning = warnings?.includes("trg_fastspell") ? true : false;

  const srcSentTokens = report?.src_sent_tokens ?? "";
  const srcUniqueTokens = report?.src_unique_sents ?? "";

  const srcSentenceTokens = processTokenFrequencies(
    srcSentTokens,
    srcUniqueTokens
  );

  const trgSentTokens = report?.trg_sent_tokens ?? "";
  const trgUniqueTokens = report?.trg_unique_sents ?? "";

  const trgSentenceTokens = processTokenFrequencies(
    trgSentTokens,
    trgUniqueTokens
  );

  const noiseDistribution = report.hardrules_tags
    ? Object.entries(report.hardrules_tags).filter((el) =>
      !report.trglang ? el[0] !== "length_ratio" : el
    )
    : "";

  const offLoading = () => {
    setFootNote(false);
    setLoadingPdf(false);
  };

  const docsDomains = report.docs_top100_domains?.length ? report.docs_top100_domains.slice(0, 10) : undefined;

  const docsTLDs = report.docs_top100_tld?.length
    ? report.docs_top100_tld.slice(0, 10)
    : undefined;

  const docs_total = report.docs_total;

  const srcDomains = report.src_top100_domains?.slice(0, 10);

  const trgDomains = report.trg_top100_domains?.slice(0, 10);

  const srcTLDs = report.src_top100_tld?.slice(0, 10);

  const trgTLDs = report.trg_top100_tld?.slice(0, 10);

  const dataset = report?.corpus ?? "";

  const totalDocsOverview = report?.docs_total ?? "";

  const src = srclang ? languagePairName([srclang]) : "";

  const trg = trglang ? languagePairName([trglang]) : "";

  const srcSize = report.src_bytes
    ? typeof report.src_bytes === "number"
      ? convertSize(report.src_bytes)
      : report.src_bytes.toLocaleString("en-US")
    : "";

  const trgSize = report.trg_bytes
    ? typeof report.trg_bytes === "number"
      ? convertSize(report.trg_bytes)
      : report.trg_bytes.toLocaleString("en-US")
    : "";

  const srcChars = report.src_chars?.toLocaleString("en-US") ?? "";

  const trgChars = report.trg_chars
    ? report.trg_chars.toLocaleString("en-US")
    : "";

  const uniqueSegments = report.unique_sents ? report.unique_sents : "";
  const duplicationRatio = report.duplication_ratio ?? "";

  const srcTokens = numberFormatter(src_tokens) ?? "";

  const trgTokens = numberFormatter(trg_tokens) ?? "";

  const documentSizesObj = calculateDocumentSegments(report);

  const totalDocs = documentSizesObj.totalDocuments;

  useEffect(() => {
    if (footNote) {
      exportMultipleChartsToPdf(filename, offLoading);
    }
  }, [footNote]);

  useEffect(() => {
    document.body.style.overflow = showSample ? "hidden" : "unset";
  }, [showSample]);

  return (
    <div className={styles.dataReportContainer}>
      {sample && <SampleButton setShowSample={setShowSample} />}
      {sample && showSample && (
        <Sample
          src={src}
          trg={trg}
          sample={sample}
          setShowSample={setShowSample}
        />
      )}
      <div className="custom-chart">
        <div className={styles.reportMainStats}>
          <ReportTitle />
          <div className={styles.tables}>
            <div className={styles.overviewTables}>
              <div className={styles.generalOverview}>
                <h3>General overview</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Corpus</th>
                      <th>Date</th>
                      {trglang ? (
                        <>
                          <th className={styles.desktopData}>SL</th>
                          <th className={styles.desktopData}>TL</th>{" "}
                        </>
                      ) : (
                        <th className={styles.desktopData}>Language</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{dataset ? dataset : "Not specified"}</td>
                      <td>
                        {date === "Invalid Date" ? "Not specified" : date}
                      </td>
                      <td className={styles.desktopData}>
                        {src &&
                          (src[0].value === "hbs"
                            ? "Croatian-Bosnian-Serbian"
                            : src[0].label)}
                      </td>
                      {trg && (
                        <td className={styles.desktopData}>{trg[0].label}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
                <div className={styles.mobileData}>
                  <h4>Language</h4>
                  <p>
                    {src &&
                      (src[0].value === "hbs"
                        ? "Croatian-Bosnian-Serbian"
                        : src[0].label)}
                    {trglang && `-${trglang[0].label}`}
                  </p>
                </div>
              </div>
              <div className={styles.volumes} style={{ marginTop: "20px" }}>
                <h3>Volumes</h3>
                <table>
                  <thead>
                    <tr>
                      {totalDocsOverview && <th>Docs</th>}
                      <th>
                        <div className={styles.containsTooltip}>
                          Segments{" "}
                          <a className="segments-info" >
                            {!footNote && <InfoCircle style={{ marginBottom: "-2px", marginLeft: "3px" }} />}
                          </a>
                          <Tooltip anchorSelect=".segments-info" place="top" style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}>
                            <p style={{ fontSize: "14px" }}> Segments correspond to paragraph and list boundaries
                              as defined by HTML elements{" "}
                              <code>
                                ({"<"}p{">"}, {"<"}ul{">"}, {"<"}ol{">"}, etc.)
                              </code>{" "}
                              replaced by newlines.</p>
                          </Tooltip>
                        </div>
                      </th>
                      {!trglang && uniqueSegments && (
                        <th className={styles.desktopData}>Unique segments</th>
                      )}
                      {duplicationRatio !== "" && (
                        <th className={styles.desktopData}>Duplication ratio</th>
                      )}
                      {!trglang && Number(src_tokens) > 0 && (
                        <th className={styles.desktopData}>
                          <div className={styles.containsTooltip}>
                            Tokens{" "}
                            <a className="tokens-info">
                              {!footNote && <InfoCircle style={{ marginBottom: "-2px", marginLeft: "3px" }} />}
                            </a>
                            <Tooltip
                              anchorSelect=".tokens-info"
                              place="top"
                              clickable style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 100000 }}
                            >
                              <p style={{ fontSize: "14px" }}>  Tokenized with{" "}
                                <a
                                  href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                                  target="_blank"
                                  className={styles.tooltipLink}
                                >
                                  https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                                </a></p>
                            </Tooltip>
                          </div>
                        </th>
                      )}
                      {trglang && Number(src_tokens) > 0 && (
                        <th className={styles.desktopData}>SL tokens</th>
                      )}
                      {trglang && srcChars && (
                        <th className={styles.desktopData}>SL characters</th>
                      )}
                      {trglang && srcSize && (
                        <th className={styles.desktopData}>SL size</th>
                      )}{" "}
                      {!trglang && srcChars && (
                        <th className={styles.desktopData}>Characters</th>
                      )}
                      {!trglang && <th className={styles.desktopData}>Size</th>}
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
                                {(
                                  (report.unique_sents * 100) /
                                  report.sentence_pairs
                                ).toFixed(2)}{" "}
                                %)
                              </span>
                            )}
                          </p>
                          <p className={styles.mobileNum}>
                            {numberFormatter(+uniqueSegments)}
                            {uniqueSegments && sentences && (
                              <span className={styles.percSpan}>
                                {" ("}
                                {(
                                  (report.unique_sents * 100) /
                                  report.sentence_pairs
                                ).toFixed(2)}{" "}
                                %)
                              </span>
                            )}
                          </p>
                        </td>
                      )}
                      {duplicationRatio !== "" && (
                        <td className={styles.desktopData}>
                          {(duplicationRatio * 100).toFixed(2)}%
                        </td>)}
                      {Number(src_tokens) > 0 &&
                        (<td className={styles.desktopData}>{srcTokens}</td>
                        )}


                      {srcChars && (
                        <td className={styles.desktopData}>{srcChars}</td>
                      )}
                      {srcSize && (
                        <td className={styles.desktopData}>{srcSize}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
                <table style={{ marginLeft: "auto" }}>
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
                      {trgChars && (
                        <td className={styles.desktopData}>{trgChars}</td>
                      )}
                      {trgSize && (
                        <td className={styles.desktopData}>{trgSize}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
                <div className={styles.mobileData}>
                  {!trglang && uniqueSegments && (
                    <p className={styles.mobileNum}>
                      Unique segments - {numberFormatter(+uniqueSegments)}
                      {uniqueSegments && sentences && (
                        <span className={styles.percSpan}>
                          {" ("}
                          {(
                            (report.src_unique_sents.length * 100) /
                            report.sentence_pairs
                          ).toFixed(2)}{" "}
                          %)
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
              </div>
            </div>
            <div className={styles.tablesLeft}>
              {docsDomains && (
                <DomainTable domains={docsDomains} docsTotal={docs_total} />
              )}

              {docsTLDs && <TLDTable tlds={docsTLDs} docsTotal={docs_total} />}
            </div>
            <div className={styles.bilingualTables}>
              {srcDomains && trgDomains && (
                <BilingualTable
                  src={srcDomains}
                  trg={trgDomains}
                  type={"domains"}
                  sentences={report.sentence_pairs}
                />
              )}
              {srcTLDs && trgTLDs && (
                <BilingualTable
                  src={srcTLDs}
                  trg={trgTLDs}
                  type={"TLDs"}
                  sentences={report.sentence_pairs}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {report["register_labels"] && (
        <RegisterLabels
          labels={report["register_labels"]}
          footNote={footNote}
        />
      )}
      {report["domain_labels"] && (
        <div className="custom-chart">
          <DomainLabels labels={report["domain_labels"]} footNote={footNote} />
        </div>
      )}
      {report.docs_segments && (
        <div className="custom-chart">
          <div className={styles.langDocsContainer}>
            <div
              style={
                report.docs_collections
                  ? { width: "70%", marginBottom: "40px" }
                  : { width: "100%", marginBottom: "40px" }
              }
            >
              <DocumentSizes documentSizesObj={documentSizesObj} />
            </div>
            {report.docs_collections && (
              <div className={styles.collectionsGraphPie}>
                <CollectionsGraph
                  collection={report.docs_collections}
                  docs={true}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="custom-chart">
        <div className={styles.languagesPieReportsContainer}>
          <div className={styles.langTitle}>
            <h3>Language Distribution</h3>
          </div>
          <div className={styles.languagesPieReports}>
            {report.src_langs && (
              <div className={styles.singleLanguageReport}>
                {!report.trglang ? (
                  <div className={styles.title}>
                    <h3 className={styles.smaller}>
                      Number of segments in the {src && src[0].label} corpus

                    </h3>
                    <>
                      <a className="lang-distribution-info" style={{ marginLeft: "5px" }}>
                        {!footNote && <InfoCircle />}
                      </a>
                      <Tooltip
                        anchorSelect=".lang-distribution-info"
                        place="top"
                        clickable
                        style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}
                      >
                        <p style={{ fontSize: "14px" }}>   Language identified with FastSpell (
                          <a
                            href="https://github.com/mbanon/fastspell"
                            target="_blank"
                            className={styles.tooltipLink}
                          >
                            https://github.com/mbanon/fastspell
                          </a>
                          )</p>
                      </Tooltip>
                    </>
                  </div>
                ) : (
                  <h3 className={styles.smaller}>Source</h3>
                )}
                <LanguagePieChart
                  langs={report.src_langs}
                  warning={srcLangIDWarning}
                  warningLang={src[0].label}
                  id="image"
                />
              </div>
            )}
            {docs_langs && (
              <div className={styles.singleLanguageReportDocs}>
                <div className={styles.title}>
                  <h3 className={styles.smaller}>
                    Percentage of segments {src && `in ${src[0].label}`} inside
                    documents{" "}


                  </h3>
                  <>
                    <a className="lang-distribution-info-second" style={{ marginLeft: "5px" }}>
                      {!footNote && (
                        <InfoCircle
                        />
                      )}
                    </a>
                    <Tooltip
                      anchorSelect=".lang-distribution-info-second"
                      place="top"
                      clickable
                      style={{ fontWeight: 400, backgroundColor: "rgba(24, 18, 17, 1)", zIndex: 10000 }}
                    >
                      <p style={{ fontSize: "14px" }}>   Language identification at segment-level based on Heliport: (
                        <a
                          href="https://github.com/ZJaume/heliport"
                          target="_blank"
                          className={styles.tooltipLink}
                        >
                          https://github.com/ZJaume/heliport
                        </a>
                        )</p>
                    </Tooltip>
                  </>
                </div>
                <LangDocs
                  langDocs={docs_langs}
                  srclang={src ? src : ""}
                  footNote={footNote}
                />
              </div>
            )}
            {report.trg_langs && (
              <div className={styles.singleLanguageReport}>
                <h3 className={styles.smaller}>Target</h3>
                <LanguagePieChart
                  langs={report.trg_langs}
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
      <div
        className={
          report.bicleaner_scores || report.collections ? "custom-chart" : ""
        }
      >
        <div className={styles.anotherContainer}>
          {report.bicleaner_scores && (
            <div
              style={
                report.collections
                  ? { width: "70%", marginBottom: "40px" }
                  : { width: "100%", marginBottom: "40px" }
              }
            >
              <BicleanerScores
                scores={report.bicleaner_scores}
                footNote={footNote}
              />
            </div>
          )}
          {report.collections && (
            <div
              className={styles.collectionsGraphPie}
              style={{ width: "30%" }}
            >
              <CollectionsGraph collection={report.collections} docs={false} />
            </div>
          )}
        </div>
      </div>
      {report.docs_wds && (
        <DocumentScores scores={report.docs_wds} footNote={footNote} />
      )}
      <div className={styles.languageDistributionContainer}>
        {srcSentenceTokens && (
          <div
            className={[styles.singleDistribution, " custom-chart"].join("")}
          >
            <div className={styles.containsTooltip}>
              <h3>
                {!report.trglang
                  ? "Segment length distribution by token"
                  : "Source segment length distribution by token"}
              </h3>
              <a className="segment-length-info">
                {!footNote && <InfoCircle style={{ marginBottom: "-3px", marginLeft: "3px" }} />}
              </a>
              <Tooltip
                anchorSelect=".segment-length-info"
                place="top"
                clickable
                style={{ fontWeight: 400, backgroundColor: "rgba(17, 21, 24, 1)", zIndex: 10000 }}

              >
                <p style={{ fontSize: "14px" }}> Tokenized with{" "}
                  <a
                    href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                    target="_blank"
                    className={styles.tooltipLink}
                  >
                    https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                  </a></p>
              </Tooltip>
            </div>
            <div className={styles.desktopNum}>
              <SegmentDistribution
                data={srcSentenceTokens}
                which={"Source"}
                fontSize={14}
              />
            </div>
          </div>
        )}
        {trglang && trgSentenceTokens && (
          <div
            className={[styles.singleDistribution, " custom-chart"].join("")}
          >
            <h3>Target segment length distribution by token</h3>
            <div className={styles.desktopNum}>
              <SegmentDistribution
                data={trgSentenceTokens}
                which={"Target"}
                fontSize={14}
              />
            </div>
          </div>
        )}
      </div>
      {report.hardrules_tags && noiseDistribution && (
        <NoiseDistribution
          noiseData={noiseDistribution}
          sentences={report.sentence_pairs}
          trglang={report.trglang}
          footNote={footNote}
        />
      )}
      {report.src_ngrams && Object.entries(report.src_ngrams).length > 0 && (
        <NGrams
          which="Source"
          ngrams={report.src_ngrams}
          trg={report.trglang}
          footNote={footNote}
        />
      )}
      {report.trglang && Object.entries(report.src_ngrams).length > 0 && (
        <NGrams
          which="Target"
          ngrams={report.trg_ngrams}
          trg={report.trglang}
          footNote={footNote}
        />
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
          onClick={() => handleDownload(datasetName)}
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
              exportMultipleChartsToPdf(filename, offLoading);
            }
          }}
        >
          {!loadingPdf && <p> Export to PDF</p>}
        </button>
      </div>
      {footNote && <Loader />}
    </div>
  );
}
