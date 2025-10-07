# Google Calendar API Setup for Festivals Feature

## Overview
The Festivals feature in the employee dashboard fetches holiday and festival data from Google Calendar API. This document explains how to set up the Google Calendar API integration.

## Prerequisites
1. Google Cloud Console account
2. Access to create and manage APIs

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

### 2. Enable Google Calendar API
1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### 3. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to Google Calendar API only for security

### 4. Configure Environment Variable
Add the following environment variable to your `.env.local` file:

```bash
GOOGLE_CALENDAR_API_KEY=your_api_key_here
```

## Supported Countries

The festivals feature supports the following countries with their respective Google Calendar IDs:

- **US** - United States
- **UK** - United Kingdom  
- **Canada** - Canada
- **Australia** - Australia
- **India** - India
- **Germany** - Germany
- **France** - France
- **Japan** - Japan
- **China** - China
- **Brazil** - Brazil
- **Mexico** - Mexico
- **Italy** - Italy
- **Spain** - Spain
- **Russia** - Russia
- **South Korea** - South Korea
- **Thailand** - Thailand
- **Singapore** - Singapore
- **Malaysia** - Malaysia
- **Indonesia** - Indonesia
- **Philippines** - Philippines
- **Vietnam** - Vietnam
- **Saudi Arabia** - Saudi Arabia
- **UAE** - United Arab Emirates
- **South Africa** - South Africa
- **Egypt** - Egypt
- **Nigeria** - Nigeria
- **Kenya** - Kenya
- **Argentina** - Argentina
- **Chile** - Chile
- **Colombia** - Colombia
- **Peru** - Peru
- **Venezuela** - Venezuela
- **Turkey** - Turkey
- **Poland** - Poland
- **Netherlands** - Netherlands
- **Sweden** - Sweden
- **Norway** - Norway
- **Denmark** - Denmark
- **Finland** - Finland
- **Switzerland** - Switzerland
- **Austria** - Austria
- **Belgium** - Belgium
- **Portugal** - Portugal
- **Greece** - Greece
- **Israel** - Israel
- **New Zealand** - New Zealand

## API Usage

### Endpoints

#### GET `/api/festivals`
Fetches festivals for a specific country and year.

**Query Parameters:**
- `country` (string): Country code (e.g., 'us', 'uk', 'india')
- `year` (number): Year to fetch festivals for (default: current year)
- `month` (number, optional): Specific month (1-12)

**Example:**
```
GET /api/festivals?country=us&year=2024&month=12
```

#### POST `/api/festivals?action=countries`
Returns list of available countries.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "us",
      "name": "Us",
      "calendarId": "en.usa#holiday@group.v.calendar.google.com"
    }
  ]
}
```

## Features

### Employee Dashboard Integration
- **New Tab**: "Festivals" tab added to employee dashboard
- **Country Selection**: Dropdown to select from 40+ countries
- **Year Navigation**: Previous/Next year buttons with input field
- **Month Filtering**: Optional month-specific filtering
- **Search**: Search festivals by name or description
- **Responsive Design**: Works on desktop and mobile

### Data Display
- **Festival Cards**: Beautiful cards showing festival details
- **Date Information**: Formatted dates and times
- **All Day Events**: Special badges for all-day festivals
- **Statistics**: Total festivals count and country information
- **Month Navigation**: Navigate between months when filtering

### Real-time Updates
- **Auto-refresh**: Data refreshes when filters change
- **Loading States**: Proper loading indicators
- **Error Handling**: Graceful error handling with user feedback

## Security Considerations

1. **API Key Protection**: Store API key in environment variables only
2. **Rate Limiting**: Google Calendar API has rate limits (consult Google's documentation)
3. **Authentication**: Only authenticated users can access the festivals API
4. **Input Validation**: All user inputs are validated before API calls

## Troubleshooting

### Common Issues

1. **"Google Calendar API key not configured"**
   - Ensure `GOOGLE_CALENDAR_API_KEY` is set in `.env.local`
   - Restart the development server after adding the environment variable

2. **"Failed to fetch festivals from Google Calendar API"**
   - Check if the API key is valid
   - Ensure Google Calendar API is enabled in your Google Cloud project
   - Check if the API key has proper permissions

3. **No festivals showing**
   - Verify the country code is supported
   - Check if there are festivals for the selected year
   - Try a different country or year

### API Limits
- Google Calendar API has daily quotas
- Free tier: 1,000,000 queries per day
- Each request counts toward your quota

## Support

For issues related to:
- **Google Calendar API**: Check [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- **Application Issues**: Check browser console for error messages
- **Setup Issues**: Verify environment variables and API key configuration
