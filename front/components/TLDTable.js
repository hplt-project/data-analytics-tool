import styles from "../src/styles/TLDTable.module.css";
function TLDTable({ topTLDs, type }) {
  return (
    <div className={styles.topTLDs}>
      <h3>
        {type === "src" ? "Source top" : type === "trg" ? "Target top" : "Top"}{" "}
        10 TLDs{" "}
      </h3>
      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Docs</th>
            {topTLDs[0].perc && <th>% of total</th>}
          </tr>
        </thead>
        <tbody>
          {topTLDs.map((doc) => {
            return (
              <tr>
                <td>{doc.token}</td>
                <td>{doc.freq}</td>
                <td>{doc?.perc && doc.perc.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TLDTable;
