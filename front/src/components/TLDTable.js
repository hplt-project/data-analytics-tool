import styles from "@/styles/TLDTable.module.css";
import { numberFormatter } from "@/lib/helpers";
const punycode = require("punycode/");


function TLDTable({ tlds, docsTotal }) {
  return (
    <div className={styles.topTLDs}>
      <h3>
        Top 10 TLDs
      </h3>
      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Docs</th>
            {tlds[0][1] && <th>% of total</th>}
          </tr>
        </thead>
        <tbody>
          {tlds.map((doc, idx) => {
            const tld = punycode.toUnicode(doc[0]);
            const frequency = numberFormatter(doc[1]);
            const percentage = docsTotal ? (doc[1] * 100) / docsTotal : "";
            return (
              <tr key={`tld--${idx}`}>
                <td>{tld}</td>
                <td>{frequency}</td>
                <td>{percentage && percentage.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TLDTable;
