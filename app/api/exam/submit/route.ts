import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { OptionChoice, Question, ExamSet } from '@/lib/types'
import { generateCertificate } from '@/lib/certificate'

export async function POST(req: Request) {
  try {
    const { exam_id, set_id, answers, is_practice, time_taken } = await req.json()
    const supabase = createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // 2. Fetch Exam & Questions
    const [examRes, questionsRes, setRes] = await Promise.all([
      supabase.from('exams').select('*').eq('id', exam_id).single(),
      supabase.from('exam_questions').select('*').eq('exam_id', exam_id),
      set_id ? supabase.from('exam_sets').select('*').eq('id', set_id).single() : Promise.resolve({ data: null })
    ])

    if (examRes.error) throw examRes.error
    if (questionsRes.error) throw questionsRes.error

    const exam = examRes.data
    const questions = questionsRes.data as Question[]
    const examSet = setRes.data as ExamSet | null

    // 3. Calculate Score
    let score = 0
    let correctCount = 0
    let wrongCount = 0
    const totalQuestions = questions.length
    const processedAnswers: any[] = []

    questions.forEach(q => {
      const userAnswer = answers.find((a: any) => a.question_id === q.id)
      const selectedOption = userAnswer?.selected_option as OptionChoice | undefined

      if (selectedOption) {
        // If set exists, we need to map the selected option back to original
        let originalSelectedOption = selectedOption
        if (examSet) {
          // mapping[new_pos] = original_pos
          originalSelectedOption = examSet.shuffled_options_map[q.id][selectedOption]
        }

        const isCorrect = originalSelectedOption === q.correct_option
        if (isCorrect) {
          score += 1
          correctCount += 1
        } else {
          if (exam.negative_marking) {
            score -= exam.negative_value
          }
          wrongCount += 1
        }

        processedAnswers.push({
          question_id: q.id,
          selected_option: selectedOption,
          is_correct: isCorrect,
          original_selected_option: originalSelectedOption
        })
      } else {
        processedAnswers.push({
          question_id: q.id,
          selected_option: null,
          is_correct: false
        })
      }
    })

    // 4. Save Attempt - only for real exams; practice attempts are NOT saved
    let attempt: any = null
    if (!is_practice) {
      const { data: insertedAttempt, error: attemptError } = await supabase
        .from('exam_attempts')
        .insert({
          student_id: user.id,
          exam_id,
          set_id,
          is_practice: false,
          score,
          total_questions: totalQuestions,
          correct_count: correctCount,
          wrong_count: wrongCount,
          time_taken_seconds: time_taken || 0,
          started_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (attemptError) throw attemptError
      attempt = insertedAttempt

      // 5. Save Answers (only for real exam)
      const { error: answersError } = await supabase
        .from('attempt_answers')
        .insert(processedAnswers.map(pa => ({
          attempt_id: attempt.id,
          question_id: pa.question_id,
          selected_option: pa.selected_option,
          is_correct: pa.is_correct
        })))

      if (answersError) throw answersError

      // Auto-trigger certificate if course exam passed and requirements met
      if (exam.course_id && score >= 50) {
        try {
          await generateCertificate(supabase, exam.course_id, user.id)
        } catch (certErr) {
          console.error('Certificate auto-generation skipped:', certErr)
        }
      }
    } else {
      // Practice: return result without persisting
      attempt = {
        id: `practice-${Date.now()}`,
        score,
        total_questions: totalQuestions,
        correct_count: correctCount,
        wrong_count: wrongCount,
        time_taken_seconds: time_taken || 0,
        submitted_at: new Date().toISOString(),
        is_practice: true
      }
    }

    // 6. Return Result with breakdown
    return NextResponse.json({ 
      success: true, 
      data: {
        ...attempt,
        breakdown: processedAnswers
      } 
    })
  } catch (error: any) {
    console.error('Submit Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit' }, { status: 500 })
  }
}
