# Database Setup Instructions

## Import Database Schema to tarhely.eu MySQL

### Method 1: Using cPanel phpMyAdmin (Recommended)

1. **Login to your tarhely.eu cPanel**
2. **Open phpMyAdmin** 
3. **Select your database**: `salamons_palacepoker`
4. **Click Import tab**
5. **Choose file**: Upload the `schema.sql` file from this directory
6. **Click Go** to import the schema

### Method 2: Using MySQL Command Line

```bash
mysql -h tmseventyseven.tarhely.eu -u salamons_poker -p salamons_palacepoker < schema.sql
```

When prompted, enter your password: `Subaru86iok200`

## Database Configuration

The schema is configured for:
- **Host**: `tmseventyseven.tarhely.eu` (or `185.208.225.77`)
- **Database**: `salamons_palacepoker`
- **Username**: `salamons_poker`
- **Password**: `Subaru86iok200`
- **Charset**: `utf8mb4`

## What This Schema Creates

### Main Tables:
- **tournaments** - Tournament events with details
- **tournament_categories** - Tournament types/categories  
- **cash_games** - Cash game information
- **cash_game_types** - Types of cash games
- **banners** - Homepage banner/slider images
- **news** - News articles and announcements
- **users** - Admin user accounts
- **gallery** - Photo gallery images
- **settings** - Site configuration

### Sample Data Included:
- Tournament categories (Weekly, Special Event, Satellite)
- Cash game types (Texas Hold'em, PLO, Mixed Games)
- Sample tournaments and cash games
- Sample banners and news articles
- Default admin user: `sziszi86`

## Environment Configuration

Update your `.env.local` file with:
```env
DB_HOST=tmseventyseven.tarhely.eu
DB_USER=salamons_poker
DB_PASSWORD=Subaru86iok200
DB_NAME=salamons_palacepoker
DB_PORT=3306
```

## Testing the Connection

After importing the schema, restart your development server:
```bash
npm run dev
```

Test the API endpoints:
- `http://localhost:3000/api/tournaments`
- `http://localhost:3000/api/cash-games` 
- `http://localhost:3000/api/banners`
- `http://localhost:3000/api/news`

## Troubleshooting

If you encounter connection issues:

1. **Check firewall**: Ensure your IP is allowed to connect to the MySQL server
2. **Verify credentials**: Double-check username/password in tarhely.eu cPanel
3. **Test different hosts**: Try `185.208.225.77` or `185.51.191.57` if hostname doesn't work
4. **Contact tarhely.eu support** if connection issues persist

## Production Deployment

When deploying to Vercel or other platforms, add the database environment variables to your deployment configuration:

### Vercel Environment Variables:
- `DB_HOST=tmseventyseven.tarhely.eu`
- `DB_USER=salamons_poker` 
- `DB_PASSWORD=Subaru86iok200`
- `DB_NAME=salamons_palacepoker`
- `DB_PORT=3306`