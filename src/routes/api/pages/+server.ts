import { error, json, type RequestHandler } from "@sveltejs/kit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type PageResults } from "$lib/types";

import { GEMINI_KEY } from "$env/static/private";

export const GET: RequestHandler = async ({ url }) => {
    let description = url.searchParams.get("description");

    if (!description || description.length > 160 || description.trim().length <= 0) {
        error(400, "Invalid Description.");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Given a brief description about a person, you can guess what experiences 
    and events that person has gone through in his or her life. I will give you a person's 
    description and I need you to generate 5 to 6 Wikipedia styled section titles that will be 
    used in that person's Wikipedia page. Be unique and creative. Since these titles will be used 
    to tell the person's story, they must follow a chronological order, starting from that person's 
    childhood up until their death, although in some cases they may still be alive. It is extremely 
    important that you keep the titles short, concise and straight to the point, no more than 5 words. 
    Do not include chapter descriptions or any type of help text, I just want a list of the titles texts. 
    Do not use any placeholders for the person's information in the results. Give me the results as 
    one string value using a pipe | character to separate each title. If you are not able to generate a 
    response in the requested format, you will simply respond with a message saying "NOT OKAY". 
    Knowing all that, here is the person's description: ${description.trim()}`;

    const result = await model.generateContent(prompt);
        
    if (result.response.candidates && result.response.candidates.length > 0) {
        if (result.response.candidates[0].finishReason === "SAFETY") {
            error(400, { message: "Pease do not type anything inappropiate." });
        }
    }
    
    const resultText = result.response.text().replace("\n", "").trim();

    if (resultText === "NOT OKAY") {
        error(400, "Could not generate your results using the provided description. Please follow the example in the textbox above.");
    }

    let pageResults: PageResults = {
        titles: resultText.split("|").map(title => title.trim()).filter(title => title.length > 0)
    };

    return json(pageResults);
};