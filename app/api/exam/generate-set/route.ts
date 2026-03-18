import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { OptionChoice } from '@/lib/types'

// Fisher-Yates Shuffle
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export async function POST(req: Request) {
  try {
    const { exam_id, set_number } = await req.json()
    const supabase = createClient()

    // 1. Fetch all questions
    const { data: questions, error: fetchError } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', exam_id)
      .order('order_index', { ascending: true })

    if (fetchError) throw fetchError
    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this exam' }, { status: 400 })
    }

    // 2. Shuffle question order
    const shuffledQuestionIds = shuffle(questions.map(q => q.id))

    // 3. Shuffle options for each question
    const shuffledOptionsMap: Record<string, Record<OptionChoice, OptionChoice>> = {}
    const options: OptionChoice[] = ['a', 'b', 'c', 'd']

    questions.forEach(q => {
      const shuffledOptions = shuffle(options)
      const mapping: Record<string, OptionChoice> = {}
      
      // mapping[new_position] = original_position
      shuffledOptions.forEach((originalPos, index) => {
        const newPos = options[index]
        mapping[newPos] = originalPos
      })

      shuffledOptionsMap[q.id] = mapping as Record<OptionChoice, OptionChoice>
    })

    // 4. Store in exam_sets
    const { data: examSet, error: insertError } = await supabase
      .from('exam_sets')
      .upsert({
        exam_id,
        set_number,
        shuffled_question_order: shuffledQuestionIds,
        shuffled_options_map: shuffledOptionsMap,
      }, { onConflict: 'exam_id,set_number' })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ success: true, data: examSet })
  } catch (error: any) {
    console.error('Generate Set Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate set' }, { status: 500 })
  }
}
