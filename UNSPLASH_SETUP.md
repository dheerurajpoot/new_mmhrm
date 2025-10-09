# Unsplash API Setup Guide

This guide will help you set up the Unsplash API to display real festival images in the employee dashboard.

## 🚀 Quick Setup

### 1. Get Unsplash API Access Key

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Sign up or log in to your Unsplash account
3. Create a new application:
   - Click "Your apps" → "New Application"
   - Accept the API Use and Access Agreement
   - Fill in the application details:
     - **Application name**: `MMHRM Festival Images`
     - **Description**: `HR Management System - Festival Image Display`
     - **Website URL**: Your application URL (can be localhost for development)
4. After creating the app, you'll get an **Access Key**

### 2. Configure Environment Variables

Add your Unsplash access key to your environment variables:

**For Development (.env.local):**
```bash
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_actual_access_key_here
```

**For Production:**
Add the same environment variable to your hosting platform (Vercel, Netlify, etc.)

### 3. API Limits

- **Free Tier**: 50 requests per hour
- **Paid Plans**: Available for higher usage
- **Caching**: Images are cached for 24 hours to minimize API calls

## 🎯 Features

### ✅ What's Included

- **Real Festival Images**: Fetches actual photos from Unsplash
- **Smart Caching**: 24-hour cache to reduce API calls
- **Fallback System**: Shows emojis if images fail to load
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful degradation
- **Festival-Specific Search**: Optimized search terms for each festival type

### 🎨 Supported Festivals

The system automatically searches for images for:

**Hindu Festivals:**
- Diwali, Holi, Dussehra, Rakhi, Karva Chauth, Janmashtami, Ganesh Chaturthi, Navratri

**Islamic Festivals:**
- Eid, Ramadan, Muharram

**Christian Festivals:**
- Christmas, Easter, Good Friday

**National Holidays:**
- Independence Day, Republic Day, Gandhi Jayanti

**Cultural Festivals:**
- New Year, Thanksgiving, Labor Day, Memorial Day

## 🔧 Technical Details

### Image Caching
- Images are cached in memory for 24 hours
- Cache is automatically cleared when expired
- Reduces API calls and improves performance

### Fallback System
- If Unsplash API fails → Shows emoji
- If image fails to load → Shows emoji
- If no image found → Shows emoji
- Ensures the UI always works

### Performance
- Images are optimized for web (small size from Unsplash)
- Lazy loading with Next.js Image component
- Responsive sizing for different screen sizes

## 🛠️ Troubleshooting

### Common Issues

**1. Images not loading:**
- Check if `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` is set correctly
- Verify the API key is valid and not expired
- Check browser console for error messages

**2. API rate limit exceeded:**
- Free tier allows 50 requests per hour
- Images are cached for 24 hours to minimize calls
- Consider upgrading to a paid plan for higher usage

**3. Images showing as emojis:**
- This is the fallback behavior when images can't be loaded
- Check network connection and API key
- Verify Unsplash API is accessible

### Debug Mode

To see what's happening with image loading, check the browser console for:
- API request logs
- Cache hit/miss information
- Error messages

## 📈 Usage Monitoring

You can monitor your API usage at:
- [Unsplash Developer Dashboard](https://unsplash.com/developers)
- Check your application's usage statistics
- Monitor rate limits and remaining requests

## 🔒 Security Notes

- Never commit your API key to version control
- Use environment variables for all sensitive data
- The API key is safe to use in client-side code (it's public by design)
- Unsplash API keys are meant for client-side use

## 🎉 Ready to Go!

Once you've set up the API key, the festival cards will automatically start showing real images from Unsplash. The system will:

1. Search for relevant festival images
2. Cache them for 24 hours
3. Display them with smooth loading animations
4. Fall back to emojis if anything goes wrong

Enjoy your beautiful festival images! 🎊
