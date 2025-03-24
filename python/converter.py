import sys
import json
import os
import argparse
from urllib.parse import urlparse

try:
    import yt_dlp
except ImportError:
    print(json.dumps({
        "success": False,
        "title": "",
        "filename": "",
        "error": "yt-dlp module not found. Please install it using 'pip install yt-dlp'"
    }))
    sys.exit(1)

# Set up downloads folder
DOWNLOADS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'downloads')
if not os.path.exists(DOWNLOADS_FOLDER):
    os.makedirs(DOWNLOADS_FOLDER)

def is_soundcloud_url(url):
    """Check if the URL is from SoundCloud"""
    parsed_url = urlparse(url)
    return 'soundcloud.com' in parsed_url.netloc

def is_youtube_url(url):
    """Check if the URL is from YouTube"""
    parsed_url = urlparse(url)
    return any(domain in parsed_url.netloc for domain in ['youtube.com', 'youtu.be'])

def convert_media(url, format_type, conversion_id):
    """Convert media from YouTube or SoundCloud to the specified format"""
    result = {
        'success': False,
        'title': '',
        'filename': '',
        'error': ''
    }
    
    try:
        # Determine the source based on URL
        if is_youtube_url(url):
            source = 'youtube'
        elif is_soundcloud_url(url):
            source = 'soundcloud'
        else:
            result['error'] = 'Unsupported URL source'
            return result
        
        # Configure yt-dlp options based on format
        if format_type == 'mp3':
            ydl_opts = {
                'format': 'bestaudio/best',
                'noplaylist': True,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '0',  # '0' means highest available quality
                }],
                'outtmpl': os.path.join(DOWNLOADS_FOLDER, f'{conversion_id}-%(title)s.%(ext)s'),
            }
        elif format_type == 'mp4' and source == 'youtube':
            ydl_opts = {
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                'noplaylist': True,
                'outtmpl': os.path.join(DOWNLOADS_FOLDER, f'{conversion_id}-%(title)s.%(ext)s'),
            }
        else:
            result['error'] = f'Unsupported format {format_type} for source {source}'
            return result
        
        # Additional common options
        ydl_opts.update({
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://www.youtube.com/' if source == 'youtube' else 'https://soundcloud.com/',
            },
            'force_ipv4': True,
        })
        
        # Download and convert
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
            # Get the title and filename
            title = info.get('title', 'Unknown Title')
            
            if format_type == 'mp3':
                filename = ydl.prepare_filename(info).rsplit('.', 1)[0] + '.mp3'
            else:
                filename = ydl.prepare_filename(info)
            
            # Get just the filename without the path
            base_filename = os.path.basename(filename)
            
            result['success'] = True
            result['title'] = title
            result['filename'] = base_filename
            
    except Exception as e:
        result['error'] = str(e)
        
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert media from YouTube or SoundCloud')
    parser.add_argument('url', help='URL of the YouTube video or SoundCloud track')
    parser.add_argument('format', help='Output format (mp3 or mp4)')
    parser.add_argument('conversion_id', help='Unique ID for this conversion')
    
    args = parser.parse_args()
    
    result = convert_media(args.url, args.format, args.conversion_id)
    
    # Print result as JSON for Node.js to parse
    print(json.dumps(result))