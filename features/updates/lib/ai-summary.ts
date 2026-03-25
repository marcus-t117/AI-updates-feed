import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// Generate a concise AI summary for a feed item using title + existing description.
// Returns null silently on any error so sync never fails due to summarization.
export async function generateSummary(
  title: string,
  description: string | null
): Promise<string | null> {
  try {
    const input = description
      ? `Title: ${title}\n\nContext: ${description}`
      : `Title: ${title}`

    const message = await client.messages.create(
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [
          {
            role: 'user',
            content: `Write a concise 1-2 sentence summary of this AI/tech news item. Be specific about what is new or noteworthy. Output only the summary, no preamble or quotes.\n\n${input}`,
          },
        ],
      },
      { timeout: 8000 }
    )

    const block = message.content[0]
    return block.type === 'text' ? block.text.trim() : null
  } catch {
    return null
  }
}
