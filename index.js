// Wrapping the whole extension in a JS function 
// (ensures all global variables set in this extension cannot be referenced outside its scope)
(async function(codioIDE, window) {
  
   const systemPrompt = `You will be given a programming error message. Your task is to explain in plain, non-technical English what is causing the error, without suggesting any potential fixes or solutions.

If provided with the programming assignment and the student's current code state, please carefully review them before explaining the error message.

Note that information about common misconceptions should also be included to provide a full explanation.

When referring to code in your explanation, please use markdown syntax. Wrap inline code with \` and multiline code with \`\`\`. 
  `
  
  // register(id: unique button id, name: name of button visible in Coach, function: function to call when button is clicked) 
  codioIDE.coachBot.register("customErrorExplanationRStudio", "Explain this R error!", onButtonPress)

  // function called when I have a question button is pressed
  async function onButtonPress() {

    // Function that automatically collects all available context 
    // returns the following object: {guidesPage, assignmentData, files, error}
    let context = await codioIDE.coachBot.getContext()
    // console.log(context)

    // let codeFile = codioIDE.getFileContent("Practice_Building_a_Fault_Tree_With_R.Rmd")
    // console.log(codeFile)

    let filetree = await codioIDE.files.getStructure()
    console.log("filetree", filetree)
    
    async function getFilesWithExtension(obj, extension) {
        const files = {};

        async function traverse(path, obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'object') {
                  // appending next object to traverse to path
                  await traverse(path + "/" + key, obj[key]);
                } else if (obj[key] === 1 && key.toLowerCase().endsWith(extension)) {
                    
                    let filepath = path + "/" + key
                    // removed the first / from filepath
                    filepath = filepath.substring(1)
                    const fileContent = await codioIDE.files.getContent(filepath)
                    files[key] = fileContent
                }
                }
        }

        await traverse("", obj);
        return files;
    }

    const files = await getFilesWithExtension(filetree, '.rmd')
    console.log(files);

    let student_files = ""

    for (const filename in files) {
        student_files = student_files.concat(`
        filename: ${filename}
        file content: 
        ${files[filename]}\n\n\n`)
    }
    console.log(student_files)

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
${student_files}
</code> 

If <assignment> and <code> are empty, assume that they're not available. 

Phrase your explanation directly addressing the student as 'you'. 
After writing your explanation in 2-3 sentences, double check that it does not suggest any fixes or solutions. 
The explanation should only describe the cause of the error.`

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
 

  
  
