# DidYouPoop.online

The fun and functional way to track your gut health with poop scoring, streaks, and achievements!

## Features

- 💩 Daily poop tracking with scoring system
- 📊 Advanced analytics and charts
- 🏆 Achievement system with unlockable badges
- 📱 Cross-device sync with cloud storage
- 🎯 Streak tracking and consistency monitoring
- 🌾 Fiber intake tracking and recommendations
- 📅 Calendar view of your poop history
- 🔒 Secure authentication and data privacy

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe integration for premium features
- **Deployment**: Netlify
- **State Management**: Zustand with persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for premium features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/didyoupoop-online.git
cd didyoupoop-online
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase and Stripe credentials in `.env.local`.

4. Set up the database:
Follow the instructions in `SUPABASE_SETUP.md` to create the necessary tables and deploy edge functions.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

The app is configured for deployment on Netlify. See `NETLIFY_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@didyoupoop.online or join our Discord community.