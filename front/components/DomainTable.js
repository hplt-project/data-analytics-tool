import styles from "../src/styles/DomainTable.module.css";

function DomainTable({ topDomains, type }) {
  return (
    <div className={styles.topDomains}>
      <h3>
        {type === "src" ? "Source top" : type === "trg" ? "Target top" : "Top"}{" "}
        10 domains{" "}
      </h3>
      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Docs</th>
            {topDomains[0].perc && <th>% of total</th>}
          </tr>
        </thead>
        <tbody>
          {topDomains.map((doc) => {
            return (
              <tr>
                <td>
                  <a
                    href={`http://www.${doc.token}`}
                    target="_blank"
                    className={styles.domainLink}
                  >
                    {doc.token}
                  </a>
                </td>
                <td>{doc.freq}</td>
                <td>{doc.perc && doc.perc.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DomainTable;
