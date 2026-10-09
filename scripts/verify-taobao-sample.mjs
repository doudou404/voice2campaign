import fs from "node:fs";

const csv = fs.readFileSync(new URL("../test-data/taobao-owala-reviews.csv", import.meta.url), "utf8");

function parseCsvRow(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }
  fields.push(field);
  return fields;
}

const reviews = csv
  .replace(/^\uFEFF/, "")
  .split(/\r?\n/)
  .slice(0, 501)
  .map((line) => parseCsvRow(line).at(-1)?.trim() || "")
  .filter((line, index) => index > 0 || !/评论|内容|review|comment/i.test(line))
  .map((line) => line.trim())
  .filter(Boolean);

const dimensions = [
  { name: "便携性", words: ["轻", "便携", "携带", "体积小", "不占", "出差", "通勤"] },
  { name: "清洁体验", words: ["清洗", "果渣", "冲", "干净"] },
  { name: "性能效果", words: ["动力", "细", "效果", "速度", "两分钟"] },
  { name: "外观设计", words: ["颜值", "好看", "设计", "做工"] },
  { name: "续航能力", words: ["续航", "充电", "电量"] },
  { name: "声音体验", words: ["声音", "噪音", "吵"] },
  { name: "价格价值", words: ["价格", "贵", "性价比"] },
  { name: "操作体验", words: ["操作", "双击", "简单", "学习成本"] },
  { name: "密封防漏", words: ["密封", "防漏", "漏水", "不漏"] },
  { name: "饮用体验", words: ["吸管", "杯口", "双饮", "直饮", "圆润"] },
  { name: "容量空间", words: ["容量", "大容量", "装得多", "容纳"] },
  { name: "保温保冷", words: ["保温", "保冷", "冰水", "温度"] },
];

const positiveWords = ["方便", "不错", "很好", "简单", "干净", "安心", "喜欢", "好看", "很细", "高", "快"];
const negativeWords = ["一般", "贵", "声音大", "体积大", "太大", "吵", "藏", "需要", "偏小", "漏", "麻烦", "不足", "问题"];
const scoreText = (text) => {
  const positive = positiveWords.filter((word) => text.includes(word)).length;
  const negative = negativeWords.filter((word) => text.includes(word)).length;
  return positive > negative ? "positive" : negative > positive ? "negative" : "neutral";
};

const sentiment = reviews.map(scoreText);
const themes = dimensions
  .map((dimension) => ({
    name: dimension.name,
    count: reviews.filter((review) => dimension.words.some((word) => review.includes(word))).length,
  }))
  .filter((item) => item.count > 0)
  .sort((a, b) => b.count - a.count);

console.log(JSON.stringify({
  parsedReviews: reviews,
  total: reviews.length,
  positive: sentiment.filter((item) => item === "positive").length,
  neutral: sentiment.filter((item) => item === "neutral").length,
  negative: sentiment.filter((item) => item === "negative").length,
  themes,
  conclusion: reviews.length < 10 ? "样本量过小，只能验证流程，不能形成稳定营销结论" : "可用于初步洞察",
}, null, 2));
