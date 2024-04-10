import styles from "@/styles/Fottnotes.module.css";

export default function Footnotes() {
  return (
    <div className={styles.footNotes}>
      <h2>About HPLT Analytics</h2>
      <div className={styles.singleNote}>
        <h4>Volumes - Segments</h4>
        <ul>
          <li>
            Segments correspond to paragraph and list boundaries as defined by
            HTML elements ({"<"}p{">"}, {"<"}ul{">"}, {"<"}ol{">"}, etc.)
            replaced by newlines.
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Volumes - Tokens</h4>
        <ul>
          <li>
            Tokenized with {"<"}loquesea{">"}
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Type-Token Ratio</h4>
        <ul>
          <li>
            Lexical variety computed as *number or types (uniques)/number of
            tokens*, after removing punctuation
            (https://www.sltinfo.com/wp-content/uploads/2014/01/type-token-ratio.pdf).
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Document size (in segments)</h4>
        <ul>
          <li>
            Segments correspond to paragraph and list boundaries as defined by
            HTML elements ({"<"}p{">"}, {"<"}ul{">"}, {"<"}ol{">"}, etc.)
            replaced by newlines.
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Language distribution</h4>
        <ul>
          <li>
            Language identified with FastSpell
            (https://github.com/mbanon/fastspell).
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Distribution of segments by fluency score</h4>
        <ul>
          <li>
            Obtained with Monocleaner (https://github.com/bitextor/monocleaner).
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Distribution of documents by average fluency score</h4>
        <ul>
          <li>
            Obtained with Monocleaner (https://github.com/bitextor/monocleaner).
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Segment length distribution by token</h4>
        <ul>
          <li>
            Tokenized with {"<"}loquesea{">"}.
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Segment noise distribution</h4>
        <ul>
          <li>Obtained with Bicleaner Hardrules.</li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Frequent n-grams</h4>
        <ul>
          <li>
            Tokenized with {"<"}loquesea{">"}, after removing n-grams starting
            or ending in a stopword. Stopwords from
            https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt
          </li>
        </ul>
      </div>
    </div>
  );
}
