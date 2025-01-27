import styles from "@/styles/DomainTable.module.css";

function BilingualTable({ list, type }) {
  return (
    <div className={styles.bilingualTable}>
      <h2>Dataset top 10 {type}</h2>
      <table>
        <thead>
          <tr>
            <th>Src domain</th>
            <th>Segments</th>
            <th>Trg domain</th>
            <th>Segments</th>
          </tr>
        </thead>
        <tbody>
          {list.map((el) => {
            return (
              <tr>
                <th scope="row">{el.src_domain.token}</th>
                <td>
                  {el.src_domain.freq}{" "}
                  <span>( {el.src_domain.perc.toFixed(1)}%)</span>
                </td>
                <th scope="row">{el.trg_domain.token}</th>
                <td>
                  {el.trg_domain.freq}{" "}
                  <span>({el.trg_domain.perc.toFixed(1)}%)</span>
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
