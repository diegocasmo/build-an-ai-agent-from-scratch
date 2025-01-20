import { addMessages, getMessages, saveToolResponse } from './memory'
import { runLLM } from './llm'
import { showLoader, logMessage } from './ui'
import { runTool } from './toolRunner'

export const runAgent = async ({
  userMessage,
  tools,
}: {
  userMessage: string
  tools: any[]
}) => {
  await addMessages([{ role: 'user', content: userMessage }])

  const loader = showLoader('Thinking... 🤔')

  while (true) {
    const history = await getMessages()
    const response = await runLLM({ messages: history, tools })

    await addMessages([response])

    logMessage(response)

    if (response.content) {
      loader.stop()
      return getMessages()
    }

    if (response.tool_calls) {
      const toolCall = response.tool_calls[0]
      loader.update(`executing tool: ${toolCall.function.name}`)
      const toolResponse = await runTool(toolCall, userMessage)
      await saveToolResponse(toolCall.id, toolResponse)
      loader.update(`executed tool: ${toolCall.function.name}`)
    }
  }
}
