import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { interviewer } from "@/constants";

const jobExamplePompt = `Prepare questions for a job interview
Job description:
University Admissions Officer
📍 Location: Remote / On-site
📅 Job Type: Full-time
💰 Salary: Competitive

About the Role
We are seeking a detail-oriented and customer-focused Admissions Officer to join our team. You will be responsible for managing student applications, evaluating qualifications, and guiding prospective students through the admissions process.

Key Responsibilities
✅ Review and evaluate student applications based on university criteria
✅ Communicate with prospective students via email, phone, and video calls
✅ Conduct interviews to assess candidate eligibility
✅ Maintain accurate student records and ensure compliance with admission policies
✅ Collaborate with marketing and recruitment teams to attract top talent
✅ Provide support for campus visits, orientation programs, and recruitment events

Required Qualifications
🎓 Bachelor's degree in Education, Business Administration, or a related field
📅 2+ years of experience in university admissions or student services
💬 Strong communication and interpersonal skills
🖥️ Proficiency in CRM and student management systems
🌍 Multilingual candidates (English, French, Spanish) are a plus

Preferred Skills
⭐ Experience in international student admissions
⭐ Knowledge of scholarship and financial aid processes
⭐ Ability to work in a fast-paced, deadline-driven environment

Why Join Us?
🚀 Be part of an innovative team transforming higher education
🌎 Work with students from diverse backgrounds
📚 Professional development opportunities
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]
Number of questions shouldn't be more than 5.
`

// `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]
        
//         Thank you! <3
//     `,
export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid,  experiences} = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: jobExamplePompt + `\n heres are user experiences ${experiences}`,
    });


    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("interview", interview);
    await db.collection("interviews").add(interview);

    return Response.json({ success: true, questions: questions }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
