import Link from "next/link";
import styles from "@/styles/DomainTable.module.css";

function BilingualTable({ list, type }) {
  return (
    <div className={styles.bilingualTable}>
      <h2>Dataset top 10 {type}</h2>
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
          {list.map((el) => {
            return (
              <tr>
                {type === "domains" && (
                  <td>
                    <Link
                      href={`http://www.${el.src_domain.token}`}
                      target="_blank"
                      className={styles.domainLink}
                    >
                      {el.src_domain.token}
                    </Link>
                  </td>
                )}
                {type === "TLDs" && <td>{el.src_domain.token}</td>}
                <td>{el.src_domain.freq}</td>
                <td>
                  {type === "domains" && (
                    <td>
                      <Link
                        href={`http://www.${el.trg_domain.token}`}
                        target="_blank"
                        className={styles.domainLink}
                      >
                        {el.trg_domain.token}
                      </Link>
                    </td>
                  )}
                  {type === "TLDs" && <td>{el.trg_domain.token}</td>}
                </td>
                <td>{el.trg_domain.freq}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot></tfoot>
      </table>
    </div>
  );
}

export default BilingualTable;
