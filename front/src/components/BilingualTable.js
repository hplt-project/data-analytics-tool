import Link from "next/link";
const punycode = require("punycode/");

function BilingualTable({ src, trg, type, sentences }) {
  return (
    <div
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
          {src.map((el, idx) => {
            const srcName = punycode.toUnicode(el[0]);
            const trgName = punycode.toUnicode(trg[idx][0]);
            const srcPercentage = sentences ? (el[1] * 100) / sentences : "";
            const trgPercentage = sentences ? (trg[idx][1] * 100) / sentences : "";
            return (
              <tr>
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
        <tfoot></tfoot>
      </table>
    </div>
  );
}

export default BilingualTable;
