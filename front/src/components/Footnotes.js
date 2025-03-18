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
            Tokenized with
            https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
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
        <h4>Distribution of documents by document score</h4>
        <ul>
          <li>
            Obtained with Web Docs Scorer
            (https://github.com/pablop16n/web-docs-scorer/).
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Segment length distribution by token</h4>
        <ul>
          <li>
            Tokenized with
            https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Segment noise distribution</h4>
        <ul>
          <li>
            Obtained with Bicleaner Hardrules
            (https://github.com/bitextor/bicleaner-hardrules/).
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Frequent n-grams</h4>
        <ul>
          <li>
            Tokenized with
            https://github.com/hplt-project/data-analytics-tool/blob/main/tokenizers-info.md,
            after removing n-grams starting or ending in a stopword. Stopwords
            from
            https://github.com/hplt-project/data-analytics-tool/blob/main/scripts/resources/README.txt
          </li>
        </ul>
      </div>
      <div className={styles.singleNote}>
        <h4>Register labels</h4>
        <div
          className={styles.registarLebelsTables}
          style={{ display: "flex" }}
        >
          <table style={{ marginRight: "20px" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Abbr.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.mainCategory}>Machine-translated</td>
                <td>MT</td>
              </tr>
              <tr>
                <td className={styles.mainCategory}>Lyrical</td>
                <td>LY</td>
              </tr>
              <tr>
                <td className={styles.mainCategory}>Spoken</td>
                <td>SP</td>
              </tr>
              <tr>
                <td>Interview</td>
                <td>it</td>
              </tr>
              <tr>
                <td className={styles.mainCategory}>Interactive discussion</td>
                <td>ID</td>
              </tr>
              <tr>
                <td className={styles.mainCategory}>Narrative</td>
                <td>NA</td>
              </tr>
              <tr>
                <td>News report</td>
                <td>ne</td>
              </tr>
              <tr>
                <td>Sports report</td>
                <td>sr</td>
              </tr>
              <tr>
                <td>Narrative blog</td>
                <td>nb</td>
              </tr>
            </tbody>
          </table>
          <table style={{ marginRight: "20px" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Abbr.</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.mainCategory}>
                <td>How-to or instructions</td>
                <td>HI</td>
              </tr>
              <tr>
                <td>Recipe</td>
                <td>re</td>
              </tr>
              <tr className={styles.mainCategory}>
                <td>Informational persuasion</td>
                <td>IP</td>
              </tr>
              <tr>
                <td>Description with intent to sell</td>
                <td>ds</td>
              </tr>
              <tr>
                <td>News & opinion blog or editorial</td>
                <td>ed</td>
              </tr>
              <tr className={styles.mainCategory}>
                <td>Informational description</td>
                <td>IN</td>
              </tr>
              <tr>
                <td>Enciclopedia article</td>
                <td>en</td>
              </tr>
              <tr>
                <td>Research article</td>
                <td>ra</td>
              </tr>
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Abbr.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Description of a thing or person</td>
                <td>dtp</td>
              </tr>
              <tr>
                <td>FAQ</td>
                <td>fi</td>
              </tr>
              <tr>
                <td>Legal terms & conditions</td>
                <td>lt</td>
              </tr>
              <tr className={styles.mainCategory}>
                <td>Opinion</td>
                <td>OP</td>
              </tr>
              <tr>
                <td>Review</td>
                <td>rv</td>
              </tr>
              <tr>
                <td>Opinion blog</td>
                <td>ob</td>
              </tr>
              <tr>
                <td>Denominational religious blog or sermon</td>
                <td>rs</td>
              </tr>
              <tr>
                <td>Advice</td>
                <td>av</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
