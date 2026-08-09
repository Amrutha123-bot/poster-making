# AI-Powered Corporate Occasion Poster Generation System

## What Does It Do?

This project is an AI-powered web application that automatically generates professional corporate posters for different occasions such as festivals, celebrations, and corporate events.

The user can provide a simple natural language prompt, and the system generates AI artwork and automatically integrates the company's branding information.

The system can:

- Generate occasion-specific posters
- Enhance user prompts using AI
- Generate AI artwork
- Add company logo and branding
- Regenerate posters
- Store generated posters
- View poster history
- Download generated posters

## Tech Stack

- React.js
- Next.js
- Node.js
- TypeScript / JavaScript
- Supabase
- OpenRouter
- Pollinations.ai
- Git
- GitHub

## How It Works

1. The user creates an account and provides company information.
2. Supabase handles user authentication and stores company information.
3. The user enters a natural language prompt for the required poster.
4. OpenRouter enhances the prompt into a detailed creative prompt.
5. Pollinations.ai generates the AI artwork.
6. The application combines the artwork with the company's branding information.
7. The final poster is displayed to the user.
8. The poster can be regenerated or downloaded.
9. Generated posters are stored and made available through the History section.

## Supabase Usage

Supabase is used for:

- User authentication
- Company profile information
- Database management
- Storage
- Poster history

## AI Services

### OpenRouter

OpenRouter is used to enhance the user's basic prompt and generate a detailed creative prompt for the poster.

### Pollinations.ai

Pollinations.ai is used to generate the AI artwork based on the enhanced creative prompt.

## Poster Generation Workflow

```text
User Prompt
     ↓
OpenRouter
     ↓
Creative Prompt Enhancement
     ↓
Pollinations.ai
     ↓
AI Artwork Generation
     ↓
Poster Composition
     ↓
Company Branding Integration
     ↓
Final Poster
     ↓
Poster History
```

## Main Features

### User Authentication

Users can create an account and securely log in to the application.

### Company Profile

Users can provide and manage company information such as:

- Company Name
- Company Logo
- Tagline
- Website
- Email
- Phone Number

### AI Poster Generation

Users can enter a simple natural language prompt and generate an occasion-specific corporate poster.

### AI Prompt Enhancement

OpenRouter enhances the user's prompt by adding creative details such as:

- Occasion
- Visual elements
- Style
- Atmosphere
- Composition

### AI Artwork Generation

Pollinations.ai generates the artwork based on the enhanced prompt.

### Branding Integration

The generated artwork is combined with the company's branding information to create the final poster.

### Poster Regeneration

Users can regenerate posters to create different creative variations.

### Poster History

Previously generated posters are stored and can be viewed through the History section.

### Download

Users can download their generated posters for further use.

## How to Run

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root directory.

Add the required API keys and Supabase configuration.

Example:

```env
OPENROUTER_API_KEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

Use the exact environment variable names required by the project.

### 4. Run the Application

```bash
npm run dev
```

### 5. Open the Application

Open the following URL in your browser:

```text
http://localhost:3000
```

## Example Prompt

```text
Create a professional Diwali poster wishing Happy Diwali to all our clients.
```

The system processes the prompt, enhances it using OpenRouter, generates the artwork using Pollinations.ai, and combines it with the registered company branding.

## Output

The final poster contains:

- AI-generated artwork
- Company logo
- Company name
- Tagline
- Website
- Email
- Phone number
- Occasion-specific design

## Project Structure

```text
project/
│
├── app/
├── components/
├── public/
├── services/
├── lib/
├── package.json
├── .env.local
└── README.md
```

The exact structure may vary depending on the final project implementation.

## Security

Do not upload API keys, passwords, Supabase credentials, or other sensitive information to GitHub.

Make sure `.env.local` is included in `.gitignore`.

Example:

```text
.env.local
```

## Future Improvements

- Support multiple AI image generation models
- Add multilingual poster generation
- Add QR code generation
- Add advanced branding customization
- Add social media publishing
- Add campaign management
- Add more poster layouts and design styles
- Add collaborative poster creation

## Internship

This project was developed as part of an AI/ML Internship at NighaTech Global Private Limited.

## Project Type

Generative AI | Full-Stack Web Development | AI Image Generation
