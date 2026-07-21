"use client";
import { useEffect, useState } from "react";
import BicleanerScores from "./BicleanerScores";
import LanguagePieChart from "./LanguagePieChart";
import {
  languagePairName,
  handleDownload,
  downloadYAML,
} from "@/lib/helpers";
import { calculateDocumentSegments, processTokenFrequencies } from "@/lib/data";
import SegmentDistribution from "./SegmentDistribution";
import { exportMultipleChartsToPdf } from "./utils";
import NoiseDistribution from "./NoiseDistribution";
import LangDocs from "./LangDocs";
import { useRouter } from "next/router";
import CollectionsGraph from "./CollectionsGraph";
import DocumentSizes from "./DocumentSizes";
import Footnotes from "./Footnotes";
import SampleButton from "./SampleButton";
import Loader from "./Loader";
import ReportTitle from "./ReportTitle";
import Sample from "./Sample";
import RegisterLabels from "@/components/RegisterLabels";
import DomainLabels from "@/components/DomainLabels";
import InfoTooltip from "@/components/InfoTooltip";
import buttonStyles from "@/styles/Uploader.module.css";
import styles from "@/styles/Report.module.css";
import NGrams from "./NGrams";
import DocumentScores from "./DocumentScores";
import ReportOverviewTables from "./ReportOverviewTables";

export default function Report({ date, report, external, externalFilename, externalReport }) {
  if (!report) return;

  const router = useRouter();

  const [showSample, setShowSample] = useState(false);
  const [footNote, setFootNote] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const {
    srclang,
    trglang,
    warnings,
    docs_langs,
    sample,
    src_ngrams,
    trg_ngrams,
    collections,
    hardrules_tags,
    bicleaner_scores
  } = report;

  const datasetName = router.query.file;

  const filename = router.query.file ? router.query.file.replace(".yaml", "") : undefined;

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

  const noiseDistribution = hardrules_tags
    ? Object.entries(hardrules_tags).filter((el) =>
      !report.trglang ? el[0] !== "length_ratio" : el
    )
    : "";

  const offLoading = () => {
    setFootNote(false);
    setLoadingPdf(false);
  };

  const src = srclang ? languagePairName([srclang]) : "";

  const trg = trglang ? languagePairName([trglang]) : "";

  const documentSizesObj = calculateDocumentSegments(report);

  useEffect(() => {

    if (footNote) {
      exportMultipleChartsToPdf(external ? externalFilename : filename, offLoading);
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
          <ReportOverviewTables
            report={report}
            date={date}
            src={src}
            trg={trg}
            footNote={footNote}
          />
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
              className={
                report.docs_collections
                  ? styles.primaryChartWithAside
                  : styles.primaryChartFull
              }
            >
              <DocumentSizes documentSizesObj={documentSizesObj} />
            </div>
            {report.docs_collections && (
              <div className={[styles.collectionsGraphPie, styles.asideChart].join(" ")}>
                <CollectionsGraph
                  collection={report.docs_collections}
                  footNote={footNote}
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
                    {!footNote && (
                      <InfoTooltip className={styles.titleTooltipTrigger}>
                        <p>Language identified with FastSpell (
                          <a
                            href="https://github.com/mbanon/fastspell"
                            target="_blank"
                          >
                            https://github.com/mbanon/fastspell
                          </a>
                          )</p>
                      </InfoTooltip>
                    )}
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
                  {!footNote && (
                    <InfoTooltip className={styles.titleTooltipTrigger}>
                      <p>Language identification at segment-level based on Heliport: (
                        <a
                          href="https://github.com/ZJaume/heliport"
                          target="_blank"
                        >
                          https://github.com/ZJaume/heliport
                        </a>
                        )</p>
                    </InfoTooltip>
                  )}
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
          bicleaner_scores || collections ? "custom-chart" : ""
        }
      >
        <div className={styles.anotherContainer}>
          {bicleaner_scores && (
            <div
              className={
                collections
                  ? styles.primaryChartWithAside
                  : styles.primaryChartFull
              }
            >
              <BicleanerScores
                scores={bicleaner_scores}
                footNote={footNote}
              />
            </div>
          )}
          {collections && (
            <div
              className={[styles.collectionsGraphPie, styles.asideChart].join(" ")}
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
                {!trglang
                  ? "Segment length distribution by token"
                  : "Source segment length distribution by token"}
              </h3>
              {!footNote && (
                <InfoTooltip className={styles.titleTooltipTrigger}>
                  <p>Tokenized with{" "}
                    <a
                      href="https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md"
                      target="_blank"
                    >
                      https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
                    </a></p>
                </InfoTooltip>
              )}
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
      {hardrules_tags && noiseDistribution && (
        <NoiseDistribution
          noiseData={noiseDistribution}
          sentences={report.sentence_pairs}
          trglang={report.trglang}
          footNote={footNote}
        />
      )}
      {Object.keys(src_ngrams ?? {}).length > 0 && (
        <NGrams
          which="Source"
          ngrams={src_ngrams}
          trg={trglang}
          footNote={footNote}
        />
      )}
      {Object.keys(trg_ngrams ?? {}).length > 0 && (
        <NGrams
          which="Target"
          ngrams={trg_ngrams}
          trg={trglang}
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
          onClick={() => external ? downloadYAML(externalReport, externalFilename) : handleDownload(datasetName)}
          type="button"
        >
          Download yaml
        </button>
        <button
          className={buttonStyles["button-26"]}
          onClick={() => {
            setFootNote(true);
            setLoadingPdf(true);
          }}
        >
          {!loadingPdf && <p> Export to PDF</p>}
        </button>
      </div>
      {footNote && <Loader />}
    </div>
  );
}
