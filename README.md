# KeyShift 🎵

A web application that allows users to change the key of their MP3 files directly in the browser. Upload a song, adjust its pitch, and hear the difference instantly - no account needed.

## Features

- Upload MP3 files and detect their musical key
- Change pitch by up to ±12 semitones
- Real-time audio playback with waveform visualization
- Adjustable audio quality settings
- Mobile-optimized interface
- Client-side processing (no server uploads)
- Preserve tempo option while changing pitch

## Tech Stack

- React + TypeScript
- Vite for building
- Express backend
- Web Audio API for audio processing
- Tailwind CSS + Radix UI for styling
- Drizzle ORM for database operations

## Development

1. Clone this Repl
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```
4. Open your browser to port 5000

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Update database schema

## Project Structure

```
├── client/         # Frontend React application
├── server/         # Express backend
├── shared/         # Shared types and schemas
└── attached_assets # Additional resources
```

## Contributing

Feel free to fork this Repl and contribute improvements. Please maintain the existing code style and add tests for new features.

## License

MIT