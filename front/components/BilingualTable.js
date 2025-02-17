import Link from "next/link";
import styles from "@/styles/BilingualTable.module.css";

function BilingualTable({ list, type }) {
  return (
    <div
      className={styles.bilingualTable}
      style={type === "domains" ? { marginRight: "15px" } : {}}
    >
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
                <td>
                  {/* {el.src_domain.freq} |{" "} */}
                  {el.src_domain.perc.toFixed(1)}%
                </td>
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
                <td>
                  {/* {el.trg_domain.freq} |{" "} */}
                  {el.trg_domain.perc.toFixed(1)}%
                </td>
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
