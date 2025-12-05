// Wrapping the whole extension in a JS function 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {

  // register(id: unique button id, name: name of button visible in Coach, function: function to call when button is clicked) 
  codioIDE.coachBot.register("customHintsJupyter", "Provide a hint on what to do next", onButtonPress)

  // function called when I have a question button is pressed
  async function onButtonPress() {
    try {
      // automatically collects all available context 
      let context = await codioIDE.coachBot.getContext()
      
      // Check if jupyter context exists
      if (!context.jupyterContext || context.jupyterContext.length === 0) {
        codioIDE.coachBot.write("No Jupyter notebook is currently open")
        codioIDE.coachBot.showMenu()
        return
      }
      
      // select open jupyterlab notebook related context
      let openJupyterFileContext = context.jupyterContext[0]
      let jupyterFileName = openJupyterFileContext.path
      let jupyterFileContent = openJupyterFileContext.content
      
      // filter and map cell indices of code and markdown cells into a new array
      const markdownAndCodeCells = jupyterFileContent.map(
          ({ id, ...rest }, index) => ({
                cell: index,
              ...rest
          })).filter(
              obj => obj.type === 'markdown' || obj.type === 'code'
          )

      const systemPrompt = `You are an assistant helping students understand and make progress themselves on their programming assignments. 
You will be provided with the jupyter notebook they're working in.
Based on this information, provide only 1 relevant hint or idea for things they can try next to make progress.
Do not provide the full solution. 
Do not ask if they have any other questions.
      `
          
      const userPrompt = `Here is the student's jupyter notebook:

<code>
${JSON.stringify(markdownAndCodeCells)}
</code> 

If <code> is empty, assume that it's not available. 

Phrase your hints directly addressing the student as 'you'.
Phrase your hints as questions or suggestions.
`

      try {
        const result = await codioIDE.coachBot.ask({
            systemPrompt: systemPrompt,
            messages: [{"role": "user", "content": userPrompt}]
        })
        // Handle the result
        if (result && result.response) {
          codioIDE.coachBot.write(result.response)
        }
      } catch (apiError) {
        codioIDE.coachBot.write("An error occurred while processing your request")
        codioIDE.coachBot.showMenu()
      }

    } catch (error) {
      codioIDE.coachBot.write("An unexpected error occurred")
      codioIDE.coachBot.showMenu()
    }
  }

})(window.codioIDE, window)
