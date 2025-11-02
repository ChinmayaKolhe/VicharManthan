# VicharManthan Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. The `.env` file is already configured with MongoDB connection

3. Start the server:
```bash
npm start
# or for development
npm run dev
```

Server runs on `http://localhost:5000`

## API Documentation

All endpoints are prefixed with `/api`

### Authentication Required
Add header: `Authorization: Bearer <token>`

## Models

### User
- name, email, password
- bio, skills, avatar
- location, website, github, linkedin
- followers, following

### Idea
- title, description, category
- requiredSkills, teamSize, currentTeamSize
- stage, tags, status
- author, teamMembers
- upvotes, comments

### Proposal
- idea, applicant
- message, proposedRole, skills
- status (Pending/Accepted/Rejected)

### Notification
- recipient, sender, type
- idea, proposal, message
- read status

### Chat
- participants
- messages (sender, text, timestamp)
- lastMessage, lastMessageAt
