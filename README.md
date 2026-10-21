# JobHub — Job Search Platform

JobHub is a full-stack job platform that connects job seekers with companies. Users can explore job opportunities, save jobs, manage applications, and upload resumes. Companies can create profiles, publish job vacancies, and manage applications.


## Live Demo

- **Job Seeker Website:** https://job-hub-b5ulu463r-yousuf-s-projects3.vercel.app/
- **Backend API:** https://jobhub-com-vxzx.onrender.com

## Source Code

- **GitHub Repository:** https://github.com/zyousufkhan777-gif/JobHub.com

## Developer

Full Stack Developer | React.js | Node.js | Express.js | MongoDB





## Features

### For Job Seekers
- Create an account and log in.
- Browse and search for job opportunities.
- Explore company profiles.
- Save jobs for later.
- Apply for jobs.
- Upload PDF resumes.

### For Companies
- Create and manage company profiles.
- Publish job vacancies.
- Manage job applications.
- Connect with potential candidates.

### For Administrators
- Access administrative features to manage the platform.

## Tech Stack

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Other Technologies
- Firebase Authentication
- Cloudinary
- Git and GitHub
- Vercel
- Render

## Project Structure

```text
JobHub.com/
├── admin/
├── company/
├── user/
└── backend/
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/zyousufkhan777-gif/JobHub.com.git
cd JobHub.com
```

### 2. Install dependencies

Install dependencies separately in the frontend applications and backend:

```bash
cd backend
npm install
```

Repeat the installation inside `admin`, `company`, and `user`.

### 3. Configure environment variables

Configure the required environment variables for MongoDB, Firebase, Cloudinary, authentication, and the frontend API URL.

Never commit `.env` files or Firebase service account credentials to GitHub.

### 4. Run the application

Start the backend using the start script configured in `backend/package.json`. Start each frontend using its own development script.

## Deployment

- Frontend applications: Vercel
- Backend API: Render
- Database: MongoDB
- File storage: Cloudinary

## Author

Developed as a personal full-stack web development project.

## License

Add a license if you intend to distribute this project as open-source software.
