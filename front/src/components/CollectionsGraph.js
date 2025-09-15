import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { randDarkColor, numberFormatter } from "../lib/helpers";
import styles from "@/styles/CollectionsGraph.module.css";

const CustomTooltip = ({ active, payload, label, totalValue }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltip} style={{ zIndex: 30000 }}>
                {payload.map((item, idx) => {
                    return (
                        <>
                            <p key={idx} className={styles.label} >
                                {item.name}
                            </p>
                            <p key={idx} className={styles.desc} style={{ marginBottom: "20px" }} >
                                {item.value.toLocaleString("en-US")} documents <span style={{ fontWeight: 600 }}>({parseFloat((item.value * 100) / totalValue).toFixed(2)}%)</span>
                            </p>
                            {item.payload.others &&
                                item.name.includes("Others") &&
                                <div className={styles.breakdown}>
                                    <p className={styles.label} >
                                        Breakdown
                                    </p>
                                    <div className={styles.othersCont}>
                                        {item.payload.others.map((other) => {
                                            return (
                                                <p>{`${other.token} - ${other.freq.toLocaleString("en-US")}`} <span style={{ fontWeight: 600 }}>({((other.freq * 100) / totalValue).toFixed(2)}%)</span></p>
                                            );
                                        })}
                                    </div>
                                </div>}
                        </>
                    );
                })}
            </div>
        );
    }
};

export default function CollectionsGraph({ collection, docs }) {

    const values = collection.reduce((acc, item) => {

        const processedItem = {
            token: item[0],
            freq: item[1],
            fill: randDarkColor()
        };
        acc.processedItems.push(processedItem);

        if (item[0].toLowerCase().includes("cc")) {
            acc.ccTotal += item[1];
        } else {
            if (!item[0].toLowerCase().includes("unk")) {
                acc.iaTotal += item[1];

            }
        }

        acc.totalValue += item[1];

        return acc;
    }, {
        totalValue: 0,
        ccTotal: 0,
        iaTotal: 0,
        processedItems: []
    });

    const { totalValue, ccTotal, iaTotal, processedItems } = values;

    const others = processedItems.filter((el) => parseFloat((el.freq * 100) / totalValue).toFixed(2) < 10);

    const othersCount = others.length;

    const final = others.reduce((a, b) => {
        return a + +b.freq;
    }, 0);

    const newCollection = processedItems.filter((el) => parseFloat((el.freq * 100) / totalValue).toFixed(2) > 10);

    if (others.length) {
        newCollection.push({
            token: `${othersCount} Others`,
            freq: final,
            fill: "gray",
            others: [...others],
        });
    }

    const ccPerc = (ccTotal / totalValue) * 100;
    const iaPerc = (iaTotal / totalValue) * 100;

    return (
        <div className={styles.collectionsContainer}>
            <h3>{docs ? "Document collections" : "Collections"}</h3>
            <div className={styles.title}>
                <div className={styles.collectionsPercCont}>
                    <p>CC = {ccPerc.toFixed(2)}%</p>
                    <p>IA = {iaPerc.toFixed(2)}%</p>
                </div>
            </div>
            <div className={styles.collectionsGraph}>
                <ResponsiveContainer width="100%" height="100%" aspect={1.6}>
                    <PieChart width={300} height={300}>
                        <Pie
                            dataKey="freq"
                            isAnimationActive={false}
                            data={newCollection}
                            cx={200}
                            cy={120}
                            nameKey="token"
                            outerRadius={70}
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
                                        {numberFormatter(value)}
                                        )
                                    </text>
                                );
                            }}
                        />
                        <Tooltip
                            content={<CustomTooltip totalValue={totalValue} />}
                            wrapperStyle={{ outline: "none" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
