const punycode = require("punycode/");
import { numberFormatter } from "@/lib/helpers";
import styles from "@/styles/DomainTable.module.css";

function DomainTable({ domains, docsTotal }) {
  return (
    <div className={styles.topDomains}>
      <h3>
        Top 10 domains
      </h3>
      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Docs</th>
            {domains[0][1] && <th>% of total</th>}
          </tr>
        </thead>
        <tbody>
          {domains.map((dom, idx) => {
            const domain = punycode.toUnicode(dom[0]);
            const frequency = numberFormatter(dom[1]);
            const percentage = docsTotal ? (dom[1] * 100) / docsTotal : "";
            return (
              <tr key={`domain--${idx}`}>
                <td>
                  <a
                    href={`http://www.${domain}`}
                    target="_blank"
                    className={styles.domainLink}
                  >
                    {domain.length > 18
                      ? `${domain.slice(0, 15)}...`
                      : domain}
                  </a>
                </td>
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

export default DomainTable;
