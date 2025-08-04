import styles from "@/styles/NGramsTable.module.css";
import { unEscape } from "@/lib/helpers";

export default function NGramsTable({ NGrams }) {
  if (!NGrams) return;
  return (
    <div className={styles.nGramsTableContainer}>
      <table>
        <thead>
          <tr className={styles.firstRow}>
            <th className={styles.nunberHeader}>Size</th>
            <th>n-grams</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(NGrams)[0] && (
            <tr>
              <td>1</td>
              <td>
                {Object.entries(NGrams)[0][1].map((n, i) => {
                  return (
                    <div className={styles.oneNGramTag} key={i}>
                      {unEscape(n[0].join(""))} | {n[1]}
                    </div>
                  );
                })}
              </td>
            </tr>
          )}
          {Object.entries(NGrams)[1] && (
            <tr>
              <td>2</td>
              <td>
                {" "}
                {Object.entries(NGrams)[1][1].map((n, i) => {
                  return (
                    <div className={styles.twoNGramTag} key={i}>
                      {unEscape(n[0].join(" "))} | {n[1]}
                    </div>
                  );
                })}
              </td>
            </tr>
          )}
          {Object.entries(NGrams)[2] && (
            <tr>
              <td>3</td>
              <td>
                {" "}
                {Object.entries(NGrams)[2][1].map((n, i) => {
                  return (
                    <div className={styles.threeNGramTag} key={i}>
                      {unEscape(n[0].join(" "))} | {n[1]}
                    </div>
                  );
                })}
              </td>
            </tr>
          )}
          {Object.entries(NGrams)[3] && (
            <tr>
              <td>4</td>
              <td>
                {" "}
                {Object.entries(NGrams)[3][1].map((n, i) => {
                  return (
                    <div className={styles.fourNGramTag} key={i}>
                      {unEscape(n[0].join(" "))} | {n[1]}
                    </div>
                  );
                })}
              </td>
            </tr>
          )}
          {Object.entries(NGrams)[4] && (
            <tr>
              <td>5</td>
              <td>
                {" "}
                {Object.entries(NGrams)[4][1].map((n, i) => {
                  return (
                    <div className={styles.fiveNGramTag} key={i}>
                      {unEscape(n[0].join(" "))} | {n[1]}
                    </div>
                  );
                })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
