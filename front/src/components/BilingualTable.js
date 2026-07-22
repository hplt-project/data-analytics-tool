import Link from "next/link";
import styles from "@/styles/BilingualTable.module.css";
const punycode = require("punycode/");

function BilingualTable({ src, trg, type, sentences }) {
  return (
    <div className={type === "domains" ? styles.withGap : undefined}>
      <h2>Dataset top 10 {type}</h2>
      <div className={styles.tableShell}>
        <table>
        <thead>
          <tr>
            <th>SL domain</th>
            <th>Segments</th>
            <th>TL domain</th>
            <th>Segments</th>
          </tr>
        </thead>
        <tbody>
          {src.map((el, idx) => {
            const srcName = punycode.toUnicode(el[0]);
            const trgName = punycode.toUnicode(trg[idx][0]);
            const srcPercentage = sentences ? (el[1] * 100) / sentences : "";
            const trgPercentage = sentences ? (trg[idx][1] * 100) / sentences : "";
            return (
              <tr key={`${type}-${srcName}-${trgName}`}>
                {type === "domains" && (
                  <td>
                    <Link
                      href={`http://www.${srcName}`}
                      target="_blank"
                    >
                      {srcName}
                    </Link>
                  </td>
                )}
                {type === "TLDs" && <td>{srcName}</td>}
                <td>
                  {srcPercentage.toFixed(1)}%
                </td>
                {type === "domains" && (
                  <td>
                    <Link
                      href={`http://www.${trgName}`}
                      target="_blank"
                    >
                      {trgName}
                    </Link>
                  </td>
                )}
                {type === "TLDs" && <td>{trgName}</td>}
                <td>
                  {trgPercentage.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default BilingualTable;
