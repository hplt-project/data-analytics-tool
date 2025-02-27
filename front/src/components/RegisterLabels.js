import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import styles from "@/styles/RegisterLabels.module.css";

export default function RegisterLabels({ labels }) {
  const colors = [
    "#004E64",
    "#00A5CF",
    "#25A18E",
    "#00BFB3",
    "#D4CB92",
    "#800E13",
    "#9A998C",
    "#1E2019",
    "#1E2019",
    "#558564",
    "#473144",
    "#AF1B3F",
    "#2D2E2E",
    "#B68F40",
    "#DA2C38",
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

  const mtLabels = groupedLabelsTotal.filter(
    (el) => el.name.toLocaleLowerCase() === "mt"
  );

  const cleanTotalLabels = groupedLabelsTotal.filter(
    (el) => !el.name.toLowerCase().includes("mt")
  );

  const groupedLabelsSum = cleanTotalLabels.reduce((a, b) => a + b.value, 0);

  const biggerGroupedLabels = cleanTotalLabels.filter(
    (el) => (el.value / groupedLabelsSum) * 100 >= 10
  );

  const otherGroupedLabels = cleanTotalLabels.filter(
    (el) => (el.value / groupedLabelsSum) * 100 < 10
  );

  const otherGroupedLabelsTotal = otherGroupedLabels.reduce(
    (a, b) => {
      a.value += b.value;

      return a;
    },
    { name: "OTHER", value: 0, fill: "#666666" }
  );

  biggerGroupedLabels.push(otherGroupedLabelsTotal);

  const formattedLabels = Object.entries(groupedLabels)
    .map((el) => {
      const summedValues = el[1].reduce((acc, cur) => acc + cur.value, 0);

      const other = (summedValues / groupedLabelsSum) * 100 < 10;

      const item = Object.entries(el[1]).map((element, idx) => {
        const fillColor = groupedLabelsTotal.find((el) =>
          element[1].name.includes(el.name)
        );

        return {
          name: other ? `OTHER_${element[1].name}` : element[1].name,
          value: element[1].value,
          perc: (element[1].value / groupedLabelsSum) * 100,
          fill: fillColor.fill,
        };
      });
      return item;
    })
    .flat();

  const cleanLabels = formattedLabels.filter(
    (el) => el && !el.name.toLowerCase().includes("mt")
  );

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    startAngle,
    endAngle,
    innerRadius,
    name,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const diffAngle = endAngle - startAngle;
    const delta = (360 - diffAngle) / 15 - 1;
    const radius = innerRadius + (outerRadius - innerRadius);
    const x = cx + (radius + delta) * Math.cos(-midAngle * RADIAN);
    const y = cy + (radius + delta * delta) * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontWeight="normal"
      >
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  return (
    <div className={styles.registerLabelsGraph}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            label={renderCustomizedLabel}
            data={cleanTotalLabels}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={130}
            fill="#8884d8"
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pv" stackId="a" fill="#8884d8" />
          <Bar dataKey="uv" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
