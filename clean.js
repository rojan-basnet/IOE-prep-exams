const fs = require('fs');

const inputFile = 'exam1.json';
const outputFile = 'exam1_cleaned.json';

// Matches[cite: 1],,[cite: 1], etc.
const citationRegex =  /\[cite:\s*\d+\]/gi;

try {
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const quizData = JSON.parse(rawData);

    // 2. Helper function to clean text
    function removeCitations(text) {
        if (typeof text !== 'string') return text;
        return text
            .replace(citationRegex, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // 3. Recursively walk through objects and arrays to clean all string fields
    function cleanData(data) {
        if (Array.isArray(data)) {
            return data.map(cleanData);
        } else if (typeof data === 'object' && data !== null) {
            const cleanedObj = {};
            for (const key in data) {
                cleanedObj[key] = cleanData(data[key]);
            }
            return cleanedObj;
        } else if (typeof data === 'string') {
            return removeCitations(data);
        }
        return data;
    }

    // 4. Process data and write output
    const cleanedQuizData = cleanData(quizData);
    fs.writeFileSync(outputFile, JSON.stringify(cleanedQuizData, null, 2), 'utf8');

    console.log(`Successfully cleaned "${inputFile}" and saved output to "${outputFile}"!`);

} catch (error) {
    console.error('Error processing the JSON file:', error.message);
}