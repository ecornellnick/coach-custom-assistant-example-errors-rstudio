// Wrapping the whole extension in a JS function 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {
  
   const systemPrompt = `You are a helpful assistant helping students understand programming error messages.

You will be provided with a programming error message in the <error_message> tag.

- Carefully review the <assignment> and <code>, if provided, to understand the context of the error
- Explain what is causing the error, without suggesting any potential fixes or solutions in markdown format
- If relevant, mention any common misconceptions that may be contributing to the student's error
- When referring to code in your explanation, use markdown syntax - wrap inline code with \` and
multiline code with \`\`\`
  `
  
  // register(id: unique button id, name: name of button visible in Coach, function: function to call when button is clicked) 
  codioIDE.coachBot.register("customErrorExplanationRStudio", "Explain this R error!", onButtonPress)

  // function called when I have a question button is pressed
  async function onButtonPress() {

    // Function that automatically collects all available context 
    // returns the following object: {guidesPage, assignmentData, files, error}
    let context = await codioIDE.coachBot.getContext()
    console.log(context)

    let filetree = await codioIDE.files.getStructure()
    console.log(filetree)

    function getFilesWithExtension(obj, extension) {
        const files = [];

        function traverse(obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'object') {
                    traverse(obj[key]);
                } else if (obj[key] === 1 && key.toLowerCase().endsWith(extension)) {
                    files.push(key);
                }
                }
        }

        traverse(obj);
        return files;
    }

    const files = getFilesWithExtension(filetree, '.rmd')
    console.log(files);

    // const fileContent = await codioIDE.files.getFileContent(files[0])
    // console.log(fileContent)
    

    try {
        input = await codioIDE.coachBot.input("Please paste the error message you want me to explain!")
    } catch (e) {
         if (e.message == "Cancelled") 
            codioIDE.coachBot.write("Please feel free to have any other error messages explained!")
            codioIDE.coachBot.showMenu()
            return
    }

    const valPrompt = `<Instructions>

Please determine whether the following text appears to be a programming error message or not:

<text>
${input}
</text>

Output your final Yes or No answer in JSON format with the key 'answer'

Focus on looking for key indicators that suggest the text is an error message, such as:

- Words like "error", "exception", "stack trace", "traceback", etc.
- Line numbers, file names, or function/method names
- Language that sounds like it is reporting a problem or issue
- Language that sounds like it is providing feedback
- Technical jargon related to coding/programming

If you don't see clear signs that it is an error message, assume it is not. Only answer "Yes" if you are quite confident it is an error message. 
If it is not a traditional error message, only answer "Yes" if it sounds like it is providing feedback as part of an automated grading system.

</Instructions>`
    
    
    const validation_result = await codioIDE.coachBot.ask({
        systemPrompt: "You are a helpful assistant.",
        userPrompt: valPrompt
    }, {stream:false, preventMenu: true})

    if (validation_result.result.includes("Yes")) {
        //Define your assistant's userPrompt - this is where you will provide all the context you collected along with the task you want the LLM to generate text for.
        const userPrompt = `Here is the error message:

<error_message>
${input}
</error_message>
 Here is the description of the programming assignment the student is working on:

<assignment>
${context.guidesPage.content}
</assignment>

Here are the student's code files:

<code>

</code> 

If <assignment> and <current_code> are empty, assume that they're not available. 
With the available context, follow the guidelines and respond with either the teacher written explanation or your own if it doesn't match any <generalized_errors>

If generating your own explanation, make sure it is not longer than 2-3 sentences, and double check that it does not suggest any fixes or solutions. 
The explanation should only describe the cause of the error. Do not tell the student whether or not it matches. Just provide the explanation in either case only.`

      const result = await codioIDE.coachBot.ask({
        systemPrompt: systemPrompt,
        messages: [{"role": "user", "content": userPrompt}]
      })
    }
    else {
        codioIDE.coachBot.write("This doesn't look like an error. I'm sorry, I can only help you by explaining programming error messages.")
        codioIDE.coachBot.showMenu()
    }
  }

})(window.codioIDE, window)
 

  
  
