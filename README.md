# Home Stream - Alexa Audio Player Skill

A customizable Alexa audio streaming skill that reads content configuration from DynamoDB.

## Setup

### 1. Create Alexa-Hosted Skill

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Create Skill → Custom → Alexa-Hosted (Node.js)
3. Start from Scratch

### 2. Configure Interaction Model

1. **Build** tab → **JSON Editor**
2. Paste contents of `skill-package/interactionModels/custom/en-US.json`
3. Click **Save Model** → **Build Model**

### 3. Enable Audio Player Interface

1. **Build** tab → **Interfaces**
2. Enable **Audio Player**
3. Save

### 4. Deploy Lambda Code

1. **Code** tab
2. Replace `lambda/index.js` with the one from this repo
3. Create `lambda/content-library.js` and paste contents from this repo
4. Click **Deploy**

### 5. Set Up DynamoDB Content

The skill reads content from the DynamoDB table automatically created by Alexa-hosted skills.

#### Find Your Table Name

1. **Code** tab → look at the logs after invoking the skill, or
2. Check `process.env.DYNAMODB_PERSISTENCE_TABLE_NAME` in CloudWatch logs

#### Create Content Item

In AWS DynamoDB Console (or via AWS CLI), create an item in your table:

| Attribute | Type | Value |
|-----------|------|-------|
| `id` | String | `content-library` |
| `content` | String | *(JSON string, see below)* |
| `defaultContent` | String | `ocean sounds` |

#### Content Field Format

The `content` attribute must be a **JSON-encoded string**:

```json
{"ocean sounds":{"url":"https://your-server.com/ocean.mp3","title":"Ocean Sounds"},"jazz":{"url":"https://your-server.com/jazz.mp3","title":"Jazz Radio"}}
```

Formatted for readability:

```json
{
  "ocean sounds": {
    "url": "https://your-server.com/ocean.mp3",
    "title": "Ocean Sounds"
  },
  "jazz": {
    "url": "https://your-server.com/jazz.mp3",
    "title": "Jazz Radio"
  }
}
```

Each content entry has:
- **key**: What user says (e.g., "play ocean sounds")
- **url**: HTTPS URL to audio stream (MP3, AAC, or HLS)
- **title**: What Alexa says when starting playback

#### AWS CLI Example

```bash
aws dynamodb put-item \
  --table-name YOUR_TABLE_NAME \
  --item '{
    "id": {"S": "content-library"},
    "content": {"S": "{\"ocean sounds\":{\"url\":\"https://example.com/ocean.mp3\",\"title\":\"Ocean Sounds\"}}"},
    "defaultContent": {"S": "ocean sounds"}
  }'
```

## Usage

| Voice Command | Action |
|---------------|--------|
| "Alexa, open home stream" | Opens skill, lists available content |
| "play" | Plays default content |
| "play ocean sounds" | Plays specific content |
| "pause" / "stop" | Stops playback |
| "resume" | Resumes playback |
| "help" | Lists available content and commands |

### Sleep Timer

While audio is playing, say:
- "Alexa, set a sleep timer for 30 minutes"
- "Alexa, stop in 1 hour"

## Audio Requirements

Stream URLs must be:
- **HTTPS** (required)
- **Formats**: MP3, AAC/MP4, HLS
- **MP3 specs**: MPEG v1/v2/2.5, Layer 3, 16-384 kbps, 22050-48000 Hz

## Project Structure

```
├── lambda/
│   ├── index.js              # Main skill handler
│   ├── content-library.js    # DynamoDB content loader
│   └── package.json
└── skill-package/
    ├── skill.json
    └── interactionModels/
        └── custom/
            └── en-US.json
```

## License

MIT

