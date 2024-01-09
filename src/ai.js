import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-pro-vision";
const API_KEY = "AIzaSyCX2yVk_3UqMP53ufeJR_0IDDZS7U-tE10";

async function run() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.2,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  if (!fs.existsSync("image0.png")) {
    throw new Error("Could not find images in current directory.");
  }

  const parts = [
    {
      inlineData: {
        mimeType: "image/png",
        data: Buffer.from(fs.readFileSync("image0.png")).toString("base64"),
      },
    },
    { text: "\nGive me the following information in object format \n{\nhighestDegree:\ngraduationDegree:\ncollegeOfGraduation:\ngraduationDate:\n}" },
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  const data = JSON.parse(response.text());
  return data;
}
const eductaion = await run();
