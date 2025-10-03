# Token Usage Documentation

## Overview

Token usage in Dyad is calculated **per chat session**, not cumulatively across all chats. This means each chat has its own token count that resets when you start a new chat.

## How Tokens Are Calculated

Token usage includes several components:

1. **Message History** (Blue) - All previous messages in the current chat
2. **Codebase Context** (Green) - Files and code from your project
3. **Mentioned Apps** (Orange) - Code from apps you've referenced with @mentions
4. **System Prompt** (Purple) - Instructions that guide the AI's behavior
5. **Current Input** (Yellow) - The message you're currently typing

The total token count is the sum of all these components and is measured against your model's context window (e.g., 128K tokens for GPT-4).

## How to Reduce Token Usage

If you're approaching your token limit, try these strategies:

### 1. Start a New Chat
- Click the "New Chat" button in the header
- This completely resets your token count
- Your previous chat history is preserved separately

### 2. Clear Chat History
- Click the clear history button in the token bar when usage is high
- This removes all messages from the current chat
- Useful when you want to continue in the same chat but reduce tokens

### 3. Minimize Codebase Context
- Review which files are included in your codebase context
- Use `.dyadignore` to exclude unnecessary files
- Be selective about which files the AI needs access to

### 4. Reduce Message History
- Keep conversations focused and concise
- Avoid lengthy back-and-forth exchanges when possible
- Start a new chat when switching to a new topic

### 5. Limit App Mentions
- Only @mention other apps when necessary
- Each mentioned app adds its codebase to your token count

### 6. Use Dyad Pro Smart Context (Recommended)
- Enable Dyad Pro's Smart Context feature
- Automatically optimizes which files are included
- Reduces token usage without sacrificing quality

## Token Limit Warnings

When your token usage exceeds 80% of your context window, you'll see a warning with suggestions to reduce usage. This helps prevent hitting the limit unexpectedly.

## API Key Impact on Tokens

Different API keys may have different token limits:
- Free tier keys: May have lower context windows
- Paid API keys: Usually support larger context windows
- You can switch between keys in Settings → AI Models

## Best Practices

1. **Monitor usage regularly** - Check the token bar to stay aware of your usage
2. **Start fresh when needed** - Don't hesitate to start a new chat for new topics
3. **Organize your codebase** - Keep your project structure clean and use `.dyadignore`
4. **Be intentional with context** - Only include what the AI needs to help you

## FAQs

**Q: Why did my token count suddenly increase?**
A: This usually happens when you mention another app or include more files in your codebase context.

**Q: Do tokens carry over between chats?**
A: No, each chat has its own independent token count.

**Q: What happens if I exceed the token limit?**
A: The AI may not be able to process your request. You'll need to reduce tokens by clearing history or starting a new chat.

**Q: Does switching API keys affect my token count?**
A: Switching keys doesn't change your current token usage, but different models may have different context windows.
