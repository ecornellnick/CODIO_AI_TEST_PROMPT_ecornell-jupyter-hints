TODO: Add details how this works in the new Codio AI Prompt

# ecornell-jupyter-hints

This assistant mirrors the functionality of the native hints assistant with the following customizations:

#### Prompt modifications
- Both system and user prompts have slight changes for jupyter specific context setting.


#### Open guide pages are screened out of the context
- This can be verified by checking the `userPrompt` variable - we've **removed** the following snippet that would pass the open guide page as context

    ```
    <assignment>
    ${context.guidesPage.content}
    </assignment>
    ```

#### Passing markdown and code cell types as student file context
- comments in `index.js` walk through how we select and filter the code and markdown cell content of the open Jupyterlab notebook.
- this is then passed as context (in the `userPrompt` variable)
