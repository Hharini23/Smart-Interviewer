import Groq from 'groq-sdk';
import { supabase } from '../config/supabaseClient.js';
import crypto from 'crypto';

// Controller to handle generating questions
export const generateQuestions = async (req, res) => {
  try {
    const { role, experienceLevel, type } = req.body;
    
    // Validate inputs
    if (!role || !experienceLevel || !type) {
      return res.status(400).json({ message: 'Please provide role, experienceLevel, and type' });
    }

    if (!process.env.GROQ_API_KEY) {
       return res.status(500).json({ message: 'GROQ_API_KEY is not configured in backend!' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const prompt = `You are an expert ${type} interviewer. Generate exactly 15 relevant interview questions for a ${role} with ${experienceLevel} level of experience. Output the questions strictly as a JSON array of strings. Do not include markdown formatting or any other text.`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });

    let textResponse = completion.choices[0]?.message?.content;
    
    // Clean up basic markdown blocks if Groq returns them
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    
    let questionsText;
    try {
      questionsText = JSON.parse(textResponse);
      if (!Array.isArray(questionsText)) {
          // Fallback if LLM wraps the array inside an object e.g., { questions: [] }
          questionsText = questionsText.questions || Object.values(questionsText)[0];
      }
    } catch (e) {
      console.error("Error parsing Groq response:", textResponse);
      return res.status(500).json({ message: 'Failed to generate valid JSON questions.' });
    }
    
    const questions = questionsText.map(q => ({ 
      _id: crypto.randomUUID(), 
      question: q,
      answer: '',
      feedback: null
    }));

    // Insert to Supabase DB
    const { data: interview, error } = await supabase
       .from('interviews')
       .insert([
         {
           role,
           experienceLevel,
           type,
           questions,
           overallScore: 0
         }
       ])
       .select()
       .single();

    if (error) throw error;

    // Add back _id to match mongoose schema response behavior
    interview._id = interview.id;

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error in generateQuestions:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Controller to handle evaluating a specific answer
export const evaluateAnswer = async (req, res) => {
  try {
    const { interviewId, questionId, answer } = req.body;
    
    const { data: interview, error: fetchError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();
    
    if (fetchError || !interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const questionIndex = interview.questions.findIndex(q => q._id === questionId);
    
    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Question not found in this interview' });
    }

    const questionObj = interview.questions[questionIndex];
    questionObj.answer = answer;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const prompt = `You are evaluating an interview candidate.
    Role: ${interview.role}
    Level: ${interview.experienceLevel}
    Question asked: "${questionObj.question}"
    Candidate's answer: "${answer}"
    
    Evaluate the candidate's answer based on the following criteria out of 100:
    1. Relevance Score (0-100)
    2. Confidence Score (0-100) (judge based on language and phrasing)
    3. Clarity Score (0-100)
    
    Also, identify the keywords they successfully hit (as an array of strings).
    Provide actionable improvements as a string.
    
    Output strictly as a JSON object with this shape:
    {
      "relevanceScore": 80,
      "confidenceScore": 85,
      "clarityScore": 90,
      "keywordsHit": ["keyword1", "keyword2"],
      "improvements": "Suggest how to structure the answer better."
    }
    IMPORTANT RULES: 
    1. Do NOT include any markdown wrappers or code blocks like \`\`\`json.
    2. The raw JSON MUST NOT contain any unescaped new line characters inside string values. Keep response text short and on a single continuous string.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });
    
    let textResponse = completion.choices[0]?.message?.content;
    
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    }

    const feedback = JSON.parse(textResponse);
    questionObj.feedback = feedback;
    
    interview.questions[questionIndex] = questionObj;
    
    let totalScore = 0;
    let evalCount = 0;
    interview.questions.forEach(q => {
      if (q.feedback && q.feedback.relevanceScore > 0) {
        totalScore += (q.feedback.relevanceScore + q.feedback.confidenceScore + q.feedback.clarityScore) / 3;
        evalCount++;
      }
    });
    
    let overallScore = interview.overallScore;
    if (evalCount > 0) {
       overallScore = totalScore / evalCount;
    }

    const { data: updatedInterview, error: updateError } = await supabase
       .from('interviews')
       .update({ questions: interview.questions, overallScore })
       .eq('id', interviewId)
       .select()
       .single();

    if (updateError) throw updateError;
    
    res.json({ question: questionObj, overallScore: updatedInterview.overallScore, _id: updatedInterview.id });
  } catch (error) {
    console.error('Error in evaluateAnswer:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const getInterviewResult = async (req, res) => {
  try {
    const { data: interview, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', req.params.id)
        .single();
    
    if (error || !interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    interview._id = interview.id;
    
    res.json(interview);
  } catch (error) {
    console.error('Error fetch results:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
