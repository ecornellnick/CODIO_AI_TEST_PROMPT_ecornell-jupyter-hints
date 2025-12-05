// Wrapping the whole extension in a JS function 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {

  // Use a very specific button ID to avoid any clashes with other extensions
  codioIDE.coachBot.register(
    "CODIO_AI_TEST_PROMPT_customHintsJupyter",
    "Provide a hint on what to do next",
    onButtonPress
  )

  // function called when the button is pressed
  async function onButtonPress() {
    try {
      // automatically collects all available context 
      const context = await codioIDE.coachBot.getContext()
      
      // Check if jupyter context exists
      if (!context.jupyterContext || context.jupyterContext.length === 0) {
        codioIDE.coachBot.write("No Jupyter notebook is currently open.")
        codioIDE.coachBot.showMenu()
        return
      }
      
      // select open jupyterlab notebook related context
      const openJupyterFileContext = context.jupyterContext[0]
      const jupyterFileContent = openJupyterFileContext.content
      
      // filter and map cell indices of code and markdown cells into a new array
      const markdownAndCodeCells = jupyterFileContent
        .map(({ id, ...rest }, index) => ({
          cell: index,
          ...rest
        }))
        .filter(obj => obj.type === 'markdown' || obj.type === 'code')

      // Serialize notebook context to send into the VARIABLE in the Codio prompt template
      const notebookJson = JSON.stringify(markdownAndCodeCells)

      // Reference the Codio Prompt Management template by ID
      const userPrompt = "{% prompt 'CODIO_AI_TEST_PROMPT_JUPYTER_HINT_V1' %}"

      // Ask CoachBot using the managed prompt.
      const result = await codioIDE.coachBot.ask({
        userPrompt: userPrompt,
        vars: {
          "JUPYTER_NOTEBOOK": notebookJson
        }
      })

      // In some Codio examples, ask() returns a string; in others, an object.
      // Handle both but ONLY write when we actually have content.
      let answer = null

      if (typeof result === "string") {
        answer = result
      } else if (result && typeof result.response === "string") {
        answer = result.response
      }

      if (answer) {
        codioIDE.coachBot.write(answer)
      } else {
        // Only show this if truly nothing came back.
        codioIDE.coachBot.write("I couldn't generate a hint right now. Please try again.")
      }

      codioIDE.coachBot.showMenu()

    } catch (error) {
      codioIDE.coachBot.write("An unexpected error occurred.")
      codioIDE.coachBot.showMenu()
      // Optional: log to browser console for debugging
      console.error("CoachBot error in CODIO_AI_TEST_PROMPT_customHintsJupyter:", error)
    }
  }

})(window.codioIDE, window)
