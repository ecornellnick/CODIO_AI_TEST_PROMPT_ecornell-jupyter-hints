// Wrapping the whole extension in a JS function 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {

  // register(id: unique button id, name: name of button visible in Coach, function: function to call when button is clicked) 
  codioIDE.coachBot.register(
    "customHintsJupyter",
    "Provide a hint on what to do next",
    onButtonPress
  )

  // function called when I have a question button is pressed
  async function onButtonPress() {
    try {
      // automatically collects all available context 
      const context = await codioIDE.coachBot.getContext()
      
      // Check if jupyter context exists
      if (!context.jupyterContext || context.jupyterContext.length === 0) {
        codioIDE.coachBot.write("No Jupyter notebook is currently open")
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

      // No instructional text here – everything lives in the managed prompt
      const result = await codioIDE.coachBot.ask({
        userPrompt: userPrompt,
        vars: {
          "JUPYTER_NOTEBOOK": notebookJson
        }
      })

      // Handle the result
      if (result && result.response) {
        codioIDE.coachBot.write(result.response)
      } else {
        codioIDE.coachBot.write("I couldn't generate a hint right now.")
      }

    } catch (error) {
      codioIDE.coachBot.write("An unexpected error occurred")
      codioIDE.coachBot.showMenu()
    }
  }

})(window.codioIDE, window)
