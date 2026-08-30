
const fs = require('fs');


module.exports = quizData;


// Helper to strip HTML tags, non-breaking spaces, and optional option letters
function cleanText(textStr, isOption = false) {
  if (!textStr) return '';

  let cleaned = textStr
    // Safely remove HTML tags without destroying math inequalities like < or >
    // This looks for an opening bracket followed immediately by a letter or a forward slash
    .replace(/<\/?\s*[a-zA-Z][^>]*>/g, '')
    // Replace non-breaking spaces
    .replace(/&nbsp;/g, ' ')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();

  // If this is an option, remove the hardcoded "a)", "b)", etc. from the start
  if (isOption) {
    cleaned = cleaned.replace(/^[a-zA-Z][.)]\s*/, '');
  }

  return cleaned;
}

function getOptionLetter(options, optionId) {
  const index = options.findIndex(opt => opt._id === optionId);

  if (index === -1) {
    return null;
  }

  return String.fromCharCode(97 + index); // 0 -> a, 1 -> b, 2 -> c...
}

function extractUsefulBits() {
  try {
    const fileData = fs.readFileSync('data.json', 'utf8');
    const json = JSON.parse(fileData);

    const attempts = json.data || [];
    const responses = attempts[0]?.responses || [];

    const cleanedQuestions = responses.map((r, index) => {
      const qData = r.questionData || {};
      const options = qData.options || [];

      // Get selected and correct answer letters
      const userAnswer = getOptionLetter(options, r.answer);

      const correctOption = options.find(
        opt => opt.isCorrect === true
      );

      const correctAnswer = correctOption
        ? getOptionLetter(options, correctOption._id)
        : null;

      return {
        questionNo: index + 1,

        question: cleanText(qData.question),

        options: options.map(opt =>
          cleanText(opt.text,true)
        ),

        userAnswer: userAnswer,

        correctAnswer: correctAnswer,

        isCorrect: r.isCorrect ?? (
          r.answer === correctOption?._id
        )
      };
    });

    fs.writeFileSync(
      'cleaned_data.json',
      JSON.stringify(cleanedQuestions, null, 2),
      'utf8'
    );

    console.log(
      `Extracted ${cleanedQuestions.length} questions to cleaned_data.json`
    );

  } catch (error) {
    console.error(
      'Error processing file:',
      error.message
    );
  }
}

extractUsefulBits();
