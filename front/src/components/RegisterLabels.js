import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import styles from "@/styles/RegisterLabels.module.css";
import { randDarkColor } from "../../hooks/hooks";
import { DataFormatter } from "../../hooks/hooks";

export default function RegisterLabels({ labels }) {
  const colors = [
    "#29054a",
    "#2f4850",
    "#004040",
    "#7a0000",
    "#D302f2e",
    "#5d5109",
    "#2c482c",
    "#1b336b",
    "#576c0f",
    "#655649",
    "#161449",
    "#555c33",
    "#7b645a",
    "#3f4448",
    "#440f5f",
    "#226F54",
    "#FF9B42",
    "#0FA3B1",
  ];

  const groupedLabels = Object.entries(labels).reduce((acc, [name, value]) => {
    const langCode = name.split("_")[0];
    if (!acc[langCode]) {
      acc[langCode] = [];
    }

    acc[langCode].push({ name, value });

    return acc;
  }, {});

  const groupedLabelsTotal = Object.entries(groupedLabels).map((el, idx) => {
    const summedValues = el[1].reduce((acc, cur) => acc + cur.value, 0);

    return { name: el[0], value: summedValues, fill: colors[idx] };
  });

  groupedLabelsTotal.sort((a, b) => b.value - a.value);

  const mtLabels = groupedLabelsTotal.filter(
    (el) => el.name.toLocaleLowerCase() === "mt"
  );

  const cleanTotalLabels = groupedLabelsTotal.filter(
    (el) => !el.name.toLowerCase().includes("mt")
  );

  const groupedLabelsSum = cleanTotalLabels.reduce((a, b) => a + b.value, 0);

  /// BAR CHART WITH SUBDIVISION

  const groupedLabelsTotalBarChart = Object.entries(groupedLabels)
    .filter((el) => el[0] !== "MT")
    .map((el, idx) => {
      let result = { name: el[0] };

      el[1].forEach((item, idx) =>
        !result[item.name] ? (result[item.name] = item.value) : ""
      );

      return result;
    });

  let barsArrayTest = [];

  groupedLabelsTotalBarChart.forEach((date) => {
    Object.entries(date)
      .filter((item) => {
        return item[0] != "name";
      })
      .map(([key, value]) => {
        barsArrayTest.push({
          key: key,
          value: (value / groupedLabelsSum) * 100,
        });
      });
  });

  const renderBar = (item) => (
    <Bar
      dataKey={`${item.key}`}
      percent={item.value}
      stackId="a"
      fill={randDarkColor()}
    />
  );

  const renderLegend = (props) => {
    const { payload } = props;

    return (
      <ul className={styles.legendListStacked}>
        {payload.map((entry, index) => {
          const color = entry.color;

          return (
            <li
              key={`item-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: color,
                  width: "12px",
                  height: "12px",
                  marginRight: "4px",
                }}
              ></div>
              {`${entry.value} - ${entry.payload.percent.toFixed(1)}%`}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <h2>Register labels</h2>
      <div
        style={{
          width: "100%",
          height: "455px",
          display: "flex",
          alignItems: "flex-start",
          marginBottom: "30px",
        }}
      >
        <ResponsiveContainer width={850} height={400}>
          <PieChart>
            <Pie
              data={groupedLabelsTotal}
              dataKey="value"
              nameKey="name"
              fill="#8884d8"
              legendType="circle"
              paddingAngle={1}
              minAngle={1}
              cx={"33%"}
              outerRadius={200}
            />
            <Tooltip />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              margin={{ top: 12, left: 60, right: 0, bottom: 12 }}
              formatter={(value, entry, index) => {
                return (
                  <span
                    className={styles.legendText}
                    style={{
                      marginBottom: "5px",
                      marginTop: "5px",
                      display: "inline-block",
                    }}
                  >{`${value} - ${(entry.payload.percent * 100).toFixed(
                    2
                  )}%`}</span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <ResponsiveContainer width={"100%"} height={400}>
          <BarChart
            data={groupedLabelsTotalBarChart}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 5,
            }}
            style={{ stroke: "#fff", strokeWidth: 1 }}
            legendType="circle"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={DataFormatter} />
            <Tooltip />
            <Legend
              content={renderLegend}
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />
            {barsArrayTest
              .sort(function (a, b) {
                var textA = a.key.toUpperCase();
                var textB = b.key.toUpperCase();
                return textA < textB ? -1 : textA > textB ? 1 : 0;
              })
              .map((key) => {
                return renderBar(key);
              })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
