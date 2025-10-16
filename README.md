# Palace Poker Szombathely - Next.js Website

Modern, responsive website for Palace Poker Szombathely built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern React/Next.js Architecture**: Built with Next.js 15 and React 19
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Tournament Management**: Complete tournament calendar and management system
- **Cash Game Tracking**: Live cash game table management
- **Content Management**: Custom admin interface for content management
- **SEO Optimized**: Built-in SEO features and structured data
- **Database Integration**: MySQL backend for all content
- **Component-based Architecture**: Reusable components following modern best practices

## 🏗️ Project Structure

```
palacepokerv1/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin interface pages
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── admin/             # Admin-specific components
│   │   ├── Banner.tsx         # Homepage banner slider
│   │   ├── Header.tsx         # Site header with navigation
│   │   ├── Footer.tsx         # Site footer
│   │   ├── FeaturedOffers.tsx # Featured tournaments/games
│   │   ├── TournamentCard.tsx # Tournament display card
│   │   └── CashGameCard.tsx   # Cash game display card
│   ├── lib/                   # Utility libraries
│   │   └── database.ts        # Database connection/queries
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # Main types
├── database/
│   └── schema.sql             # MySQL database schema
├── package.json
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── next.config.js            # Next.js configuration
```

## 🔧 Key Components

### Frontend Components

1. **Header**: Navigation with responsive mobile menu, logo, and contact info
2. **Banner**: Rotating banner slider for promotions and announcements
3. **FeaturedOffers**: Tournament and cash game highlights
4. **Tournament/Cash Game Cards**: Detailed display cards with booking functionality

### Admin Interface

- **Dashboard**: Overview of tournaments, cash games, and system status
- **Tournament Management**: Create, edit, and manage poker tournaments
- **Cash Game Management**: Configure and monitor live cash game tables
- **Banner Management**: Upload and schedule promotional banners
- **Content Management**: News, gallery, and page content editing

### Database Schema

Complete MySQL schema including:
- Tournament management (tournaments, categories, results)
- Cash game configuration (games, types)
- Content management (banners, news, gallery)
- User management and settings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MySQL database (optional for development)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd palacepokerv1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (create `.env.local`):
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=palace_poker
   DB_PORT=3306
   ```

4. **Set up the database** (optional):
   ```bash
   # Import the schema
   mysql -u your_user -p palace_poker < database/schema.sql
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin

## 🎨 Design System

### Colors
- **Poker Gold**: `#D4AF37` - Primary accent color
- **Dark Green**: `#0F3F26` - Primary brand color
- **Green**: `#228B22` - Secondary brand color  
- **Red**: `#DC143C` - Accent color
- **Black**: `#1A1A1A` - Text color

### Typography
- Primary font: Inter (system fallback)
- Modern, readable typography with proper hierarchy

### Components
- Consistent button styles (`btn-primary`, `btn-secondary`)
- Card-based layouts for content
- Responsive grid system
- Hover effects and animations

## 📱 Responsive Design

The site is fully responsive with breakpoints for:
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

Key responsive features:
- Collapsible mobile navigation
- Responsive grid layouts
- Touch-friendly interface elements
- Optimized images and content

## 🗄️ Database Integration

### Development Mode
Currently configured with mock data for development. The `MockDatabase` class provides sample data for:
- Tournaments
- Cash games
- Banners
- News articles

### Production Setup
For production, replace mock database calls with real MySQL connections using libraries like:
- `mysql2`
- `prisma`
- `drizzle-orm`

## 🔒 Security Features

- Input validation on all forms
- SQL injection prevention (prepared statements)
- XSS protection
- CSRF protection
- Secure admin authentication (to be implemented)

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deployment Options

1. **Vercel** (Recommended):
   - Connect GitHub repository
   - Automatic deployments on push
   - Built-in environment variable management

2. **Docker**:
   - Dockerfile included
   - Container-ready configuration

3. **Traditional Hosting**:
   - Build static export if needed
   - Configure web server (nginx/Apache)

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **Components**: Add to `src/components/`
2. **Pages**: Add to `src/app/`  
3. **API Routes**: Add to `src/app/api/`
4. **Types**: Update `src/types/index.ts`
5. **Database**: Update schema in `database/schema.sql`

## 📋 TODO for Production

- [ ] Implement real database connections
- [ ] Add user authentication system
- [ ] Set up email notifications  
- [ ] Implement image upload functionality
- [ ] Add payment processing for tournaments
- [ ] Set up automated backups
- [ ] Configure SSL certificates
- [ ] Implement caching strategies
- [ ] Add monitoring and analytics
- [ ] Create automated testing suite

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 📞 Support

For support and questions:
- Email: palacepoker@hotmail.hu
- Phone: +36 30 971 5832
- Address: 9700 Szombathely, Semmelweis u. 2.

---

**Palace Poker Szombathely** - Professzionális póker élmény a szív városában!