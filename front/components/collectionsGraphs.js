import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import styles from "@/styles/CollectionsGraph.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.label}>{label}</p>
        {payload.map((item, idx) => {
          return (
            <>
              <p key={idx} className={styles.desc} style={{ color: item.fill }}>
                {`${item.name} - (${item.value.toLocaleString("en-US")})`}
              </p>
              {item.payload.perc && (
                <p
                  key={idx}
                  className={styles.perc}
                  style={{ color: item.fill }}
                >{`% of total:   ${item.payload.perc} %`}</p>
              )}
              {item.payload.others &&
                item.name.includes("Others") &&
                item.payload.others.map((other) => {
                  return (
                    <div>
                      <p
                        className={styles.singleOther}
                      >{`${other.token} - ${other.freq} - (${other.perc}%)`}</p>
                    </div>
                  );
                })}
            </>
          );
        })}
      </div>
    );
  }
};

export default function CollectionsGraph({ collection, total }) {
  const others = collection.filter((el) => +el.perc < 10);

  const othersCount = others.length;

  const final = others.reduce((a, b) => {
    return a + +b.freq;
  }, 0);

  const newCollection = collection.filter((el) => +el.perc > 10);

  if (others.length) {
    newCollection.push({
      token: `${othersCount} Others`,
      freq: final,
      perc: parseFloat((final * 100) / total).toFixed(2),
      fill: "gray",
      others: [...others],
    });
  }

  const ccOnly = collection
    .filter((el) => el.token.includes("cc"))
    .reduce((a, b) => a + b.freq, 0);
  const iaOnly = collection
    .filter((el) => !el.token.includes("cc"))
    .reduce((a, b) => a + b.freq, 0);

  const ccPerc = (ccOnly / total) * 100;
  const iaPerc = (iaOnly / total) * 100;

  return (
    <div className={styles.collectionsContainer}>
      <div className={styles.collectionsPercCont}>
        <p>CC = {ccPerc.toFixed(2)}%</p>
        <p>IA = {iaPerc.toFixed(2)}%</p>
      </div>
      <div className={styles.collectionsGraph}>
        <ResponsiveContainer width="100%" height="100%" aspect={1.6}>
          <PieChart width={400} height={300}>
            <Pie
              dataKey="freq"
              isAnimationActive={false}
              data={newCollection}
              cx={180}
              cy={130}
              nameKey="token"
              outerRadius={60}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                value,
                index,
              }) => {
                const RADIAN = Math.PI / 180;
                // eslint-disable-next-line
                const radius = 25 + innerRadius + (outerRadius - innerRadius);
                // eslint-disable-next-line
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                // eslint-disable-next-line
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill={newCollection[index].fill}
                    fontWeight={600}
                    fontSize={12}
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                  >
                    {newCollection[index].token} (
                    {Intl.NumberFormat("en", {
                      notation: "compact",
                    }).format(value)}
                    )
                  </text>
                );
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
