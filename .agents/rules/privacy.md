# Privacy Rules

**CRITICAL RULE: DO NOT ACCESS `.env.local`**

Under NO circumstances are you (the AI Agent) allowed to use `view_file`, `grep_search`, `replace_file_content`, or any other tool to read or modify the `.env.local` file or any other file containing production secrets.

If a user asks for help configuring environment variables, provide them with the code snippets and tell them to manually paste them into their `.env.local` file. DO NOT attempt to open the file yourself.
